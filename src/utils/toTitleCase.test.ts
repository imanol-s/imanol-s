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

  it('returns empty string unchanged', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('capitalizes a single word', () => {
    expect(toTitleCase('hello')).toBe('Hello');
    expect(toTitleCase('WORLD')).toBe('World');
  });

  it('passes through already-title-cased single word', () => {
    expect(toTitleCase('Python')).toBe('Python');
  });

  it('lowercases ALL CAPS input word-by-word then capitalizes first letter', () => {
    expect(toTitleCase('ALL CAPS INPUT')).toBe('All Caps Input');
    expect(toTitleCase('REACT')).toBe('React');
  });

  it('treats hyphenated words as a single token (only first character capitalized)', () => {
    // The implementation splits on spaces only, so "machine-learning" is one token.
    // Only the first character is uppercased; the part after the hyphen stays lowercase.
    expect(toTitleCase('machine-learning')).toBe('Machine-learning');
    expect(toTitleCase('state-of-the-art methods')).toBe('State-of-the-art Methods');
  });

  it('preserves extra whitespace between words (splits on single space)', () => {
    // The implementation does not collapse whitespace; extra spaces become empty tokens.
    expect(toTitleCase('hello  world')).toBe('Hello  World');
  });

  it('handles strings that start or end with a space', () => {
    // Leading space produces an empty first token; trailing space produces an empty last token.
    expect(toTitleCase(' hello')).toBe(' Hello');
    expect(toTitleCase('hello ')).toBe('Hello ');
  });

  it('handles numbers inline — they pass through unchanged', () => {
    expect(toTitleCase('top 10 results')).toBe('Top 10 Results');
    expect(toTitleCase('version 2 release')).toBe('Version 2 Release');
  });

  it('handles special characters at word boundaries', () => {
    // Punctuation attached to a word is preserved; only the leading character is processed.
    // Letters get uppercased; non-letter leading characters (like punctuation) pass through unchanged.
    expect(toTitleCase('hello, world!')).toBe('Hello, World!');
    // '(' is not a letter — charAt(0).toUpperCase() is still '(', so the word stays lowercase.
    expect(toTitleCase('(parenthesized title)')).toBe('(parenthesized Title)');
  });
});
