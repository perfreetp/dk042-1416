import { create } from 'zustand';
import { FilterState, TimeRange } from '@/types';

function getDefaultDateRange() {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
  return { startDate, endDate };
}

const defaultDates = getDefaultDateRange();

interface FilterStore extends FilterState {
  setAircraftTypes: (types: string[]) => void;
  setBases: (bases: string[]) => void;
  setAtaChapters: (chapters: string[]) => void;
  setSeasons: (seasons: string[]) => void;
  setFaultCode: (code: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  aircraftTypes: [],
  bases: [],
  ataChapters: [],
  seasons: [],
  faultCode: '',
  timeRange: 'last3Months',
  startDate: defaultDates.startDate,
  endDate: defaultDates.endDate,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,
  setAircraftTypes: (types) => set({ aircraftTypes: types }),
  setBases: (bases) => set({ bases }),
  setAtaChapters: (chapters) => set({ ataChapters: chapters }),
  setSeasons: (seasons) => set({ seasons }),
  setFaultCode: (code) => set({ faultCode: code }),
  setTimeRange: (range) => {
    const now = new Date();
    let startDate = initialState.startDate;
    const endDate = now.toISOString().split('T')[0];

    switch (range) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
        break;
      case 'custom':
      default:
        break;
    }

    set({ timeRange: range, startDate, endDate });
  },
  setStartDate: (date) => set({ startDate: date, timeRange: 'custom' }),
  setEndDate: (date) => set({ endDate: date, timeRange: 'custom' }),
  resetFilters: () => set(initialState),
}));
