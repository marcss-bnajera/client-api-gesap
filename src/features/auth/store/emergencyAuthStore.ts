import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi, type AuthUser } from "../../../shared/api/auth";

const EMERGENCY_ROLES = ["ASISTENTE_PREHOSPITALARIO", "ASISTENTE_RECEPCION_CLINICA"];

interface EmergencyAuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useEmergencyAuthStore = create<EmergencyAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await loginApi({ email, password });
          if (!EMERGENCY_ROLES.includes(data.user.role)) {
            set({
              loading: false,
              error: "Acceso denegado. Solo asistentes pueden ingresar al módulo de emergencias.",
            });
            throw new Error("Rol no permitido");
          }
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err: unknown) {
          const isRoleError = err instanceof Error && err.message === "Rol no permitido";
          if (!isRoleError) {
            set({ loading: false, error: "Credenciales inválidas" });
          }
          throw err;
        }
      },

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, error: null }),
    }),
    {
      name: "gesap-emergency-auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
