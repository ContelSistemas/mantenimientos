# Notas de Lanzamiento (Version 2.5)

## Nuevas Funcionalidades

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

## Mejoras de Logica de Cobertura

- **Simulacion de ausencia calculada sobre datos reales**:
  - La redistribucion por tecnico ausente ahora se calcula dinamicamente usando la asignacion actual guardada.
  - La barra de carga resultante refleja el estado real del reparto tras los cambios.

- **Manejo de errores en guardado**:
  - Si un guardado falla, la UI revierte al estado anterior (rollback visual) y muestra el error.

## Detalles Tecnicos Clave

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
*Fecha de Lanzamiento: 12 de abril de 2026*
