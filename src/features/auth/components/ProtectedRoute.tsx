import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useKickListener } from "../../../shared/hooks/useKickListener";
import type { ReactNode } from "react";

const ALLOWED_ROLES = ["DOCTOR", "ASISTENTE_PREHOSPITALARIO", "ASISTENTE_RECEPCION_CLINICA"];

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Escucha eventos de kick en tiempo real desde gesap-api
  useKickListener();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!ALLOWED_ROLES.includes(user?.role ?? "")) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
