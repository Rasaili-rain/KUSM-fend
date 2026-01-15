import { axiosInstance } from "./api_provider";
import type { GetAllMeterResponse, MeterData, User } from "./types";

// API methods
export const api = {
  system: {
    async healthCheck(): Promise<boolean> {
      const res = await axiosInstance.get("/");
      return res.status === 200;
    },
  },

  auth: {
    async getGoogleAuthUrl(): Promise<string> {
      const res = await axiosInstance.get("/auth/login/google");
      return res.data.url;
    },
  },

  user: {
    async me(): Promise<User> {
      const res = await axiosInstance.get("/users/me");
      return res.data;
    },
  },

  meter: {
    async getAllMeter(): Promise<GetAllMeterResponse> {
      const response = await axiosInstance.get("/meter");
      return response.data;
    },
  
    async getLatestMeterData(id: number): Promise<MeterData> {
      const response = await axiosInstance.get(`/meter/${id}/latest`);
      return response.data;
    },

    async updateMeterLocation(meterId: number, location: { x: number; y: number }) {
      const response = await axiosInstance.put(`/meter/${meterId}/location`, location);
      return response.data;
    },
  
    async updateMeterLocations(locations: Array<{ meter_id: number; x: number; y: number }>) {
      const response = await axiosInstance.put(`/meter/locations`, { locations });
      return response.data;
    },

  },


  async getMeterDataByDate(name: string, fromDate: string, toDate: string) {
    const response = await axiosInstance.get(`/meter/databydate`, {
      params: {
        meter_name: name,
        from_date: fromDate,
        to_date: toDate,
      },
    });
    return response.data;
  },

  billing: {
    async getBillingData(year: number, month: number) {
      const response = await axiosInstance.get(`/billing/${year}/${month}`);
      return response.data;
    },
  },
};

export default axiosInstance;
