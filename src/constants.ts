// ── Overlay timing ──────────────────────────────────────────────
export const OVERLAY_OPAQUE_MS = 600;
export const OVERLAY_FADE_MS = 500;
/** Extra buffer so the overlay fully fades before content appears. */
const OVERLAY_BUFFER_MS = 100;
/** Delays content until the loading overlay has fully cleared (opaque + fade + buffer). */
export const OVERLAY_CLEAR_MS = OVERLAY_OPAQUE_MS + OVERLAY_FADE_MS + OVERLAY_BUFFER_MS;
export const PAGE_SWAP_DELAY_MS = 300;

