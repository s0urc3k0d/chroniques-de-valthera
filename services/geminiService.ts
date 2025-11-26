import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// WARNING: In a real app, API Key should not be exposed or hardcoded if client-side only without strict origin policies.
// For this demo, we assume the environment variable or user input is handled securely.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateCampaignIdeas = async (pitch: string, genre: string): Promise<string> => {
  if (!ai) return "API Key not configured.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am a Game Master for a tabletop RPG. 
      Campaign Pitch: "${pitch}"
      Genre/Universe: "${genre}"
      
      Generate 3 creative ideas for the next major plot twist or a unique encounter that fits this theme. 
      Keep it concise and inspiring. Format as a bulleted list in French.`,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content. Please check your API key.";
  }
};

export const enhanceSessionSummary = async (rawNotes: string): Promise<{summary: string, highlights: string[], loot: string[]}> => {
  if (!ai) throw new Error("API Key missing");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Transform these raw RPG session notes into a structured narrative summary suitable for a campaign log.
    
    Raw Notes:
    ${rawNotes}
    
    Output JSON format with:
    - summary: A compelling paragraph narrating the events (in French).
    - highlights: An array of strings, 3-5 key memorable moments (in French).
    - loot: An array of strings, items found (in French).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            loot: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return { summary: rawNotes, highlights: [], loot: [] };
  
  try {
    return JSON.parse(text);
  } catch (e) {
    return { summary: text, highlights: [], loot: [] };
  }
};