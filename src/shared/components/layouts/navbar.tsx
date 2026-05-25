import { FiBell, FiUser } from "react-icons/fi";
import { useAuthStore } from "../../../features/auth/store/authStore";

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: "Doctor",
  ASISTENTE_PREHOSPITALARIO: "Asistente Prehospitalario",
  ASISTENTE_RECEPCION_CLINICA: "Recepción Clínica",
};

export const Navbar = () => {
  const { user } = useAuthStore();

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Usuario";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-blue-100 px-6 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0">
      <div>
        <p className="text-[#0A2647] font-bold text-sm">Portal Clínico</p>
        <p className="text-slate-400 text-xs">Sistema Hospitalario GESAP</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-[#0E6BA8] transition-colors rounded-xl hover:bg-blue-50">
          <FiBell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="w-px h-8 bg-blue-100" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#0A2647] leading-tight">{displayName}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[user?.role ?? ""] ?? user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-sm font-bold shadow-md">
            {initials || <FiUser size={15} />}
          </div>
        </div>
      </div>
    </header>
  );
};
