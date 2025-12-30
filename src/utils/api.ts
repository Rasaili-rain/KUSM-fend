import { axiosInstance } from "./api_provider";
import type { GetAllMeterResponse, GetLatestMeterDataResponse, User } from "./types";

// API methods
export const api = {
  async getGoogleAuthUrl(): Promise<string> {
    const response = await axiosInstance.get("/auth/login/google");
    return response.data.url;
  },

  async healthCheck(): Promise<boolean> {
    const response = await axiosInstance.get("/");
    return response.status === 200;
  },

  async getCurrentUser(): Promise<User> {
    //axios interceptor handels the authorization tokens
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },

  async getAllMeter(): Promise<GetAllMeterResponse> {
    const response = await axiosInstance.get("/meter");
    return response.data;
  },

  async getMeterData(id: number): Promise<GetLatestMeterDataResponse> {
    const response = await axiosInstance.get(`/meter/${id}/latest`);
    return response.data;
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
};

export default axiosInstance;
