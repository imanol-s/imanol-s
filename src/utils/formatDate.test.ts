import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a date as "Mon YYYY"', () => {
    expect(formatDate(new Date('2025-01-15'))).toBe('Jan 2025');
  });

  it('handles year boundaries correctly', () => {
    expect(formatDate(new Date('2024-12-31'))).toBe('Dec 2024');
    expect(formatDate(new Date('2025-01-01'))).toBe('Jan 2025');
  });

  it('returns mixed case, never uppercase', () => {
    const result = formatDate(new Date('2025-06-15'));
    expect(result).toBe('Jun 2025');
    expect(result).not.toBe('JUN 2025');
  });
});
