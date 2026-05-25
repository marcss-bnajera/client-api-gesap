import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiUser, FiFileText, FiActivity, FiAlertTriangle,
  FiPhone, FiPlus, FiLoader, FiTrash2, FiToggleLeft, FiToggleRight,
} from "react-icons/fi";
import {
  getPatientByIdApi, getMedicalRecordsApi, getTreatmentsApi, getAllergiesApi,
  getEmergencyContactsApi, createMedicalRecordApi, createTreatmentApi,
  deactivateTreatmentApi, createAllergyApi, deleteAllergyApi,
  type Patient, type MedicalRecord, type Treatment, type Allergy,
  type EmergencyContact, type AllergyType, type AllergySeverity,
} from "../../../shared/api/patients";
import { useAuthStore } from "../../auth/store/authStore";
import toast from "react-hot-toast";

type TabKey = "records" | "treatments" | "allergies" | "contacts";

const SEVERITY_STYLE: Record<AllergySeverity, string> = {
  SEVERE: "bg-red-50 text-red-600 border border-red-100",
  MODERATE: "bg-amber-50 text-amber-600 border border-amber-100",
  MILD: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};
const SEVERITY_LABEL: Record<AllergySeverity, string> = {
  SEVERE: "Alta", MODERATE: "Moderada", MILD: "Leve",
};
const TYPE_LABEL: Record<AllergyType, string> = {
  MEDICATION: "Medicamento", FOOD: "Alimento",
  ENVIRONMENTAL: "Ambiental", OTHER: "Otro",
};

const inputClass = "w-full px-3 py-2.5 text-sm bg-[#EBF5FB] border border-blue-200 rounded-xl text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all";

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDoctor = user?.role === "DOCTOR";
  const patientId = Number(id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState<TabKey>("records");
  const [loading, setLoading] = useState(true);

  // Data per tab
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Forms
  const [recordForm, setRecordForm] = useState({ diagnosis: "", notes: "" });
  const [treatmentForm, setTreatmentForm] = useState({ name: "", description: "", startDate: "", endDate: "" });
  const [allergyForm, setAllergyForm] = useState<{
    substance: string; type: AllergyType; severity: AllergySeverity; notes: string;
  }>({ substance: "", type: "MEDICATION", severity: "MILD", notes: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getPatientByIdApi(patientId);
        setPatient(data);
      } catch {
        toast.error("No se pudo cargar el paciente");
        navigate("/portal/pacientes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, navigate]);

  useEffect(() => {
    const loadTab = async () => {
      setTabLoading(true);
      try {
        if (tab === "records") {
          const { data } = await getMedicalRecordsApi(patientId);
          setRecords(data);
        } else if (tab === "treatments") {
          const { data } = await getTreatmentsApi(patientId);
          setTreatments(data);
        } else if (tab === "allergies") {
          const { data } = await getAllergiesApi(patientId);
          setAllergies(data);
        } else if (tab === "contacts") {
          const { data } = await getEmergencyContactsApi(patientId);
          setContacts(data);
        }
      } catch {
        toast.error("Error al cargar datos");
      } finally {
        setTabLoading(false);
      }
    };
    if (!loading) loadTab();
  }, [tab, patientId, loading]);

  const handleSaveRecord = async () => {
    if (!recordForm.diagnosis.trim()) { toast.error("El diagnóstico es requerido"); return; }
    setSaving(true);
    try {
      await createMedicalRecordApi({ patientId, ...recordForm });
      toast.success("Registro médico creado");
      setShowRecordModal(false);
      setRecordForm({ diagnosis: "", notes: "" });
      const { data } = await getMedicalRecordsApi(patientId);
      setRecords(data);
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  };

  const handleSaveTreatment = async () => {
    if (!treatmentForm.name.trim() || !treatmentForm.startDate) {
      toast.error("Nombre y fecha de inicio son requeridos"); return;
    }
    setSaving(true);
    try {
      await createTreatmentApi({
        patientId,
        name: treatmentForm.name,
        description: treatmentForm.description || undefined,
        startDate: treatmentForm.startDate,
        endDate: treatmentForm.endDate || undefined,
      });
      toast.success("Tratamiento registrado");
      setShowTreatmentModal(false);
      setTreatmentForm({ name: "", description: "", startDate: "", endDate: "" });
      const { data } = await getTreatmentsApi(patientId);
      setTreatments(data);
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (treatId: number) => {
    try {
      await deactivateTreatmentApi(treatId);
      toast.success("Tratamiento desactivado");
      const { data } = await getTreatmentsApi(patientId);
      setTreatments(data);
    } catch { toast.error("Error al desactivar"); }
  };

  const handleSaveAllergy = async () => {
    if (!allergyForm.substance.trim()) { toast.error("La sustancia es requerida"); return; }
    setSaving(true);
    try {
      await createAllergyApi({ patientId, ...allergyForm });
      toast.success("Alergia registrada");
      setShowAllergyModal(false);
      setAllergyForm({ substance: "", type: "MEDICATION", severity: "MILD", notes: "" });
      const { data } = await getAllergiesApi(patientId);
      setAllergies(data);
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  };

  const handleDeleteAllergy = async (allergyId: number) => {
    try {
      await deleteAllergyApi(allergyId);
      toast.success("Alergia eliminada");
      setAllergies((prev) => prev.filter((a) => a.id !== allergyId));
    } catch { toast.error("Error al eliminar"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-[#0E6BA8]" size={28} />
      </div>
    );
  }

  if (!patient) return null;

  const fullName = [patient.firstName, patient.secondName, patient.thirdName, patient.firstLastName, patient.secondLastName]
    .filter(Boolean).join(" ");

  const TABS = [
    { key: "records" as TabKey, label: "Registros Médicos", icon: FiFileText },
    { key: "treatments" as TabKey, label: "Tratamientos", icon: FiActivity },
    { key: "allergies" as TabKey, label: "Alergias", icon: FiAlertTriangle },
    { key: "contacts" as TabKey, label: "Contactos Emergencia", icon: FiPhone },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/portal/pacientes")} className="p-2 text-[#0E6BA8] border border-blue-200 bg-white rounded-xl hover:bg-blue-50 transition-colors">
          <FiArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647]">{fullName}</h2>
          <p className="text-slate-500 text-sm mt-0.5">DPI: {patient.dpi}</p>
        </div>
      </div>

      {/* Patient info card */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {patient.firstName[0]}{patient.firstLastName[0]}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 text-sm">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Sexo</p>
              <p className="font-semibold text-[#0A2647]">{patient.sex}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Nacimiento</p>
              <p className="font-semibold text-[#0A2647]">{new Date(patient.birthDate).toLocaleDateString("es-GT")}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Tipo de Sangre</p>
              <p className="font-semibold text-[#0A2647]">{patient.bloodType?.replace("_", " ") ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Teléfono</p>
              <p className="font-semibold text-[#0A2647]">{patient.phone ?? "—"}</p>
            </div>
            {patient.address && (
              <div className="col-span-2 md:col-span-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Dirección</p>
                <p className="font-semibold text-[#0A2647]">{patient.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-blue-50 rounded-2xl p-1 shadow-sm overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${
              tab === key
                ? "bg-[#0E6BA8] text-white shadow-md"
                : "text-slate-500 hover:bg-blue-50 hover:text-[#0E6BA8]"
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5 min-h-48">
        {tabLoading ? (
          <div className="flex items-center justify-center h-32">
            <FiLoader className="animate-spin text-[#0E6BA8]" size={24} />
          </div>
        ) : (
          <>
            {/* Medical Records */}
            {tab === "records" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0A2647]">Registros Médicos</p>
                  {isDoctor && (
                    <button onClick={() => setShowRecordModal(true)} className="flex items-center gap-2 px-3 py-2 bg-[#0E6BA8] text-white text-xs font-semibold rounded-xl hover:bg-[#00ACC1] transition-colors">
                      <FiPlus size={13} /> Nuevo registro
                    </button>
                  )}
                </div>
                {records.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Sin registros médicos</p>
                ) : (
                  <div className="space-y-3">
                    {records.map((r) => (
                      <div key={r.id} className="border border-blue-50 rounded-xl p-4 hover:border-blue-100 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#0A2647] text-sm">{r.diagnosis}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{new Date(r.createdAt).toLocaleDateString("es-GT")}</span>
                        </div>
                        {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}
                        {r.doctor && <p className="text-[10px] text-slate-400 mt-1.5">Dr. {r.doctor.firstName} {r.doctor.lastName}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Treatments */}
            {tab === "treatments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0A2647]">Tratamientos</p>
                  {isDoctor && (
                    <button onClick={() => setShowTreatmentModal(true)} className="flex items-center gap-2 px-3 py-2 bg-[#0E6BA8] text-white text-xs font-semibold rounded-xl hover:bg-[#00ACC1] transition-colors">
                      <FiPlus size={13} /> Nuevo tratamiento
                    </button>
                  )}
                </div>
                {treatments.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Sin tratamientos</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {treatments.map((t) => (
                      <div key={t.id} className={`border rounded-xl p-4 transition-colors ${t.isActive ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 opacity-60"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#0A2647] text-sm">{t.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {t.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        {t.description && <p className="text-xs text-slate-500 mt-1">{t.description}</p>}
                        <p className="text-[10px] text-slate-400 mt-2">
                          Inicio: {new Date(t.startDate).toLocaleDateString("es-GT")}
                          {t.endDate && ` · Fin: ${new Date(t.endDate).toLocaleDateString("es-GT")}`}
                        </p>
                        {isDoctor && t.isActive && (
                          <button onClick={() => handleDeactivate(t.id)} className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-700 font-semibold">
                            <FiToggleLeft size={12} /> Desactivar
                          </button>
                        )}
                        {!t.isActive && isDoctor && (
                          <span className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                            <FiToggleRight size={12} /> Finalizado
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Allergies */}
            {tab === "allergies" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0A2647]">Alergias</p>
                  {isDoctor && (
                    <button onClick={() => setShowAllergyModal(true)} className="flex items-center gap-2 px-3 py-2 bg-[#0E6BA8] text-white text-xs font-semibold rounded-xl hover:bg-[#00ACC1] transition-colors">
                      <FiPlus size={13} /> Registrar alergia
                    </button>
                  )}
                </div>
                {allergies.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Sin alergias registradas</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {allergies.map((a) => (
                      <div key={a.id} className={`rounded-xl p-4 ${SEVERITY_STYLE[a.severity]}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm">{a.substance}</p>
                            <p className="text-[10px] mt-0.5">{TYPE_LABEL[a.type]} · {SEVERITY_LABEL[a.severity]}</p>
                            {a.notes && <p className="text-xs mt-1 opacity-80">{a.notes}</p>}
                          </div>
                          {isDoctor && (
                            <button onClick={() => handleDeleteAllergy(a.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors shrink-0">
                              <FiTrash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Emergency Contacts */}
            {tab === "contacts" && (
              <div className="space-y-4">
                <p className="font-bold text-[#0A2647]">Contactos de Emergencia</p>
                {contacts.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Sin contactos de emergencia</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {contacts.map((c) => (
                      <div key={c.id} className="border border-blue-50 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
                          <FiUser size={16} className="text-[#0E6BA8]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A2647] text-sm">{c.fullName}</p>
                          <p className="text-xs text-slate-500">{c.phone}{c.relationship ? ` · ${c.relationship}` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: New Medical Record */}
      {showRecordModal && (
        <div className="modal-backdrop" onClick={() => setShowRecordModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0A2647]">Nuevo Registro Médico</h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Diagnóstico *</label>
                <input value={recordForm.diagnosis} onChange={(e) => setRecordForm((f) => ({ ...f, diagnosis: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Notas</label>
                <textarea value={recordForm.notes} onChange={(e) => setRecordForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={inputClass + " resize-none"} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRecordModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSaveRecord} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0A2647] rounded-xl hover:bg-[#0E6BA8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <FiLoader className="animate-spin" size={14} />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Treatment */}
      {showTreatmentModal && (
        <div className="modal-backdrop" onClick={() => setShowTreatmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0A2647]">Nuevo Tratamiento</h3>
              <button onClick={() => setShowTreatmentModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Nombre *</label>
                <input value={treatmentForm.name} onChange={(e) => setTreatmentForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Descripción</label>
                <input value={treatmentForm.description} onChange={(e) => setTreatmentForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Fecha inicio *</label>
                <input type="date" value={treatmentForm.startDate} onChange={(e) => setTreatmentForm((f) => ({ ...f, startDate: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Fecha fin</label>
                <input type="date" value={treatmentForm.endDate} onChange={(e) => setTreatmentForm((f) => ({ ...f, endDate: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTreatmentModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSaveTreatment} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0A2647] rounded-xl hover:bg-[#0E6BA8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <FiLoader className="animate-spin" size={14} />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Allergy */}
      {showAllergyModal && (
        <div className="modal-backdrop" onClick={() => setShowAllergyModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0A2647]">Registrar Alergia</h3>
              <button onClick={() => setShowAllergyModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Sustancia *</label>
                <input value={allergyForm.substance} onChange={(e) => setAllergyForm((f) => ({ ...f, substance: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Tipo</label>
                <select value={allergyForm.type} onChange={(e) => setAllergyForm((f) => ({ ...f, type: e.target.value as AllergyType }))} className={inputClass}>
                  <option value="MEDICATION">Medicamento</option>
                  <option value="FOOD">Alimento</option>
                  <option value="ENVIRONMENTAL">Ambiental</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Severidad</label>
                <select value={allergyForm.severity} onChange={(e) => setAllergyForm((f) => ({ ...f, severity: e.target.value as AllergySeverity }))} className={inputClass}>
                  <option value="MILD">Leve</option>
                  <option value="MODERATE">Moderada</option>
                  <option value="SEVERE">Alta</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Notas</label>
                <input value={allergyForm.notes} onChange={(e) => setAllergyForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAllergyModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSaveAllergy} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0A2647] rounded-xl hover:bg-[#0E6BA8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <FiLoader className="animate-spin" size={14} />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
