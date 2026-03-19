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
});
