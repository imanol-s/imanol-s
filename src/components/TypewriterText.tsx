import { useState, useEffect, useCallback, useRef } from "react";

const SESSION_KEY = "heroNameTyped";

// LoadingOverlay: 600ms opaque + 500ms fade = 1100ms; add 100ms buffer
const OVERLAY_CLEAR_MS = 1200;

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;

    setDisplayed("");
    setDone(false);
    abortRef.current = false;

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

    let index = 0;

    const type = () => {
      if (abortRef.current) return;
      index++;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        timeoutRef.current = setTimeout(type, 35 + Math.random() * 25);
      } else {
        try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* storage unavailable */ }
        setDone(true);
      }
    };

    timeoutRef.current = setTimeout(type, OVERLAY_CLEAR_MS);

    return () => {
      abortRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, reducedMotion]);

  const skip = useCallback(() => {
    abortRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* storage unavailable */ }
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
        {reducedMotion === false && (
          <span className={`typing-caret ${done ? "hidden-caret" : ""}`} />
        )}
      </span>
    </h1>
  );
};

export default TypewriterText;
