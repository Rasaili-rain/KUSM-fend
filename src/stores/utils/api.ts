import { axiosInstance } from "./api_provider";
import type { User } from "./types";

// API methods
export const api = {
  async getGoogleAuthUrl(): Promise<string> {
    const response = await axiosInstance.get("/auth/login/google");
    return response.data.url;
  },

  async healthCheck():Promise<boolean>{
    const response = await axiosInstance.get("/");
    return response.status === 200;
  },

  async getCurrentUser(): Promise<User> {
    //axios interceptor handels the authorization tokens
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },
};

export default axiosInstance;
