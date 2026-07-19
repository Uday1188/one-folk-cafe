import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerState {
  name: string;
  mobile: string;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setCustomer: (name: string, mobile: string) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      name: '',
      mobile: '',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setCustomer: (name, mobile) => set({ name, mobile }),
      clearCustomer: () => set({ name: '', mobile: '' }),
    }),
    {
      name: 'cafe-customer-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
