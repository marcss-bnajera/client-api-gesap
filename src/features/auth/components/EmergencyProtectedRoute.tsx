import { Navigate } from "react-router-dom";
import { useEmergencyAuthStore } from "../store/emergencyAuthStore";
import { useEmergencyKickListener } from "../../../shared/hooks/useEmergencyKickListener";
import type { ReactNode } from "react";

const EMERGENCY_ROLES = ["ASISTENTE_PREHOSPITALARIO", "ASISTENTE_RECEPCION_CLINICA"];

export const EmergencyProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useEmergencyAuthStore();

  useEmergencyKickListener();

  if (!isAuthenticated) return <Navigate to="/emergencias/login" replace />;
  if (!EMERGENCY_ROLES.includes(user?.role ?? "")) {
    return <Navigate to="/emergencias/login" replace />;
  }

  return <>{children}</>;
};
