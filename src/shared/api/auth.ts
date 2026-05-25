import { axiosCore } from "./api";

export type ClinicalRole =
  | "DOCTOR"
  | "ASISTENTE_PREHOSPITALARIO"
  | "ASISTENTE_RECEPCION_CLINICA";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hospitalId?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export const loginApi = (payload: { email: string; password: string }) =>
  axiosCore.post<AuthResponse>("/auth/login", payload);
