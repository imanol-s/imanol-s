import { useState, useEffect, useCallback, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSessionState } from "../hooks/useSessionState";

// LoadingOverlay: 600ms opaque + 500ms fade = 1100ms; add 100ms buffer
const OVERLAY_CLEAR_MS = 1200;

const TypewriterText = ({ text }: { text: string }) => {
  const reducedMotion = useReducedMotion();
  const [alreadyPlayed, setAlreadyPlayed] = useSessionState("heroNameTyped", false);
  const [displayed, setDisplayed] = useState(text);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    abortRef.current = false;

    if (reducedMotion || alreadyPlayed) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let index = 0;

    const type = () => {
      if (abortRef.current) return;
      index++;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        timeoutRef.current = setTimeout(type, 35 + Math.random() * 25);
      } else {
        setAlreadyPlayed(true);
        setDone(true);
      }
    };

    timeoutRef.current = setTimeout(type, OVERLAY_CLEAR_MS);

    return () => {
      abortRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, reducedMotion, alreadyPlayed, setAlreadyPlayed]);

  const skip = useCallback(() => {
    abortRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlreadyPlayed(true);
    setDisplayed(text);
    setDone(true);
  }, [text, setAlreadyPlayed]);

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
      <span aria-hidden="true" className="absolute inset-0">
        {displayed}
        {!reducedMotion ? (
          <span className={`typing-caret ${done ? "hidden-caret" : ""}`} />
        ) : null}
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
