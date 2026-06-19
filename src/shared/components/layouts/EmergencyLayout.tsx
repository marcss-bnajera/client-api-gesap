import { useState } from "react";
import { Outlet } from "react-router-dom";
import { EmergencySidebar } from "./EmergencySidebar";
import { FiMenu, FiAlertCircle } from "react-icons/fi";
import { useEmergencyNotifications } from "../../hooks/useEmergencyNotifications";
import { useEmergencyNotificationsStore } from "../../../features/emergencias/store/emergencyNotificationsStore";
import { useEmergencyAuthStore } from "../../../features/auth/store/emergencyAuthStore";

export const EmergencyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useEmergencyAuthStore((s) => s.user);
  const notifCount = useEmergencyNotificationsStore((s) => s.count);

  // Activar notificaciones WebSocket para RECEPCION_CLINICA
  useEmergencyNotifications();

  const isRecepcion = user?.role === "ASISTENTE_RECEPCION_CLINICA";

  return (
    <div className="flex min-h-screen bg-red-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <EmergencySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar de emergencias */}
        <header className="bg-white border-b border-red-100 px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#7f1d1d] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            aria-label="Abrir menú"
          >
            <FiMenu size={20} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <FiAlertCircle className="text-red-600" size={16} />
            </div>
            <span className="font-semibold text-[#7f1d1d] text-sm truncate">
              Módulo de Emergencias
            </span>
          </div>

          {isRecepcion && notifCount > 0 && (
            <div className="flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse shrink-0">
              <FiAlertCircle size={12} />
              <span>{notifCount} nueva{notifCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
