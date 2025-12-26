
import { GoogleGenAI, Type } from "@google/genai";
import { Shloka, ValidationResponse } from "../types";
import { lookupShlokaLocally } from "./localShlokaService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are a Sanskrit scholar helping users practice Shloka Antakshari.

CRITICAL RULES:

1. BE LENIENT WITH VALIDATION:
   - If the text appears to be Sanskrit verse, ACCEPT it as valid.
   - Do NOT reject shlokas just because you cannot verify the exact source.
   - Famous shlokas from any Sanskrit text (Raghuvamsha, Gita, Mahabharata, etc.) are VALID.

2. START CHARACTER CHECK:
   - The FIRST Devanagari letter MUST match the required character.
   - Compare the base consonant/vowel only.
   - If the first letter matches, set isValid = true.

3. CORRECTED TEXT:
   - In shlokaDetails.text, return the COMPLETE/FULL CORRECTED shloka with all padas/lines.
   - Fix any spelling errors, missing diacritics, or formatting issues.
   - If the user provided a partial shloka, return the complete verse.
   - If the user's shloka is slightly wrong, provide the full correct version.

4. LAST CHARACTER EXTRACTION:
   - Ignore punctuation (।, ॥), numbers, and source citations.
   - If the shloka ends with a halant (्), DO NOT use that consonant with halant.
   - Instead, use the consonant that comes BEFORE the halant.
   - Example: If shloka ends with "माधवम्", the lastChar should be "व" (not "म").
   - Extract the last meaningful Devanagari consonant WITHOUT halant.

5. AI RESPONSE:
   - Must start with the lastChar of the user's shloka.
   - Should be a COMPLETE well-known Sanskrit shloka with all padas/lines.

Return valid JSON with FULL shlokas. Be GENEROUS in accepting Sanskrit verses - this is for practice!
Return valid JSON. Be GENEROUS in accepting Sanskrit verses - this is for practice!
`;

export const validateAndGetAiResponse = async (
  userContent: string,
  targetChar: string,
  history: { sender: string; content: string }[]
): Promise<ValidationResponse> => {
  // Try local database lookup first (saves API tokens!)
  const previousShlokas = history.map(h => h.content);
  const localResult = lookupShlokaLocally(userContent, targetChar, previousShlokas);
  
  // If found locally with complete response, return immediately
  if (localResult.found && localResult.userShloka && localResult.aiShloka) {
    console.log('✓ Using local database - saved API tokens!');
    return {
      isValid: true,
      shlokaDetails: localResult.userShloka,
      aiResponse: localResult.aiShloka
    };
  }
  
  // If local lookup found a validation error (wrong starting char), return it
  if (localResult.error) {
    return {
      isValid: false,
      error: localResult.error
    };
  }
  
  // If user shloka was found but no AI response available locally, 
  // we still need AI for the response
  if (localResult.found && localResult.userShloka && !localResult.aiShloka) {
    console.log('✓ User shloka found locally, getting AI response for continuation...');
    return await getAiContinuation(localResult.userShloka, history);
  }
  
  console.log('→ Shloka not in local database, using AI...');
  
  // Fallback to AI when not found locally
  return await callGeminiApi(userContent, targetChar, history);
};

/**
 * Get AI response for continuation when user's shloka was found locally
 * but we need AI to provide the next shloka
 */
const getAiContinuation = async (
  userShloka: Shloka,
  history: { sender: string; content: string }[]
): Promise<ValidationResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const promptText = `
      The user provided a valid Sanskrit shloka: "${userShloka.text}"
      The last character is: "${userShloka.lastChar}"
      
      Please provide a COMPLETE Sanskrit shloka (all padas/lines) that STARTS with "${userShloka.lastChar}".
      
      Previous shlokas (avoid repetition): ${JSON.stringify(history.slice(-6))}
      
      Return ONLY the aiResponse object with the FULL shloka text and lastChar.
    `;
    
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: promptText }] },
      config: {
        systemInstruction: "You are a Sanskrit scholar. Provide a COMPLETE Sanskrit shloka (all padas/lines) starting with the given character. Return valid JSON with aiResponse containing the full text and lastChar.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiResponse: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                lastChar: { type: Type.STRING }
              },
              required: ["text", "lastChar"]
            }
          },
          required: ["aiResponse"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    console.log("AI Continuation Response:", result);
    
    return {
      isValid: true,
      shlokaDetails: userShloka,
      aiResponse: result.aiResponse
    };
  } catch (error) {
    console.error("AI Continuation Error:", error);
    return {
      isValid: true,
      shlokaDetails: userShloka,
      error: "Could not get AI response. Your shloka was valid though!"
    };
  }
};

/**
 * Full AI validation and response (used when local lookup fails)
 */
const callGeminiApi = async (
  userContent: string,
  targetChar: string,
  history: { sender: string; content: string }[]
): Promise<ValidationResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    const processedContent = userContent.trim();
    
    const parts: any[] = [];
    parts.push({ text: `User's input: ${processedContent}` });
    
    const textPrompt = `
      REQUIRED STARTING CHARACTER: "${targetChar}"
      
      VALIDATION STEPS:
      1. Check if the user's input starts with "${targetChar}" (the first Devanagari letter).
      2. Accept the shloka if it looks like Sanskrit verse - don't be overly strict.
      
      If the first character is "${targetChar}":
      - Set isValid = true
      - Fill shlokaDetails.text with the COMPLETE/FULL CORRECTED shloka (all padas/lines, not just what user typed)
      - Fill shlokaDetails.lastChar: If shloka ends with halant (्), take the consonant BEFORE the halant. Example: "माधवम्" → lastChar is "व"
      - Fill aiResponse with a COMPLETE Sanskrit shloka starting with that lastChar (include all padas/lines)
      
      If the first character is NOT "${targetChar}":
      - Set isValid = false
      - Set error to explain what character was found vs expected
      
      IMPORTANT: Return FULL shlokas with all lines/padas, not partial verses.
      
      Previous shlokas (avoid repetition): ${JSON.stringify(history.slice(-6))}
    `;
    
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            error: { type: Type.STRING },
            shlokaDetails: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                lastChar: { type: Type.STRING }
              },
              required: ["text", "lastChar"]
            },
            aiResponse: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                lastChar: { type: Type.STRING }
              },
              required: ["text", "lastChar"]
            }
          },
          required: ["isValid"]
        }
      }
    });

    const result = JSON.parse(response.text);
    console.log("Gemini API Response:", result);
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      isValid: false,
      error: "Acharya is currently meditating. Please try again in a moment."
    };
  }
};
