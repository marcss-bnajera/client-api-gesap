import { axiosCore } from "./api";

export type EmergencyStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Emergency {
  id: number;
  status: EmergencyStatus;
  notes?: string;
  transferDate?: string;
  createdAt: string;
  patient?: { id: number; firstName: string; firstLastName: string; dpi: string };
  unidentifiedPatient?: { id: number; sex: string; estimatedAge?: number };
  hospitalDestination?: { id: number; name: string };
  createdBy?: { firstName: string; lastName: string };
  assignedTo?: { firstName: string; lastName: string };
  primaryAssessment?: Record<string, unknown>;
  secondaryAssessment?: Record<string, unknown>;
  completionRecord?: Record<string, unknown>;
}

export interface CreateEmergencyPayload {
  patientId?: number;
  unidentifiedPatientId?: number;
  hospitalDestinationId: number;
  primaryAssessment?: Record<string, unknown>;
  secondaryAssessment?: Record<string, unknown>;
  notes?: string;
  transferDate?: string;
}

export interface UnidentifiedPatient {
  id: number;
  sex: string;
  estimatedAge?: number;
  headFaceDescription?: string;
  shirtDescription?: string;
  pantsDescription?: string;
  shoesDescription?: string;
  jacketDescription?: string;
  hatDescription?: string;
  additionalNotes?: string;
  transferDate: string;
  hospital?: { id: number; name: string };
  identifiedPatient?: { id: number; firstName: string; firstLastName: string };
}

export interface CreateUnidentifiedPatientPayload {
  sex: "MASCULINO" | "FEMENINO";
  estimatedAge?: number;
  hatDescription?: string;
  headFaceDescription?: string;
  shirtDescription?: string;
  jacketDescription?: string;
  pantsDescription?: string;
  shoesDescription?: string;
  additionalNotes?: string;
  hospitalId: number;
  transferDate: string;
}

// Emergencias
export const createEmergencyApi = (payload: CreateEmergencyPayload) =>
  axiosCore.post<Emergency>("/emergencies", payload);

export const getPendingEmergenciesApi = (hospitalId: number) =>
  axiosCore.get<Emergency[]>(`/emergencies/pending/${hospitalId}`);

export const getEmergencyByIdApi = (id: number) =>
  axiosCore.get<Emergency>(`/emergencies/${id}`);

export const updateEmergencyApi = (id: number, payload: Partial<CreateEmergencyPayload>) =>
  axiosCore.patch<Emergency>(`/emergencies/${id}`, payload);

export const assignEmergencyApi = (id: number) =>
  axiosCore.patch<Emergency>(`/emergencies/${id}/assign`);

export const completeEmergencyApi = (id: number, completionRecord: Record<string, unknown>) =>
  axiosCore.patch<Emergency>(`/emergencies/${id}/complete`, { completionRecord });

// Pacientes sin identificar
export const createUnidentifiedPatientApi = (payload: CreateUnidentifiedPatientPayload) =>
  axiosCore.post<UnidentifiedPatient>("/unidentified-patients", payload);

export const getUnidentifiedPatientsApi = () =>
  axiosCore.get<UnidentifiedPatient[]>("/unidentified-patients");
