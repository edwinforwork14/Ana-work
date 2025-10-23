# API Routes Reference

Base URL: http://localhost:3000

Este documento lista todas las rutas registradas en el backend (método, path completo, parámetros y notas de autenticación/roles).

---

## Auth routes (mounted at /api/auth)

- POST /api/auth/register
  - Public
  - Body: { nombre, email, password, rol, ... }
  - Crea un nuevo usuario y devuelve token

- POST /api/auth/login
  - Public
  - Body: { email, password }
  - Devuelve token y datos públicos de usuario

- GET /api/auth/disponibilidad-staff/:staffId
  - Protected (authMiddleware)
  - Path param: staffId
  - Query: desde=YYYY-MM-DD, hasta=YYYY-MM-DD
  - Ejemplo: /api/auth/disponibilidad-staff/17?desde=2025-10-01&hasta=2025-10-07
  - Devuelve: { disponibilidad } (usa utils/disponibilidadStaff)

- GET /api/auth/staffs
  - Protected (no rol específico aplicado en la ruta)
  - Devuelve: lista de usuarios con rol staff

- GET /api/auth/me
  - Protected
  - Devuelve perfil público del usuario autenticado

- POST /api/auth/change-password
  - Protected
  - Body: { oldPassword, newPassword }

- GET /api/auth/solo-staff
  - Protected + authorize(['staff','admin'])
  - Ejemplo de ruta solo para staff/admin

- DELETE /api/auth/solo-admin
  - Protected + authorize(['admin'])

---

## Citas routes (mounted at /api/citas)

- GET /api/citas
  - Protected + allowRoles(['cliente','staff','admin'])
  - Lista todas las citas accesibles según rol

- POST /api/citas
  - Protected + allowRoles(['cliente'])
  - Middlewares: validateCreateCita, canCreateCita
  - Body: datos de la cita (fecha_hora_utc, id_staff, etc.)

- GET /api/citas/:id
  - Protected
  - Middleware: canViewCita
  - Devuelve cita por id

- GET /api/citas/:id/con-documentos
  - Protected
  - Devuelve la cita con documentos asociados

- GET /api/citas/:id/con-documento
  - Protected
  - Alias (singular) para la ruta anterior

- GET /api/citas/usuario/:id
  - Protected + allowRoles(['staff','admin'])
  - Obtener citas por id_usuario

- PUT /api/citas/:id
  - Protected
  - Middleware: canModifyCita
  - Actualiza la cita

- DELETE /api/citas/:id
  - Protected
  - Middleware: canDeleteCita
  - Elimina la cita (según reglas de permiso)

- POST /api/citas/:id/confirmar
  - Protected + allowRoles(['staff','admin'])
  - Confirmar cita

- POST /api/citas/:id/cancelar
  - Protected
  - Middleware: canCancelCita
  - Cancelar cita

- POST /api/citas/:id/completar
  - Protected
  - Middleware: canCompleteCita
  - Completar cita

- POST /api/citas/:id/pendiente
  - Protected
  - Middleware: canMarkPendingCita

---

## Staff routes (mounted at /api/staff)

- GET /api/staff
  - Protected + allowRoles(['cliente','staff','admin'])
  - Lista todos los staff

- GET /api/staff/alertas
  - Protected + allowRoles(['staff'])
  - Ver citas pendientes del staff autenticado

- GET /api/staff/citas
  - Protected + allowRoles(['staff','admin'])
  - Obtener citas de staff (filtro por id_staff y estado)

- GET /api/staff/disponibilidad
  - Protected + allowRoles(['cliente','staff','admin'])
  - Query params (requeridos): id_staff, desde=YYYY-MM-DD, hasta=YYYY-MM-DD
  - Ejemplo: /api/staff/disponibilidad?id_staff=17&desde=2025-10-10&hasta=2025-10-14
  - Devuelve: { disponibilidad } (usa Cita.getStaffOcupado)

- GET /api/staff/ocupados
  - Protected + allowRoles(['cliente','staff','admin'])
  - Devuelve bloques ocupados (legacy)

---

## Document routes (mounted at /api/documentos)

- GET /api/documentos/cita/:id_cita
  - Protected + allowRoles(['cliente','staff','admin'])
  - Listar archivos asociados a una cita

- GET /api/documentos/mis-documentos
  - Protected + allowRoles(['cliente','staff','admin'])
  - Obtener documentos subidos por el usuario autenticado (filtros opcionales)

- GET /api/documentos/ver/:id_documento
  - Protected
  - Middleware: canViewDocumento
  - Devuelve el archivo (inline según mime)

- GET /api/documentos/download/:id_documento
  - Protected
  - Middleware: canViewDocumento
  - Fuerza descarga (Content-Disposition: attachment)

- POST /api/documentos/upload
  - Protected + allowRoles(['cliente','staff'])
  - Form-data: campo 'archivo' (file) y body con id_cita

- DELETE /api/documentos/eliminar
  - Protected + allowRoles(['cliente','staff','admin'])
  - Middleware: canDeleteDocumento
  - Body (JSON): { id_documento }

---

## Notificaciones routes (mounted at /api/notificaciones)

- GET /api/notificaciones
  - Protected
  - Listar notificaciones para el usuario autenticado

- POST /api/notificaciones/:id/leida
  - Protected
  - Marcar notificación como leída

---

## Admin routes (mounted at /api/admin)

- GET /api/admin/citas
  - Protected + allowRoles(['admin'])
  - Query params (opcionales): desde=YYYY-MM-DD, hasta=YYYY-MM-DD, id_usuario, id_staff, estado
  - Ejemplo: /api/admin/citas?desde=2025-10-01&hasta=2025-10-31&id_staff=17
  - Devuelve: { citas: [ /* objetos de cita */ ] }

- GET /api/admin/citas/con-documentos
  - Protected + allowRoles(['admin'])
  - Mismos query params opcionales que /api/admin/citas
  - Ejemplo: /api/admin/citas/con-documentos?desde=2025-10-01&hasta=2025-10-07
  - Devuelve: { citas: [ /* citas que tienen documentos */ ] }

- GET /api/admin/citas/:id/historial
  - Protected + allowRoles(['admin'])
  - Path param: id (id de la cita)
  - Query params (opcionales): desde=YYYY-MM-DD, hasta=YYYY-MM-DD
  - Ejemplo: /api/admin/citas/123/historial?desde=2025-10-01&hasta=2025-10-22
  - Devuelve: { cita: { ... }, historial: [ { tipo: 'notificacion'|'documento'|'cita', data: {...}, fecha } ] }

- GET /api/admin/clientes/:id/historial
  - Protected + allowRoles(['admin'])
  - Path param: id (id del cliente / id_usuario)
  - Query params (opcionales): desde=YYYY-MM-DD, hasta=YYYY-MM-DD
  - Ejemplo: /api/admin/clientes/45/historial?desde=2025-09-01&hasta=2025-10-22
  - Devuelve: { citas: [...], documentos: [...], notificaciones: [...] }

- GET /api/admin/panel
  - Protected + allowRoles(['admin'])
  - Query params:
    - period=day|week|month (default: day)
    - fecha=YYYY-MM-DD (fecha base para el periodo; default: hoy)
    - id_staff (opcional, para filtrar métricas por staff)
  - Ejemplo: /api/admin/panel?period=week&fecha=2025-10-20
  - Devuelve métricas: { period, start, end, totalCitas, estados: { pendiente: X, confirmada: Y, ... }, totalDocumentos }


## Otras rutas
- GET /ping
  - Pública
  - Devuelve: { ok: true }

- GET /
  - Pública
  - Devuelve: API OK


---

Si quieres, puedo:
- Añadir ejemplos curl para cada ruta (con headers y cuerpos de ejemplo).
- Generar un OpenAPI (YAML/JSON) básico a partir de estas rutas.
- Agregar la documentación en `README.md` en lugar de `routes.md`.

He creado este archivo en: `backend-node/routes.md`.
