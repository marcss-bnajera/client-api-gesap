import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "../layouts/DashboardPage";
import { MainLayout } from "../../shared/components/layouts/MainLayout";
import { EmergencyLayout } from "../../shared/components/layouts/EmergencyLayout";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { EmergencyLoginForm } from "../../features/auth/components/EmergencyLoginForm";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { EmergencyProtectedRoute } from "../../features/auth/components/EmergencyProtectedRoute";
import { PacientesPage } from "../../features/pacientes/components/PacientesPage";
import { PatientDetailPage } from "../../features/pacientes/components/PatientDetailPage";
import { BuscarDpiPage } from "../../features/pacientes/components/BuscarDpiPage";
import { EmergenciasPage } from "../../features/emergencias/components/EmergenciasPage";
import { NuevaEmergenciaPage } from "../../features/emergencias/components/NuevaEmergenciaPage";
import { EntrantesPage } from "../../features/emergencias/components/EntrantesPage";
import { HistorialEmergenciasPage } from "../../features/emergencias/components/HistorialEmergenciasPage";
import { SinIdentificarPage } from "../../features/sinIdentificar/components/SinIdentificarPage";
import { useEmergencyAuthStore } from "../../features/auth/store/emergencyAuthStore";

const EmergencyIndex = () => {
  const user = useEmergencyAuthStore((s) => s.user);
  if (user?.role === "ASISTENTE_RECEPCION_CLINICA") return <Navigate to="entrantes" replace />;
  return <Navigate to="nueva" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to="/portal/dashboard" replace />} />

      {/* Portal clínico */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pacientes" element={<PacientesPage />} />
        <Route path="pacientes/:id" element={<PatientDetailPage />} />
        <Route path="buscar-dpi" element={<BuscarDpiPage />} />
        <Route path="emergencias" element={<EmergenciasPage />} />
        <Route path="sin-identificar" element={<SinIdentificarPage />} />
      </Route>

      {/* Módulo de emergencias — auth separado */}
      <Route path="/emergencias/login" element={<EmergencyLoginForm />} />
      <Route
        path="/emergencias"
        element={
          <EmergencyProtectedRoute>
            <EmergencyLayout />
          </EmergencyProtectedRoute>
        }
      >
        <Route index element={<EmergencyIndex />} />
        <Route path="nueva"     element={<NuevaEmergenciaPage />} />
        <Route path="entrantes" element={<EntrantesPage />} />
        <Route path="historial" element={<HistorialEmergenciasPage />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-[#EBF5FB] flex items-center justify-center">
            <div className="text-center">
              <p className="text-8xl font-extrabold text-[#0A2647]/10">404</p>
              <h2 className="text-2xl font-bold text-[#0A2647] mt-2">Página no encontrada</h2>
              <a href="/portal/dashboard" className="mt-4 inline-block text-[#0E6BA8] font-semibold hover:text-[#00ACC1] transition-colors">
                ← Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};
