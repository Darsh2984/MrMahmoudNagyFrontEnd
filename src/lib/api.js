import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "./storage";

const baseURL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:6000";

export const api = axios.create({ baseURL: `${baseURL}/api` });

// Attach the JWT (if we have one) to every request — mirrors the old
// frontend's services/api.js interceptor pattern.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
