import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Searches for current product prices using Google Search Grounding.
 * Uses gemini-3-flash-preview for speed and efficiency.
 * Returns a list of structured Product objects.
 */
export const searchProductsWithGrounding = async (query: string): Promise<Product[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the current price of '${query}' in India at 3-4 major online retailers (like Amazon.in, Flipkart, Croma, Reliance Digital, JioMart, Tata Cliq). 
      
      CRITICAL INSTRUCTIONS:
      1. STRICTLY EXCLUDE YouTube, Facebook, Instagram, LinkedIn, Pinterest, or any video/social media links.
      2. ONLY return direct e-commerce product page links where the item can be purchased immediately.
      3. DO NOT return reviews or blog posts.
      4. IMAGE REQUIREMENT: You MUST find a direct URL to the product image (ending in .jpg, .png, .webp). Do not return generic site logos. If a product image cannot be confidently found, set it to null.
      
      Return a JSON array of objects. Each object must have:
      - id: string (unique)
      - name: string (precise product name)
      - retailer: string (store name, e.g., "Amazon", "Flipkart")
      - price: number (numeric value in INR)
      - currency: string (symbol, usually ₹)
      - url: string (direct buy link)
      - inStock: boolean (true if available)
      - image: string (A direct URL to the product image. If not found, leave as null)

      Ensure the data is accurate based on the search results.`,
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
              image: { type: Type.STRING, nullable: true }
            },
            required: ["id", "name", "retailer", "price", "currency", "url", "inStock"]
          }
        }
      },
    });

    if (response.text) {
      const products = JSON.parse(response.text) as Product[];
      // Filter out products with 0 price, missing essential data, or blacklisted domains
      return products.filter(p => {
        const isValidData = p.price > 0 && p.name && p.url;
        const urlLower = p.url.toLowerCase();
        const isNotSocial = !urlLower.includes('youtube.com') && 
                            !urlLower.includes('youtu.be') && 
                            !urlLower.includes('facebook.com') && 
                            !urlLower.includes('instagram.com') &&
                            !urlLower.includes('linkedin.com');
        return isValidData && isNotSocial;
      });
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