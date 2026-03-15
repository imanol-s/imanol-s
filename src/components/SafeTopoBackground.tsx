// Pre-bundles AnimationBoundary with TopoBackground as a single React island.
// Astro cannot compose a React class-based error boundary with children from .astro scope,
// so this wrapper exists to satisfy that island boundary requirement.
import AnimationBoundary from "./AnimationBoundary";
import TopoBackground from "./TopoBackground";

export default function SafeTopoBackground() {
  return (
    <AnimationBoundary>
      <TopoBackground />
    </AnimationBoundary>
  );
}
