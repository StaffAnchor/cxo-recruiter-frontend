'use client';

import { create } from 'zustand';
import { getDegrees, getInstitutes, type Degree, type Institute } from './api/meta';

interface MetaState {
  degrees: Degree[];
  institutes: Institute[];
  degreesLoaded: boolean;
  institutesLoaded: boolean;
  loadDegrees: () => Promise<void>;
  loadInstitutes: () => Promise<void>;
}

export const useMetaStore = create<MetaState>((set, get) => ({
  degrees: [],
  institutes: [],
  degreesLoaded: false,
  institutesLoaded: false,

  loadDegrees: async () => {
    if (get().degreesLoaded) return;
    const degrees = await getDegrees();
    set({ degrees, degreesLoaded: true });
  },

  loadInstitutes: async () => {
    if (get().institutesLoaded) return;
    const institutes = await getInstitutes();
    set({ institutes, institutesLoaded: true });
  },
}));
