import { describe, it, expect } from 'vitest';
import { lookupTech, getTechView, techTagSchema, type TechId } from './techRegistry';

describe('techRegistry', () => {
  it('returns entry with icon path for a known tech', () => {
    const entry = lookupTech('python');
    expect(entry).not.toBeNull();
    expect(entry!.iconPath).toContain('python.svg');
  });

  it('returns null for an unknown tech', () => {
    expect(lookupTech('nonexistent' as TechId)).toBeNull();
  });

  it('normalizes case when looking up', () => {
    const entry = lookupTech('Python');
    expect(entry).not.toBeNull();
    expect(entry!.id).toBe('python');
  });
});

describe('getTechView', () => {
  it('returns id, displayName, and iconPath for a known entry with all fields', () => {
    const view = getTechView('python');
    expect(view.id).toBe('python');
    expect(view.displayName).toBe('Python');
    expect(view.iconPath).toContain('python.svg');
  });

  it('falls back displayName to id for entries without an explicit displayName', () => {
    const view = getTechView('astro');
    expect(view.id).toBe('astro');
    expect(view.displayName).toBe('astro');
    expect(view.iconPath).toContain('astro.svg');
  });

  it('returns iconPath null and does not throw for unknown IDs', () => {
    const view = getTechView('nonexistent-tech');
    expect(view.id).toBe('nonexistent-tech');
    expect(view.displayName).toBe('nonexistent-tech');
    expect(view.iconPath).toBeNull();
  });

  it('normalizes whitespace and case before lookup', () => {
    const view = getTechView('  Python  ');
    expect(view.id).toBe('python');
    expect(view.displayName).toBe('Python');
    expect(view.iconPath).toContain('python.svg');
  });
});

describe('techTagSchema', () => {
  it('normalizes a valid tech tag', () => {
    const result = techTagSchema.parse('  Python  ');
    expect(result).toBe('python');
  });

  it('throws for an unknown tech tag', () => {
    expect(() => techTagSchema.parse('nonexistent')).toThrow('Unknown tech tag');
  });
});
