import { useState, useEffect, useCallback, useRef } from "react";

const SESSION_KEY = "heroNameTyped";

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);
  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    if (reducedMotion || sessionStorage.getItem(SESSION_KEY) === "true") {
      setDisplayed(text);
      setDone(true);
      return;
    }

    abortRef.current = false;
    let index = 0;

    const type = () => {
      if (abortRef.current) return;
      index++;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        timeoutRef.current = setTimeout(type, 35 + Math.random() * 25);
      } else {
        sessionStorage.setItem(SESSION_KEY, "true");
        setDone(true);
      }
    };

    const startAnimation = () => {
      timeoutRef.current = setTimeout(type, 100);
    };

    // Start only after the loading overlay has fully faded out.
    // The 1500ms fallback handles the case where the event fired before this
    // listener was registered (e.g., very fast load / overlay already gone).
    const fallbackTimer = setTimeout(startAnimation, 1500);
    const onOverlayDone = () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener('hero:overlay-done', onOverlayDone);
      startAnimation();
    };
    document.addEventListener('hero:overlay-done', onOverlayDone);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener('hero:overlay-done', onOverlayDone);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const skip = useCallback(() => {
    abortRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    sessionStorage.setItem(SESSION_KEY, "true");
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
      className="relative cursor-pointer select-none text-5xl md:text-7xl font-display font-bold mb-4 leading-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded"
      role="button"
      aria-label={text}
      onClick={skip}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") skip();
      }}
    >
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0">
        {displayed}
        {!reducedMotion && (
          <span className={`typing-caret ${done ? "hidden-caret" : ""}`} />
        )}
      </span>
    </h1>
  );
};

export default TypewriterText;
