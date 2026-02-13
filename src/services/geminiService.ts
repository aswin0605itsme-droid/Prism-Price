import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini Client
const getClient = (): GoogleGenAI | null => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Prism: API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const isApiConfigured = (): boolean => !!process.env.API_KEY;

// Caches
const searchCache = new Map<string, Product[]>();

export const searchProductsWithGrounding = async (query: string): Promise<Product[]> => {
  const ai = getClient();
  if (!ai) return [];

  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)!;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Find real-time pricing for "${query}" in India from major retailers (Amazon, Flipkart, Croma). 
            Return 4 distinct items.
            Exclude used items or accessories unless asked.
            Must include valid image URLs if found.`
          }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              retailer: { type: Type.STRING },
              price: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              url: { type: Type.STRING },
              inStock: { type: Type.BOOLEAN },
              image: { type: Type.STRING },
              rating: { type: Type.NUMBER },
            },
            required: ["id", "name", "retailer", "price", "url"]
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });

    if (response.text) {
      const products = JSON.parse(response.text) as Product[];
      // Filter out invalid items
      const valid = products.filter(p => p.price > 0 && p.name).map(p => ({
        ...p,
        currency: p.currency || '₹',
        inStock: p.inStock ?? true
      }));
      
      searchCache.set(cacheKey, valid);
      return valid;
    }
  } catch (error) {
    console.error("Prism Search Error:", error);
  }
  return [];
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  const ai = getClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{ text: `Suggest 5 specific shopping queries related to: "${query}". JSON Array only.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (e) {
    return [];
  }
};

export const analyzeProductImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key missing";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Identify this product and estimate its price in INR. Be concise." }
        ]
      }
    });
    return response.text || "Could not analyze.";
  } catch (e) {
    console.error("Vision Error:", e);
    return "Error analyzing image.";
  }
};

export const chatWithAI = async (message: string, history: any[]) => {
  const ai = getClient();
  if (!ai) return "Offline";

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history,
      config: { systemInstruction: "You are a helpful shopping assistant." }
    });
    const res = await chat.sendMessage({ message });
    return res.text;
  } catch (e) {
    return "I'm having trouble right now.";
  }
};