# Contel Ingenieros — Buscador de Mantenimientos y Helpdesk

Aplicación web avanzada para la gestión y visualización de contratos de mantenimiento, servicios de monitorización y helpdesk. Desarrollada con **React**, **Node.js (Express)** y **SQLite**, orquestada mediante **Docker**.

## 🚀 Arquitectura y Tecnologías

- **Frontend**: React (Vite) + CSS nativo. Interfaz modularizada para alta mantenibilidad.
- **Backend (API)**: Express.js + Zod para validación de esquemas.
- **Base de Datos**: SQLite (`better-sqlite3`) en modo WAL para alto rendimiento, persistida mediante volúmenes de Docker.
- **Infraestructura**: Docker Compose con Nginx como servidor web y proxy inverso.

## ✨ Funcionalidades Implementadas

- **Búsqueda en tiempo Real**: Filtrado dinámico por obra, cliente, nº cliente o descripción con resaltado de coincidencias.
- **Alta de Contratos**: Formulario modal completo para registrar nuevas obras, clientes y servicios iniciales.
- **Edición Rápida**: Modificación "in-place" de descripciones y estados de servicios (checkboxes) directamente desde la lista.
- **Interfaz Responsiva**: Diseño moderno con temática oscura, iconos por categoría y feedback visual de copiado.
- **Refactorización Modular**: Código organizado en componentes reutilizables (`Header`, `SearchBar`, `ContractRow`, `CategoryRow`, `ContractForm`).

## 🛠️ Requisitos previos

- Docker
- Docker Compose

## 🏁 Cómo empezar

Para levantar el proyecto completo (Frontend + Backend), ejecuta el siguiente comando en la raíz:

```bash
docker compose up -d --build
```

- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **API**: [http://localhost:8080/api/contracts](http://localhost:8080/api/contracts)

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
│   └── data/            # Base de datos SQLite persistida
└── docker-compose.yml   # Orquestación de contenedores
```

## 📝 Próximos Pasos

- [ ] Implementar edición completa de contratos vía modal (añadir/quitar categorías).
- [ ] Mejorar las gráficas de estadísticas de servicios.
- [ ] Implementar sistema de logs para cambios en contratos.
