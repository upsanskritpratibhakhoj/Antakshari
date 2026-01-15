/**
 * Database mapping shloka text to their audio CDN URLs
 * 
 * Key: The exact shloka text (can be full text or a unique identifier portion)
 * Value: CDN URL to the audio file
 * 
 * Audio files are hosted on GitHub: https://github.com/upsanskritpratibhakhoj/shlokas_audio
 */

export const shlokaAudioDatabase: Record<string, string> = {
  // Meghadutam shlokas
  "तस्मिन्नद्रौ कतिचिदबलाविप्रयुक्तः स कामी नीत्वा मासान् कनकवलयभ्रंशरिक्तप्रकोष्ठः । आषाढस्य प्रथमदिवसे मेघमाश्लिष्टसानुं वप्रक्रीडापरिणतगजप्रेक्षणीयं ददर्श॥ मेघदूतम्, पूर्वमेघः २॥": "https://raw.githubusercontent.com/upsanskritpratibhakhoj/shlokas_audio/main/audio/tasminnidro.mpeg",
  "यां चिन्तयामि सततं मयि सा विरक्ता साऽप्यन्यमिच्छति जनं स जनोऽन्यसक्तः। अस्मत्कृते च परितुष्यति काचिदन्या  धिक् तां च तञ्च मदनञ्च इमाञ्च माञ्च ॥ नीतिशतकम् २ ॥" : "https://raw.githubusercontent.com/upsanskritpratibhakhoj/shlokas_audio/main/audio/yam_chintayami.mpeg"
  
  // Add more shloka-to-audio mappings here
  // Format: "shloka text": "CDN_URL",
  
  // Example entries (uncomment and modify as needed):
  // "कश्चित्कान्ताविरहगुरुणा स्वाधिकारात्प्रमत्तः": "https://raw.githubusercontent.com/upsanskritpratibhakhoj/shlokas_audio/main/audio/kashchitkanta.mpeg",
};

/**
 * Looks up the audio URL for a given shloka text
 * Uses partial matching to find audio even if the text isn't an exact match
 * 
 * @param shlokaText - The shloka text to look up
 * @returns The audio URL if found, undefined otherwise
 */
export function getShlokaAudioUrl(shlokaText: string): string | undefined {
  // First try exact match
  if (shlokaAudioDatabase[shlokaText]) {
    return shlokaAudioDatabase[shlokaText];
  }
  
  // Try partial match - check if the shloka text starts with any key
  const normalizedInput = shlokaText.trim();
  
  for (const [key, url] of Object.entries(shlokaAudioDatabase)) {
    // Check if input starts with key or key starts with input
    const normalizedKey = key.trim();
    
    // Extract first line/pada for matching
    const inputFirstLine = normalizedInput.split('\n')[0].split('।')[0].trim();
    const keyFirstLine = normalizedKey.split('\n')[0].split('।')[0].trim();
    
    if (inputFirstLine === keyFirstLine || 
        normalizedInput.startsWith(normalizedKey.substring(0, 50)) ||
        normalizedKey.startsWith(normalizedInput.substring(0, 50))) {
      return url;
    }
  }
  
  return undefined;
}

/**
 * Checks if a shloka has an associated audio file
 * 
 * @param shlokaText - The shloka text to check
 * @returns true if audio is available, false otherwise
 */
export function hasShlokaAudio(shlokaText: string): boolean {
  return getShlokaAudioUrl(shlokaText) !== undefined;
}

export default shlokaAudioDatabase;
