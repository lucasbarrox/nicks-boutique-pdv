import { create } from 'zustand';

type DateRange = {
  from?: string;
  to?: string;
};

interface SalesFilterState {
  dateRange: DateRange;
  customerId: string | null;
  productId: string | null;
  setDateRange: (range: DateRange) => void;
  setCustomerId: (id: string | null) => void;
  setProductId: (id: string | null) => void;
  clearFilters: () => void;
}

const initialState = {
  dateRange: {},
  customerId: null,
  productId: null,
};

export const useSalesFilterStore = create<SalesFilterState>((set) => ({
  ...initialState,
  setDateRange: (range) => set({ dateRange: range }),
  setCustomerId: (id) => set({ customerId: id }),
  setProductId: (id) => set({ productId: id }),
  clearFilters: () => set(initialState),
}));