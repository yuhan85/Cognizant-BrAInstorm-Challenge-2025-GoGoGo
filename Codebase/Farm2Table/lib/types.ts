export interface City {
  id: string;
  name: string;
  state: string;
  region: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'farmer' | 'customer' | 'driver';
  farmId?: string;
  plan?: 'basic' | 'premium';
}

export interface Farm {
  id: string;
  name: string;
  cityId: string;
  bio: string;
  bannerImage: string;
  videoUrl: string;
  images: string[];
  available: boolean;
}

export interface Product {
  id: string;
  farmId: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  quantity: number;
  available: boolean;
  nutrition: {
    calories: number;
    proteinG: number;
    fiberG: number;
    vitaminCMg: number;
    ironMg: number;
  };
  image: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  farm?: string;
  text: string;
  image: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  cityId: string;
}

export interface Order {
  id: string;
  userId: string;
  subscriptionId: string;
  status: 'created' | 'preparing' | 'out_for_delivery' | 'delivered';
  createdAt: string;
  deliveredAt?: string;
  items: OrderItem[];
  total: number;
  deliveryDate?: string;
  deliveryWindow?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    lat?: number;
    lng?: number;
  };
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  farmId: string;
  status?: 'created' | 'preparing' | 'out_for_delivery' | 'delivered';
}

export interface GrowthTimeline {
  id: string;
  productId: string;
  entries: GrowthEntry[];
}

export interface GrowthEntry {
  date: string;
  stage: string;
  image: string | null;
}

export interface RAGDocument {
  id: string;
  city: string;
  title: string;
  text: string;
  embedding: number[];
}

export interface CustomerProfile {
  name: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  allergies: string;
  specialNotes: string;
}

export interface CarbonCalculatorResult {
  estimated_monthly_kg_co2_saved: number;
  assumptions: string[];
  explanation: string;
}

export interface NutritionAdvisorResult {
  target_nutrients: string[];
  gaps: string[];
  recommendations: Array<{
    item: string;
    why: string;
  }>;
}

