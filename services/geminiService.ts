
import { GoogleGenAI, Type } from "@google/genai";
import { Shloka, ValidationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are a Sanskrit scholar helping users practice Shloka Antakshari.

IMPORTANT - BE LENIENT WITH VALIDATION:
- If the text appears to be Sanskrit verse in Devanagari script, ACCEPT it as valid.
- Do NOT reject shlokas just because you cannot verify the exact source.
- Famous shlokas from Raghuvamsha, Bhagavad Gita, Mahabharata, Ramayana, Subhashitas, etc. are all VALID.
- Even lesser-known or regional shlokas should be ACCEPTED if they follow Sanskrit meter patterns.

Rules:
1. START CHARACTER CHECK (MOST IMPORTANT):
   - The FIRST Devanagari letter of the user's shloka MUST match the required character.
   - Compare ONLY the base consonant/vowel, ignoring matras (vowel signs).
   - Example: "यदात्थ" starts with "य" - this is VALID if required character is "य".
   
2. IF THE FIRST CHARACTER MATCHES THE REQUIRED CHARACTER:
   - Set isValid = true
   - Provide shlokaDetails with the user's shloka text and its lastChar
   - Provide aiResponse with YOUR new shloka starting with that lastChar

3. LAST CHARACTER EXTRACTION:
   - For determining lastChar, ignore punctuation (।, ॥), numbers, and source citations.
   - Extract the last meaningful Devanagari consonant from the actual verse.

4. YOUR RESPONSE SHLOKA:
   - Must start with the lastChar of the user's shloka.
   - Should be a different, well-known Sanskrit shloka.

Return valid JSON. Be generous in accepting Sanskrit verses - this is for practice, not academic verification.
`;

export const validateAndGetAiResponse = async (
  userContent: string | { data: string; mimeType: string },
  targetChar: string,
  history: { sender: string; content: string }[]
): Promise<ValidationResponse> => {
  try {
    const isAudio = typeof userContent !== 'string';
    const model = 'gemini-3-flash-preview';
    
    // Preprocess text input: trim whitespace
    let processedContent = userContent;
    if (!isAudio && typeof userContent === 'string') {
      processedContent = userContent.trim();
    }
    
    const parts: any[] = [];
    if (isAudio) {
      parts.push({ 
        inlineData: {
          data: userContent.data,
          mimeType: userContent.mimeType 
        } 
      });
      parts.push({ text: "Transcribe and validate this Sanskrit shloka audio." });
    } else {
      parts.push({ text: `User's input: ${processedContent}` });
    }

    const promptText = `
      REQUIRED STARTING CHARACTER: "${targetChar}"
      
      VALIDATION STEPS:
      1. Check if the user's input starts with "${targetChar}" (the first Devanagari letter).
      2. The shloka "यदात्थ राजन्यकुमार..." starts with "य" - if required char is "य", this is VALID.
      3. Accept the shloka if it looks like Sanskrit verse - don't be overly strict about authenticity.
      
      If the first character is "${targetChar}":
      - Set isValid = true
      - Fill shlokaDetails with text and lastChar (last consonant before any citations/numbers)
      - Fill aiResponse with a new shloka starting with that lastChar
      
      If the first character is NOT "${targetChar}":
      - Set isValid = false
      - Set error to explain what character was found vs expected
      
      Previous shlokas (avoid repetition): ${JSON.stringify(history.slice(-6))}
    `;
    
    parts.push({ text: promptText });

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
