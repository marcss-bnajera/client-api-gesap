import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiLoader, FiUser, FiAlertTriangle, FiPhone,
  FiFileText, FiChevronRight,
} from "react-icons/fi";
import {
  getPatientByDpiApi, getAllergiesApi, getEmergencyContactsApi,
  type Patient, type Allergy, type EmergencyContact,
} from "../../../shared/api/patients";
import { useAuthStore } from "../../auth/store/authStore";
import toast from "react-hot-toast";

const SEVERITY_STYLE: Record<string, string> = {
  SEVERE: "bg-red-50 text-red-600",
  MODERATE: "bg-amber-50 text-amber-600",
  MILD: "bg-emerald-50 text-emerald-700",
};
const SEVERITY_LABEL: Record<string, string> = {
  SEVERE: "Alta", MODERATE: "Moderada", MILD: "Leve",
};

export const BuscarDpiPage: React.FC = () => {
  const [dpi, setDpi] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [notFound, setNotFound] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!/^\d{13}$/.test(dpi)) { toast.error("El DPI debe tener 13 dígitos"); return; }
    setLoading(true);
    setPatient(null);
    setAllergies([]);
    setContacts([]);
    setNotFound(false);
    try {
      const { data } = await getPatientByDpiApi(dpi);
      setPatient(data);
      const [allergyRes, contactRes] = await Promise.all([
        getAllergiesApi(data.id),
        getEmergencyContactsApi(data.id),
      ]);
      setAllergies(allergyRes.data);
      setContacts(contactRes.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fullName = patient
    ? [patient.firstName, patient.secondName, patient.thirdName, patient.firstLastName, patient.secondLastName]
        .filter(Boolean).join(" ")
    : "";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0A2647]">Buscar por DPI</h2>
        <p className="text-slate-500 text-sm mt-0.5">Consulta rápida del expediente de un paciente</p>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-blue-50 rounded-2xl shadow-sm p-5">
        <label className="block text-[10px] font-semibold text-[#144272] mb-2 uppercase tracking-wide">DPI del paciente (13 dígitos)</label>
        <div className="flex gap-3">
          <input
            value={dpi}
            onChange={(e) => setDpi(e.target.value.replace(/\D/g, "").slice(0, 13))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="1234567890123"
            className="flex-1 px-3 py-2.5 text-sm bg-[#EBF5FB] border border-blue-200 rounded-xl text-[#0A2647] font-mono focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0E6BA8] text-white text-sm font-semibold rounded-xl hover:bg-[#00ACC1] transition-colors disabled:opacity-60"
          >
            {loading ? <FiLoader className="animate-spin" size={15} /> : <FiSearch size={15} />}
            Buscar
          </button>
        </div>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="bg-white border border-blue-50 rounded-2xl p-8 text-center shadow-sm">
          <FiUser size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">No se encontró ningún paciente con ese DPI</p>
          <p className="text-xs text-slate-400 mt-1">Verifica que el número sea correcto</p>
        </div>
      )}

      {/* Patient result */}
      {patient && (
        <div className="space-y-4 animate-fadeIn">
          {/* Patient card */}
          <div className="bg-white border border-blue-50 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-lg font-bold shrink-0">
                {patient.firstName[0]}{patient.firstLastName[0]}
              </div>
              <div className="flex-1">
                <p className="text-lg font-extrabold text-[#0A2647]">{fullName}</p>
                <p className="text-xs text-slate-400 font-mono">{patient.dpi}</p>
              </div>
              {user?.role === "DOCTOR" && (
                <button
                  onClick={() => navigate(`/portal/pacientes/${patient.id}`)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0E6BA8] border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <FiFileText size={13} /> Ver expediente <FiChevronRight size={13} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-white border border-blue-50 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiAlertTriangle size={16} className="text-amber-500" />
              <p className="font-bold text-[#0A2647]">Alergias ({allergies.length})</p>
            </div>
            {allergies.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin alergias registradas</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allergies.map((a) => (
                  <span key={a.id} className={`px-3 py-1 rounded-full text-xs font-bold ${SEVERITY_STYLE[a.severity]}`}>
                    {a.substance} · {SEVERITY_LABEL[a.severity]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white border border-blue-50 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiPhone size={16} className="text-[#0E6BA8]" />
              <p className="font-bold text-[#0A2647]">Contactos de Emergencia ({contacts.length})</p>
            </div>
            {contacts.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin contactos registrados</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
                      <FiUser size={13} className="text-[#0E6BA8]" />
                    </div>
                    <span className="font-semibold text-[#0A2647]">{c.fullName}</span>
                    <span className="text-slate-500">{c.phone}</span>
                    {c.relationship && <span className="text-slate-400 text-xs">({c.relationship})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
