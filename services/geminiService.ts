import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  // Fix: Do not use a persistent instance. Always create a new GoogleGenAI instance right before making an API call.

  static async generateTaunts(): Promise<string[]> {
    // Correct initialization with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate 20 short, funny, snarky, and harmless one-liner taunts for a user who is trying to click a button that keeps moving away. Keep them playful and safe for all ages. Examples: 'Missed me!', 'Too slow!', 'Try using both hands!'.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              taunts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of funny prank taunts"
              }
            },
            required: ["taunts"]
          }
        }
      });

      // Fix: Access response.text directly (property, not a method)
      const text = response.text || "{}";
      const data = JSON.parse(text);
      return data.taunts || [];
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback taunts
      return [
        "Is your mouse broken?",
        "Wait, was that a click? I didn't feel anything!",
        "Catch me if you can!",
        "I'm just over here now. Oops, now I'm here!",
        "Maybe if you close one eye it'll help?",
        "Are you a turtle? Just checking.",
        "That was close... not!",
        "You're doing great! (Sarcasm included)",
        "The button: 1, You: 0",
        "Whoosh! There I go again!"
      ];
    }
  }
}