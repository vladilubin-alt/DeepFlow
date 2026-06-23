const QWERTY_ROWS = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
];

function buildAdjacencyMap() {
  const adj = {};
  for (const row of QWERTY_ROWS) {
    for (let i = 0; i < row.length; i++) {
      const neighbors = [];
      if (i > 0) neighbors.push(row[i - 1]);
      if (i < row.length - 1) neighbors.push(row[i + 1]);
      adj[row[i]] = neighbors;
    }
  }
  return adj;
}

const ADJ = buildAdjacencyMap();

function isKeyboardWalk(word, minLength) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length < minLength) return false;
  let walkLen = 1;
  for (let i = 1; i < w.length; i++) {
    const prev = w[i - 1];
    const cur = w[i];
    if (ADJ[prev] && ADJ[prev].includes(cur)) {
      walkLen++;
      if (walkLen >= minLength) return true;
    } else {
      walkLen = 1;
    }
  }
  return false;
}

export function validateKeystroke(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, reason: 'Empty or invalid input' };
  }

  const cleaned = text.trim();
  if (!cleaned) {
    return { valid: false, reason: 'Text contains only whitespace' };
  }

  const words = cleaned.split(/\s+/);
  if (!words.length) {
    return { valid: false, reason: 'No words found' };
  }

  for (const word of words) {
    if (word.length >= 5) {
      const lower = word.toLowerCase();
      const uniqueChars = new Set(lower.replace(/[^a-z0-9]/g, ''));
      if (uniqueChars.size === 1) {
        return { valid: false, reason: `Repetitive characters: '${word}'` };
      }
    }
  }

  for (const word of words) {
    const wClean = word.replace(/[^\w]/g, '');
    if (wClean.length > 25) {
      return { valid: false, reason: `Extremely long token: '${word}'` };
    }
  }

  for (const word of words) {
    const wAlpha = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (wAlpha.length >= 4) {
      const vowels = new Set('aeiouy');
      let vCount = 0;
      for (const ch of wAlpha) {
        if (vowels.has(ch)) vCount++;
      }
      const cCount = wAlpha.length - vCount;

      if (vCount === 0) {
        return { valid: false, reason: `No vowels in word: '${word}'` };
      }
      if (cCount === 0 && wAlpha.length > 4) {
        return { valid: false, reason: `Too many vowels: '${word}'` };
      }

      let consecConsonants = 0;
      for (const ch of wAlpha) {
        if (!vowels.has(ch)) {
          consecConsonants++;
          if (consecConsonants >= 6) {
            return { valid: false, reason: `Consonant cluster: '${word}'` };
          }
        } else {
          consecConsonants = 0;
        }
      }

      let consecVowels = 0;
      for (const ch of wAlpha) {
        if (vowels.has(ch)) {
          consecVowels++;
          if (consecVowels >= 5) {
            return { valid: false, reason: `Vowel cluster: '${word}'` };
          }
        } else {
          consecVowels = 0;
        }
      }
    }
  }

  if (isKeyboardWalk(cleaned, 5)) {
    return { valid: false, reason: 'Keyboard walking pattern detected' };
  }

  return { valid: true, reason: 'Valid writing' };
}
