import React, { useEffect, useState, useCallback } from "react";
import {
  FiAlertCircle, FiLoader, FiRefreshCw,
  FiCheckCircle, FiUser, FiClock, FiMapPin, FiBell,
} from "react-icons/fi";
import {
  getPendingEmergenciesEmApi, assignEmergencyEmApi, completeEmergencyEmApi,
  type Emergency,
} from "../../../shared/api/emergenciesEmergency";
import { useEmergencyAuthStore } from "../../auth/store/emergencyAuthStore";
import { useEmergencyNotificationsStore } from "../store/emergencyNotificationsStore";
import toast from "react-hot-toast";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En Proceso", COMPLETED: "Completada",
};

export const EntrantesPage: React.FC = () => {
  const user = useEmergencyAuthStore((s) => s.user);
  const { count: notifCount, reset: resetNotif } = useEmergencyNotificationsStore();

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<Emergency | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEmergencies = useCallback(async () => {
    if (!user?.hospitalId) return;
    setLoading(true);
    try {
      const { data } = await getPendingEmergenciesEmApi(user.hospitalId);
      setEmergencies(data);
    } catch { toast.error("Error al cargar emergencias"); }
    finally { setLoading(false); }
  }, [user?.hospitalId]);

  useEffect(() => {
    fetchEmergencies();
    resetNotif();
  }, []);

  const handleAssign = async (em: Emergency) => {
    try {
      await assignEmergencyEmApi(em.id);
      toast.success("Emergencia asignada — ahora está en proceso");
      fetchEmergencies();
    } catch { toast.error("Error al asignar emergencia"); }
  };

  const handleComplete = async () => {
    if (!showCompleteModal) return;
    setSaving(true);
    try {
      await completeEmergencyEmApi(showCompleteModal.id, {
        notes: completionNote,
        completedAt: new Date().toISOString(),
      });
      toast.success("Emergencia completada");
      setShowCompleteModal(null);
      setCompletionNote("");
      fetchEmergencies();
    } catch { toast.error("Error al completar emergencia"); }
    finally { setSaving(false); }
  };

  const handleRefreshAndClear = () => {
    resetNotif();
    fetchEmergencies();
  };

  const pending   = emergencies.filter((e) => e.status === "PENDING");
  const inProgress = emergencies.filter((e) => e.status === "IN_PROGRESS");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#7f1d1d]">Emergencias Entrantes</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {pending.length} pendiente{pending.length !== 1 ? "s" : ""} ·{" "}
            {inProgress.length} en proceso
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {notifCount > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <FiBell size={12} className="animate-bounce" />
              {notifCount} nueva{notifCount !== 1 ? "s" : ""}
            </div>
          )}
          <button
            onClick={handleRefreshAndClear}
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
          <FiCheckCircle size={36} className="mx-auto mb-3 text-emerald-300" />
          <p className="font-semibold text-slate-400">No hay emergencias activas en tu hospital</p>
          <p className="text-slate-400 text-xs mt-1">Recibirás una notificación cuando llegue una nueva emergencia</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map((em) => (
            <div
              key={em.id}
              className={`bg-white border rounded-2xl shadow-sm p-5 transition-all ${
                em.status === "PENDING"
                  ? "border-amber-200 ring-1 ring-amber-100"
                  : "border-red-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  em.status === "PENDING" ? "bg-amber-50" : "bg-blue-50"
                }`}>
                  <FiAlertCircle
                    size={18}
                    className={em.status === "PENDING" ? "text-amber-500" : "text-blue-500"}
                  />
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
                    {em.transferDate && (
                      <span className="flex items-center gap-1">
                        <FiClock size={11} /> {new Date(em.transferDate).toLocaleString("es-GT")}
                      </span>
                    )}
                    {em.createdBy && (
                      <span>Por: {em.createdBy.firstName} {em.createdBy.lastName}</span>
                    )}
                  </div>
                  {em.notes && (
                    <p className="text-xs text-slate-500 mt-1.5 italic">{em.notes}</p>
                  )}
                  {em.assignedTo && (
                    <p className="text-xs text-blue-600 mt-1">
                      Asignado a: {em.assignedTo.firstName} {em.assignedTo.lastName}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {em.status === "PENDING" && (
                    <button
                      onClick={() => handleAssign(em)}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Asignar
                    </button>
                  )}
                  {em.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => setShowCompleteModal(em)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Completar emergencia */}
      {showCompleteModal && (
        <div className="modal-backdrop" onClick={() => setShowCompleteModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#7f1d1d]">
                Completar Emergencia #{showCompleteModal.id}
              </h3>
              <button
                onClick={() => setShowCompleteModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Añade las notas de cierre para completar la emergencia.
            </p>
            <div>
              <label className="block text-[10px] font-semibold text-[#7f1d1d] mb-1.5 uppercase tracking-wide">
                Notas de cierre
              </label>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={4}
                placeholder="Descripción de la atención brindada..."
                className="w-full px-3 py-2.5 text-sm bg-red-50 border border-red-200 rounded-xl text-[#7f1d1d] focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCompleteModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <FiLoader className="animate-spin" size={14} />}
                Completar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
