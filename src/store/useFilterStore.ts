import { create } from 'zustand';
import { FilterState } from '@/types';

interface FilterStore extends FilterState {
  setAircraftTypes: (types: string[]) => void;
  setBases: (bases: string[]) => void;
  setAtaChapters: (chapters: string[]) => void;
  setSeasons: (seasons: string[]) => void;
  setFaultCode: (code: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  aircraftTypes: [],
  bases: [],
  ataChapters: [],
  seasons: [],
  faultCode: '',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,
  setAircraftTypes: (types) => set({ aircraftTypes: types }),
  setBases: (bases) => set({ bases }),
  setAtaChapters: (chapters) => set({ ataChapters: chapters }),
  setSeasons: (seasons) => set({ seasons }),
  setFaultCode: (code) => set({ faultCode: code }),
  resetFilters: () => set(initialState),
}));
