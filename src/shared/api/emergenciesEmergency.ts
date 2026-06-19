// API de emergencias usando el token del módulo de emergencias (emergencyAuthStore).
// Separado de emergencies.ts que usa el token del portal clínico.
import { axiosEmergency } from "./apiEmergency";
import type { Emergency, CreateEmergencyPayload } from "./emergencies";

export const createEmergencyEmApi = (payload: CreateEmergencyPayload) =>
  axiosEmergency.post<Emergency>("/emergencies", payload);

export const getMyEmergenciesEmApi = () =>
  axiosEmergency.get<Emergency[]>("/emergencies/mine");

export const getPendingEmergenciesEmApi = (hospitalId: number) =>
  axiosEmergency.get<Emergency[]>(`/emergencies/pending/${hospitalId}`);

export const getHospitalEmergenciesEmApi = (hospitalId: number, status?: string) =>
  axiosEmergency.get<Emergency[]>(`/emergencies/hospital/${hospitalId}`, {
    params: status ? { status } : undefined,
  });

export const getEmergencyConstanciaEmApi = (id: number) =>
  axiosEmergency.get<{ constancia: Record<string, unknown> }>(`/emergencies/${id}/constancia`);

export const assignEmergencyEmApi = (id: number) =>
  axiosEmergency.patch<Emergency>(`/emergencies/${id}/assign`);

export const completeEmergencyEmApi = (id: number, completionRecord: Record<string, unknown>) =>
  axiosEmergency.patch<Emergency>(`/emergencies/${id}/complete`, { completionRecord });

export type { Emergency };

// Endpoints auxiliares usando token de emergencias
import type { Hospital } from "./hospitals";
import type { Patient } from "./patients";

export const getActiveHospitalsEmApi = () =>
  axiosEmergency.get<Hospital[]>("/hospitals/active");

export const getPatientByDpiEmApi = (dpi: string) =>
  axiosEmergency.get<Patient>(`/patients/dpi/${dpi}`);
