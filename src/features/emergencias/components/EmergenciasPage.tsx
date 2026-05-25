import React, { useEffect, useState } from "react";
import {
  FiAlertCircle, FiLoader, FiSearch, FiPlus, FiRefreshCw,
  FiCheckCircle, FiUser, FiClock, FiMapPin,
} from "react-icons/fi";
import {
  createEmergencyApi, getPendingEmergenciesApi, assignEmergencyApi,
  completeEmergencyApi, type Emergency, type CreateEmergencyPayload,
} from "../../../shared/api/emergencies";
import { getPatientByDpiApi, type Patient } from "../../../shared/api/patients";
import { getActiveHospitalsApi, type Hospital } from "../../../shared/api/hospitals";
import { useAuthStore } from "../../auth/store/authStore";
import toast from "react-hot-toast";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En Proceso", COMPLETED: "Completada",
};

const inputClass = "w-full px-3 py-2.5 text-sm bg-[#EBF5FB] border border-blue-200 rounded-xl text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all";

export const EmergenciasPage: React.FC = () => {
  const { user } = useAuthStore();
  const isPrehospitalario = user?.role === "ASISTENTE_PREHOSPITALARIO";
  const isRecepcion = user?.role === "ASISTENTE_RECEPCION_CLINICA";

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<Emergency | null>(null);
  const [saving, setSaving] = useState(false);

  // Patient lookup for create form
  const [dpiSearch, setDpiSearch] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Create emergency form
  const [form, setForm] = useState<Partial<CreateEmergencyPayload>>({
    hospitalDestinationId: undefined,
    notes: "",
    transferDate: "",
  });

  // Complete form
  const [completionNote, setCompletionNote] = useState("");

  const fetchEmergencies = async () => {
    if (!isRecepcion || !user?.hospitalId) return;
    setLoading(true);
    try {
      const { data } = await getPendingEmergenciesApi(user.hospitalId);
      setEmergencies(data);
    } catch { toast.error("Error al cargar emergencias"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getActiveHospitalsApi();
        setHospitals(data);
      } catch { /* silent */ }
    };
    init();
    if (isRecepcion) fetchEmergencies();
  }, []);

  const handleLookupDpi = async () => {
    if (!/^\d{13}$/.test(dpiSearch)) { toast.error("DPI debe tener 13 dígitos"); return; }
    setLookingUp(true);
    setFoundPatient(null);
    try {
      const { data } = await getPatientByDpiApi(dpiSearch);
      setFoundPatient(data);
      setForm((f) => ({ ...f, patientId: data.id, unidentifiedPatientId: undefined }));
      toast.success(`Paciente encontrado: ${data.firstName} ${data.firstLastName}`);
    } catch {
      toast.error("No se encontró paciente con ese DPI");
    } finally { setLookingUp(false); }
  };

  const handleCreateEmergency = async () => {
    if (!form.hospitalDestinationId) { toast.error("Selecciona el hospital de destino"); return; }
    if (!form.patientId) { toast.error("Busca y selecciona un paciente por DPI"); return; }
    setSaving(true);
    try {
      await createEmergencyApi({
        patientId: form.patientId,
        hospitalDestinationId: form.hospitalDestinationId,
        notes: form.notes || undefined,
        transferDate: form.transferDate || undefined,
      });
      toast.success("Emergencia registrada exitosamente");
      setShowCreateModal(false);
      setForm({ hospitalDestinationId: undefined, notes: "", transferDate: "" });
      setFoundPatient(null);
      setDpiSearch("");
    } catch { toast.error("Error al registrar emergencia"); }
    finally { setSaving(false); }
  };

  const handleAssign = async (emergency: Emergency) => {
    try {
      await assignEmergencyApi(emergency.id);
      toast.success("Emergencia asignada");
      fetchEmergencies();
    } catch { toast.error("Error al asignar"); }
  };

  const handleComplete = async () => {
    if (!showCompleteModal) return;
    setSaving(true);
    try {
      await completeEmergencyApi(showCompleteModal.id, {
        notes: completionNote,
        completedAt: new Date().toISOString(),
      });
      toast.success("Emergencia completada");
      setShowCompleteModal(null);
      setCompletionNote("");
      fetchEmergencies();
    } catch { toast.error("Error al completar"); }
    finally { setSaving(false); }
  };

  // ── ASISTENTE_PREHOSPITALARIO view ──────────────────────────────────────────
  if (isPrehospitalario) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0A2647]">Nueva Emergencia</h2>
            <p className="text-slate-500 text-sm mt-0.5">Registra un traslado de emergencia</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            <FiPlus size={16} /> Registrar emergencia
          </button>
        </div>

        <div className="bg-white border border-blue-50 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-[#0A2647] text-lg mb-1">Registrar traslado</p>
          <p className="text-slate-500 text-sm mb-5">
            Usa el botón superior para registrar una nueva emergencia con los datos del paciente y hospital de destino.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            <FiPlus size={15} /> Registrar ahora
          </button>
        </div>

        {/* Modal: Create Emergency */}
        {showCreateModal && (
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#0A2647]">Registrar Emergencia</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
              </div>

              <div className="space-y-4">
                {/* Patient lookup */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Buscar paciente por DPI *</label>
                  <div className="flex gap-2">
                    <input
                      value={dpiSearch}
                      onChange={(e) => setDpiSearch(e.target.value.replace(/\D/g, "").slice(0, 13))}
                      placeholder="1234567890123"
                      className={inputClass + " font-mono"}
                    />
                    <button
                      onClick={handleLookupDpi}
                      disabled={lookingUp}
                      className="px-3 py-2.5 bg-[#0E6BA8] text-white text-sm rounded-xl hover:bg-[#00ACC1] transition-colors disabled:opacity-60 shrink-0"
                    >
                      {lookingUp ? <FiLoader className="animate-spin" size={15} /> : <FiSearch size={15} />}
                    </button>
                  </div>
                  {foundPatient && (
                    <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700">
                      ✓ {foundPatient.firstName} {foundPatient.firstLastName} — DPI {foundPatient.dpi}
                    </div>
                  )}
                </div>

                {/* Hospital destination */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Hospital de destino *</label>
                  <select
                    value={form.hospitalDestinationId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, hospitalDestinationId: Number(e.target.value) || undefined }))}
                    className={inputClass}
                  >
                    <option value="">— Seleccionar hospital —</option>
                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>

                {/* Transfer date */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Fecha/hora de traslado</label>
                  <input
                    type="datetime-local"
                    value={form.transferDate ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, transferDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Notas / Observaciones</label>
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className={inputClass + " resize-none"}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={handleCreateEmergency} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <FiLoader className="animate-spin" size={14} />} Registrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ASISTENTE_RECEPCION_CLINICA view ────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647]">Emergencias Pendientes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{emergencies.length} emergencias en tu hospital</p>
        </div>
        <button onClick={fetchEmergencies} className="p-2.5 text-[#0E6BA8] border border-blue-200 bg-white rounded-xl hover:bg-blue-50 transition-colors">
          <FiRefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <FiLoader className="animate-spin text-[#0E6BA8]" size={28} />
        </div>
      ) : emergencies.length === 0 ? (
        <div className="bg-white border border-blue-50 rounded-2xl p-10 text-center shadow-sm">
          <FiCheckCircle size={36} className="mx-auto mb-3 text-emerald-300" />
          <p className="font-semibold text-slate-400">No hay emergencias pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map((em) => (
            <div key={em.id} className="bg-white border border-blue-50 rounded-2xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiAlertCircle size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[em.status]}`}>
                      {STATUS_LABEL[em.status]}
                    </span>
                    <span className="text-xs text-slate-400">#{em.id}</span>
                  </div>
                  {em.patient && (
                    <div className="flex items-center gap-1.5 text-sm text-[#0A2647] font-semibold">
                      <FiUser size={13} className="text-slate-400" />
                      {em.patient.firstName} {em.patient.firstLastName}
                      <span className="font-mono text-xs text-slate-400">({em.patient.dpi})</span>
                    </div>
                  )}
                  {em.unidentifiedPatient && (
                    <p className="text-sm text-[#0A2647] font-semibold">Paciente sin identificar — {em.unidentifiedPatient.sex}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                    {em.hospitalDestination && (
                      <span className="flex items-center gap-1"><FiMapPin size={11} /> {em.hospitalDestination.name}</span>
                    )}
                    {em.transferDate && (
                      <span className="flex items-center gap-1"><FiClock size={11} /> {new Date(em.transferDate).toLocaleString("es-GT")}</span>
                    )}
                    {em.createdBy && (
                      <span>Creado por: {em.createdBy.firstName} {em.createdBy.lastName}</span>
                    )}
                  </div>
                  {em.notes && <p className="text-xs text-slate-500 mt-1.5 italic">{em.notes}</p>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {em.status === "PENDING" && (
                    <button
                      onClick={() => handleAssign(em)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#0E6BA8] text-white rounded-xl hover:bg-[#00ACC1] transition-colors"
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

      {/* Modal: Complete Emergency */}
      {showCompleteModal && (
        <div className="modal-backdrop" onClick={() => setShowCompleteModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0A2647]">Completar Emergencia #{showCompleteModal.id}</h3>
              <button onClick={() => setShowCompleteModal(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Añade un registro de cierre para completar esta emergencia.
            </p>
            <div>
              <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Notas de cierre</label>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={4}
                placeholder="Descripción de la atención brindada..."
                className="w-full px-3 py-2.5 text-sm bg-[#EBF5FB] border border-blue-200 rounded-xl text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCompleteModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleComplete} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <FiLoader className="animate-spin" size={14} />} Completar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
