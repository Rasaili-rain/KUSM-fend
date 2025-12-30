// -----------------DB types----------------

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meter {
  meter_id: number;
  name: string;
  sn: string;
}

export interface MeterData {
  data_id: number;
  meter_id: number;
  timestamp: string;

  phase_A_current: number;
  phase_A_voltage: number;
  phase_A_active_power: number;
  phase_A_power_factor: number;
  phase_A_grid_consumption: number;
  phase_A_exported_power: number;

  phase_B_current: number;
  phase_B_voltage: number;
  phase_B_active_power: number;
  phase_B_power_factor: number;
  phase_B_grid_consumption: number;
  phase_B_exported_power: number;

  phase_C_current: number;
  phase_C_voltage: number;
  phase_C_active_power: number;
  phase_C_power_factor: number;
  phase_C_grid_consumption: number;
  phase_C_exported_power: number;
};




// ---------------api types --------------------
// Single item

export interface GetAllMeterResponse  {
  success: boolean;
  count: number;
  data: Meter[];
};

export type GetLatestMeterDataResponse = MeterData;


// ---------------common types ------------------

export type TimePoint = {
  x: Date;
  y: number;
};

