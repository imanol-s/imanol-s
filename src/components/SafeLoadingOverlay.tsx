import AnimationBoundary from "./AnimationBoundary";
import LoadingOverlay from "./LoadingOverlay";

export default function SafeLoadingOverlay() {
  return (
    <AnimationBoundary>
      <LoadingOverlay />
    </AnimationBoundary>
  );
}
