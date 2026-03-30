import { useDottedGlow, type DottedGlowOptions } from "../../hooks/useDottedGlow";

interface DottedGlowBackgroundProps extends DottedGlowOptions {
  className?: string;
}

/**
 * Pure render shell — all animation logic lives in useDottedGlow.
 *
 * Prop cheat-sheet:
 *   accentVar  — CSS var name without var(), default "--color-accent"
 *   glowVar    — CSS var name without var(), default "--color-primary"
 *   gap        — dot grid spacing in px, default 12
 *   radius     — dot radius in px, default 2
 *   opacity    — global canvas opacity 0–1, default 0.6
 *   speed      — normalized 0–1 animation speed, default 0.5
 */
export const DottedGlowBackground = ({
  className,
  gap,
  radius,
  opacity,
  speed,
  accentVar,
  glowVar,
  _advanced,
}: DottedGlowBackgroundProps) => {
  const canvasRef = useDottedGlow({ gap, radius, opacity, speed, accentVar, glowVar, _advanced });

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
};
