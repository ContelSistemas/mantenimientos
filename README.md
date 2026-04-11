# Contel Ingenieros — Buscador de Mantenimientos y Helpdesk

Aplicación web avanzada para la gestión y visualización de contratos de mantenimiento, servicios de monitorización y helpdesk. Desarrollada con **React**, **Node.js (Express)** y **SQLite**, orquestada mediante **Docker**.

## 🚀 Arquitectura y Tecnologías

- **Frontend**: React (Vite) + CSS nativo. Interfaz modularizada para alta mantenibilidad.
- **Backend (API)**: Express.js + Zod para validación de esquemas.
- **Gestión de Archivos**: `multer` para subida de contratos en PDF, servidos de forma segura vía Nginx.
- **Base de Datos**: SQLite (`better-sqlite3`) en modo WAL para alto rendimiento, persistida mediante volúmenes de Docker.
- **Infraestructura**: Docker Compose con Nginx como servidor web y proxy inverso.

## ✨ Funcionalidades Implementadas

- **Búsqueda General en Tiempo Real**: Filtrado dinámico por obra, cliente, nº cliente o descripción con resaltado de coincidencias.
- **Búsqueda Avanzada por Categoría de Servicio**: Permite filtrar contratos por el nombre de la categoría de servicio (ej. "Mantenimiento Preventivo", "Helpdesk").
- **Gestión Completa de Contratos**: Alta, edición (vía modal) y borrado de contratos con confirmación de seguridad.
- **Contratos en PDF**: Posibilidad de adjuntar, ver y eliminar el contrato original en PDF para cada obra. Los archivos se borran automáticamente al eliminar el contrato.
- **Edición Rápida**: Modificación "in-place" de descripciones y estados de servicios (checkboxes) directamente desde la lista.
- **Interfaz Responsiva**: Diseño moderno con temática oscura/clara, iconos por categoría y feedback visual de copiado.
- **Protección de Edición**: Sistema de contraseña para evitar modificaciones accidentales por operadores no autorizados.

## 🛠️ Correcciones y Mejoras Recientes

- **Optimización de Búsqueda (Frontend)**: Implementación de debounce en los campos de búsqueda para reducir las llamadas a la API, mejorando la experiencia de usuario y el rendimiento.
- **Corrección de UX en Campos de Búsqueda**:
    - Los campos de búsqueda ahora mantienen el foco durante la escritura, evitando interrupciones.
    - Los botones de borrar ('x') en los campos de búsqueda funcionan correctamente, impidiendo la navegación inesperada del navegador y facilitando la limpieza de los filtros.
- **Manejo de Carga de Datos**: Gestión mejorada del estado de carga para los datos, proporcionando feedback visual sin afectar la interactividad de los inputs.

## 🛠️ Requisitos previos

- Docker
- Docker Compose

## 🏁 Cómo empezar

Para levantar el proyecto completo o aplicar actualizaciones, ejecuta:

```bash
docker compose up -d --build
```

- **Frontend**: [http://mantenimientos.domdoklab.me](http://mantenimientos.domdoklab.me) (o localhost en desarrollo)
- **API**: [http://localhost:3000/api/contracts](http://localhost:3000/api/contracts)

## 🗂️ Estructura mínima versionada (sin datos)

Para permitir despliegues desde cero sin subir datos reales al repositorio, se versionan solo las carpetas runtime con archivos `.gitkeep`:

- `server/data/.gitkeep`
- `server/uploads/.gitkeep`

La base de datos SQLite y los PDFs reales permanecen ignorados en `.gitignore`.  
Al iniciar la API, la aplicación crea automáticamente la estructura de DB y aplica migraciones si el archivo no existe.

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

## 📝 Próximos Pasos

- [ ] Mejorar las gráficas de estadísticas de servicios.
- [ ] Implementar sistema de logs para cambios en contratos.
- [ ] Exportación de listados a Excel/CSV.
