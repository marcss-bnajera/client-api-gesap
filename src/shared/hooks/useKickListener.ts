import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../../features/auth/store/authStore";

// Conecta al namespace /user-events de gesap-api.
// Cuando el auditor kickea esta sesión, el backend emite 'session:kicked'
// y el usuario es deslogueado y redirigido al login con mensaje explicativo.
export const useKickListener = () => {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

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
      window.location.replace(`${base}/login?kicked=true`);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, logout]);
};
