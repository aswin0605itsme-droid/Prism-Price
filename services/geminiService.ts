
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Always initialize with named parameter and process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Simple in-memory cache to speed up repeated searches
const searchCache = new Map<string, Product[]>();
const suggestionCache = new Map<string, string[]>();

/**
 * Searches for current product prices using Google Search Grounding.
 * Uses gemini-3-flash-preview for speed and efficiency.
 * Returns a list of structured Product objects.
 */
export const searchProductsWithGrounding = async (query: string): Promise<Product[]> => {
  // Check cache first
  const normalizedQuery = query.toLowerCase().trim();
  if (searchCache.has(normalizedQuery)) {
    console.log("Using cached results for:", normalizedQuery);
    return searchCache.get(normalizedQuery)!;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the current price of '${query}' in India at 3-4 major online retailers (like Amazon.in, Flipkart, Croma, Reliance Digital). 
      
      CRITICAL INSTRUCTIONS:
      1. STRICTLY EXCLUDE social media links.
      2. ONLY return direct e-commerce product page links.
      3. IMAGE REQUIREMENT: You MUST find a direct URL to the product image.
      
      Return a JSON array of objects. Each object must have:
      - id: string
      - name: string
      - retailer: string
      - price: number (INR)
      - currency: string (₹)
      - url: string
      - inStock: boolean
      - image: string (or null)`,
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
      },
    });

    if (response.text) {
      try {
        const products = JSON.parse(response.text) as Product[];
        const filtered = products.filter(p => {
          const isValidData = p.price > 0 && p.name && p.url;
          const urlLower = p.url.toLowerCase();
          const isNotSocial = !urlLower.includes('youtube.com') && 
                              !urlLower.includes('youtu.be') && 
                              !urlLower.includes('facebook.com') && 
                              !urlLower.includes('instagram.com') &&
                              !urlLower.includes('linkedin.com');
          return isValidData && isNotSocial;
        });

        // Store in cache
        if (filtered.length > 0) {
            searchCache.set(normalizedQuery, filtered);
        }
        
        return filtered;
      } catch (parseError) {
        console.error("Gemini grounding response parsing error:", parseError);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

/**
 * Chats with the AI assistant.
 * Uses gemini-3-pro-preview for complex reasoning.
 */
export const chatWithAI = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are a helpful shopping assistant named Prism AI for the Indian market. You help users compare prices in INR (₹) and find deals on sites like Amazon.in and Flipkart. Keep answers short and friendly.",
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm thinking...";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I encountered an error connecting to the server.";
  }
};

/**
 * Analyzes an image to detect products and prices.
 * Uses gemini-3-pro-preview for multimodal capabilities.
 */
export const analyzeProductImage = async (base64Image: string, mimeType: string): Promise<string> => {
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
            text: "Analyze this image. If it's a product, identify it and any visible price tag (convert to INR if possible or state the currency). If it's a receipt, summarize the total. Format your response clearly.",
          },
        ],
      },
    });
    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Error analyzing image.";
  }
};

/**
 * Gets dynamic search suggestions based on input.
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  
  const cacheKey = query.toLowerCase().trim();
  if (suggestionCache.has(cacheKey)) {
    return suggestionCache.get(cacheKey)!;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 short, popular shopping search terms related to "${query}". Return a JSON array of strings. Example: ["iPhone 15", "iPhone 15 case"].`,
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
      if (suggestions.length > 0) {
        suggestionCache.set(cacheKey, suggestions);
      }
      return suggestions;
    }
    return [];
  } catch (error) {
    // console.error("Suggestion Error:", error); // Silently fail for UI
    return [];
  }
};
