import { useEffect } from "react";
import { io } from "socket.io-client";
import { useEmergencyAuthStore } from "../../features/auth/store/emergencyAuthStore";

export const useEmergencyKickListener = () => {
  const token = useEmergencyAuthStore((s) => s.token);
  const logout = useEmergencyAuthStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;

    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const socket = io(window.location.origin + "/user-events", {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 3000,
      path: "/api-ws",
    });

    socket.on("session:kicked", () => {
      socket.disconnect();
      logout();
      window.location.replace(`${base}/emergencias/login?kicked=true`);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, logout]);
};
