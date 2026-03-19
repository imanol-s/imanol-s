import { describe, it, expect } from 'vitest';
import { toTitleCase } from './toTitleCase';

describe('toTitleCase', () => {
  it('capitalizes the first letter of each word', () => {
    expect(toTitleCase('crime analysis dashboard')).toBe('Crime Analysis Dashboard');
  });

  it('lowercases AP-style words in middle positions', () => {
    expect(toTitleCase('effect on housing prices')).toBe('Effect on Housing Prices');
    expect(toTitleCase('the art of data science')).toBe('The Art of Data Science');
  });

  it('always capitalizes first word regardless of AP rules', () => {
    expect(toTitleCase('a brief history')).toBe('A Brief History');
    expect(toTitleCase('on the nature of things')).toBe('On the Nature of Things');
  });

  it('always capitalizes last word regardless of AP rules', () => {
    expect(toTitleCase('what systems are built of')).toBe('What Systems Are Built Of');
    expect(toTitleCase('something to look up to')).toBe('Something to Look up To');
  });

  it('passes through already-correct input unchanged', () => {
    expect(toTitleCase('Dallas Crime Effect on Housing Prices')).toBe('Dallas Crime Effect on Housing Prices');
    expect(toTitleCase('Library Management System')).toBe('Library Management System');
  });

  it('handles edge cases', () => {
    expect(toTitleCase('')).toBe('');
    expect(toTitleCase('python')).toBe('Python');
    expect(toTitleCase('ALL CAPS TITLE')).toBe('All Caps Title');
  });
});
