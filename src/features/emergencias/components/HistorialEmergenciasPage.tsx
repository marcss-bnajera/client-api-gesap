import React, { useEffect, useState } from "react";
import {
  FiClock, FiLoader, FiRefreshCw, FiUser, FiMapPin,
  FiFileText, FiFilter,
} from "react-icons/fi";
import {
  getMyEmergenciesEmApi, getHospitalEmergenciesEmApi,
  getEmergencyConstanciaEmApi, type Emergency,
} from "../../../shared/api/emergenciesEmergency";
import { useEmergencyAuthStore } from "../../auth/store/emergencyAuthStore";
import toast from "react-hot-toast";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En Proceso", COMPLETED: "Completada",
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "IN_PROGRESS", label: "En Proceso" },
  { value: "COMPLETED", label: "Completadas" },
];

export const HistorialEmergenciasPage: React.FC = () => {
  const user = useEmergencyAuthStore((s) => s.user);
  const isPrehospitalario = user?.role === "ASISTENTE_PREHOSPITALARIO";
  const isRecepcion       = user?.role === "ASISTENTE_RECEPCION_CLINICA";

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading]         = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showConstancia, setShowConstancia] = useState<Record<string, unknown> | null>(null);
  const [loadingConstancia, setLoadingConstancia] = useState<number | null>(null);

  const fetchHistory = async (status?: string) => {
    setLoading(true);
    try {
      if (isPrehospitalario) {
        const { data } = await getMyEmergenciesEmApi();
        const filtered = status ? data.filter((e) => e.status === status) : data;
        setEmergencies(filtered);
      } else if (isRecepcion && user.hospitalId) {
        const { data } = await getHospitalEmergenciesEmApi(user.hospitalId, status || undefined);
        setEmergencies(data);
      }
    } catch { toast.error("Error al cargar historial"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchHistory(value || undefined);
  };

  const handleVerConstancia = async (em: Emergency) => {
    setLoadingConstancia(em.id);
    try {
      const { data } = await getEmergencyConstanciaEmApi(em.id);
      setShowConstancia(data.constancia);
    } catch { toast.error("Error al obtener constancia"); }
    finally { setLoadingConstancia(null); }
  };

  const completed = emergencies.filter((e) => e.status === "COMPLETED");
  const others    = emergencies.filter((e) => e.status !== "COMPLETED");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#7f1d1d]">
            {isPrehospitalario ? "Mi Historial" : "Historial del Hospital"}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {emergencies.length} emergencia{emergencies.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="relative">
            <FiFilter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-white border border-red-200 rounded-xl text-[#7f1d1d] focus:outline-none focus:ring-2 focus:ring-red-400 transition-all appearance-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => fetchHistory(statusFilter || undefined)}
            className="p-2.5 text-red-700 border border-red-200 bg-white rounded-xl hover:bg-red-50 transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <FiLoader className="animate-spin text-red-500" size={28} />
        </div>
      ) : emergencies.length === 0 ? (
        <div className="bg-white border border-red-100 rounded-2xl p-10 text-center shadow-sm">
          <FiClock size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-400">No hay registros en el historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...others, ...completed].map((em) => (
            <div key={em.id} className="bg-white border border-red-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiClock size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[em.status]}`}>
                      {STATUS_LABEL[em.status]}
                    </span>
                    <span className="text-xs text-slate-400">#{em.id}</span>
                  </div>

                  {em.patient && (
                    <div className="flex items-center gap-1.5 text-sm text-[#7f1d1d] font-semibold">
                      <FiUser size={13} className="text-slate-400" />
                      {em.patient.firstName} {em.patient.firstLastName}
                      <span className="font-mono text-xs text-slate-400">({em.patient.dpi})</span>
                    </div>
                  )}
                  {em.unidentifiedPatient && (
                    <p className="text-sm text-[#7f1d1d] font-semibold">
                      Paciente sin identificar — {em.unidentifiedPatient.sex}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                    {em.hospitalDestination && (
                      <span className="flex items-center gap-1">
                        <FiMapPin size={11} /> {em.hospitalDestination.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiClock size={11} /> {new Date(em.createdAt).toLocaleString("es-GT")}
                    </span>
                    {em.createdBy && (
                      <span>Por: {em.createdBy.firstName} {em.createdBy.lastName}</span>
                    )}
                  </div>
                  {em.notes && (
                    <p className="text-xs text-slate-500 mt-1.5 italic">{em.notes}</p>
                  )}
                  {em.assignedTo && (
                    <p className="text-xs text-blue-600 mt-1">
                      Atendido por: {em.assignedTo.firstName} {em.assignedTo.lastName}
                    </p>
                  )}
                </div>

                {em.status === "COMPLETED" && isRecepcion && (
                  <button
                    onClick={() => handleVerConstancia(em)}
                    disabled={loadingConstancia === em.id}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-60"
                  >
                    {loadingConstancia === em.id
                      ? <FiLoader className="animate-spin" size={13} />
                      : <FiFileText size={13} />
                    }
                    Constancia
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Constancia */}
      {showConstancia && (
        <div className="modal-backdrop" onClick={() => setShowConstancia(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#7f1d1d] flex items-center gap-2">
                <FiFileText size={18} /> Constancia de Emergencia
              </h3>
              <button
                onClick={() => setShowConstancia(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {Object.entries(showConstancia).map(([key, val]) => {
                if (val === null || val === undefined) return null;
                const label = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim();
                const display =
                  typeof val === "object"
                    ? <pre className="text-xs bg-slate-50 rounded-lg p-2 overflow-x-auto mt-1">{JSON.stringify(val, null, 2)}</pre>
                    : <span className="text-[#7f1d1d] font-medium">{String(val)}</span>;
                return (
                  <div key={key} className="border-b border-red-50 pb-2">
                    <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
                    <div>{display}</div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowConstancia(null)}
              className="mt-6 w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
