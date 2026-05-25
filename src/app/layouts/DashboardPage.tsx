import React from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar, FiUsers, FiAlertCircle, FiUserX,
  FiSearch, FiActivity, FiChevronRight,
} from "react-icons/fi";
import { useAuthStore } from "../../features/auth/store/authStore";

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: "Doctor",
  ASISTENTE_PREHOSPITALARIO: "Asistente Prehospitalario",
  ASISTENTE_RECEPCION_CLINICA: "Asistente de Recepción Clínica",
};

interface QuickLink {
  path: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
}

const LINKS_BY_ROLE: Record<string, QuickLink[]> = {
  DOCTOR: [
    { path: "/portal/pacientes",  icon: FiUsers,       label: "Pacientes",        description: "Gestionar expedientes clínicos", color: "#0E6BA8" },
    { path: "/portal/buscar-dpi", icon: FiSearch,      label: "Buscar por DPI",   description: "Consulta rápida de paciente",    color: "#00ACC1" },
  ],
  ASISTENTE_PREHOSPITALARIO: [
    { path: "/portal/emergencias",     icon: FiAlertCircle, label: "Nueva Emergencia",     description: "Registrar traslado de emergencia", color: "#ef4444" },
    { path: "/portal/sin-identificar", icon: FiUserX,       label: "Paciente Sin Identificar", description: "Registrar paciente desconocido", color: "#f59e0b" },
    { path: "/portal/buscar-dpi",      icon: FiSearch,      label: "Buscar por DPI",       description: "Consulta rápida de paciente",      color: "#00ACC1" },
  ],
  ASISTENTE_RECEPCION_CLINICA: [
    { path: "/portal/emergencias",     icon: FiAlertCircle, label: "Emergencias Pendientes", description: "Asignar y completar ingresos",  color: "#ef4444" },
    { path: "/portal/sin-identificar", icon: FiUserX,       label: "Sin Identificar",        description: "Ver pacientes no identificados", color: "#f59e0b" },
    { path: "/portal/buscar-dpi",      icon: FiSearch,      label: "Buscar por DPI",         description: "Consulta rápida de paciente",   color: "#00ACC1" },
  ],
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const role        = user?.role ?? "";
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Usuario";
  const roleLabel   = ROLE_LABELS[role] ?? role;
  const links       = LINKS_BY_ROLE[role] ?? LINKS_BY_ROLE["DOCTOR"];

  const dateStr = new Date().toLocaleDateString("es-GT", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647] tracking-tight">
            Bienvenido, {displayName}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">{roleLabel} — Portal Clínico GESAP</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-2 text-sm text-slate-600 shadow-sm">
          <FiCalendar size={16} className="text-[#00ACC1]" />
          <span className="capitalize font-medium hidden md:block">{dateStr}</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="bg-white border border-blue-50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md">
          {displayName.split(" ").slice(0, 2).map((w) => w[0]).join("")}
        </div>
        <div>
          <p className="text-xl font-extrabold text-[#0A2647]">{displayName}</p>
          <span className="inline-block mt-1 text-xs font-bold px-3 py-0.5 rounded-full bg-[#EBF5FB] text-[#0E6BA8] border border-blue-100">
            {roleLabel}
          </span>
        </div>
        {user?.hospitalId && (
          <div className="ml-auto text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Hospital asignado</p>
            <p className="text-sm font-bold text-[#0A2647]">ID #{user.hospitalId}</p>
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div>
        <h3 className="text-[#0A2647] font-bold text-lg mb-4">Accesos rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${link.color}, #0A2647)` }}
                >
                  <link.icon size={20} />
                </div>
                <FiChevronRight size={16} className="text-slate-300 group-hover:text-[#00ACC1] transition-colors" />
              </div>
              <p className="font-bold text-[#0A2647] text-base">{link.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-[#0A2647] rounded-2xl p-5 text-white flex items-center gap-4 shadow-lg">
        <div className="bg-white/10 p-2.5 rounded-xl shrink-0">
          <FiActivity size={20} className="text-blue-300" />
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Recordatorio</p>
          <p className="text-sm font-medium">
            {role === "DOCTOR"
              ? "Mantén los expedientes actualizados tras cada consulta."
              : role === "ASISTENTE_PREHOSPITALARIO"
              ? "Registra siempre la evaluación primaria al crear una emergencia."
              : "Revisa periódicamente las emergencias pendientes de tu hospital."}
          </p>
        </div>
      </div>
    </div>
  );
};
