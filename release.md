# Notas de Lanzamiento (Versión 2.2)

## Nuevas Funcionalidades

- **Búsqueda por Categoría de Servicio**: Se ha implementado una nueva capacidad de búsqueda que permite a los usuarios filtrar contratos por el nombre de la categoría de servicio (ej. "Mantenimiento Preventivo", "Helpdesk"). Esta funcionalidad se ha integrado tanto en el backend (`/api/contracts` ahora acepta el parámetro `category`) como en el frontend, con un campo de búsqueda dedicado.

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

- **Backend (`server/src/index.js`)**: El endpoint GET `/api/contracts` ahora utiliza `JOIN`s con `contract_services` y `categories` y filtra con `UPPER(cat.name) LIKE ?` para la búsqueda por categoría.
- **Frontend (`src/App.jsx`)**: El componente principal ha sido actualizado para gestionar el nuevo estado `categoryFilter` y para usar `debouncedFetchContracts` para todas las operaciones de fetching relacionadas con la búsqueda, edición y guardado.
- **Frontend (`src/components/layout/SearchBar.jsx`)**: Implementación de estado interno para `query` y `categoryFilter` con debounce integrado para actualizar el estado del componente padre.

---
*Fecha de Lanzamiento: 11 de abril de 2026*
