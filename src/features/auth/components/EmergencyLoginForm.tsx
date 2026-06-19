import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgLogo from "../../../assets/img/GESAPLogo.svg";
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiAlertCircle, FiLoader, FiAlertTriangle,
} from "react-icons/fi";
import { useEmergencyAuthStore } from "../store/emergencyAuthStore";
import toast from "react-hot-toast";

const features = [
  "Registro de emergencias prehospitalarias",
  "Recepción y atención de emergencias entrantes",
  "Notificaciones en tiempo real entre unidades",
];

const ROLE_LABELS: Record<string, string> = {
  ASISTENTE_PREHOSPITALARIO: "Asistente Prehospitalario",
  ASISTENTE_RECEPCION_CLINICA: "Asistente de Recepción Clínica",
};

export const EmergencyLoginForm: React.FC = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error } = useEmergencyAuthStore();
  const navigate = useNavigate();

  const wasKicked = new URLSearchParams(window.location.search).get("kicked") === "true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Bienvenido al módulo de emergencias");
      navigate("/emergencias");
    } catch {
      toast.error(error ?? "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — rojo oscuro */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#b91c1c] relative flex-col items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-orange-500/20" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <FiAlertCircle className="text-white w-12 h-12" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">GESAP</h1>
              <p className="text-red-300 text-sm font-medium">Módulo de Emergencias</p>
            </div>
          </div>

          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Respuesta rápida,<br />
            <span className="text-orange-300">coordinada en tiempo real</span>
          </h2>
          <p className="text-red-200 text-base mb-10 leading-relaxed">
            Sistema de gestión de emergencias para asistentes prehospitalarios y personal de recepción clínica.
          </p>

          <div className="space-y-4">
            {features.map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                  <FiAlertCircle className="text-orange-300" size={16} />
                </div>
                <span className="text-red-100 text-sm">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 bg-white/10 border border-white/20 rounded-xl text-xs text-red-200 space-y-1">
            <p className="font-bold text-red-100">Roles con acceso:</p>
            {Object.values(ROLE_LABELS).map((r) => (
              <p key={r} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />{r}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-2/5 bg-red-50 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-[#7f1d1d] p-3 rounded-xl">
              <img src={imgLogo} alt="GESAP" className="h-8 w-8 brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-[#7f1d1d] font-bold text-xl">GESAP</h1>
              <p className="text-red-500 text-xs">Módulo de Emergencias</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[#7f1d1d] text-2xl font-bold">Acceso de Emergencias</h2>
            <p className="text-slate-500 text-sm mt-1">Exclusivo para asistentes del sistema</p>
          </div>

          {wasKicked && (
            <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 flex items-start gap-2.5">
              <FiAlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold">Sesión cerrada.</strong>{" "}
                Un administrador del sistema ha cerrado tu sesión activa.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-100 border border-red-300 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#7f1d1d] mb-2 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiMail className="text-red-400" size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asistente@gesap.gt"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-red-200 rounded-xl
                    text-[#7f1d1d] placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7f1d1d] mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiLock className="text-red-400" size={16} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-red-200 rounded-xl
                    text-[#7f1d1d] placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-500 transition-colors"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#7f1d1d] to-[#dc2626] hover:from-[#991b1b] hover:to-[#ef4444]
                text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-900/25
                transition-all duration-200 hover:shadow-xl active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><FiLoader className="animate-spin" size={16} /> Verificando...</>
                : "Ingresar al módulo"
              }
            </button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="/login"
              className="text-slate-400 text-xs hover:text-slate-600 transition-colors"
            >
              ← Volver al portal clínico
            </a>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            © 2026 GESAP · Sistema Hospitalario de Guatemala
          </p>
        </div>
      </div>
    </div>
  );
};
