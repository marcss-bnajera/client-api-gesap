import React, { useEffect, useState } from "react";
import {
  FiUserX, FiLoader, FiPlus, FiRefreshCw, FiCalendar, FiMapPin,
} from "react-icons/fi";
import {
  createUnidentifiedPatientApi, getUnidentifiedPatientsApi,
  type UnidentifiedPatient, type CreateUnidentifiedPatientPayload,
} from "../../../shared/api/emergencies";
import { getActiveHospitalsApi, type Hospital } from "../../../shared/api/hospitals";
import { useAuthStore } from "../../auth/store/authStore";
import toast from "react-hot-toast";

const inputClass = "w-full px-3 py-2.5 text-sm bg-[#EBF5FB] border border-blue-200 rounded-xl text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all";

const emptyForm: CreateUnidentifiedPatientPayload = {
  sex: "MASCULINO",
  estimatedAge: undefined,
  hatDescription: "",
  headFaceDescription: "",
  shirtDescription: "",
  jacketDescription: "",
  pantsDescription: "",
  shoesDescription: "",
  additionalNotes: "",
  hospitalId: 0,
  transferDate: "",
};

export const SinIdentificarPage: React.FC = () => {
  const { user } = useAuthStore();
  const isPrehospitalario = user?.role === "ASISTENTE_PREHOSPITALARIO";

  const [patients, setPatients] = useState<UnidentifiedPatient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateUnidentifiedPatientPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await getUnidentifiedPatientsApi();
      setPatients(data);
    } catch { toast.error("Error al cargar pacientes sin identificar"); }
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
    fetchPatients();
  }, []);

  const handleSave = async () => {
    if (!form.hospitalId) { toast.error("Selecciona el hospital"); return; }
    if (!form.transferDate) { toast.error("La fecha de traslado es requerida"); return; }
    setSaving(true);
    try {
      await createUnidentifiedPatientApi({
        ...form,
        estimatedAge: form.estimatedAge || undefined,
        hatDescription: form.hatDescription || undefined,
        headFaceDescription: form.headFaceDescription || undefined,
        shirtDescription: form.shirtDescription || undefined,
        jacketDescription: form.jacketDescription || undefined,
        pantsDescription: form.pantsDescription || undefined,
        shoesDescription: form.shoesDescription || undefined,
        additionalNotes: form.additionalNotes || undefined,
      });
      toast.success("Paciente sin identificar registrado");
      setShowModal(false);
      setForm(emptyForm);
      fetchPatients();
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  };

  const setField = (key: keyof CreateUnidentifiedPatientPayload, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647]">
            {isPrehospitalario ? "Registrar Paciente Sin Identificar" : "Pacientes Sin Identificar"}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">{patients.length} registros encontrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPatients} className="p-2.5 text-[#0E6BA8] border border-blue-200 bg-white rounded-xl hover:bg-blue-50 transition-colors">
            <FiRefreshCw size={15} />
          </button>
          {isPrehospitalario && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              <FiPlus size={16} /> Nuevo registro
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <FiLoader className="animate-spin text-[#0E6BA8]" size={28} />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white border border-blue-50 rounded-2xl p-10 text-center shadow-sm">
          <FiUserX size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-400">No hay pacientes sin identificar registrados</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <div key={p.id} className="bg-white border border-blue-50 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <FiUserX size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-[#0A2647] text-sm">Sin Identificar #{p.id}</p>
                  <p className="text-xs text-slate-500">{p.sex}{p.estimatedAge ? ` · ~${p.estimatedAge} años` : ""}</p>
                </div>
              </div>

              {p.identifiedPatient && (
                <div className="mb-3 px-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-700">
                  Identificado: {p.identifiedPatient.firstName} {p.identifiedPatient.firstLastName}
                </div>
              )}

              <div className="space-y-1 text-xs text-slate-500">
                {p.headFaceDescription && <p><span className="font-semibold text-slate-600">Cabeza/Cara:</span> {p.headFaceDescription}</p>}
                {p.shirtDescription && <p><span className="font-semibold text-slate-600">Camisa:</span> {p.shirtDescription}</p>}
                {p.pantsDescription && <p><span className="font-semibold text-slate-600">Pantalón:</span> {p.pantsDescription}</p>}
                {p.shoesDescription && <p><span className="font-semibold text-slate-600">Zapatos:</span> {p.shoesDescription}</p>}
                {p.jacketDescription && <p><span className="font-semibold text-slate-600">Chaqueta:</span> {p.jacketDescription}</p>}
                {p.hatDescription && <p><span className="font-semibold text-slate-600">Sombrero:</span> {p.hatDescription}</p>}
                {p.additionalNotes && <p className="italic mt-1">{p.additionalNotes}</p>}
              </div>

              <div className="mt-3 pt-3 border-t border-blue-50 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                {p.hospital && (
                  <span className="flex items-center gap-1"><FiMapPin size={10} /> {p.hospital.name}</span>
                )}
                <span className="flex items-center gap-1">
                  <FiCalendar size={10} /> {new Date(p.transferDate).toLocaleDateString("es-GT")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create unidentified patient */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0A2647]">Paciente Sin Identificar</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Sexo *</label>
                <select value={form.sex} onChange={(e) => setField("sex", e.target.value)} className={inputClass}>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Edad estimada</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.estimatedAge ?? ""}
                  onChange={(e) => setField("estimatedAge", e.target.value ? Number(e.target.value) : undefined)}
                  className={inputClass}
                />
              </div>

              {([
                { label: "Descripción cabeza/cara", key: "headFaceDescription" },
                { label: "Camisa / blusa", key: "shirtDescription" },
                { label: "Chaqueta / abrigo", key: "jacketDescription" },
                { label: "Pantalón / falda", key: "pantsDescription" },
                { label: "Zapatos / calzado", key: "shoesDescription" },
                { label: "Sombrero / gorra", key: "hatDescription" },
              ] as { label: string; key: keyof CreateUnidentifiedPatientPayload }[]).map(({ label, key }) => (
                <div key={key} className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">{label}</label>
                  <input
                    value={(form[key] as string) ?? ""}
                    onChange={(e) => setField(key, e.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}

              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Notas adicionales</label>
                <textarea
                  value={form.additionalNotes ?? ""}
                  onChange={(e) => setField("additionalNotes", e.target.value)}
                  rows={2}
                  className={inputClass + " resize-none"}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Hospital *</label>
                <select value={form.hospitalId || ""} onChange={(e) => setField("hospitalId", Number(e.target.value))} className={inputClass}>
                  <option value="">— Seleccionar —</option>
                  {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Fecha de traslado *</label>
                <input
                  type="datetime-local"
                  value={form.transferDate}
                  onChange={(e) => setField("transferDate", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0A2647] rounded-xl hover:bg-[#0E6BA8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <FiLoader className="animate-spin" size={14} />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
