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
  x?: number | null;  // Map X coordinate (percentage)
  y?: number | null;  // Map Y coordinate (percentage)
}


// @deprecated : we do not use this type of data in the db
// below is the what we do use
export interface MeterData {
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

// we use this kinda data for some reason ; probly export garda power ko matra aayera hola
//---------------------
export interface CurrentDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_current: number;
  phase_B_current: number;
  phase_C_current: number;
}

export interface VoltageDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_voltage: number;
  phase_B_voltage: number;
  phase_C_voltage: number;
}

export interface PowerDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_active_power: number;
  phase_A_power_factor: number;
  phase_B_active_power: number;
  phase_B_power_factor: number;
  phase_C_active_power: number;
  phase_C_power_factor: number;
}

export interface EnergyDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_grid_consumption: number;
  phase_A_exported_power: number;
  phase_B_grid_consumption: number;
  phase_B_exported_power: number;
  phase_C_grid_consumption: number;
  phase_C_exported_power: number;
}
// --------------------




// ---------------api types --------------------
// Single item

export interface GetAllMeterResponse  {
  success: boolean;
  count: number;
  data: Meter[];
};

export type GetLatestMeterDataResponse = MeterData;


export type Billing = {
  total_cost: number;
  avg_cost_per_day: number;
  expensive_day: number;
  expensive_day_cost: number;
};

export type CostPerDay = {
  day: number;
  cost: number;
};

export type CostPerMeter = {
  meter_id: number;
  cost: number;
};

export type AvgCostPerWeekDay = {
  Sunday: number;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
};

export type BillingResponse = {
  billing: Billing;
  cost_per_day: CostPerDay[];
  cost_per_meter: CostPerMeter[];
  avg_cost_per_weekday: AvgCostPerWeekDay;
};


// ---------------common types ------------------

export type TimePoint = {
  x: Date | number | string;
  y: number;
};



export interface GetAllMeterResponse {
  success: boolean;
  count: number;
  data: Meter[];
}

export interface MeterLocationUpdate {
  x: number;
  y: number;
}

export interface BulkLocationUpdate {
  locations: Array<{
    meter_id: number;
    x: number;
    y: number;
  }>;
}