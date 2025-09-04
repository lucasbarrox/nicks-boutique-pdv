import { create } from 'zustand';

type DateRange = {
  from?: string;
  to?: string;
};

interface SalesFilterState {
  dateRange: DateRange;
  customerName: string | null;
  setDateRange: (range: DateRange) => void;
  setCustomerName: (name: string | null) => void;
  clearFilters: () => void;
}

const initialState = {
  dateRange: {},
  customerName: null,
};

export const useSalesFilterStore = create<SalesFilterState>((set) => ({
  ...initialState,
  setDateRange: (range) => set({ dateRange: range }),
  setCustomerName: (name) => set({ customerName: name }),
  clearFilters: () => set(initialState),
}));