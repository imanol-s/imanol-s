import AnimationBoundary from "./AnimationBoundary";
import TopoBackground from "./TopoBackground";

export default function SafeTopoBackground() {
  return (
    <AnimationBoundary>
      <TopoBackground />
    </AnimationBoundary>
  );
}
