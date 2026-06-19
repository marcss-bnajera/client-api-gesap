import { NavLink, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiClock, FiLogOut, FiUser, FiX } from "react-icons/fi";
import { useEmergencyAuthStore } from "../../../features/auth/store/emergencyAuthStore";
import { useEmergencyNotificationsStore } from "../../../features/emergencias/store/emergencyNotificationsStore";
import toast from "react-hot-toast";

const ROLE_LABELS: Record<string, string> = {
  ASISTENTE_PREHOSPITALARIO: "Asistente Prehospitalario",
  ASISTENTE_RECEPCION_CLINICA: "Recepción Clínica",
};

type NavItem = { path: string; icon: React.ElementType; label: string; badge?: boolean };

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ASISTENTE_PREHOSPITALARIO: [
    { path: "/emergencias/nueva",    icon: FiAlertCircle, label: "Nueva Emergencia" },
    { path: "/emergencias/historial", icon: FiClock,       label: "Mi Historial" },
  ],
  ASISTENTE_RECEPCION_CLINICA: [
    { path: "/emergencias/entrantes",  icon: FiAlertCircle, label: "Emergencias Entrantes", badge: true },
    { path: "/emergencias/historial",  icon: FiClock,       label: "Historial del Hospital" },
  ],
};

interface EmergencySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EmergencySidebar = ({ isOpen = false, onClose }: EmergencySidebarProps) => {
  const { user, logout } = useEmergencyAuthStore();
  const navigate = useNavigate();
  const notifCount = useEmergencyNotificationsStore((s) => s.count);
  const resetNotif = useEmergencyNotificationsStore((s) => s.reset);

  const role     = user?.role ?? "";
  const navItems = NAV_BY_ROLE[role] ?? [];

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Usuario";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/emergencias/login");
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64
      lg:static lg:z-auto lg:translate-x-0
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      bg-gradient-to-b from-[#7f1d1d] to-[#991b1b] flex flex-col shadow-2xl shrink-0
    `}>
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="bg-white/10 border border-white/15 p-2.5 rounded-xl">
          <FiAlertCircle className="text-white h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base leading-tight tracking-tight">GESAP</h1>
          <p className="text-red-300 text-xs font-medium">Módulo Emergencias</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Cerrar menú"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="px-5 pt-6 pb-2">
        <span className="text-red-300 text-[10px] font-semibold uppercase tracking-widest">Módulos</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => item.badge && resetNotif()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                isActive
                  ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-red-900/40"
                  : "text-red-200/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`}>
                  <item.icon size={17} />
                </span>
                <span className="truncate flex-1">{item.label}</span>
                {item.badge && notifCount > 0 && (
                  <span className="bg-orange-400 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
                {isActive && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#dc2626] to-[#f97316] flex items-center justify-center shrink-0 shadow-md text-white text-sm font-bold">
            {initials || <FiUser size={15} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{displayName}</p>
            <p className="text-red-300 text-xs truncate">{ROLE_LABELS[role] ?? role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-300 hover:text-orange-300 transition-colors p-1 rounded-lg hover:bg-white/10"
            title="Cerrar sesión"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
