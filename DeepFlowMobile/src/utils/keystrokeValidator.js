const QWERTY_ROWS = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
];

const adjacencyMap = {};
for (const row of QWERTY_ROWS) {
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    const neighbors = new Set();
    if (i > 0) neighbors.add(row[i - 1]);
    if (i < row.length - 1) neighbors.add(row[i + 1]);
    adjacencyMap[ch] = neighbors;
  }
}
adjacencyMap['a'].add('q'); adjacencyMap['a'].add('z');
adjacencyMap['q'].add('a');
adjacencyMap['z'].add('a');
adjacencyMap['p'].add('l');
adjacencyMap['l'].add('p');

function isKeyboardWalk(word) {
  if (word.length < 5) return false;
  const lower = word.toLowerCase();
  let adjacentCount = 0;
  for (let i = 1; i < lower.length; i++) {
    if (adjacencyMap[lower[i - 1]] && adjacencyMap[lower[i - 1]].has(lower[i])) {
      adjacentCount++;
      if (adjacentCount >= 4) return true;
    } else {
      adjacentCount = 0;
    }
  }
  return false;
}

function hasRepetitiveChars(word) {
  if (word.length < 5) return false;
  const unique = new Set(word.toLowerCase().split(''));
  return unique.size === 1;
}

function hasNoVowels(word) {
  return word.length >= 4 && !/[aeiou]/i.test(word);
}

function hasConsonantCluster(word) {
  return /[^aeiou]{6,}/i.test(word);
}

function hasVowelCluster(word) {
  return /[aeiou]{5,}/i.test(word);
}

function isTooLong(word) {
  return word.length > 25;
}

function hasRepeatedWords(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  const last3 = words.slice(-3).map(w => w.toLowerCase());
  return last3[0] === last3[1] && last3[1] === last3[2];
}

function validateWord(word) {
  if (isTooLong(word)) return { valid: false, reason: 'word_too_long' };
  if (hasRepetitiveChars(word)) return { valid: false, reason: 'repetitive' };
  if (isKeyboardWalk(word)) return { valid: false, reason: 'keyboard_walk' };
  if (hasNoVowels(word)) return { valid: false, reason: 'no_vowels' };
  if (hasConsonantCluster(word)) return { valid: false, reason: 'consonant_cluster' };
  if (hasVowelCluster(word)) return { valid: false, reason: 'vowel_cluster' };
  return null;
}

export function validateKeystroke(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  for (const word of words) {
    const result = validateWord(word);
    if (result) return result;
  }
  if (hasRepeatedWords(text)) {
    return { valid: false, reason: 'repeated_words' };
  }

  return { valid: true, reason: null };
}
