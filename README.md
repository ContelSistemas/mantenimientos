# Contel — Buscador MONIT. Y HELPDESK

Buscador interno de contratos de monitorización y helpdesk.
Desplegado como contenedor Docker detrás de un Traefik existente.

**URL final:** https://mantenimientos.domdoklab.me

---

## Requisitos previos

- VPS con Docker + Docker Compose instalados
- **Traefik ya corriendo** en el VPS con:
  - Entrypoints `web` (80) y `websecure` (443)
  - Cert resolver llamado `letsencrypt`
  - Conectado a una red Docker externa llamada `traefik-public`
- DNS del subdominio `mantenimientos.domdoklab.me` apuntando a la IP del VPS

---

## Verificar la red de Traefik

Antes de desplegar, confirma el nombre exacto de la red donde corre tu Traefik:

```bash
docker network ls
```

Busca la red a la que está conectado tu Traefik (normalmente `traefik-public` o similar).
Si el nombre es diferente, edita esta línea en `docker-compose.yml`:

```yaml
networks:
  traefik-public:        # ← cambia esto si tu red tiene otro nombre
    external: true
```

---

## Despliegue paso a paso

### 1. Subir el proyecto al VPS

Desde tu máquina local:

```bash
scp -r contel-buscador/ usuario@IP_VPS:/opt/contel-buscador
```

### 2. Conectarse al VPS y desplegar

```bash
ssh usuario@IP_VPS
cd /opt/contel-buscador
docker compose up -d --build
```

El contenedor arranca en ~30 segundos. Traefik detecta los labels automáticamente
y solicita el certificado Let's Encrypt. En 1-2 minutos estará en:

https://mantenimientos.domdoklab.me

---

## Comandos útiles

```bash
docker compose ps                        # estado
docker compose logs -f buscador          # logs en tiempo real
docker compose down                      # parar
docker compose up -d --build buscador   # actualizar tras cambios
```

---

## Actualizar los datos del Excel

1. Edita el array `DATA` en `src/App.jsx`
2. Redespliega:

```bash
cd /opt/contel-buscador
docker compose up -d --build buscador
```
