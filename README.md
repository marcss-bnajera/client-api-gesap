# client-api-gesap

Portal clínico del Sistema GESAP. Interfaz para doctores, asistentes prehospitalarios y asistentes de recepción clínica.

## Stack

- React 18 + TypeScript
- Vite + Tailwind CSS v4
- Zustand (estado global, persistido en localStorage)
- Axios (cliente HTTP)
- Socket.IO client (kick en tiempo real)
- React Router v6

## Puerto de desarrollo

```
http://localhost:5174
```

## Roles con acceso

| Rol | Funcionalidades principales |
|-----|-----------------------------|
| `DOCTOR` | Consulta de pacientes y expedientes |
| `ASISTENTE_PREHOSPITALARIO` | Crear emergencias, ver mis emergencias creadas |
| `ASISTENTE_RECEPCION_CLINICA` | Recibir emergencias entrantes, asignar, completar, ver historial |

## Instalación y desarrollo

```bash
pnpm install    # o npm install
pnpm dev        # http://localhost:5174
```

Requiere que **gesap-api** esté corriendo en `localhost:3000`.

## Módulo de emergencias

El módulo de emergencias es una SPA separada dentro del mismo build, con su propio sistema de autenticación. Accesible en:

- **Dev:** `http://localhost:5174/emergencias/login`
- **Prod:** `https://gesap.lat/clinico/emergencias/login`

Los roles PREHOSPITALARIO y RECEPCION_CLINICA deben iniciar sesión aquí con las mismas credenciales del sistema.

## Proxy de desarrollo (Vite)

No requiere `.env` — el proxy de Vite redirige automáticamente:

| Path | Destino |
|------|---------|
| `/gesap/v1/*` | `http://localhost:3000` (gesap-api) |
| `/api-ws/*` | `http://localhost:3000` WebSocket (kick en tiempo real) |

## Build de producción

```bash
pnpm build
# Genera dist/ con base en /clinico/
# Copiar a www/client-api/ en el servidor para que nginx lo sirva
```

## Estructura principal

```
src/
├── app/
│   ├── main.tsx              # BrowserRouter con basename automático
│   └── router/AppRoutes.tsx
├── features/
│   ├── auth/                 # Login, ProtectedRoute, stores
│   └── emergencias/          # Módulo separado (login propio, vistas, stores)
└── shared/
    ├── api/                  # Cliente axios + funciones por módulo
    ├── hooks/                # useKickListener, useEmergencyKickListener, useEmergencyNotifications
    └── components/layouts/   # MainLayout, Sidebar, EmergencyLayout, EmergencySidebar
```
