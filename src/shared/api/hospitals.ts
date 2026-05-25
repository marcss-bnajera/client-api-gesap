import { axiosCore } from "./api";

export interface Hospital {
  id: number;
  name: string;
  code: string;
}

export const getActiveHospitalsApi = () =>
  axiosCore.get<Hospital[]>("/hospitals/active");
