import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "../layouts/DashboardPage";
import { MainLayout } from "../../shared/components/layouts/MainLayout";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { PacientesPage } from "../../features/pacientes/components/PacientesPage";
import { PatientDetailPage } from "../../features/pacientes/components/PatientDetailPage";
import { BuscarDpiPage } from "../../features/pacientes/components/BuscarDpiPage";
import { EmergenciasPage } from "../../features/emergencias/components/EmergenciasPage";
import { SinIdentificarPage } from "../../features/sinIdentificar/components/SinIdentificarPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to="/portal/dashboard" replace />} />

      {/* Protected */}
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
