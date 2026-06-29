import { create } from 'zustand'

/** Filters applied on the event discovery/list pages. */
export interface EventFilters {
  q: string
  city: string
  categoryId: string | null
}

interface EventState {
  filters: EventFilters
  setFilters: (filters: Partial<EventFilters>) => void
  resetFilters: () => void
}

const EMPTY_FILTERS: EventFilters = { q: '', city: '', categoryId: null }

/** Client-side event discovery state (filters shared across list/search views). */
export const useEventStore = create<EventState>((set) => ({
  filters: EMPTY_FILTERS,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
}))
