import { SHLOKA_DATABASE, ShlokaEntry } from '../data/shlokaDatabase';
import { Shloka } from '../types';

/**
 * Normalize Sanskrit text for comparison
 * - Removes extra whitespace
 * - Removes punctuation marks (।, ॥, etc.)
 * - Removes numbers and citations
 */
const normalizeText = (text: string): string => {
  return text
    .replace(/[।॥\|॰॰०१२३४५६७८९0-9\.]/g, '') // Remove punctuation and numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Extract words from Sanskrit text (minimum 2 characters per word)
 */
const extractWords = (text: string): string[] => {
  const normalized = normalizeText(text);
  return normalized.split(' ').filter(word => word.length >= 2);
};

/**
 * Check if user's input matches a shloka from the database
 * Requires:
 * - First word must match closely (since this is antakshari)
 * - At least 50% of user's words must match
 */
const findMatchingShloka = (userInput: string, requiredStartChar: string): ShlokaEntry | null => {
  const userWords = extractWords(userInput);
  
  if (userWords.length < 2) {
    return null; // Need at least 2 words to match
  }

  // First check if input starts with the required character
  const trimmedInput = userInput.trim();
  if (trimmedInput.length > 0 && trimmedInput[0] !== requiredStartChar) {
    return null; // Doesn't start with required character
  }

  const userFirstWord = userWords[0];
  let bestMatch: ShlokaEntry | null = null;
  let bestMatchScore = 0;

  for (const entry of SHLOKA_DATABASE) {
    const dbWords = extractWords(entry.text);
    
    // Check if the database shloka starts with the required character
    const dbText = entry.text.trim();
    if (dbText.length > 0 && dbText[0] !== requiredStartChar) {
      continue; // Skip shlokas that don't start with required character
    }
    
    if (dbWords.length === 0) continue;
    
    // CRITICAL: First word must match closely (high similarity)
    const firstWordSimilarity = levenshteinSimilarity(userFirstWord, dbWords[0]);
    if (firstWordSimilarity < 0.7) {
      continue; // First word doesn't match well enough
    }
    
    // Count matching words (excluding first word which we already checked)
    let matchCount = 1; // First word already matched
    for (let i = 1; i < userWords.length; i++) {
      const userWord = userWords[i];
      if (dbWords.some(dbWord => 
        levenshteinSimilarity(userWord, dbWord) > 0.75
      )) {
        matchCount++;
      }
    }
    
    // Calculate match percentage
    const matchPercentage = matchCount / userWords.length;
    
    // Require at least 50% of words to match AND at least 3 matching words (or all if less than 3)
    const minMatches = Math.min(3, userWords.length);
    if (matchPercentage >= 0.5 && matchCount >= minMatches) {
      // Use combined score: first word similarity + match percentage
      const score = firstWordSimilarity + matchPercentage;
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = entry;
      }
    }
  }
  
  // Only return if we have a good match (score > 1.4 means good first word + good overall match)
  if (bestMatch && bestMatchScore > 1.4) {
    console.log(`Local match found with score ${bestMatchScore.toFixed(2)}`);
    return bestMatch;
  }
  
  return null;
};

/**
 * Calculate Levenshtein similarity between two strings (0 to 1)
 */
const levenshteinSimilarity = (a: string, b: string): number => {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLen = Math.max(a.length, b.length);
  return 1 - matrix[b.length][a.length] / maxLen;
};

/**
 * Get a random shloka from database that starts with the given character
 */
const getRandomShlokaStartingWith = (char: string, excludeTexts: string[] = []): ShlokaEntry | null => {
  const matchingShlokas = SHLOKA_DATABASE.filter(entry => {
    const text = entry.text.trim();
    return text.length > 0 && 
           text[0] === char && 
           !excludeTexts.some(excluded => normalizeText(excluded) === normalizeText(entry.text));
  });
  
  if (matchingShlokas.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * matchingShlokas.length);
  return matchingShlokas[randomIndex];
};

export interface LocalLookupResult {
  found: boolean;
  userShloka?: Shloka;
  aiShloka?: Shloka;
  error?: string;
}

/**
 * Main function to lookup shloka locally
 */
export const lookupShlokaLocally = (
  userInput: string,
  requiredStartChar: string,
  previousShlokas: string[] = []
): LocalLookupResult => {
  const trimmedInput = userInput.trim();
  
  // Check if input starts with required character
  if (trimmedInput.length === 0) {
    return {
      found: false,
      error: `Please enter a shloka starting with '${requiredStartChar}'.`
    };
  }
  
  const firstChar = trimmedInput[0];
  if (firstChar !== requiredStartChar) {
    return {
      found: false,
      error: `Your shloka starts with '${firstChar}' but should start with '${requiredStartChar}'.`
    };
  }
  
  // Try to find the shloka in our database
  const matchedEntry = findMatchingShloka(userInput, requiredStartChar);
  
  if (!matchedEntry) {
    return { found: false }; // Not found locally, will fallback to AI
  }
  
  console.log('✓ Found shloka in local database!');
  console.log('  User input:', trimmedInput.substring(0, 50) + '...');
  console.log('  Matched to:', matchedEntry.text.substring(0, 50) + '...');
  console.log('  Next char:', matchedEntry.nextChar);
  
  // Get AI's response shloka starting with the matched entry's nextChar
  const aiShlokaEntry = getRandomShlokaStartingWith(matchedEntry.nextChar, previousShlokas);
  
  if (!aiShlokaEntry) {
    // No local AI response found, but user's shloka was valid
    // Return partial result - AI will need to provide response
    // NOTE: We show the matched database entry text (the "correct" shloka)
    return {
      found: true,
      userShloka: {
        text: matchedEntry.text, // Show the full correct shloka from database
        translation: '',
        lastChar: matchedEntry.nextChar
      }
    };
  }
  
  return {
    found: true,
    userShloka: {
      text: matchedEntry.text, // Show the full correct shloka from database
      translation: '',
      lastChar: matchedEntry.nextChar
    },
    aiShloka: {
      text: aiShlokaEntry.text,
      translation: '',
      lastChar: aiShlokaEntry.nextChar
    }
  };
};

/**
 * Get statistics about available shlokas for each starting character
 */
export const getShlokaStats = (): Map<string, number> => {
  const stats = new Map<string, number>();
  
  for (const entry of SHLOKA_DATABASE) {
    const text = entry.text.trim();
    if (text.length > 0) {
      const firstChar = text[0];
      stats.set(firstChar, (stats.get(firstChar) || 0) + 1);
    }
  }
  
  return stats;
};
