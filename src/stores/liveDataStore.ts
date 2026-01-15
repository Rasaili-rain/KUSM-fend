import { api } from "@/utils/api";
import type { MeterData } from "@/utils/types";
import { create } from "zustand";
import { useMeterStore } from "./meterStore";

interface LiveDataState {
  meterDataMap: { [meterId: number]: MeterData };
  outages: number[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  fetchLiveData: () => Promise<void>;
  fetchSingleMeterData: (meterId: number) => Promise<void>;
  clearLiveData: () => void;
}

export const useLiveDataStore = create<LiveDataState>((set, get) => ({
  meterDataMap: {},
  outages: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  fetchLiveData: async () => {
    set({ isLoading: true, error: null });

    try {
      const meterIds = useMeterStore.getState().meters.map(meter => meter.meter_id);
      if (meterIds.length === 0) {
        console.warn("No meters found in meter store");
        set({ isLoading: false });
        return;
      }

      // Fetch data for all meters in parallel
      const promises = meterIds.map(id => api.meter.getLatestMeterData(id));
      const results = await Promise.allSettled(promises);

      const meterDataByMeterId: Record<number, MeterData> = {};
      const outageList: number[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          const meterId = meterIds[index];

          meterDataByMeterId[meterId] = data;

          // Detect outage (no current on any phase)
          if (
            data.phase_A_current === 0 &&
            data.phase_B_current === 0 &&
            data.phase_C_current === 0
          ) {
            outageList.push(meterId);
          }
        } else {
          console.error(`Failed to fetch data for meter ${meterIds[index]}:`, result.reason);
        }
      });

      const timestamp = new Date().toISOString();

      set({
        meterDataMap: meterDataByMeterId,
        outages: outageList,
        lastUpdate: timestamp,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch live data:", err);
      set({
        error: "Failed to load live data",
        isLoading: false,
      });
    }
  },

  fetchSingleMeterData: async (meterId: number) => {
    try {
      const data = await api.meter.getLatestMeterData(meterId);
      const currentState = get();
      // Update meter data
      const meterDataByMeterId = {
        ...currentState.meterDataMap,
        [meterId]: data,
      };
      // Update outages list
      const isOutage =
        data.phase_A_current === 0 &&
        data.phase_B_current === 0 &&
        data.phase_C_current === 0;

      const outages = isOutage
        ? [...new Set([...currentState.outages, meterId])]
        : currentState.outages.filter((id) => id !== meterId);

      set({
        meterDataMap: meterDataByMeterId,
        outages,
        lastUpdate: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Failed to fetch data for meter ${meterId}:`, err);
      throw err;
    }
  },

  clearLiveData: () => {
    set({
      meterDataMap: {},
      outages: [],
      lastUpdate: null,
    });
  },
}));