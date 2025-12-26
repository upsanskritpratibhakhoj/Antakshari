
import { GoogleGenAI, Type } from "@google/genai";
import { Shloka, ValidationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are a highly scholar in Sanskrit literature and an expert in Shloka Antakshari.
Your role is to help the user practice Sanskrit Shlokas.

Rules:
1. VALIDATION: You must strictly check if the user's input (text or audio) is an authentic Sanskrit Shloka.
2. START CHARACTER: You must strictly verify if the user's Shloka starts with the required character provided in the prompt. If it does not, set 'isValid' to false and explain the error.
3. AI RESPONSE: If valid, you MUST respond with a NEW, UNIQUE Sanskrit Shloka. This shloka MUST start with the LAST phoneme (Akshara) of the user's shloka.
4. OUTPUT FIELDS: For both the user's shloka (shlokaDetails) and your response (aiResponse), provide:
   - text: The full shloka in Devanagari script.
   - lastChar: The starting character for the NEXT turn. For shlokaDetails, this is the last letter the AI must use. For aiResponse, this is the last letter the USER must use next.
5. NO TRANSLITERATION: Do not provide IAST, Hinglish, or translations.
6. AUDIO: If audio is provided, transcribe it accurately into Devanagari.

Be strict with the Antakshari rules. If the user provides a shloka starting with the wrong letter, reject it even if it is a valid shloka.
Return strictly valid JSON.
`;

export const validateAndGetAiResponse = async (
  userContent: string | { data: string; mimeType: string },
  targetChar: string,
  history: { sender: string; content: string }[]
): Promise<ValidationResponse> => {
  try {
    const isAudio = typeof userContent !== 'string';
    const model = 'gemini-3-flash-preview';
    
    const parts: any[] = [];
    if (isAudio) {
      parts.push({ 
        inlineData: {
          data: userContent.data,
          mimeType: userContent.mimeType 
        } 
      });
      parts.push({ text: "Transcribe and validate this Sanskrit shloka audio." });
    }

    const promptText = `
      CURRENT REQUIRED CHARACTER: "${targetChar}"
      Verify if the user's input starts with "${targetChar}".
      
      If it is valid:
      1. Transcribe the user's shloka (if audio) or use the text.
      2. Provide your own response shloka starting with the user's shloka's last letter.
      
      Game History (for context and to avoid repetition): ${JSON.stringify(history.slice(-6))}
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      isValid: false,
      error: "Acharya is currently meditating. Please try again in a moment."
    };
  }
};
