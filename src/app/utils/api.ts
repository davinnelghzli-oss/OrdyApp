import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ddaf841f`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Business API
export const saveBusiness = async (businessData: any) => {
  const response = await fetch(`${API_BASE_URL}/business`, {
    method: 'POST',
    headers,
    body: JSON.stringify(businessData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save business');
  }
  
  return response.json();
};

export const getBusiness = async (businessId: string) => {
  const response = await fetch(`${API_BASE_URL}/business/${businessId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get business');
  }
  
  return response.json();
};

// Menu API
export const saveMenu = async (businessId: string, menuItems: any[]) => {
  const response = await fetch(`${API_BASE_URL}/menu/${businessId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ menuItems }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save menu');
  }
  
  return response.json();
};

export const getMenu = async (businessId: string) => {
  const response = await fetch(`${API_BASE_URL}/menu/${businessId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get menu');
  }
  
  return response.json();
};

// Payment API
export const savePaymentMethods = async (businessId: string, paymentMethods: any[]) => {
  const response = await fetch(`${API_BASE_URL}/payment/${businessId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ paymentMethods }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save payment methods');
  }
  
  return response.json();
};

export const getPaymentMethods = async (businessId: string) => {
  const response = await fetch(`${API_BASE_URL}/payment/${businessId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get payment methods');
  }
  
  return response.json();
};

// Orders API
export const createOrder = async (businessId: string, orderData: any) => {
  const response = await fetch(`${API_BASE_URL}/orders/${businessId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }
  
  return response.json();
};

export const getOrders = async (businessId: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${businessId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get orders');
  }
  
  return response.json();
};

export const updateOrderStatus = async (businessId: string, orderId: string, status: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${businessId}/${orderId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order status');
  }
  
  return response.json();
};
