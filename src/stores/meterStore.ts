import { create } from "zustand";
import { api } from "@/utils/api";
import type { Meter, GetAllMeterResponse } from "@/utils/types";

interface MeterState {
  meters: Meter[];
  isLoading: boolean;
  error: string | null;

  fetchMeters: () => Promise<void>;
  clearMeters: () => void;
}

export const useMeterStore = create<MeterState>((set) => ({
  meters: [],
  isLoading: false,
  error: null,

  fetchMeters: async () => {
    set({ isLoading: true, error: null });

    try {
      const res: GetAllMeterResponse = await api.getAllMeter();
      set({
        meters: res.data,
        isLoading: false,
      });
      console.log ("meter loaded with data :",res.data);
    } catch (err) {
      console.error("Failed to fetch meters:", err);
      set({
        error: "Failed to load meters",
        isLoading: false,
      });
    }
  },

  clearMeters: () => {
    set({ meters: [] });
  },
}));
