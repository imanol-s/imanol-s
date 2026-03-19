import { describe, it, expect } from 'vitest';
import { lookupTech, type TechId } from './techRegistry';

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
