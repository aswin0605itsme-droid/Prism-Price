import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Client Getter - Initializes only when needed
const getClient = (): GoogleGenAI | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("Prism: Waiting for API Key...");
    return null;
  }

  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Prism: Failed to initialize Gemini Client.", error);
    return null;
  }
};

export const isApiConfigured = (): boolean => {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
};

// Caching
const searchCache = new Map<string, Product[]>();
const suggestionCache = new Map<string, string[]>();

export const searchProductsWithGrounding = async (query: string): Promise<Product[]> => {
  const ai = getClient();
  if (!ai) return [];

  const normalizedQuery = query.toLowerCase().trim();
  if (searchCache.has(normalizedQuery)) {
    return searchCache.get(normalizedQuery)!;
  }

  try {
    const productSchema = {
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
          rating: { type: Type.NUMBER, description: "Average product rating (0-5 stars)" },
          reviewCount: { type: Type.NUMBER, description: "Total number of user reviews" }
        },
        required: ["id", "name", "retailer", "price", "currency", "url", "inStock"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Search for the current price of '${query}' in India.
            Find 3-4 distinct listings from major retailers like Amazon.in, Flipkart, Croma, or Reliance Digital.
            
            RULES:
            - EXCLUDE social media (Youtube, Facebook, etc).
            - EXCLUDE news articles or blogs.
            - MUST return valid JSON matching the schema.
            - For 'image', try to find a direct URL to the product image on the retailer's site.
            - Try to extract 'rating' and 'reviewCount' if available on the page.
            - If price is not found, set it to 0.`
          }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        tools: [{ googleSearch: {} }],
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

export const chatWithAI = async (message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
  const ai = getClient();
  if (!ai) return "I'm offline right now. Please check your API key.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-1.5-flash',
      history: history as any,
      config: {
        systemInstruction: "You are Prism, a helpful Indian shopping assistant. Help users compare prices in INR. Be concise."
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Prism: Chat Error", error);
    return "Sorry, I encountered an error.";
  }
};

export const analyzeProductImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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
        ]
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Prism: Vision Error", error);
    return "Error processing image.";
  }
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  const ai = getClient();
  if (!ai || query.length < 2) return [];

  const cacheKey = query.toLowerCase().trim();
  if (suggestionCache.has(cacheKey)) return suggestionCache.get(cacheKey)!;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        role: 'user',
        parts: [{ text: `Generate 5-8 short, relevant shopping search queries based on: "${query}". Return a JSON array of strings.` }]
      },
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