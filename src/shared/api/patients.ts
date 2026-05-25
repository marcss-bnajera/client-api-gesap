import { axiosCore } from "./api";

export type SexEnum = "MASCULINO" | "FEMENINO";
export type BloodTypeEnum =
  | "A_POSITIVO" | "A_NEGATIVO"
  | "B_POSITIVO" | "B_NEGATIVO"
  | "AB_POSITIVO" | "AB_NEGATIVO"
  | "O_POSITIVO" | "O_NEGATIVO";

export interface Patient {
  id: number;
  dpi: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  firstLastName: string;
  secondLastName: string;
  birthDate: string;
  sex: SexEnum;
  bloodType?: BloodTypeEnum;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreatePatientPayload {
  dpi: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  firstLastName: string;
  secondLastName: string;
  birthDate: string;
  sex: SexEnum;
  bloodType?: BloodTypeEnum;
  phone?: string;
  address?: string;
}

export interface MedicalRecord {
  id: number;
  diagnosis: string;
  notes?: string;
  vitalSigns?: Record<string, unknown>;
  createdAt: string;
  doctor?: { firstName: string; lastName: string };
  hospital?: { name: string };
}

export interface Treatment {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  doctor?: { firstName: string; lastName: string };
}

export type AllergyType = "MEDICATION" | "FOOD" | "ENVIRONMENTAL" | "OTHER";
export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE";

export interface Allergy {
  id: number;
  substance: string;
  type: AllergyType;
  severity: AllergySeverity;
  notes?: string;
}

export interface EmergencyContact {
  id: number;
  fullName: string;
  phone: string;
  relationship?: string;
}

// CRUD Patients
export const getPatientsApi = () => axiosCore.get<Patient[]>("/patients");
export const getPatientByIdApi = (id: number) => axiosCore.get<Patient>(`/patients/${id}`);
export const getPatientByDpiApi = (dpi: string) => axiosCore.get<Patient>(`/patients/dpi/${dpi}`);
export const createPatientApi = (payload: CreatePatientPayload) =>
  axiosCore.post<Patient>("/patients", payload);
export const updatePatientApi = (id: number, payload: Partial<CreatePatientPayload>) =>
  axiosCore.put<Patient>(`/patients/${id}`, payload);

// Medical Records (DOCTOR only)
export const getMedicalRecordsApi = (patientId: number) =>
  axiosCore.get<MedicalRecord[]>(`/patients/${patientId}/medical-records`);
export const createMedicalRecordApi = (payload: {
  patientId: number;
  diagnosis: string;
  notes?: string;
  vitalSigns?: Record<string, unknown>;
}) => axiosCore.post<MedicalRecord>("/patients/medical-records", payload);

// Treatments (DOCTOR only)
export const getTreatmentsApi = (patientId: number) =>
  axiosCore.get<Treatment[]>(`/patients/${patientId}/treatments`);
export const createTreatmentApi = (payload: {
  patientId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
}) => axiosCore.post<Treatment>("/patients/treatments", payload);
export const deactivateTreatmentApi = (id: number) =>
  axiosCore.patch(`/patients/treatments/${id}/deactivate`);

// Allergies
export const getAllergiesApi = (patientId: number) =>
  axiosCore.get<Allergy[]>(`/patients/${patientId}/allergies`);
export const createAllergyApi = (payload: {
  patientId: number;
  substance: string;
  type: AllergyType;
  severity: AllergySeverity;
  notes?: string;
}) => axiosCore.post<Allergy>("/patients/allergies", payload);
export const deleteAllergyApi = (id: number) =>
  axiosCore.delete(`/patients/allergies/${id}`);

// Emergency Contacts
export const getEmergencyContactsApi = (patientId: number) =>
  axiosCore.get<EmergencyContact[]>(`/patients/${patientId}/emergency-contacts`);
