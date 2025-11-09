import { City, User, Farm, Product, Testimonial, Subscription, Order, GrowthTimeline, RAGDocument } from './types';
import citiesData from '@/data/cities.json';
import usersData from '@/data/users.json';
import farmsData from '@/data/farms.json';
import productsData from '@/data/products.json';
import testimonialsData from '@/data/testimonials.json';
import subscriptionsData from '@/data/subscriptions.json';
import ordersData from '@/data/orders.json';
import growthTimelineData from '@/data/growth-timeline.json';
import ragData from '@/data/rag.json';

// In-memory stores
let cities: City[] = [...citiesData] as City[];
let users: User[] = [...usersData] as User[];
let farms: Farm[] = [...farmsData] as Farm[];
let products: Product[] = [...productsData] as Product[];
let testimonials: Testimonial[] = [...testimonialsData] as Testimonial[];
let subscriptions: Subscription[] = [...subscriptionsData] as Subscription[];
let orders: Order[] = [...ordersData] as Order[];
let growthTimelines: GrowthTimeline[] = [...growthTimelineData] as GrowthTimeline[];
let ragDocuments: RAGDocument[] = [...ragData] as RAGDocument[];

// Cities
export const getCities = (): City[] => cities;
export const getCityById = (id: string): City | undefined => cities.find(c => c.id === id);

// Users
export const getUsers = (): User[] => users;
export const getUserByEmail = (email: string): User | undefined => users.find(u => u.email === email);
export const getUserById = (id: string): User | undefined => users.find(u => u.id === id);
export const updateUser = (id: string, updates: Partial<User>): User | undefined => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  users[index] = { ...users[index], ...updates };
  return users[index];
};

// Farms
export const getFarms = (cityId?: string): Farm[] => {
  if (!cityId) return farms;
  return farms.filter(f => f.cityId === cityId);
};
export const getFarmById = (id: string): Farm | undefined => farms.find(f => f.id === id);
export const updateFarm = (id: string, updates: Partial<Farm>): Farm | undefined => {
  const index = farms.findIndex(f => f.id === id);
  if (index === -1) return undefined;
  farms[index] = { ...farms[index], ...updates };
  return farms[index];
};

// Products
export const getProducts = (farmId?: string, cityId?: string): Product[] => {
  let filtered = products;
  if (farmId) filtered = filtered.filter(p => p.farmId === farmId);
  if (cityId) {
    const farmIds = farms.filter(f => f.cityId === cityId).map(f => f.id);
    filtered = filtered.filter(p => farmIds.includes(p.farmId));
  }
  return filtered;
};
export const getProductById = (id: string): Product | undefined => products.find(p => p.id === id);
export const updateProduct = (id: string, updates: Partial<Product>): Product | undefined => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  products[index] = { ...products[index], ...updates };
  return products[index];
};
export const createProduct = (product: Omit<Product, 'id'>): Product => {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
  };
  products.push(newProduct);
  return newProduct;
};
export const decrementProductQuantity = (id: string, amount: number): boolean => {
  const product = products.find(p => p.id === id);
  if (!product || product.quantity < amount) return false;
  product.quantity -= amount;
  return true;
};
export const deleteProduct = (id: string): boolean => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
};

// Testimonials
export const getTestimonials = (): Testimonial[] => testimonials;

// Subscriptions
export const getSubscriptions = (): Subscription[] => subscriptions;
export const getSubscriptionByUserId = (userId: string): Subscription | undefined => {
  return subscriptions.find(s => s.userId === userId);
};
export const updateSubscription = (id: string, updates: Partial<Subscription>): Subscription | undefined => {
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  subscriptions[index] = { ...subscriptions[index], ...updates };
  return subscriptions[index];
};

// Orders
export const getOrders = (userId?: string): Order[] => {
  if (!userId) return orders;
  return orders.filter(o => o.userId === userId);
};
export const getOrderById = (id: string): Order | undefined => orders.find(o => o.id === id);
export const createOrder = (order: Omit<Order, 'id' | 'createdAt'>): Order => {
  const newOrder: Order = {
    ...order,
    id: `order-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  return newOrder;
};
export const updateOrder = (id: string, updates: Partial<Order>): Order | undefined => {
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return undefined;
  orders[index] = { ...orders[index], ...updates };
  return orders[index];
};
export const updateOrderItemStatus = (orderId: string, productId: string, farmId: string, status: Order['status']): boolean => {
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;
  const item = order.items.find(i => i.productId === productId && i.farmId === farmId);
  if (!item) return false;
  item.status = status;
  
  // Update overall order status based on item statuses
  const allDelivered = order.items.every(i => i.status === 'delivered');
  const allOutForDelivery = order.items.every(i => i.status === 'out_for_delivery' || i.status === 'delivered');
  const allPreparing = order.items.every(i => i.status === 'preparing' || i.status === 'out_for_delivery' || i.status === 'delivered');
  
  if (allDelivered) {
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
  } else if (allOutForDelivery) {
    order.status = 'out_for_delivery';
  } else if (allPreparing) {
    order.status = 'preparing';
  }
  
  return true;
};

// Growth Timeline
export const getGrowthTimelineByProductId = (productId: string): GrowthTimeline | undefined => {
  return growthTimelines.find(t => t.productId === productId);
};
export const updateGrowthTimeline = (productId: string, entries: GrowthTimeline['entries']): GrowthTimeline => {
  const existing = growthTimelines.find(t => t.productId === productId);
  if (existing) {
    existing.entries = entries;
    return existing;
  }
  const newTimeline: GrowthTimeline = {
    id: `timeline-${Date.now()}`,
    productId,
    entries,
  };
  growthTimelines.push(newTimeline);
  return newTimeline;
};

// RAG Documents
export const getRAGDocuments = (): RAGDocument[] => ragDocuments;
export const updateRAGEmbeddings = (newEmbeddings: RAGDocument[]): void => {
  ragDocuments = newEmbeddings;
};

