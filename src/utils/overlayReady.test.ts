// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { signalOverlayReady, resetOverlayReady, waitForOverlay } from './overlayReady';

beforeEach(() => {
  const win = window as unknown as Record<string, unknown>;
  delete win.__overlayReady;
});

describe('overlayReady', () => {
  it('waitForOverlay returns a pending promise before signal', () => {
    let resolved = false;
    waitForOverlay().then(() => { resolved = true; });
    // Promise should not resolve synchronously
    expect(resolved).toBe(false);
  });

  it('signalOverlayReady resolves the promise', async () => {
    const promise = waitForOverlay();
    signalOverlayReady();
    await expect(promise).resolves.toBeUndefined();
  });

  it('late callers get an already-resolved promise', async () => {
    signalOverlayReady();
    // Called after signal — should resolve immediately
    await expect(waitForOverlay()).resolves.toBeUndefined();
  });

  it('resetOverlayReady creates a fresh pending promise', async () => {
    signalOverlayReady();
    await waitForOverlay();

    resetOverlayReady();

    let resolved = false;
    waitForOverlay().then(() => { resolved = true; });
    // Flush microtasks
    await Promise.resolve();
    expect(resolved).toBe(false);
  });

  it('signal after reset resolves the new promise', async () => {
    signalOverlayReady();
    await waitForOverlay();

    resetOverlayReady();
    const promise = waitForOverlay();
    signalOverlayReady();
    await expect(promise).resolves.toBeUndefined();
  });

  it('multiple waitForOverlay calls share the same promise', () => {
    const a = waitForOverlay();
    const b = waitForOverlay();
    expect(a).toBe(b);
  });
});
