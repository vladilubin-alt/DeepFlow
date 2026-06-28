import { validateKeystroke } from '../src/utils/keystrokeValidator';

describe('validateKeystroke', () => {
  describe('valid input', () => {
    test('accepts normal words', () => {
      expect(validateKeystroke('hello')).toEqual({ valid: true, reason: null });
    });

    test('accepts sentences', () => {
      expect(validateKeystroke('The quick brown fox')).toEqual({ valid: true, reason: null });
    });

    test('accepts single character', () => {
      expect(validateKeystroke('a')).toEqual({ valid: true, reason: null });
    });

    test('accepts empty text', () => {
      expect(validateKeystroke('')).toEqual({ valid: true, reason: null });
    });
  });

  describe('repetitive characters', () => {
    test('rejects 5+ same chars', () => {
      expect(validateKeystroke('aaaaa')).toEqual({ valid: false, reason: 'repetitive' });
    });

    test('rejects uppercase repetitive', () => {
      expect(validateKeystroke('AAAAA')).toEqual({ valid: false, reason: 'repetitive' });
    });

    test('accepts 4 same chars', () => {
      expect(validateKeystroke('aaaa')).toEqual({ valid: true, reason: null });
    });
  });

  describe('word too long', () => {
    test('rejects word > 25 chars', () => {
      expect(validateKeystroke('a'.repeat(26))).toEqual({ valid: false, reason: 'word_too_long' });
    });

    test('accepts word of 25 chars (non-repetitive)', () => {
      expect(validateKeystroke('abcdefghijklmnopqrstuvwxy')).toEqual({ valid: true, reason: null });
    });
  });

  describe('keyboard walk detection', () => {
    test('rejects horizontal walk', () => {
      expect(validateKeystroke('asdfg')).toEqual({ valid: false, reason: 'keyboard_walk' });
    });

    test('rejects reverse walk', () => {
      expect(validateKeystroke('hgfds')).toEqual({ valid: false, reason: 'keyboard_walk' });
    });

    test('rejects qwerty walk', () => {
      expect(validateKeystroke('qwert')).toEqual({ valid: false, reason: 'keyboard_walk' });
    });

    test('accepts non-adjacent letters', () => {
      expect(validateKeystroke('hello')).toEqual({ valid: true, reason: null });
    });

    test('accepts short adjacent sequences', () => {
      expect(validateKeystroke('asd')).toEqual({ valid: true, reason: null });
    });
  });

  describe('no vowels', () => {
    test('rejects 4+ consonants with no vowels', () => {
      expect(validateKeystroke('rhythm')).toEqual({ valid: false, reason: 'no_vowels' });
    });

    test('accepts 3 consonants', () => {
      expect(validateKeystroke('try')).toEqual({ valid: true, reason: null });
    });

    test('accepts words with vowels', () => {
      expect(validateKeystroke('apple')).toEqual({ valid: true, reason: null });
    });
  });

  describe('consonant cluster', () => {
    test('rejects 6+ consecutive consonants', () => {
      expect(validateKeystroke('abcdfgh')).toEqual({ valid: false, reason: 'consonant_cluster' });
    });

    test('accepts 5 consecutive consonants', () => {
      expect(validateKeystroke('strength')).toEqual({ valid: true, reason: null });
    });
  });

  describe('vowel cluster', () => {
    test('rejects 5+ consecutive vowels', () => {
      expect(validateKeystroke('aeiou')).toEqual({ valid: false, reason: 'vowel_cluster' });
    });

    test('accepts 4 consecutive vowels', () => {
      expect(validateKeystroke('aieo')).toEqual({ valid: true, reason: null });
    });
  });

  describe('last word validation', () => {
    test('rejects bad words even if last word is valid', () => {
      expect(validateKeystroke('aaaaa hello')).toEqual({ valid: false, reason: 'repetitive' });
    });

    test('rejects gibberish in earlier words', () => {
      expect(validateKeystroke('hello aaaaa')).toEqual({ valid: false, reason: 'repetitive' });
    });
  });

  describe('repeated word spam prevention', () => {
    test('rejects 3+ identical consecutive words', () => {
      expect(validateKeystroke('the the the')).toEqual({ valid: false, reason: 'repeated_words' });
    });

    test('rejects 4+ identical consecutive words', () => {
      expect(validateKeystroke('hello hello hello hello')).toEqual({ valid: false, reason: 'repeated_words' });
    });

    test('accepts 2 identical words (not spam)', () => {
      expect(validateKeystroke('the the')).toEqual({ valid: true, reason: null });
    });

    test('accepts different repeated words', () => {
      expect(validateKeystroke('a b a b a')).toEqual({ valid: true, reason: null });
    });
  });
});
