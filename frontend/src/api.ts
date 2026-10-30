// API Service — connects frontend to the Sportika backend

const BASE_URL = 'http://localhost:3001/api';

// ── Token helpers ──
export const getToken = (): string | null => {
  try {
    const auth = JSON.parse(localStorage.getItem('sportika-auth') || '{}');
    return auth?.state?.token || null;
  } catch {
    return null;
  }
};

// ── Generic fetch wrapper ──
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Something went wrong');
  }
  return json;
}

// ── Auth API ──
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: async () => {
    return apiFetch('/auth/me');
  },

  updateProfile: async (data: { name?: string; phone?: string; avatar?: string }) => {
    return apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addAddress: async (address: object) => {
    return apiFetch('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  deleteAddress: async (id: string) => {
    return apiFetch(`/auth/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  googleAuth: async (data: { email: string; name?: string; avatar?: string }) => {
    return apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  sendOtp: async (email: string) => {
    return apiFetch('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email: string, code: string) => {
    return apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },
};

// ── Orders API ──
export const ordersAPI = {
  create: async (orderData: object) => {
    return apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getMyOrders: async () => {
    return apiFetch('/orders');
  },

  getOrder: async (id: string) => {
    return apiFetch(`/orders/${id}`);
  },
};

// ── Cart API (Persistent Backend Sync) ──
export const cartAPI = {
  getCart: async () => {
    return apiFetch('/cart');
  },

  addItem: async (item: { productId: string; product: object; size: string; color: string; quantity: number; price: number }) => {
    return apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateQuantity: async (productId: string, size: string, color: string, quantity: number) => {
    return apiFetch('/cart/quantity', {
      method: 'PUT',
      body: JSON.stringify({ productId, size, color, quantity }),
    });
  },

  removeItem: async (productId: string, size: string, color: string) => {
    return apiFetch('/cart/item', {
      method: 'DELETE',
      body: JSON.stringify({ productId, size, color }),
    });
  },

  clearCart: async () => {
    return apiFetch('/cart', {
      method: 'DELETE',
    });
  },

  syncCart: async (items: any[]) => {
    return apiFetch('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};

// ── Health check ──
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
};
