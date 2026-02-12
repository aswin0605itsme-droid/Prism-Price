export interface Subscription {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  url: string;
  iconName: string; // Mapping to Lucide icon
  color: string;
}

export interface Product {
  id: string;
  name: string;
  retailer: string;
  price: number;
  currency: string;
  url: string;
  inStock: boolean;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AnalysisResult {
  productName: string;
  detectedPrice: string;
  confidence: string;
  description: string;
}