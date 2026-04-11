# Notas de Lanzamiento (Versión 2.4)

## Nuevas Funcionalidades

- **Login Obligatorio con Sesión Backend**:
  - Nueva pantalla de acceso animada con estética tecnológica/telecomunicaciones.
  - Inicio de sesión contra backend con cookie de sesión `HttpOnly`.
  - Endpoints nuevos: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
  - Protección de recursos: `/api/contracts*` y `/uploads` requieren sesión válida.
- **Búsqueda por Categoría de Servicio**: Se ha implementado una nueva capacidad de búsqueda que permite a los usuarios filtrar contratos por el nombre de la categoría de servicio (ej. "Mantenimiento Preventivo", "Helpdesk"). Esta funcionalidad se ha integrado tanto en el backend (`/api/contracts` ahora acepta el parámetro `category`) como en el frontend, con un campo de búsqueda dedicado.
- **Asignacion de Soporte integrada en React**: Se integró la funcionalidad originalmente implementada en `soporte_contel.html` como una segunda vista dentro de la app principal.
  - Selector de técnico ausente.
  - Vista de asignación normal.
  - Simulación de redistribución de tareas y barra de carga resultante.
  - Nuevo botón en header renombrado a **"Asignacion de Soporte"**.

## Mejoras y Correcciones de Errores (UX/Rendimiento)

- **Optimización de Búsqueda (Frontend)**:
    - Se ha implementado un patrón de `debounce` en los campos de búsqueda del frontend para reducir la frecuencia de las llamadas a la API. Esto mejora la experiencia del usuario al hacer la interfaz más fluida y reduce la carga en el servidor.
- **Corrección de Pérdida de Foco en Campos de Búsqueda**:
    - Se ha refactorizado el componente `SearchBar.jsx` para que gestione su propio estado interno para los inputs de búsqueda. Esto asegura que el foco no se pierda al escribir, incluso cuando el componente padre se re-renderiza.
- **Corrección de Navegación Inesperada al Borrar Filtros**:
    - Los botones de borrado ('x') en los campos de búsqueda ahora incluyen `e.preventDefault()` en sus manejadores `onClick` y están definidos con `type='button'`. Esto soluciona un problema donde al borrar el contenido de un campo, el navegador podía retroceder a la URL anterior.
- **Manejo Mejorado del Estado de Carga**:
    - Se ha ajustado la forma en que el estado `loading` afecta a los inputs de búsqueda. Se eliminó el atributo `disabled={loading}` de los inputs para evitar que los cambios en este estado causaran problemas de foco, manteniendo solo la indicación visual de carga mediante la `opacity`.

## Detalles Técnicos Clave

- **Backend (`server/src/index.js`)**:
  - Se añadieron tablas `auth_users` y `auth_sessions`.
  - Hash de contraseñas mediante `scrypt`.
  - Gestión de sesión con token aleatorio y hash `sha256`.
  - Middleware `requireAuth` para proteger endpoints privados.
- **Backend (`server/src/index.js`)**: El endpoint GET `/api/contracts` ahora utiliza `JOIN`s con `contract_services` y `categories` y filtra con `UPPER(cat.name) LIKE ?` para la búsqueda por categoría.
- **Frontend (`src/App.jsx`)**: El componente principal ha sido actualizado para gestionar el nuevo estado `categoryFilter` y para usar `debouncedFetchContracts` para todas las operaciones de fetching relacionadas con la búsqueda, edición y guardado.
- **Frontend (`src/components/auth/LoginPage.jsx`)**: Nueva página de login con animaciones de red/señal.
- **Frontend (`src/components/layout/SearchBar.jsx`)**: Implementación de estado interno para `query` y `categoryFilter` con debounce integrado para actualizar el estado del componente padre.
- **Frontend (`src/components/coverage/CoveragePlanner.jsx`)**: Nueva vista React para cobertura por ausencia con renderizado condicional por técnico.
- **Frontend (`src/components/coverage/coverageData.js`)**: Fuente de datos estructurada para asignación normal y escenarios de cobertura.
- **Frontend (`src/components/layout/Header.jsx`)**: Se añadió selector de sección y el botón se muestra como **"Asignacion de Soporte"**.

---
*Fecha de Lanzamiento: 11 de abril de 2026*
