// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transition, getInitialState, LIFECYCLE_SESSION_KEY, type State, type Action } from './siteLifecycle';

describe('siteLifecycle transition', () => {
  it('follows full sequence: loading → playing → fading → ready', () => {
    let state: State = 'loading';
    state = transition(state, 'PLAY');
    expect(state).toBe('overlay-playing');
    state = transition(state, 'FADE');
    expect(state).toBe('overlay-fading');
    state = transition(state, 'FINISH');
    expect(state).toBe('ready');
  });

  it('skips directly to ready from loading', () => {
    expect(transition('loading', 'SKIP')).toBe('ready');
  });

  it('ready is terminal — all actions are no-ops', () => {
    expect(transition('ready', 'PLAY')).toBe('ready');
    expect(transition('ready', 'FADE')).toBe('ready');
    expect(transition('ready', 'FINISH')).toBe('ready');
    expect(transition('ready', 'SKIP')).toBe('ready');
  });

  it('ignores invalid actions for each state', () => {
    expect(transition('loading', 'FADE')).toBe('loading');
    expect(transition('loading', 'FINISH')).toBe('loading');
    expect(transition('overlay-playing', 'PLAY')).toBe('overlay-playing');
    expect(transition('overlay-playing', 'FINISH')).toBe('overlay-playing');
    expect(transition('overlay-playing', 'SKIP')).toBe('overlay-playing');
    expect(transition('overlay-fading', 'PLAY')).toBe('overlay-fading');
    expect(transition('overlay-fading', 'FADE')).toBe('overlay-fading');
    expect(transition('overlay-fading', 'SKIP')).toBe('overlay-fading');
  });
});

describe('getInitialState', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
  });

  it('returns loading on first visit', () => {
    expect(getInitialState()).toBe('loading');
  });

  it('returns ready if session flag is set (return visit)', () => {
    sessionStorage.setItem(LIFECYCLE_SESSION_KEY, 'true');
    expect(getInitialState()).toBe('ready');
  });

  it('returns ready if reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn() });
    expect(getInitialState()).toBe('ready');
  });
});
