PROMPT DE CONTEXTO: Contel-Buscador (v2.8.0)

1. Proyecto y Stack:
* Proposito: Gestion de mantenimientos y helpdesk para Contel Ingenieros.
* Frontend: React (Vite) + CSS nativo (temas claro/oscuro).
* Backend: Node.js (Express) + better-sqlite3 (modo WAL) + Zod.
* Infraestructura: Docker Compose con Nginx; proxy inverso Traefik v2 en despliegue.
* Persistencia: Bind mounts fuera del repo:
  * DB: `/app/data` (host recomendado: `/var/lib/contel-buscador/data`)
  * PDFs: `/app/uploads` (host recomendado: `/var/lib/contel-buscador/uploads`)

2. Estado actual de la logica y base de datos:
* Esquema principal:
  * `contracts`: sin UNIQUE en `obra`; incluye `empresa` (CI/CS), `nCliente`, `cliente`, `descripcion`, `start_date`, `end_date`, `pdf_url` (contrato) y `budget_pdf_url` (presupuesto).
  * `categories`: tabla maestra de categorias de servicio.
  * `contract_services`: relacion N:M contrato-categoria con `services_json`, `service_clauses_json`, `periodicity`, `last_execution`, `next_execution`.
* Esquema de autenticacion:
  * `auth_users`: usuarios con roles `ADMIN` y `VIEWER`.
  * `auth_sessions`: sesiones backend con expiracion y cookie `HttpOnly`.
* Esquema de cobertura dinamica:
  * `coverage_assignments`: asignacion editable de tareas (`technician_id`, `loc`, `area`, `position`).
  * Seed automatico del reparto base si la tabla de cobertura esta vacia.

3. Seguridad y acceso:
* Login obligatorio con sesion backend (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`).
* Recursos protegidos por sesion: `/api/contracts*`, `/uploads`, `/api/coverage/*`.
* Autorizacion por rol:
  * `ADMIN`: edicion completa de contratos y guardado de cobertura.
  * `VIEWER`: consulta en solo lectura.
* Credenciales iniciales (configurables por variables de entorno):
  * ADMIN: `admin` / `produccion_2026`
  * VIEWER: `viewer` / `lectura_2026`

4. Funcionalidades principales vigentes:
* Busqueda en tiempo real por obra, cliente, numero de cliente y descripcion.
* Busqueda adicional por categoria de servicio (`category` en `/api/contracts`).
* Gestion de contratos: alta, edicion, borrado y adjuntos PDF por contrato.
* Fechas de contrato por ficha:
  * Cada contrato admite `fecha de inicio` y `fecha de finalizacion`.
  * Las fechas se editan en el formulario y se muestran en la tarjeta de contrato.
* Adjuntos PDF dobles por contrato:
  * Contrato: `/api/contracts/:id/pdf`
  * Presupuesto: `/api/contracts/:id/budget-pdf`
* Edicion rapida en lista para descripcion/servicios.
* Clausulas opcionales por servicio y contrato:
  * Se pueden definir excepciones/condiciones concretas por modalidad de servicio (ej. `COR. PRES.`).
  * Disponibles en edicion rapida y en formulario completo para rol `ADMIN`.
  * Consulta por tooltip al pasar el raton sobre el servicio.
* Vista "Asignacion de Soporte" integrada en React con dos modos:
  * Reparto normal (editable por drag & drop entre tecnicos).
  * Simulacion por ausencia (redistribucion automatica segun carga actual).

5. Estado reciente (v2.8):
* Fechas de inicio/fin integradas en contratos:
  * Nuevos campos persistentes `start_date` y `end_date` en `contracts` (migracion automatica).
  * API de contratos actualizada para leer/escribir fechas en `POST /api/contracts` y `PUT /api/contracts/:id`.
  * Frontend actualizado con inputs de fecha en formulario y visualizacion compacta en cada ficha.

6. Estado reciente (v2.6):
* Clausulas por servicio integradas en el modelo de contratos:
  * Nuevo campo persistente `service_clauses_json` en `contract_services`.
  * Lectura/escritura integrada en `POST /api/contracts` y `PUT /api/contracts/:id`.
  * Sanitizacion de clausulas vacias para guardar solo contenido util.
* Frontend de contratos:
  * Campo "Clausula (opcional)" junto a cada servicio en modo edicion.
  * Tooltip contextual en modo consulta para leer clausulas al hover.
* Mantiene lo entregado en v2.5:
  * Cobertura pasa de estatica a dinamica con persistencia en SQLite.
  * Nuevos endpoints de cobertura:
    * `GET /api/coverage/assignments` (lectura autenticada)
    * `PUT /api/coverage/assignments` (guardado restringido a ADMIN)
  * Frontend de cobertura con:
    * Carga inicial desde backend.
    * Reasignacion por arrastre.
    * Guardado por movimiento con rollback visual ante error.
  * El calculo de cobertura por ausencia usa la asignacion viva guardada, no un JSON estatico.

7. Estado reciente (v2.6.1 - UI):
* Ajuste de rejilla en "Ver asignacion normal" para mostrar mejor la carga en una sola linea:
  * Desktop: 4 columnas.
  * Tablet: 3 columnas.
  * Movil: 1 columna.

8. Convencion de documentacion (importante):
* `release.md` debe mantenerse como historial acumulativo.
* Al documentar una nueva version, se debe anadir una nueva seccion/version sin eliminar ni sobreescribir notas de versiones anteriores.
* Se prioriza conservar el registro historico completo de mejoras y cambios.
