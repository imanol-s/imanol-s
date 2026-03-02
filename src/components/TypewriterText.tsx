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
    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      // sessionStorage unavailable (private mode, quota exceeded, etc.)
    }

    if (reducedMotion || alreadyPlayed) {
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
        try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* storage unavailable; animation will replay on next visit */ }
        setDone(true);
      }
    };

    // Wait for the LoadingOverlay to fully clear before starting.
    // LoadingOverlay takes 600ms (wait) + 500ms (CSS fade) = ~1100ms to clear;
    // the 100ms buffer ensures the overlay is fully gone before the first character types.
    timeoutRef.current = setTimeout(type, 1200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const skip = useCallback(() => {
    abortRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* storage unavailable; animation will replay on next visit */ }
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
