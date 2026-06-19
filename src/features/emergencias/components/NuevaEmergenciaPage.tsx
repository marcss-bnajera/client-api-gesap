import React, { useEffect, useState } from "react";
import {
  FiAlertCircle, FiLoader, FiSearch, FiPlus,
  FiUser, FiClock, FiMapPin, FiRefreshCw,
} from "react-icons/fi";
import {
  createEmergencyEmApi, getMyEmergenciesEmApi, getActiveHospitalsEmApi,
  getPatientByDpiEmApi, type Emergency,
} from "../../../shared/api/emergenciesEmergency";
import type { CreateEmergencyPayload } from "../../../shared/api/emergencies";
import type { Hospital } from "../../../shared/api/hospitals";
import type { Patient } from "../../../shared/api/patients";
import toast from "react-hot-toast";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En Proceso", COMPLETED: "Completada",
};

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-red-50 border border-red-200 rounded-xl text-[#7f1d1d] " +
  "focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all";

export const NuevaEmergenciaPage: React.FC = () => {
  const [myEmergencies, setMyEmergencies] = useState<Emergency[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dpiSearch, setDpiSearch] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [form, setForm] = useState<Partial<CreateEmergencyPayload>>({
    hospitalDestinationId: undefined,
    notes: "",
    transferDate: "",
  });

  const fetchMine = async () => {
    setLoading(true);
    try {
      const { data } = await getMyEmergenciesEmApi();
      setMyEmergencies(data);
    } catch { toast.error("Error al cargar emergencias"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getActiveHospitalsEmApi();
        setHospitals(data);
      } catch { /* silent */ }
    };
    init();
    fetchMine();
  }, []);

  const handleLookupDpi = async () => {
    if (!/^\d{13}$/.test(dpiSearch)) { toast.error("DPI debe tener 13 dígitos"); return; }
    setLookingUp(true);
    setFoundPatient(null);
    try {
      const { data } = await getPatientByDpiEmApi(dpiSearch);
      setFoundPatient(data);
      setForm((f) => ({ ...f, patientId: data.id, unidentifiedPatientId: undefined }));
      toast.success(`Paciente: ${data.firstName} ${data.firstLastName}`);
    } catch { toast.error("No se encontró paciente con ese DPI"); }
    finally { setLookingUp(false); }
  };

  const handleCreate = async () => {
    if (!form.hospitalDestinationId) { toast.error("Selecciona el hospital de destino"); return; }
    if (!form.patientId) { toast.error("Busca y selecciona un paciente por DPI"); return; }
    setSaving(true);
    try {
      await createEmergencyEmApi({
        patientId: form.patientId,
        hospitalDestinationId: form.hospitalDestinationId,
        notes: form.notes || undefined,
        transferDate: form.transferDate || undefined,
      });
      toast.success("Emergencia registrada y notificación enviada al hospital destino");
      setShowModal(false);
      setForm({ hospitalDestinationId: undefined, notes: "", transferDate: "" });
      setFoundPatient(null);
      setDpiSearch("");
      fetchMine();
    } catch { toast.error("Error al registrar emergencia"); }
    finally { setSaving(false); }
  };

  const openModal = () => {
    setFoundPatient(null);
    setDpiSearch("");
    setForm({ hospitalDestinationId: undefined, notes: "", transferDate: "" });
    setShowModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#7f1d1d]">Nueva Emergencia</h2>
          <p className="text-slate-500 text-sm mt-0.5">Registra un traslado prehospitalario</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchMine}
            className="p-2.5 text-red-700 border border-red-200 bg-white rounded-xl hover:bg-red-50 transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw size={15} />
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-700 text-white text-sm font-semibold rounded-xl hover:bg-red-800 transition-colors shadow-sm"
          >
            <FiPlus size={16} /> Registrar emergencia
          </button>
        </div>
      </div>

      {/* Mi historial */}
      <div>
        <h3 className="text-sm font-semibold text-[#7f1d1d] mb-3 uppercase tracking-wide">
          Mis emergencias registradas
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <FiLoader className="animate-spin text-red-500" size={28} />
          </div>
        ) : myEmergencies.length === 0 ? (
          <div className="bg-white border border-red-100 rounded-2xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={28} className="text-red-300" />
            </div>
            <p className="font-semibold text-slate-400">Aún no has registrado emergencias</p>
            <button
              onClick={openModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm font-semibold rounded-xl hover:bg-red-800 transition-colors"
            >
              <FiPlus size={15} /> Registrar primera emergencia
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myEmergencies.map((em) => (
              <div key={em.id} className="bg-white border border-red-100 rounded-2xl shadow-sm p-5">
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
                      <span className="text-slate-300">
                        {new Date(em.createdAt).toLocaleString("es-GT")}
                      </span>
                    </div>
                    {em.notes && (
                      <p className="text-xs text-slate-500 mt-1.5 italic">{em.notes}</p>
                    )}
                    {em.assignedTo && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Atendido por: {em.assignedTo.firstName} {em.assignedTo.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Registrar emergencia */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#7f1d1d]">Registrar Emergencia</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* DPI lookup */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7f1d1d] mb-1.5 uppercase tracking-wide">
                  Buscar paciente por DPI *
                </label>
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
                    className="px-3 py-2.5 bg-red-700 text-white text-sm rounded-xl hover:bg-red-800 transition-colors disabled:opacity-60 shrink-0"
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

              {/* Hospital destino */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7f1d1d] mb-1.5 uppercase tracking-wide">
                  Hospital de destino *
                </label>
                <select
                  value={form.hospitalDestinationId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hospitalDestinationId: Number(e.target.value) || undefined }))
                  }
                  className={inputClass}
                >
                  <option value="">— Seleccionar hospital —</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Fecha traslado */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7f1d1d] mb-1.5 uppercase tracking-wide">
                  Fecha/hora de traslado
                </label>
                <input
                  type="datetime-local"
                  value={form.transferDate ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, transferDate: e.target.value }))}
                  className={inputClass}
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-[10px] font-semibold text-[#7f1d1d] mb-1.5 uppercase tracking-wide">
                  Notas / Observaciones
                </label>
                <textarea
                  value={form.notes ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-700 rounded-xl hover:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <FiLoader className="animate-spin" size={14} />}
                Registrar emergencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
