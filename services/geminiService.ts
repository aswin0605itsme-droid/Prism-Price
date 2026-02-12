
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Product } from "../types";

// Fix: Use process.env.API_KEY as per guidelines and to fix ImportMeta error
const API_KEY = process.env.API_KEY || "";

let ai: GoogleGenAI | null = null;

// 2. Initialize the Gemini Client
try {
  if (API_KEY && API_KEY.length > 0) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } else {
    console.warn("Prism: API_KEY is missing. AI features will be disabled.");
  }
} catch (error) {
  console.error("Prism: Failed to initialize Gemini Client.", error);
}

// Helper: Check if API is ready
export const isApiConfigured = (): boolean => {
  return !!ai && API_KEY.length > 0;
};

// Caching to prevent duplicate API calls
const searchCache = new Map<string, Product[]>();
const suggestionCache = new Map<string, string[]>();

/**
 * Search Products using Gemini Grounding (Google Search)
 */
export const searchProductsWithGrounding = async (query: string): Promise<Product[]> => {
  if (!ai) return [];

  const normalizedQuery = query.toLowerCase().trim();
  if (searchCache.has(normalizedQuery)) {
    return searchCache.get(normalizedQuery)!;
  }

  // Schema definition for structured output
  // Fix: Use Schema type instead of SchemaShared
  const productSchema: Schema = {
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
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the current price of '${query}' in India.
      Find 3-4 distinct listings from major retailers like Amazon.in, Flipkart, Croma, or Reliance Digital.
      
      RULES:
      - EXCLUDE social media (Youtube, Facebook, etc).
      - EXCLUDE news articles or blogs.
      - MUST return valid JSON matching the schema.
      - For 'image', try to find a direct URL to the product image on the retailer's site.
      - If price is not found, set it to 0.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: productSchema,
      },
    });

    if (response.text) {
      const products = JSON.parse(response.text) as Product[];
      
      // Filter out bad results (social media, zero price, etc.)
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
export const chatWithAI = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  if (!ai) throw new Error("API Key not configured");

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are Prism, a helpful Indian shopping assistant. Help users compare prices in INR. Be concise.",
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Prism: Chat Error", error);
    return "Sorry, I encountered an error.";
  }
};

/**
 * Analyze Product Image
 */
export const analyzeProductImage = async (base64Image: string, mimeType: string): Promise<string> => {
  if (!ai) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
  if (!ai || query.length < 2) return [];

  const cacheKey = query.toLowerCase().trim();
  if (suggestionCache.has(cacheKey)) return suggestionCache.get(cacheKey)!;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5-8 short, relevant shopping search queries based on: "${query}". Return a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    if (response.text) {
      const suggestions = JSON.parse(response.text) as string[];
      suggestionCache.set(cacheKey, suggestions);
      return suggestions;
    }
  } catch (error) {
    // Silent fail for suggestions
  }
  return [];
};
