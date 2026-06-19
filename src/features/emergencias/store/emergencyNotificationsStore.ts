import { create } from "zustand";

interface NotificationsState {
  count: number;
  lastEmergency: { id: number; patientName: string; hospitalName: string } | null;
  increment: (emergency: { id: number; patientName: string; hospitalName: string }) => void;
  reset: () => void;
}

export const useEmergencyNotificationsStore = create<NotificationsState>((set) => ({
  count: 0,
  lastEmergency: null,
  increment: (emergency) =>
    set((s) => ({ count: s.count + 1, lastEmergency: emergency })),
  reset: () => set({ count: 0, lastEmergency: null }),
}));
