import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useEmergencyAuthStore } from "../../features/auth/store/emergencyAuthStore";
import { useEmergencyNotificationsStore } from "../../features/emergencias/store/emergencyNotificationsStore";

interface EmergencyNewEvent {
  id: number;
  patientName: string;
  hospitalName: string;
  status: string;
  createdAt: string;
}

// Solo activo para ASISTENTE_RECEPCION_CLINICA.
// Escucha 'emergency:new' y actualiza el contador de badge + muestra toast.
export const useEmergencyNotifications = () => {
  const token = useEmergencyAuthStore((s) => s.token);
  const user = useEmergencyAuthStore((s) => s.user);
  const increment = useEmergencyNotificationsStore((s) => s.increment);
  const onEntrantes = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "ASISTENTE_RECEPCION_CLINICA") return;

    const socket = io(window.location.origin + "/user-events", {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 3000,
      path: "/api-ws",
    });

    socket.on("emergency:new", (payload: EmergencyNewEvent) => {
      increment({ id: payload.id, patientName: payload.patientName, hospitalName: payload.hospitalName });

      toast(
        `🚨 Nueva emergencia: ${payload.patientName}`,
        {
          duration: 6000,
          style: {
            background: "#7f1d1d",
            color: "#fef2f2",
            fontWeight: "600",
            borderRadius: "12px",
            padding: "12px 16px",
          },
          icon: "🚑",
        }
      );

      onEntrantes.current?.();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.role, increment]);

  return { onEntrantes };
};
