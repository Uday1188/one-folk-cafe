import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  tableNumber: string | null;
  setTableNumber: (tableNumber: string | null) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  tableNumber: null,
  setTableNumber: (tableNumber) => set({ tableNumber }),
  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    });
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      // Remove item from cart instead of silently ignoring
      set((state) => ({
        items: state.items.filter((item) => item.id !== productId),
      }));
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    // Use parseFloat + toFixed to prevent floating-point precision issues
    const raw = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
    return parseFloat(raw.toFixed(2));
  },
}));
