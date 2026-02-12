import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// We assume it is pre-configured and accessible in the execution context.
export const isApiConfigured = (): boolean => {
  return !!process.env.API_KEY;
};

// Caching
const searchCache = new Map<string, Product[]>();
const suggestionCache = new Map<string, string[]>();

/**
 * Search Products using Gemini Grounding (Google Search)
 */
export const searchProductsWithGrounding = async (query: string): Promise<Product[]> => {
  if (!process.env.API_KEY) return [];

  const normalizedQuery = query.toLowerCase().trim();
  if (searchCache.has(normalizedQuery)) {
    return searchCache.get(normalizedQuery)!;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Using gemini-3-flash-preview for efficiency and JSON capability
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the current price of '${query}' in India.
            Find 3-4 distinct listings from major retailers like Amazon.in, Flipkart, Croma, or Reliance Digital.
            
            RULES:
            - EXCLUDE social media (Youtube, Facebook, etc).
            - EXCLUDE news articles or blogs.
            - MUST return valid JSON matching the schema.
            - For 'image', try to find a direct URL to the product image on the retailer's site.
            - If price is not found, set it to 0.`,
      config: {
        tools: [{ googleSearch: {} }],
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
              image: { type: Type.STRING }
            },
            required: ["id", "name", "retailer", "price", "currency", "url", "inStock"]
          }
        }
      }
    });

    const responseText = response.text;

    if (responseText) {
      const products = JSON.parse(responseText) as Product[];
      
      const validProducts = products.filter(p => {
        const url = p.url?.toLowerCase() || "";
        const isSocial = url.includes('youtube') || url.includes('twitter') || url.includes('instagram') || url.includes('facebook');
        return p.price > 0 && p.name && !isSocial;
      });

      if (validProducts.length > 0) {
        searchCache.set(normalizedQuery, validProducts);
      }
      return validProducts;
    }
  } catch (error) {
    console.error("Prism: Search Error", error);
  }

  return [];
};

/**
 * Chat with AI Assistant
 */
export const chatWithAI = async (message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
  if (!process.env.API_KEY) throw new Error("API Key not configured");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are Prism, a helpful Indian shopping assistant. Help users compare prices in INR. Be concise."
      },
      history: history as any
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Prism: Chat Error", error);
    return "Sorry, I encountered an error.";
  }
};

/**
 * Analyze Product Image
 */
export const analyzeProductImage = async (base64Image: string, mimeType: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image. Identify the product and any visible price tag. Convert price to INR if needed. Keep it short.",
          },
        ],
      },
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Prism: Vision Error", error);
    return "Error processing image.";
  }
};

/**
 * Get Search Suggestions
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!process.env.API_KEY || query.length < 2) return [];

  const cacheKey = query.toLowerCase().trim();
  if (suggestionCache.has(cacheKey)) return suggestionCache.get(cacheKey)!;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5-8 short, relevant shopping search queries based on: "${query}". Return a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const suggestions = JSON.parse(responseText) as string[];
      suggestionCache.set(cacheKey, suggestions);
      return suggestions;
    }
  } catch (error) {
    // Silent fail for suggestions
  }
  return [];
};
