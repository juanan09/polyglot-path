# 🐳 Guía de Despliegue con Docker (Polyglot Path)

🇪🇸 **Español** | [🇬🇧 English Version](./Docker_Deployment.md)

Este documento detalla la configuración, arquitectura y comandos necesarios para desplegar la aplicación "Polyglot Path" utilizando Docker y Docker Compose, tanto en entornos de **Desarrollo local** como en **Producción**.

---

## 🏗️ Arquitectura de Contenedores

La aplicación está compuesta por los siguientes servicios definidos en el archivo `docker-compose.yml`:

| Servicio                   | Descripción                                               | Imagen / Build                    | Puertos Externos        |
| :------------------------- | :-------------------------------------------------------- | :-------------------------------- | :---------------------- |
| **`polyglot-db`**          | Base de datos principal.                                  | `postgres:16-alpine`              | `5444` (Mapeado a 5432) |
| **`polyglot-pgadmin`**     | Herramienta gráfica de administración de BBDD.            | `dpage/pgadmin4:latest`           | `5050`                  |
| **`polyglot-app`**         | Aplicación principal (Frontend Vue/Nuxt + Backend Nitro). | Construcción local (`Dockerfile`) | `3000`                  |
| **`polyglot-migrator`**    | Ejecuta las migraciones de Drizzle automáticamente.       | Construcción local (`Dockerfile`) | N/A                     |
| **`polyglot-ollama`**      | Servidor LLM local (Opcional, Perfil `ollama`).           | `ollama/ollama:latest`            | `11434`                 |
| **`polyglot-ollama-pull`** | Helper para descargar el modelo inicial configurado.      | `ollama/ollama:latest`            | N/A                     |

---

## 🛠️ Entorno de Desarrollo (Local)

El entorno de desarrollo aprovecha el archivo secundario `docker-compose.override.yml` que se ejecuta por defecto si no se especifica lo contrario. 

**Características del modo desarrollo:**
- **Hot-Reload (HMR):** Activo a través del puerto `24678`.
- **Sincronización:** Modificar el código en tu editor se refleja instantáneamente en el contenedor debido al mapeo de volúmenes (`.:/app`).
- **Dockerfile (Target Base):** No compila el código, sino que instala dependencias y ejecuta `pnpm run dev` de forma dinámica.

### Comandos de Desarrollo

**1. Levantar el proyecto completo (por defecto):**
```bash
docker compose up -d
```

**2. Levantar el proyecto INCLUYENDO Ollama (LLM Local):**
```bash
docker compose --profile ollama up -d
```

---

## 🚀 Entorno de Producción

En producción, la estrategia minimiza el tamaño y mejora la seguridad construyendo la imagen final con un enfoque *Multi-stage*:
1. **`base`**: Alpine + Node 22 + PNPM (Preparación).
2. **`deps`**: Instalación estricta de dependencias sin código fuente.
3. **`builder`**: Copia y compila el código, generando `.output`.
4. **`runner`**: Etapa final que copia exclusivamente la carpeta `.output` (Nitro compilado), ignorando el resto del código y las dependencias de desarrollo.

**Nota importante para el despliegue:** En el servidor de producción, se debe EVITAR que se aplique el archivo `docker-compose.override.yml` (que está pensado sólo para dev). Si está presente en el servidor, usa el flag explícito para leer sólo el base.

### Comandos de Producción

**1. Levantar en modo producción estricto (Ignorando override de Desarrollo):**
```bash
docker compose -f docker-compose.yml up -d --build
```
*(Si eliminas el archivo override del servidor de producción, basta con un simple `docker compose up -d --build`).*

### 🔒 Prácticas de Seguridad en Producción

Antes de desplegar en un servidor accesible públicamente, debes asegurar tu entorno:
1. **Archivo `.env` seguro**: Nunca subas tu `.env` a GitHub. En tu servidor VPS, crea un archivo `.env` con contraseñas fuertes y aleatorias para `POSTGRES_PASSWORD`, `PGADMIN_PASSWORD` y `SESSION_PASSWORD` (mínimo 32 caracteres para encriptar cookies).
2. **Cerrar el puerto de la Base de Datos**: En tu `docker-compose.yml` de producción, elimina la sección `ports: - "5444:5432"` del servicio `polyglot-db`. La aplicación se conectará internamente a la BD de forma segura, evitando que quede expuesta a todo internet.
3. **Usar HTTPS**: Configura un proxy inverso (como Nginx o Traefik) con certificados SSL/TLS (let's encrypt) delante de `polyglot-app` (puerto 3000).

---

## 💻 Comandos Útiles para el Equipo

- **Ver logs en tiempo real (de la App):**
  ```bash
  docker compose logs -f polyglot-app
  ```

- **Ver logs de todos los contenedores:**
  ```bash
  docker compose logs -f
  ```

- **Apagar y eliminar contenedores (Mantiene la BD intacta):**
  ```bash
  docker compose down
  ```

- **⚠️ Apagar, eliminar contenedores Y BORRAR LOS DATOS de la BD y Ollama:**
  ```bash
  docker compose down -v
  ```

- **Forzar la reconstrucción general (Si se añaden paquetes a package.json, por ejemplo):**
  ```bash
  docker compose up -d --build
  ```

- **Acceder por consola interactiva a la base de datos (PostgreSQL Shell):**
  ```bash
  docker exec -it polyglot-db psql -U polyglot -d polyglot_path
  ```

---

## 🔐 Variables de Entorno y Configuraciones

El despliegue depende fuertemente de tu archivo `.env`. Si no tienes uno, duplica el archivo `.env.example`:

```bash
cp .env.example .env
```

Variables clave en Docker Compose:
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`: Credenciales de BBDD.
- `PGADMIN_EMAIL` / `PGADMIN_PASSWORD`: Acceso al pgAdmin (`http://localhost:5050`).
- `USE_OLLAMA` y `OLLAMA_MODEL`: Permite cambiar el modelo local usado por defecto (ej. `phi4-mini`).

---

## 🆘 Solución de Problemas Frecuentes (Troubleshooting)

### 1. Error de Migraciones (`relation "..." already exists`)
**Síntoma:** El contenedor `polyglot-migrator` crashea con este error.
**Causa:** Conflicto de versiones entre el historial de migraciones de Drizzle y el estado actual de la base de datos local, típicamente causado por volúmenes residuales en el entorno de desarrollo.
**Solución:** Borra el estado de la base de datos actual para que se autogenere limpia:
```bash
docker compose down -v
docker compose up -d --build
```
*(⚠️ Nota: Esto borra los datos de la base de datos local).*

### 2. La aplicación no carga (`ERR_EMPTY_RESPONSE` en localhost:3000)
**Síntoma:** El puerto 3000 no devuelve nada y al inspeccionar el contenedor con `docker compose logs -f polyglot-app` el proceso parece parado pidiendo a un usuario que pulse Enter (`Press "Enter" to acknowledge and continue`).
**Causa:** Herramientas de Inteligencia Artificial locales como Genkit están bloqueando la consola esperando interacción del usuario, lo cual es imposible en un contenedor daemonizado (`-d`).
**Solución:** Especificar explicitamente que queremos arrancar en modo no interactivo. Asegúrate de que el script en tu `package.json` incluye el flag `--non-interactive`:
```json
"scripts": {
  "dev": "npx genkit start --non-interactive -- npm run dev:nuxt"
}
```

### 3. Permisos denegados en Linux (EACCES node_modules)
**Problema:** Al levantar en Linux (Ubuntu/Debian) el contenedor falla intentando escribir en `/app/node_modules` (Error `EACCES`).
**Causa:** Conflicto de permisos entre el usuario `node` dentro del contenedor Alpine y el dueño de los archivos mapeados desde tu disco local.
**Solución:** Puedes cambiar el propietario de la carpeta localmente antes de montar el volumen:
```bash
sudo chown -R 1000:1000 .
```

### 4. Ollama responde lento o falla la primera vez
**Problema:** Has usado `--profile ollama`, pero la IA no contesta de inmediato en localhost:11434 o da "Connection refused".
**Causa:** La primera vez, el *helper* (`polyglot-ollama-pull`) tiene que descargar un modelo que pesa varios Gigabytes (como `phi4-mini`). Ese contenedor no dejará funcionar a Ollama hasta que haya descargado y aplicado todo.
**Solución:** Revisa el progreso de la descarga con:
```bash
docker compose logs -f polyglot-ollama-pull
```

---

## 🎩 Trucos Avanzados (docker exec)

Si necesitas instalar una nueva dependencia sin apagar tu servidor y reconstruir la imagen, o ejecutar tests manualmente, puedes "entrar" en el contenedor:

**1. Abrir una terminal iteractiva dentro de la App (Node):**
```bash
docker exec -it polyglot-app sh
```

**2. Instalar un paquete de npm en caliente (sin reiniciar):**
```bash
docker exec -it polyglot-app pnpm add <package_name>
```

**3. Lanzar tests manualmente dentro del entorno dockerizado:**
```bash
docker exec -it polyglot-app pnpm test
```
