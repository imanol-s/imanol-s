import { useState, useEffect, useCallback, useRef } from "react";

const SESSION_KEY = "heroTyped";
// LoadingOverlay: 600ms opaque + 500ms fade = 1100ms; add 100ms buffer
const OVERLAY_CLEAR_MS = 1200;

function sessionFlag(action: "get" | "set"): boolean {
  try {
    if (action === "set") {
      sessionStorage.setItem(SESSION_KEY, "1");
      return true;
    }
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);
  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    abortRef.current = false;

    if (reducedMotion || sessionFlag("get")) {
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
        setDone(true);
        sessionFlag("set");
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
    setDisplayed(text);
    setDone(true);
    sessionFlag("set");
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
