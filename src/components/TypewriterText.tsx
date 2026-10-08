import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSiteLifecycle } from "../hooks/useSiteLifecycle";

const CARET_STYLE: CSSProperties = {
  display: "inline-block",
  width: "0.6em",
  height: "1em",
  backgroundColor: "var(--color-primary)",
  marginLeft: 2,
  verticalAlign: "text-bottom",
};

function Caret({ hidden }: { hidden: boolean }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (hidden) return;
    const id = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, [hidden]);

  const opacity = hidden ? 0 : visible ? 1 : 0;
  const transition = hidden ? "opacity 0.5s ease-out" : undefined;

  return <span style={{ ...CARET_STYLE, opacity, transition }} />;
}

/**
 * Character-by-character hero text animation with accessibility escape hatches.
 *
 * Layout: an invisible full-text span reserves the final dimensions so the
 * visible animated span doesn't cause layout shift as characters appear.
 *
 * Accessibility: an sr-only skip button and Escape key listener let keyboard
 * and screen-reader users bypass the animation.
 */
const TypewriterText = ({ text }: { text: string }) => {
  const reducedMotion = useReducedMotion();
  const { state } = useSiteLifecycle();
  const reveal = state === "overlay-fading" || state === "ready";
  const animateOnFirstVisit = useRef(
    !reducedMotion && (state === "loading" || state === "overlay-playing"),
  );
  const [displayed, setDisplayed] = useState(text);
  const [done, setDone] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Clear only behind the opaque overlay; fading and ready share one reveal.
    // Late hydration, return visits, and reduced motion keep the full name.
    if (
      reducedMotion ||
      !animateOnFirstVisit.current ||
      hasAnimatedRef.current
    ) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    if (!reveal) {
      setDisplayed("");
      setDone(false);
      return;
    }

    hasAnimatedRef.current = true;
    abortRef.current = false;
    let index = 0;

    const type = () => {
      if (abortRef.current) return;
      index++;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        // Randomized delay (35-60ms) avoids the mechanical feel of a fixed interval.
        timeoutRef.current = setTimeout(type, 35 + Math.random() * 25);
      } else {
        setDone(true);
      }
    };

    type();

    return () => {
      abortRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, reducedMotion, reveal]);

  const skip = useCallback(() => {
    hasAnimatedRef.current = true;
    abortRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDisplayed(text);
    setDone(true);
  }, [text]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [skip]);

  return (
    <h1
      className="relative text-5xl md:text-7xl font-display font-bold mb-4 leading-tight"
      aria-label={text}
    >
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span
        aria-hidden="true"
        data-typewriter-output
        className="absolute inset-0"
      >
        {displayed}
        {!reducedMotion ? <Caret hidden={done} /> : null}
      </span>
      {!done && (
        <button
          type="button"
          className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          aria-label="Skip typewriter animation"
          onClick={skip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") skip();
          }}
        />
      )}
    </h1>
  );
};

export default TypewriterText;
