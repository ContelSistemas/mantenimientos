# Notas de Lanzamiento

## Version 2.7 (24 de abril de 2026)

### Nuevas Funcionalidades

- **Dos PDFs por contrato (Contrato + Presupuesto)**:
  - Cada contrato permite adjuntar y gestionar 2 documentos independientes.
  - En las tarjetas se muestran accesos rápidos: **C** (Contrato) y **P** (Presupuesto).

### Detalles Tecnicos Clave

- **Backend (`server/src/index.js`)**:
  - Nueva columna `budget_pdf_url` en `contracts` (migración automática).
  - Nuevos endpoints:
    - `POST /api/contracts/:id/budget-pdf`
    - `DELETE /api/contracts/:id/budget-pdf`
  - Al eliminar un contrato se eliminan ambos PDFs si existen.

- **Frontend (`src/components/contracts/ContractForm.jsx`, `src/components/contracts/ContractRow.jsx`)**:
  - Modal de edición con 2 campos de subida (Contrato y Presupuesto).
  - Visualización en tarjeta con enlaces independientes.

- **Infraestructura (`docker-compose.yml`)**:
  - Persistencia fuera del repo para evitar pérdidas en despliegues:
    - `/var/lib/contel-buscador/data` → `/app/data`
    - `/var/lib/contel-buscador/uploads` → `/app/uploads`

---

## Version 2.6.1 (21 de abril de 2026)

### Mejoras de Interfaz (Frontend)

- **Asignacion normal con visualizacion en una sola linea**:
  - Se ajusta la rejilla de tarjetas de tecnicos en "Ver asignacion normal" para facilitar comparacion lateral de carga.
  - Nuevo comportamiento responsive:
    - Desktop: 4 columnas.
    - Tablet: 3 columnas.
    - Movil: 1 columna.

### Detalles Tecnicos Clave

- **Frontend (`src/components/coverage/coverage.css`)**:
  - Actualizacion de `grid-template-columns` en `.cov-normal-grid`.
  - Ajuste de `@media` para conservar legibilidad en tablet y movil.

---

## Version 2.6 (17 de abril de 2026)

### Nuevas Funcionalidades

- **Clausulas por servicio y cliente**:
  - Ahora cada modalidad de servicio dentro de una categoria puede tener una clausula opcional especifica por contrato.
  - Ejemplo de uso: anotar excepciones como "en Correctivo no incluye limpieza de camaras".
  - Las clausulas se editan junto a cada servicio en edicion rapida y en el formulario completo.

- **Tooltip contextual de clausulas**:
  - En vista de consulta, al pasar el raton por la etiqueta del servicio se muestra la descripcion del servicio y, si existe, su clausula asociada.
  - Permite consultar condiciones especiales sin abrir modales adicionales.

### Detalles Tecnicos Clave

- **Backend (`server/src/index.js`)**:
  - Nueva columna `service_clauses_json` en `contract_services`.
  - Migracion automatica para bases existentes (`ALTER TABLE` si la columna no existe).
  - API de contratos actualizada para leer/escribir clausulas en `POST /api/contracts` y `PUT /api/contracts/:id`.
  - Sanitizacion de clausulas vacias para persistir solo contenido util.

- **Frontend (`src/components/contracts/CategoryRow.jsx`)**:
  - Campo de texto "Clausula (opcional)" por cada servicio en modo edicion.
  - Tooltip enriquecido en modo lectura con clausula por servicio.

- **Frontend (`src/components/contracts/ContractRow.jsx`, `src/components/contracts/ContractForm.jsx`)**:
  - Normalizacion de estructura de servicios para compatibilidad con datos antiguos sin clausulas.
  - Soporte completo de edicion/guardado de clausulas desde ambas rutas de edicion.

---

## Version 2.5 (12 de abril de 2026)

### Nuevas Funcionalidades

- **Asignacion de Soporte dinamica con Drag & Drop**:
  - La vista de cobertura deja de ser estatica y permite mover clientes/tareas entre tecnicos en tiempo real.
  - Reasignacion directa desde la vista **"Ver asignacion normal"** mediante arrastre.
  - Feedback visual de zona de drop activa y estado de guardado.

- **Persistencia de cobertura en Backend**:
  - Nuevos endpoints:
    - `GET /api/coverage/assignments`
    - `PUT /api/coverage/assignments`
  - Nuevo almacenamiento en SQLite en la tabla `coverage_assignments`.
  - Seed automatico del reparto base cuando la tabla de cobertura esta vacia.

- **Control de permisos por rol**:
  - Solo usuarios `ADMIN` pueden guardar cambios en la asignacion (`PUT /api/coverage/assignments`).
  - Usuarios `VIEWER` tienen la vista en modo lectura.

### Mejoras de Logica de Cobertura

- **Simulacion de ausencia calculada sobre datos reales**:
  - La redistribucion por tecnico ausente ahora se calcula dinamicamente usando la asignacion actual guardada.
  - La barra de carga resultante refleja el estado real del reparto tras los cambios.

- **Manejo de errores en guardado**:
  - Si un guardado falla, la UI revierte al estado anterior (rollback visual) y muestra el error.

### Detalles Tecnicos Clave

- **Backend (`server/src/index.js`)**:
  - Creacion de la tabla `coverage_assignments` con indice por tecnico/posicion.
  - Validacion de payload de cobertura con `zod`.
  - Bloqueo de duplicados de tarea (`loc + area`) al guardar.
  - Middleware `requireAdmin` aplicado al endpoint de escritura de cobertura.

- **Frontend (`src/components/coverage/CoveragePlanner.jsx`)**:
  - Refactor completo de la vista de cobertura para trabajar con datos remotos.
  - Implementacion de `dragstart/dragover/drop` para mover tareas entre tecnicos.
  - Carga inicial desde API, persistencia por movimiento y estado de sincronizacion.

- **Frontend (`src/App.jsx`)**:
  - Se pasa el `userRole` al planificador de cobertura para habilitar/limitar edicion.

---

## Version 2.4 (11 de abril de 2026)

### Nuevas Funcionalidades

- **Login Obligatorio con Sesion Backend**:
  - Nueva pantalla de acceso animada con estetica tecnologica/telecomunicaciones.
  - Inicio de sesion contra backend con cookie de sesion `HttpOnly`.
  - Endpoints nuevos: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
  - Proteccion de recursos: `/api/contracts*` y `/uploads` requieren sesion valida.

- **Busqueda por Categoria de Servicio**:
  - Se implemento una capacidad de busqueda para filtrar contratos por nombre de categoria (ej. "Mantenimiento Preventivo", "Helpdesk").
  - Integrada en backend (`/api/contracts` acepta `category`) y frontend con campo dedicado.

- **Asignacion de Soporte integrada en React**:
  - Se migro la funcionalidad de `soporte_contel.html` como segunda vista dentro de la app principal.
  - Selector de tecnico ausente.
  - Vista de asignacion normal.
  - Simulacion de redistribucion de tareas y barra de carga resultante.
  - Boton en header renombrado a **"Asignacion de Soporte"**.

### Mejoras y Correcciones (UX/Rendimiento)

- **Optimizacion de Busqueda (Frontend)**:
  - Implementacion de `debounce` en campos de busqueda para reducir llamadas a la API y mejorar fluidez.

- **Correccion de perdida de foco en campos de busqueda**:
  - `SearchBar.jsx` paso a gestionar estado interno de inputs para evitar perdida de foco en re-render.

- **Correccion de navegacion inesperada al borrar filtros**:
  - Botones de borrado con `e.preventDefault()` y `type='button'` para evitar retroceso del navegador.

- **Manejo mejorado del estado de carga**:
  - Se elimino `disabled={loading}` en inputs para preservar foco, manteniendo solo indicador visual de carga.

### Detalles Tecnicos Clave

- **Backend (`server/src/index.js`)**:
  - Nuevas tablas `auth_users` y `auth_sessions`.
  - Hash de contrasenas con `scrypt`.
  - Gestion de sesion con token aleatorio y hash `sha256`.
  - Middleware `requireAuth` para endpoints privados.
  - `GET /api/contracts` con `JOIN` sobre `contract_services` y `categories`, filtrando por categoria con `UPPER(cat.name) LIKE ?`.

- **Frontend (`src/App.jsx`)**:
  - Nuevo estado `categoryFilter` y uso de `debouncedFetchContracts` para operaciones de busqueda/edicion/guardado.

- **Frontend (`src/components/auth/LoginPage.jsx`)**:
  - Nueva pagina de login con animaciones de red/senal.

- **Frontend (`src/components/layout/SearchBar.jsx`)**:
  - Estado interno para `query` y `categoryFilter` con debounce para actualizar al componente padre.

- **Frontend (`src/components/coverage/CoveragePlanner.jsx`)**:
  - Vista React de cobertura por ausencia con renderizado condicional por tecnico.

- **Frontend (`src/components/coverage/coverageData.js`)**:
  - Fuente de datos estructurada para asignacion normal y escenarios de cobertura.

- **Frontend (`src/components/layout/Header.jsx`)**:
  - Selector de seccion y boton **"Asignacion de Soporte"**.
