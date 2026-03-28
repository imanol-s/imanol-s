/** Duration of one full left→right sweep in seconds. */
export const SWEEP_DURATION = 45;

/** Gaussian sigma as a fraction of SVG width (~15-20% visible band at ±2σ). */
export const BAND_SIGMA = 0.025;

/** Baseline stroke opacity for lines outside the sweep band. */
export const BASE_OPACITY = 0.40;

/** Peak stroke opacity at the center of the sweep band (1.75× brightening). */
export const PEAK_OPACITY = 0.70;

/** Static band position (fraction) when reduced motion is active. */
export const REDUCED_MOTION_POSITION = 0.5;

/** Standard gaussian function normalized to peak=1 at center. */
export function gaussian(x: number, center: number, sigma: number): number {
  const d = x - center;
  return Math.exp(-(d * d) / (2 * sigma * sigma));
}

/** Pixel offset for gradientTransform, wraps via modulo. */
export function sweepOffset(time: number, svgWidth: number, duration: number = SWEEP_DURATION): number {
  if (duration === 0) return 0;
  const t = ((time % duration) + duration) % duration;
  return (t / duration) * svgWidth;
}

/**
 * Build static gradient stops approximating a gaussian brightness band.
 * Returns stops sorted by offset with opacities in [baseOpacity, peakOpacity].
 */
export function buildSweepStops(
  sigma: number = BAND_SIGMA,
  numStops: number = 33,
  baseOpacity: number = BASE_OPACITY,
  peakOpacity: number = PEAK_OPACITY,
): Array<{ offset: number; opacity: number }> {
  const stops: Array<{ offset: number; opacity: number }> = [];
  for (let i = 0; i < numStops; i++) {
    const offset = i / (numStops - 1);
    // Center the gaussian at 0.5 of the gradient span
    const g = gaussian(offset, 0.5, sigma);
    const opacity = baseOpacity + (peakOpacity - baseOpacity) * g;
    stops.push({ offset, opacity });
  }
  return stops;
}
