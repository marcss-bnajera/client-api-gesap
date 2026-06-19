import axios, { type InternalAxiosRequestConfig } from "axios";
import { useEmergencyAuthStore } from "../../features/auth/store/emergencyAuthStore";

export const axiosEmergency = axios.create({
  baseURL: "/gesap/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = useEmergencyAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

axiosEmergency.interceptors.request.use(attachToken);

axiosEmergency.interceptors.response.use(
  (r) => r,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useEmergencyAuthStore.getState().logout();
      window.location.href = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/emergencias/login`;
    }
    return Promise.reject(error);
  }
);
