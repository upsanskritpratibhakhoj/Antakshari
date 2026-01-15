import Sanscript from '@indic-transliteration/sanscript';

/**
 * Phonetic normalization layer that converts casual English phonetic input
 * into Sanscript-compatible ITRANS-like input before transliteration.
 * 
 * This enables Google IME-style typing experience where users can type
 * casual phonetic English like "ansham", "moksha", "shlokam" and get
 * proper Devanagari output.
 */

/**
 * Normalizes casual phonetic English input to ITRANS-compatible format.
 * Must be applied BEFORE passing text to Sanscript.t()
 * 
 * @param input - Casual phonetic English input (e.g., "ansham", "moksha")
 * @returns ITRANS-compatible string ready for Sanscript transliteration
 */
export function normalizePhoneticToITRANS(input: string): string {
  let normalized = input.toLowerCase();
  
  // Handle special Sanskrit sounds - order matters!
  // Process longer patterns first to avoid partial matches
  
  // Retroflex consonants (ट, ठ, ड, ढ, ण)
  normalized = normalized.replace(/shh/g, 'Sh');      // शः -> श (emphatic sh)
  normalized = normalized.replace(/chh/g, 'Ch');     // छ
  
  // Handle 'ri' as ऋ (ṛ) - common in Sanskrit words like "krishna", "rishi"
  normalized = normalized.replace(/\bri/g, 'R');     // ऋ at word start
  normalized = normalized.replace(/ri(?=[^aeiou]|$)/g, 'R'); // ऋ before consonant or end
  
  // Anusvara (ं) handling - various patterns
  normalized = normalized.replace(/n(?=[kgc])/g, '~N'); // ङ before k/g, ञ before c
  normalized = normalized.replace(/m(?=[pbm])/g, 'M'); // म before labials
  
  // Handle common anusvara patterns
  normalized = normalized.replace(/(\w)m$/g, '$1M');   // word-ending 'm' -> anusvara
  normalized = normalized.replace(/am(?=[^aeiou])/g, 'aM'); // 'am' before consonant
  normalized = normalized.replace(/um(?=[^aeiou])/g, 'uM'); // 'um' before consonant
  normalized = normalized.replace(/im(?=[^aeiou])/g, 'iM'); // 'im' before consonant
  
  // Visarga (ः) - 'h' at end of word after vowel
  normalized = normalized.replace(/([aeiou])h$/g, '$1H');
  
  // Aspirated consonants - preserve these for ITRANS
  // kh, gh, ch, jh, th, dh, ph, bh are already ITRANS compatible
  
  // Handle 'sh' variations
  normalized = normalized.replace(/shri/g, 'shrI');   // श्री
  normalized = normalized.replace(/sh(?!h)/g, 'sh');  // श (regular sh)
  
  // Handle 'aa', 'ee', 'oo' for long vowels
  normalized = normalized.replace(/aa/g, 'A');        // आ
  normalized = normalized.replace(/ee/g, 'I');        // ई  
  normalized = normalized.replace(/ii/g, 'I');        // ई
  normalized = normalized.replace(/oo/g, 'U');        // ऊ
  normalized = normalized.replace(/uu/g, 'U');        // ऊ
  normalized = normalized.replace(/ai/g, 'ai');       // ऐ (already correct)
  normalized = normalized.replace(/au/g, 'au');       // औ (already correct)
  
  // Handle special 'n' sounds
  normalized = normalized.replace(/ng(?=[aeiou])/g, 'N'); // ङ followed by vowel
  normalized = normalized.replace(/(\w)n$/g, '$1n');  // word-ending 'n' stays as dental
  
  // Handle chandrabindu / anusvara in middle of words  
  normalized = normalized.replace(/(\w)n([^aeioughjkcdtpbmnrlvsy])/g, '$1M$2');
  
  // Common Sanskrit word patterns
  normalized = normalized.replace(/shlok/g, 'shlok'); // श्लोक
  normalized = normalized.replace(/moksh/g, 'mokSh'); // मोक्ष (with retroflex sh)
  normalized = normalized.replace(/ksh/g, 'kSh');     // क्ष
  normalized = normalized.replace(/gya/g, 'j~na');    // ज्ञ (gya/jnana)
  normalized = normalized.replace(/jna/g, 'j~na');    // ज्ञ
  normalized = normalized.replace(/jn/g, 'j~n');      // ज्ञ
  
  // Handle 'tra', 'tri' patterns
  normalized = normalized.replace(/tra/g, 'tra');     // त्र
  normalized = normalized.replace(/tri/g, 'tri');     // त्रि
  
  return normalized;
}

/**
 * Checks if the input contains any Devanagari characters.
 * 
 * @param text - Input text to check
 * @returns true if text contains Devanagari characters
 */
export function containsDevanagari(text: string): boolean {
  // Devanagari Unicode range: U+0900 to U+097F
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Checks if the input is primarily in Roman/Latin script.
 * 
 * @param text - Input text to check
 * @returns true if text is primarily Roman characters
 */
export function isRomanScript(text: string): boolean {
  // Check if text contains Latin letters and no Devanagari
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasDevanagari = containsDevanagari(text);
  return hasLatin && !hasDevanagari;
}

/**
 * Transliterates Roman/English phonetic input to Devanagari.
 * Applies phonetic normalization before transliteration.
 * 
 * @param input - Roman/English phonetic input
 * @returns Devanagari transliterated text
 */
export function transliterateToDevanagari(input: string): string {
  if (!input || !input.trim()) {
    return input;
  }
  
  // If already in Devanagari, return as-is
  if (containsDevanagari(input)) {
    return input;
  }
  
  // If not Roman script, return as-is
  if (!isRomanScript(input)) {
    return input;
  }
  
  try {
    // First normalize the phonetic input to ITRANS-compatible format
    const normalized = normalizePhoneticToITRANS(input);
    
    // Then use Sanscript to transliterate from ITRANS to Devanagari
    const devanagari = Sanscript.t(normalized, 'itrans', 'devanagari');
    
    return devanagari;
  } catch (error) {
    console.error('Transliteration error:', error);
    // Return original input if transliteration fails
    return input;
  }
}

/**
 * Smart input processor that handles both Devanagari and Roman inputs.
 * - If input is Devanagari, returns it as-is
 * - If input is Roman/English, transliterates to Devanagari
 * 
 * @param input - User input (can be Devanagari or Roman)
 * @returns Devanagari text (either original or transliterated)
 */
export function processUserInput(input: string): string {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return trimmed;
  }
  
  // If already Devanagari, return as-is
  if (containsDevanagari(trimmed)) {
    return trimmed;
  }
  
  // Transliterate Roman to Devanagari
  return transliterateToDevanagari(trimmed);
}

/**
 * Provides real-time transliteration preview for input fields.
 * Useful for showing users what their Roman input will look like in Devanagari.
 * 
 * @param input - Current input value
 * @returns Object with original input and Devanagari preview
 */
export function getTransliterationPreview(input: string): {
  original: string;
  devanagari: string;
  isTransliterated: boolean;
} {
  const trimmed = input.trim();
  
  if (!trimmed || containsDevanagari(trimmed)) {
    return {
      original: trimmed,
      devanagari: trimmed,
      isTransliterated: false
    };
  }
  
  const devanagari = transliterateToDevanagari(trimmed);
  
  return {
    original: trimmed,
    devanagari,
    isTransliterated: devanagari !== trimmed
  };
}

export default {
  normalizePhoneticToITRANS,
  containsDevanagari,
  isRomanScript,
  transliterateToDevanagari,
  processUserInput,
  getTransliterationPreview
};
