import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  condition: string;
  category: string;
  gender: 'Férfi' | 'Női';
  images: string[];
  stock: number;
  sold: boolean;
  reserved_until?: string | null;
  reserved_by?: string | null;
  inventory_status: 'available' | 'reserved' | 'sold';
  created_at: string;
};

export type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  billing_address: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
};

export function getSessionId(): string {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

export async function reserveProduct(productId: string, sessionId: string, minutes: number = 15) {
  const { data, error } = await supabase.rpc('reserve_product', {
    p_product_id: productId,
    p_session_id: sessionId,
    p_minutes: minutes
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}

export async function releaseReservation(productId: string, sessionId: string) {
  const { data, error } = await supabase.rpc('release_reservation', {
    p_product_id: productId,
    p_session_id: sessionId
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}

export async function completePurchase(productId: string, sessionId: string) {
  const { data, error } = await supabase.rpc('complete_purchase', {
    p_product_id: productId,
    p_session_id: sessionId
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}

export async function cleanupExpiredReservations() {
  const { data, error } = await supabase.rpc('cleanup_expired_reservations');

  if (error) {
    console.error('Failed to cleanup reservations:', error);
    return { success: false, error: error.message };
  }

  return data;
}
