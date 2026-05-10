# Contel Ingenieros — Buscador de Mantenimientos y Helpdesk

Aplicación web avanzada para la gestión y visualización de contratos de mantenimiento, servicios de monitorización y helpdesk. Desarrollada con **React**, **Node.js (Express)** y **SQLite**, orquestada mediante **Docker**.

Versión documentada actual: **v2.8.2** (ver `release.md`).

Documentación del proyecto:

- `context.md` (contexto técnico y funcional)
- `release.md` (historial de versiones)

## 🚀 Arquitectura y Tecnologías

- **Frontend**: React (Vite) + CSS nativo. Interfaz modularizada para alta mantenibilidad.
- **Backend (API)**: Express.js + Zod para validación de esquemas.
- **Gestión de Archivos**: `multer` para subida de contratos en PDF, servidos de forma segura vía Nginx.
- **Base de Datos**: SQLite (`better-sqlite3`) en modo WAL para alto rendimiento, persistida mediante volúmenes de Docker.
- **Infraestructura**: Docker Compose con Nginx como servidor web y proxy inverso.

## ✨ Funcionalidades Implementadas

- **Login Obligatorio con Sesión**: Acceso protegido con pantalla de inicio de sesión y sesión backend mediante cookie `HttpOnly`.
- **Búsqueda General en Tiempo Real**: Filtrado dinámico por obra, cliente, nº cliente o descripción con resaltado de coincidencias.
- **Búsqueda Avanzada por Categoría de Servicio**: Permite filtrar contratos por el nombre de la categoría de servicio (ej. "Mantenimiento Preventivo", "Helpdesk").
- **Asignacion de Soporte Dinámica (Cobertura por Ausencia)**: Vista integrada en React con reparto editable por **drag & drop** entre técnicos y persistencia en base de datos.
- **Cláusulas por Servicio (por cliente y categoría)**: Cada modalidad de servicio (ej. `COR. PRES.`) puede incluir una cláusula opcional específica del contrato.
- **Tooltip de Condiciones Especiales**: Al pasar el ratón por un servicio en modo consulta se muestra la descripción y, si existe, su cláusula concreta.
- **Gestión Completa de Contratos**: Alta, edición (vía modal) y borrado de contratos con confirmación de seguridad.
- **Notas por Contrato**: Botón 📝 en cada contrato para registrar notas relevantes persistidas en SQLite.
- **Fechas de Vigencia del Contrato**: Cada ficha permite registrar y visualizar **fecha de inicio** y **fecha de finalización** del contrato.
- **Documentos en PDF (Contrato + Presupuesto)**: Posibilidad de adjuntar, ver y eliminar ambos PDFs por contrato. Los archivos se borran automáticamente al eliminar el contrato.
- **Edición Rápida**: Modificación "in-place" de descripciones y estados de servicios (checkboxes) directamente desde la lista.
- **Interfaz Responsiva**: Diseño moderno con temática oscura/clara, iconos por categoría y feedback visual de copiado.
- **Protección de Edición**: Sistema de contraseña para evitar modificaciones accidentales por operadores no autorizados.

## 🛠️ Correcciones y Mejoras Recientes

- **Notas por Contrato (📝)**: Nuevo modal por contrato para registrar notas relevantes persistidas en SQLite.
- **Tour guiado (React Joyride)**: Recorrido interactivo para usuarios nuevos, con pasos anclados a elementos reales de la UI (buscador, primer contrato, notas, cobertura, tema y logout).
- **Permisos en Contratos (ADMIN/VIEWER)**: Operaciones mutables (alta/edición/borrado y PDFs) restringidas a rol `ADMIN`; `VIEWER` queda en solo lectura.
- **Pantalla de Login Animada (Tech/Telecom)**: Nueva interfaz de acceso con fondo animado de red/señal y formulario de autenticación.
- **Autenticación End-to-End**: Nuevos endpoints `/api/auth/login`, `/api/auth/me` y `/api/auth/logout`, con protección de `/api/contracts*` y `/uploads`.
- **Optimización de Búsqueda (Frontend)**: Implementación de debounce en los campos de búsqueda para reducir las llamadas a la API, mejorando la experiencia de usuario y el rendimiento.
- **Integración de `soporte_contel.html` en React**: La funcionalidad de sustituciones fue migrada a componentes React y embebida como una segunda sección de la app, con selector de vista desde el header.
- **Corrección de UX en Campos de Búsqueda**:
    - Los campos de búsqueda ahora mantienen el foco durante la escritura, evitando interrupciones.
    - Los botones de borrar ('x') en los campos de búsqueda funcionan correctamente, impidiendo la navegación inesperada del navegador y facilitando la limpieza de los filtros.
- **Manejo de Carga de Datos**: Gestión mejorada del estado de carga para los datos, proporcionando feedback visual sin afectar la interactividad de los inputs.
- **Cobertura Dinámica con Persistencia**:
    - Nuevo backend para cobertura: `GET /api/coverage/assignments` y `PUT /api/coverage/assignments`.
    - Las asignaciones se guardan en SQLite (`coverage_assignments`) y se inicializan automáticamente con datos base si no existen.
    - Reasignación de clientes en UI por arrastre entre técnicos, con rollback visual si falla el guardado.
    - Edición restringida a rol `ADMIN`; `VIEWER` mantiene modo solo lectura.
- **Cláusulas Dinámicas por Servicio**:
    - Se añade persistencia de cláusulas por servicio en backend para cada contrato/categoría.
    - Edición disponible en edición rápida y en el formulario completo (usuarios `ADMIN`).
    - Visualización contextual mediante tooltip al hover del servicio.
- **Fechas de Contrato (Inicio/Fin)**:
    - Nuevos campos de fecha en la ficha de contrato para controlar vigencia.
    - Persistencia en backend y visualización directa en la tarjeta de cada contrato.

## 🛠️ Requisitos previos

- Docker
- Docker Compose

## 🏁 Cómo empezar

Para levantar el proyecto completo o aplicar actualizaciones, ejecuta:

```bash
docker compose up -d --build
```

Notas importantes de persistencia (producción):

- Los datos (SQLite) y PDFs **no** deben vivir dentro del directorio del repo si despliegas con `git pull`.
- El `docker-compose.yml` monta:
  - `/var/lib/contel-buscador/data` → `/app/data` (DB)
  - `/var/lib/contel-buscador/uploads` → `/app/uploads` (PDFs)
- Evita `docker compose down -v` en producción: `-v` puede borrar volúmenes/datos.

Notas sobre entornos:

- En despliegue con Traefik: el router usa el dominio `mantenimientos.domdoklab.me` (ver `docker-compose.yml`).
- Si no tienes Traefik, crea la red externa requerida: `docker network create traefik_default`.
- En desarrollo local: `docker-compose.override.yml` expone `8080:80` (app) y `3000:3000` (API).

URLs habituales:

- **App (Traefik/prod)**: [http://mantenimientos.domdoklab.me](http://mantenimientos.domdoklab.me)
- **App (local)**: http://localhost:8080
- **API vía proxy Nginx (recomendado)**: http://localhost:8080/api/contracts
- **API directa (local)**: http://localhost:3000/api/contracts

## 🔐 Acceso inicial (entorno interno)

- **ADMIN**: `admin` / `produccion_2026`
- **VIEWER**: `viewer` / `lectura_2026`

Se recomienda cambiar estas credenciales mediante variables de entorno:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `VIEWER_USERNAME`
- `VIEWER_PASSWORD`
- `SESSION_MAX_AGE_SECONDS`

## 🗂️ Datos y PDFs (persistencia)

- En producción, la persistencia se realiza fuera del repo en `/var/lib/contel-buscador` (ver sección anterior).
- La base de datos SQLite y los PDFs no se suben al repositorio; si tienes que redeplegar, conserva esas rutas.

## 📁 Estructura del Proyecto

```text
├── src/
│   ├── components/
│   │   ├── contracts/   # ContractRow, CategoryRow, ContractForm
│   │   └── layout/      # Header, SearchBar
│   ├── constants/       # Configuración de categorías e iconos
│   ├── utils/           # Helpers (resaltado de texto, etc.)
│   └── App.jsx          # Componente principal y lógica de estado
├── server/
│   ├── src/             # API Express y lógica de base de datos
│   ├── data/            # Base de datos SQLite persistida
│   └── uploads/         # Almacenamiento persistente de contratos en PDF
└── docker-compose.yml   # Orquestación de contenedores y volúmenes
```

## 📝 Próximos Pasos

- [ ] Añadir historial/auditoría de cambios en la Asignación de Soporte.
- [ ] Implementar acciones rápidas de cobertura (deshacer último movimiento y reset al reparto base).
- [ ] Exportación de listados a Excel/CSV.
