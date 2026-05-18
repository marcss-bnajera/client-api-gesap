import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgLogo from "../../../assets/img/GESAPLogo.svg";
import {
    FiMail, FiLock, FiEye, FiEyeOff,
    FiShield, FiUsers, FiActivity,
} from "react-icons/fi";
import type { IconType } from "react-icons/lib";

// Definimos la interfaz para los items de características
interface Feature {
    icon: IconType;
    text: string;
}

const features: Feature[] = [
    { icon: FiUsers, text: "Gestión integral de usuarios y roles" },
    { icon: FiShield, text: "Seguridad y auditoría de accesos" },
    { icon: FiActivity, text: "Reportes y estadísticas en tiempo real" },
];

export const LoginForm: React.FC = () => {
    const [showPass, setShowPass] = useState<boolean>(false);
    const navigate = useNavigate();

    // Tipamos el evento del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate("/admin");
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Panel Izquierdo: Branding (Desktop) ───────────────────────── */}
            <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] relative flex-col items-center justify-center overflow-hidden">

                {/* Círculos decorativos */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
                <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-[#00ACC1]/20" />
                <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-white/5" />
                <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-[#00ACC1]" />

                {/* Contenido */}
                <div className="relative z-10 max-w-md px-12">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
                            <img src={imgLogo} alt="GESAP" className="h-12 w-12 object-contain brightness-0 invert" />
                        </div>
                        <div>
                            <h1 className="text-white text-3xl font-bold tracking-tight">GESAP</h1>
                            <p className="text-blue-300 text-sm font-medium">Portal Administrativo</p>
                        </div>
                    </div>

                    <h2 className="text-white text-4xl font-bold leading-tight mb-4">
                        Sistema de Gestión<br />
                        <span className="text-[#26C6DA]">Hospitalaria</span>
                    </h2>
                    <p className="text-blue-200 text-base mb-10 leading-relaxed">
                        Plataforma centralizada para la administración segura del personal, accesos y operaciones del sistema hospitalario.
                    </p>

                    <div className="space-y-4">
                        {features.map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#00ACC1]/20 border border-[#00ACC1]/30 flex items-center justify-center shrink-0">
                                    <Icon className="text-[#26C6DA]" size={16} />
                                </div>
                                <span className="text-blue-100 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Panel Derecho: Formulario ──────────────────────────── */}
            <div className="w-full lg:w-2/5 bg-[#EBF5FB] flex items-center justify-center p-8">
                <div className="w-full max-w-sm">

                    {/* Logo Mobile */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
                        <div className="bg-[#0A2647] p-3 rounded-xl">
                            <img src={imgLogo} alt="GESAP" className="h-8 w-8 brightness-0 invert" />
                        </div>
                        <div>
                            <h1 className="text-[#0A2647] font-bold text-xl">GESAP</h1>
                            <p className="text-blue-500 text-xs">Sistema Hospitalario</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-[#0A2647] text-2xl font-bold">Iniciar Sesión</h2>
                        <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-[#144272] mb-2 uppercase tracking-wide">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FiMail className="text-[#0E6BA8]" size={16} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="usuario@gesap.gt"
                                    required
                                    className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-blue-200 rounded-xl
                             text-[#0A2647] placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent
                             transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-[#144272] mb-2 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FiLock className="text-[#0E6BA8]" size={16} />
                                </div>
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-blue-200 rounded-xl
                             text-[#0A2647] placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent
                             transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0E6BA8] transition-colors"
                                >
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <a href="#" className="text-xs text-[#0E6BA8] hover:text-[#00ACC1] font-medium transition-colors">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1]
                         text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-900/25
                         transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/30 active:scale-[0.98]"
                        >
                            Iniciar Sesión
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-blue-200 text-center">
                        <p className="text-slate-500 text-xs">
                            ¿Necesitas acceso?{" "}
                            <a href="#" className="text-[#0E6BA8] font-semibold hover:text-[#00ACC1] transition-colors">
                                Solicita una cuenta
                            </a>
                        </p>
                    </div>

                    <p className="text-center text-slate-400 text-xs mt-6">
                        © 2026 GESAP · Sistema Hospitalario de Guatemala
                    </p>
                </div>
            </div>
        </div>
    );
};