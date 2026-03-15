// Pre-bundles AnimationBoundary with LoadingOverlay as a single React island.
// Astro cannot compose a React class-based error boundary with children from .astro scope,
// so this wrapper exists to satisfy that island boundary requirement.
import AnimationBoundary from "./AnimationBoundary";
import LoadingOverlay from "./LoadingOverlay";

export default function SafeLoadingOverlay() {
  return (
    <AnimationBoundary>
      <LoadingOverlay />
    </AnimationBoundary>
  );
}
