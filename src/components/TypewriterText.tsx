import { useState, useEffect, type CSSProperties } from "react";
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

/** Full server-rendered heading with a brief, decorative caret flourish. */
const TypewriterText = ({ text }: { text: string }) => {
  const reducedMotion = useReducedMotion();
  const { state } = useSiteLifecycle();

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
        {text}
        {!reducedMotion ? <Caret hidden={state === "ready"} /> : null}
      </span>
    </h1>
  );
};

export default TypewriterText;
