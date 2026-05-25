import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiPlus, FiSearch, FiLoader,
  FiChevronRight, FiRefreshCw,
} from "react-icons/fi";
import { getPatientsApi, createPatientApi, type Patient, type CreatePatientPayload, type SexEnum, type BloodTypeEnum } from "../../../shared/api/patients";
import toast from "react-hot-toast";

const BLOOD_TYPES: BloodTypeEnum[] = [
  "A_POSITIVO","A_NEGATIVO","B_POSITIVO","B_NEGATIVO",
  "AB_POSITIVO","AB_NEGATIVO","O_POSITIVO","O_NEGATIVO",
];

const emptyForm: CreatePatientPayload = {
  dpi: "", firstName: "", firstLastName: "", secondLastName: "",
  birthDate: "", sex: "MASCULINO",
};

export const PacientesPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<CreatePatientPayload>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getPatientsApi();
      setPatients(data);
    } catch {
      toast.error("No se pudieron cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!/^\d{13}$/.test(form.dpi)) { toast.error("El DPI debe tener 13 dígitos"); return; }
    setSaving(true);
    try {
      await createPatientApi(form);
      toast.success("Paciente registrado exitosamente");
      setShowModal(false);
      setForm(emptyForm);
      fetch();
    } catch (err: unknown) {
      const msg = typeof err === "object" && err !== null && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Error al guardar"
        : "Error al guardar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const visible = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${p.firstName} ${p.firstLastName}`.toLowerCase();
    return name.includes(q) || p.dpi.includes(q);
  });

  const inputClass = "w-full px-3 py-2.5 text-sm bg-[#EBF5FB] border border-blue-200 rounded-xl text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647]">Pacientes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{patients.length} pacientes registrados.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="p-2.5 text-[#0E6BA8] border border-blue-200 bg-white rounded-xl hover:bg-blue-50 transition-colors">
            <FiRefreshCw size={15} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E6BA8] text-white text-sm font-semibold rounded-xl hover:bg-[#00ACC1] transition-colors"
          >
            <FiPlus size={16} /> Nuevo paciente
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 bg-white border border-blue-100 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-[#00ACC1] focus-within:ring-2 focus-within:ring-[#00ACC1]/20 transition-all">
        <FiSearch className="text-blue-400 shrink-0" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o DPI..."
          className="bg-transparent text-sm outline-none text-[#0A2647] placeholder:text-slate-400 w-full"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <FiLoader className="animate-spin text-[#0E6BA8]" size={28} />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-blue-50 rounded-2xl p-10 text-center text-slate-400 shadow-sm">
          <FiUsers size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No hay pacientes registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-50 bg-[#EBF5FB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#144272] uppercase tracking-wide">Paciente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#144272] uppercase tracking-wide hidden md:table-cell">DPI</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#144272] uppercase tracking-wide hidden lg:table-cell">Nacimiento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#144272] uppercase tracking-wide hidden md:table-cell">Tipo Sangre</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {visible.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/portal/pacientes/${p.id}`)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.firstName[0]}{p.firstLastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0A2647]">{p.firstName} {p.secondName ?? ""} {p.firstLastName} {p.secondLastName}</p>
                        <p className="text-xs text-slate-400">{p.sex}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 hidden md:table-cell">{p.dpi}</td>
                  <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">{new Date(p.birthDate).toLocaleDateString("es-GT")}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {p.bloodType
                      ? <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">{p.bloodType.replace("_", " ")}</span>
                      : <span className="text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-right">
                    <FiChevronRight size={16} className="text-slate-300 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear paciente */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0A2647]">Nuevo paciente</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "DPI (13 dígitos) *", key: "dpi", col: 2 },
                { label: "Primer nombre *", key: "firstName" },
                { label: "Segundo nombre", key: "secondName" },
                { label: "Primer apellido *", key: "firstLastName" },
                { label: "Segundo apellido *", key: "secondLastName" },
              ].map(({ label, key, col }) => (
                <div key={key} className={col === 2 ? "col-span-2" : ""}>
                  <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">{label}</label>
                  <input
                    value={(form[key as keyof CreatePatientPayload] as string) ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Fecha nacimiento *</label>
                <input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Sexo *</label>
                <select value={form.sex} onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as SexEnum }))} className={inputClass}>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Tipo de sangre</label>
                <select value={form.bloodType ?? ""} onChange={(e) => setForm((f) => ({ ...f, bloodType: (e.target.value || undefined) as BloodTypeEnum | undefined }))} className={inputClass}>
                  <option value="">— Seleccionar —</option>
                  {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Teléfono</label>
                <input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g,"").slice(0,8) || undefined }))} placeholder="55551234" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Dirección</label>
                <input value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value || undefined }))} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0A2647] rounded-xl hover:bg-[#0E6BA8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <FiLoader className="animate-spin" size={14} /> : null}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
