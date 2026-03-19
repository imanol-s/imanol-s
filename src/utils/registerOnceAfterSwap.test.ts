// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerOnceAfterSwap } from './registerOnceAfterSwap';

beforeEach(() => {
  // Reset the global registry between tests
  const win = window as unknown as Record<string, unknown>;
  delete win.__astroSwapRegistry;
});

describe('registerOnceAfterSwap', () => {
  it('calls callback immediately on first invocation', () => {
    const cb = vi.fn();
    registerOnceAfterSwap('test-key', cb);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('does not re-call callback on second invocation with same key', () => {
    const cb = vi.fn();
    registerOnceAfterSwap('dup-key', cb);
    registerOnceAfterSwap('dup-key', cb);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('calls callback when astro:after-swap fires', () => {
    const cb = vi.fn();
    registerOnceAfterSwap('swap-key', cb);
    expect(cb).toHaveBeenCalledTimes(1); // immediate call

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cb).toHaveBeenCalledTimes(2); // after swap
  });

  it('only registers one listener per key even if called twice', () => {
    const cb = vi.fn();
    registerOnceAfterSwap('once-key', cb);
    registerOnceAfterSwap('once-key', cb);
    cb.mockClear();

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cb).toHaveBeenCalledOnce(); // one listener, not two
  });

  it('registers different keys independently', () => {
    const cbA = vi.fn();
    const cbB = vi.fn();
    registerOnceAfterSwap('key-a', cbA);
    registerOnceAfterSwap('key-b', cbB);
    expect(cbA).toHaveBeenCalledOnce();
    expect(cbB).toHaveBeenCalledOnce();

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cbA).toHaveBeenCalledTimes(2);
    expect(cbB).toHaveBeenCalledTimes(2);
  });

  // --- Cleanup callback support (#58) ---

  it('does not call cleanup on initial invocation', () => {
    const cleanup = vi.fn();
    registerOnceAfterSwap('cleanup-initial', () => cleanup);
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('calls cleanup before re-invocation on astro:after-swap', () => {
    const cleanup = vi.fn();
    const cb = vi.fn(() => cleanup);
    registerOnceAfterSwap('cleanup-swap', cb);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('calls cleanup before each subsequent re-invocation', () => {
    const cleanup = vi.fn();
    const cb = vi.fn(() => cleanup);
    registerOnceAfterSwap('cleanup-multi', cb);

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cleanup).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it('cleanup is called before the callback on re-invocation (ordering)', () => {
    const order: string[] = [];
    const cleanup = vi.fn(() => order.push('cleanup'));
    const cb = vi.fn(() => {
      order.push('cb');
      return cleanup;
    });
    registerOnceAfterSwap('cleanup-order', cb);

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(order).toEqual(['cb', 'cleanup', 'cb']);
  });

  it('is backward-compatible: void-returning callbacks still work', () => {
    const cb = vi.fn(() => {});
    registerOnceAfterSwap('cleanup-void', cb);
    expect(cb).toHaveBeenCalledOnce();

    document.dispatchEvent(new Event('astro:after-swap'));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('stores latest cleanup returned by each re-invocation', () => {
    let callCount = 0;
    const cleanups = [vi.fn(), vi.fn(), vi.fn()];
    const cb = vi.fn(() => cleanups[callCount++]);
    registerOnceAfterSwap('cleanup-latest', cb);

    document.dispatchEvent(new Event('astro:after-swap'));
    // cleanup[0] was returned on first call, should be called before second
    expect(cleanups[0]).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('astro:after-swap'));
    // cleanup[1] was returned on second call, should be called before third
    expect(cleanups[1]).toHaveBeenCalledTimes(1);
    expect(cleanups[0]).toHaveBeenCalledTimes(1); // not called again
  });
});
