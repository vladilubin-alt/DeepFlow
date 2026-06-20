#!/usr/bin/env python3
import sys
import json
import re

def validate_text(text):
    if not text or not isinstance(text, str):
        return False, "Empty or invalid input type"
        
    cleaned = text.strip()
    if not cleaned:
        return False, "Text contains only whitespace"
        
    # Split text into individual words
    words = cleaned.split()
    if not words:
        return False, "No words found"

    # 1. Check for single character mashing (e.g., "aaaaaaa")
    for word in words:
        if len(word) >= 5:
            # If a word is just the same character repeating
            if len(set(word.lower())) == 1:
                return False, f"Repetitive characters detected in word: '{word}'"

    # 2. Check for extremely long words without spaces (mashing keys across the keyboard)
    for word in words:
        # Strip punctuation from word for analysis
        w_clean = re.sub(r'[^\w]', '', word)
        if len(w_clean) > 25:
            return False, f"Extremely long word token detected: '{word}'"

    # 3. Consonant/Vowel ratio and cluster checks for words of length >= 4
    vowels = set("aeiouy")
    for word in words:
        # Filter for alphanumeric characters only
        w_clean = re.sub(r'[^a-zA-Z]', '', word).lower()
        if len(w_clean) >= 4:
            v_count = sum(1 for c in w_clean if c in vowels)
            c_count = len(w_clean) - v_count
            
            # If a word of 4+ letters contains no vowels or no consonants
            if v_count == 0:
                return False, f"Gibberish check failed (no vowels): '{word}'"
            if c_count == 0:
                # Allow a few rare exceptions like "area" but reject long vowel mashes like "aeiouaeiou"
                if len(w_clean) > 4:
                    return False, f"Gibberish check failed (too many vowels): '{word}'"
            
            # Check for excessive consecutive consonants (e.g., "sdfghjk")
            consecutive_consonants = 0
            for char in w_clean:
                if char not in vowels:
                    consecutive_consonants += 1
                    if consecutive_consonants >= 6:
                        return False, f"Gibberish check failed (consonant cluster): '{word}'"
                else:
                    consecutive_consonants = 0
                    
            # Check for excessive consecutive vowels (e.g., "aeioue")
            consecutive_vowels = 0
            for char in w_clean:
                if char in vowels:
                    consecutive_vowels += 1
                    if consecutive_vowels >= 5:
                        return False, f"Gibberish check failed (vowel cluster): '{word}'"
                else:
                    consecutive_vowels = 0

    return True, "Valid writing"

def main():
    # Read text from stdin (supports long strings and complex inputs safely)
    try:
        input_text = sys.stdin.read()
    except Exception as e:
        print(json.dumps({"valid": False, "reason": f"Read error: {str(e)}"}))
        sys.exit(1)

    is_valid, reason = validate_text(input_text)
    
    output = {
        "valid": is_valid,
        "reason": reason
    }
    print(json.dumps(output))
    sys.exit(0)

if __name__ == '__main__':
    main()
