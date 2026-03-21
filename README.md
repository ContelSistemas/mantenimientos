# Contel Ingenieros — Buscador de Mantenimientos

Aplicación web para la gestión y visualización de contratos de mantenimiento, servicios de monitorización y helpdesk. Desarrollada con **React**, **Node.js (Express)** y **SQLite**, orquestada con **Docker**.

## 🚀 Arquitectura del Proyecto

- **Frontend**: React (Vite) + CSS nativo. Proporciona una interfaz rápida con búsqueda en tiempo real y filtrado dinámico.
- **Backend (API)**: Express.js. Gestiona las operaciones CRUD y se comunica con la base de datos.
- **Base de Datos**: SQLite (mediante `better-sqlite3`). Almacenamiento ligero y eficiente con persistencia mediante volúmenes de Docker.
- **Infraestructura**: Docker Compose. Orquestación de contenedores con Nginx como proxy inverso para la API.

## 🛠️ Requisitos previos

- Docker
- Docker Compose

## 🏁 Cómo empezar

Para levantar el proyecto completo (Frontend + Backend), ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d --build
```

- **Frontend**: Acceso en [http://localhost:8080](http://localhost:8080)
- **API**: Acceso en [http://localhost:8080/api/contracts](http://localhost:8080/api/contracts)

## 📁 Estructura de archivos

- `/src`: Código fuente del Frontend (React).
- `/server`: Código fuente del Backend (Node.js + SQLite).
- `/server/data`: Ubicación de la base de datos `contel.db` (Persistida mediante volúmenes).
- `docker-compose.yml`: Configuración de los servicios.
- `nginx.conf`: Configuración del servidor Nginx y proxy inverso para la API.

## 📝 Próximas Mejoras

- [ ] Implementar pantalla para añadir nuevos contratos (Alta).
- [ ] Implementar modo edición para modificar servicios y descripciones (CRUD completo).
- [ ] Refactorización de componentes de React en archivos independientes.
- [ ] Mejoras estéticas en los gráficos y feedback visual.
