import React from 'react';
import { FiCalendar, FiClipboard, FiAlertCircle, FiChevronRight, FiUsers } from "react-icons/fi";
import { KpiCards } from "../../features/components/KpiCards";
interface Appointment {
    patientName: string;
    reason: string;
    time: string;
    status: 'Pendiente' | 'Atendido' | 'En Progreso';
}

// Datos orientados a las citas del día para el Doctor
const todayAppointments: Appointment[] = [
    { patientName: 'Carlos Mendoza', reason: 'Control de Cardiología', time: '09:00 AM', status: 'En Progreso' },
    { patientName: 'María Rodríguez', reason: 'Revisión General', time: '10:15 AM', status: 'Pendiente' },
    { patientName: 'Jorge Palacios', reason: 'Evaluación Preoperatoria', time: '11:30 AM', status: 'Pendiente' },
];

export const DashboardPage: React.FC = () => {
    const dateStr: string = new Date().toLocaleDateString("es-GT", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    // Filtramos la cita más cercana que esté en progreso o pendiente
    const nextAppointment = todayAppointments.find(app => app.status !== 'Atendido') || todayAppointments[0];

    return (
        /* max-w-7xl para que se alargue un poco más en pantallas grandes */
        <div className="w-full max-w-7xl mx-auto space-y-7 animate-fadeIn pb-10">

            {/* 1. HEADER - Rol Doctor */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#0A2647] tracking-tight">Bienvenido, Dr. Juan Pérez</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Gestión y control de sus citas programadas para hoy.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-2 text-sm text-slate-600 shadow-sm">
                    <FiCalendar size={16} className="text-[#00ACC1]" />
                    <span className="capitalize font-medium">{dateStr}</span>
                </div>
            </div>

            {/* 2. ALERTA / PRÓXIMO PACIENTE - Mismo diseño, enfoque médico */}
            {nextAppointment && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                            <FiAlertCircle size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-amber-900 font-bold">Próximo Paciente en Espera</p>
                            <p className="text-xs text-amber-800">
                                {nextAppointment.patientName} — {nextAppointment.reason} a las {nextAppointment.time}.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. METRICAS / ESTADÍSTICAS DEL DÍA (Reemplaza a Medicamentos Activos) */}
            <section>
                <h3 className="text-[#0A2647] font-bold text-lg mb-5 flex items-center gap-2">
                    <FiUsers className="text-[#00ACC1]" size={20} /> Resumen de Actividad
                </h3>
                <KpiCards />
            </section>

            {/* 4. CITAS DEL DIA - Reestructurado manteniendo el Grid del Récord anterior */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[#0A2647] font-bold text-lg flex items-center gap-2">
                        <FiClipboard className="text-[#00ACC1]" size={20} /> Citas Programadas para Hoy
                    </h3>
                    <button className="text-xs font-bold text-[#0E6BA8] hover:underline">
                        Ver agenda completa
                    </button>
                </div>

                <div className="bg-white border border-blue-50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-50">
                        {todayAppointments.map((appointment, i) => (
                            <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${appointment.status === 'En Progreso'
                                        ? 'bg-amber-50 text-amber-600'
                                        : appointment.status === 'Atendido'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-blue-50 text-blue-500'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                    <span className="text-slate-400 font-bold text-[10px]">{appointment.time}</span>
                                </div>
                                <p className="font-bold text-[#0A2647] text-base mb-0.5">{appointment.patientName}</p>
                                <p className="text-xs text-slate-500">{appointment.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. RECORDATORIO MÉDICO - Mismo banner elegante del pie */}
            <div className="bg-[#0A2647] rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Nota de Gestión</p>
                        <p className="text-base font-medium">Recuerde cerrar los historiales clínicos al finalizar cada consulta para mantener el sistema actualizado.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};