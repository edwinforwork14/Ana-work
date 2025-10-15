# Backend API - Documentos

Rutas relacionadas con la gestión de documentos (archivos asociados a citas).

Base URL: `http://localhost:3000/api/documentos`

Rutas disponibles:

- `GET /cita/:id_cita` - Listar archivos asociados a una cita (requiere autenticación). Devuelve `{ archivos: [...] }` con `id`, `nombre`, `creado_en`.

- `GET /mis-documentos` - Obtener documentos subidos por el usuario autenticado (filtros por query disponibles).

- `GET /ver/:id_documento` - Servir el documento en modo `inline` (abrir en navegador) (requiere permisos).

- `GET /download/:id_documento` - Forzar descarga con `Content-Disposition: attachment` (útil para Postman "Send and Download").

- `POST /upload` - Subir documento. Form-data: `archivo` (file), `id_cita` (string). Requiere autenticación.

- `DELETE /eliminar` - Eliminar documento. Body JSON: `{ id_documento, id_cita }`.

Notas
- Todas las rutas requieren `Authorization: Bearer <TOKEN>` salvo que el servidor esté configurado de otra manera.
- Para depuración local puedes usar `/download/:id` y comprobar la consola del servidor para ver logs.

Ejemplos (PowerShell):

Obtener metadata (deprecated debug removed):
```powershell
$token = '<TOKEN>'
Invoke-RestMethod -Uri "http://localhost:3000/api/documentos/cita/9" -Headers @{ Authorization = "Bearer $token" }
```

Descargar con curl/PowerShell:
```powershell
$token = '<TOKEN>'
Invoke-WebRequest -Uri "http://localhost:3000/api/documentos/download/9" -Headers @{ Authorization = "Bearer $token" } -OutFile "documento_9.bin"
```

Subir (curl):
```bash
curl -H "Authorization: Bearer <TOKEN>" -F "archivo=@C:/ruta/miarchivo.pdf" -F "id_cita=9" http://localhost:3000/api/documentos/upload
```

Seguridad
- El endpoint de debug fue eliminado por limpieza. Mantén backups o añade endpoints debug solo si los necesitas en desarrollo.
