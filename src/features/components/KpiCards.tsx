import React from 'react';
import { FiActivity, FiTrendingUp, FiCheckCircle } from "react-icons/fi";

interface DoctorMetrics {
    title: string;
    value: string;
    status: string;
    color: string;
    icon: React.ReactNode;
}

const doctorMetrics: DoctorMetrics[] = [
    {
        title: "Pacientes del Día",
        value: "18 Pacientes",
        status: "Progreso: 65%",
        color: "#00ACC1",
        icon: <FiActivity size={20} />
    },
    {
        title: "Atenciones Completadas",
        value: "12 Finalizadas",
        status: "Al día",
        color: "#26A69A",
        icon: <FiCheckCircle size={20} />
    },
];

export const KpiCards: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {doctorMetrics.map((metric, i) => (
                <div
                    key={i}
                    className="rounded-2xl p-5 shadow-sm border border-blue-100/60 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all animate-fadeIn"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md"
                            style={{ background: `linear-gradient(135deg, ${metric.color}, #0E6BA8)` }}
                        >
                            {metric.icon}
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 uppercase">
                            <FiTrendingUp size={11} /> {metric.status}
                        </span>
                    </div>

                    <p className="text-xl font-extrabold text-[#0A2647] leading-tight mb-1">
                        {metric.title}
                    </p>
                    <p className="text-3xl font-black text-[#0A2647] my-1">{metric.value}</p>
                </div>
            ))}
        </div>
    );
};