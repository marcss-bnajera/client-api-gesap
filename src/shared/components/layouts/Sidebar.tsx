import { NavLink, useNavigate } from "react-router-dom";
import imgLogo from "../../../assets/img/GESAPLogo.svg";
import {
  FiHome, FiUsers, FiAlertCircle,
  FiUserX, FiSearch, FiLogOut, FiUser,
} from "react-icons/fi";
import { useAuthStore } from "../../../features/auth/store/authStore";
import toast from "react-hot-toast";

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: "Doctor",
  ASISTENTE_PREHOSPITALARIO: "Asistente Prehospitalario",
  ASISTENTE_RECEPCION_CLINICA: "Recepción Clínica",
};

type NavItem = { path: string; icon: React.ElementType; label: string };

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  DOCTOR: [
    { path: "/portal/dashboard",  icon: FiHome,        label: "Dashboard" },
    { path: "/portal/pacientes",  icon: FiUsers,       label: "Pacientes" },
    { path: "/portal/buscar-dpi", icon: FiSearch,      label: "Buscar por DPI" },
  ],
  ASISTENTE_PREHOSPITALARIO: [
    { path: "/portal/dashboard",       icon: FiHome,        label: "Dashboard" },
    { path: "/portal/emergencias",     icon: FiAlertCircle, label: "Nueva Emergencia" },
    { path: "/portal/sin-identificar", icon: FiUserX,       label: "Sin Identificar" },
    { path: "/portal/buscar-dpi",      icon: FiSearch,      label: "Buscar por DPI" },
  ],
  ASISTENTE_RECEPCION_CLINICA: [
    { path: "/portal/dashboard",       icon: FiHome,        label: "Dashboard" },
    { path: "/portal/emergencias",     icon: FiAlertCircle, label: "Emergencias Pendientes" },
    { path: "/portal/sin-identificar", icon: FiUserX,       label: "Sin Identificar" },
    { path: "/portal/buscar-dpi",      icon: FiSearch,      label: "Buscar por DPI" },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const role     = user?.role ?? "";
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE["DOCTOR"];

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Usuario";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#0A2647] to-[#0D3B6E] flex flex-col shadow-2xl shrink-0">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="bg-white/10 border border-white/15 p-2.5 rounded-xl">
          <img src={imgLogo} alt="GESAP" className="h-7 w-7 object-contain brightness-0 invert" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight tracking-tight">GESAP</h1>
          <p className="text-blue-300 text-xs font-medium">Portal Clínico</p>
        </div>
      </div>

      <div className="px-5 pt-6 pb-2">
        <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-widest">Módulos</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                isActive
                  ? "bg-gradient-to-r from-[#00ACC1] to-[#26A69A] text-white shadow-lg shadow-cyan-900/40"
                  : "text-blue-200/80 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`}>
                  <item.icon size={17} />
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ACC1] to-[#26A69A] flex items-center justify-center shrink-0 shadow-md text-white text-sm font-bold">
            {initials || <FiUser size={15} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{displayName}</p>
            <p className="text-blue-300 text-xs truncate">{ROLE_LABELS[role] ?? role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-blue-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
            title="Cerrar sesión"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
