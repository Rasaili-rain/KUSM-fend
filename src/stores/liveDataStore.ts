import { axiosInstance } from "@/utils/api_provider";
import type { CurrentData, VoltageData, PowerData, EnergyData } from "@/utils/types";
import { create } from "zustand";

interface LiveDataResponse {
  current: CurrentData[];
  voltage: VoltageData[];
  power: PowerData[];
  energy: EnergyData[];
  timestamp: string;
}

interface LiveDataState {
  currentData: Record<number, CurrentData>;
  voltageData: Record<number, VoltageData>;
  powerData: Record<number, PowerData>;
  energyData: Record<number, EnergyData>;
  outages: number[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  fetchLiveData: () => Promise<void>;
  clearLiveData: () => void;
}

// Helper function to convert array to keyed object
function keyByMeterId<T extends { meter_id: number }>(items: T[]): Record<number, T> {
  return items.reduce((acc, item) => {
    acc[item.meter_id] = item;
    return acc;
  }, {} as Record<number, T>);
}

export const useLiveDataStore = create<LiveDataState>((set) => ({
  currentData: {},
  voltageData: {},
  powerData: {},
  energyData: {},
  outages: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  fetchLiveData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Single aggregated request
      const response = await axiosInstance.get<LiveDataResponse>("/live-data");
      const { current, voltage, power, energy, timestamp } = response.data;

      // Transform arrays to meter_id keyed objects
      const currentByMeter = keyByMeterId(current);
      const voltageByMeter = keyByMeterId(voltage);
      const powerByMeter = keyByMeterId(power);
      const energyByMeter = keyByMeterId(energy);

      // Detect outages (no current on any phase)
      const outageList: number[] = Object.entries(currentByMeter)
        .filter(([_, data]) => data.phase_A_current === 0 && data.phase_B_current === 0 && data.phase_C_current === 0)
        .map(([meterId]) => parseInt(meterId));

      set({
        currentData: currentByMeter,
        voltageData: voltageByMeter,
        powerData: powerByMeter,
        energyData: energyByMeter,
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

  clearLiveData: () => {
    set({
      currentData: {},
      voltageData: {},
      powerData: {},
      energyData: {},
      outages: [],
      lastUpdate: null,
    });
  },
}));
