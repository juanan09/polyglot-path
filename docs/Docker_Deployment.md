# 🐳 Docker Deployment Guide (Polyglot Path)

[🇪🇸 Versión en Español](./Despliegue_Docker.md) | 🇬🇧 **English**

This document details the configuration, architecture, and commands necessary to deploy the "Polyglot Path" application using Docker and Docker Compose, for both **Local Development** and **Production** environments.

---

## 🏗️ Container Architecture

The application is composed of the following services defined in the `docker-compose.yml` file:

| Service                   | Description                               | Image / Build                    | External Ports          |
| :------------------------- | :---------------------------------------- | :-------------------------------- | :---------------------- |
| **`polyglot-db`**          | Main database.                            | `postgres:16-alpine`              | `5444` (Mapped to 5432) |
| **`polyglot-pgadmin`**     | Graphical database administration tool.   | `dpage/pgadmin4:latest`           | `5050`                  |
| **`polyglot-app`**         | Main app (Frontend Nuxt + Backend Nitro). | Local Build (`Dockerfile`)        | `3000`                  |
| **`polyglot-migrator`**    | Automatically runs Drizzle migrations.    | Local Build (`Dockerfile`)        | N/A                     |
| **`polyglot-ollama`**      | Local LLM server (Optional).              | `ollama/ollama:latest`            | `11434`                 |
| **`polyglot-ollama-pull`** | Helper to download the initial model.     | `ollama/ollama:latest`            | N/A                     |

---

## 🛠️ Development Environment (Local)

The development environment leverages the secondary file `docker-compose.override.yml`, which runs by default unless specified otherwise.

**Development mode features:**
- **Hot-Reload (HMR):** Active through port `24678`.
- **Synchronization:** Modifying code in your editor is instantly reflected in the container due to volume mapping (`.:/app`).
- **Dockerfile (Target Base):** It doesn't compile the code but installs dependencies and runs `pnpm run dev` dynamically.

### Development Commands

**1. Spin up the full project (default):**
```bash
docker compose up -d
```

**2. Spin up the project INCLUDING Ollama (Local LLM):**
```bash
docker compose --profile ollama up -d
```

---

## 🚀 Production Environment

In production, the strategy minimizes size and improves security by building the final image with a *Multi-stage* approach:
1. **`base`**: Alpine + Node 22 + PNPM (Preparation).
2. **`deps`**: Strict installation of dependencies without source code.
3. **`builder`**: Copies and compiles the code, generating `.output`.
4. **`runner`**: Final stage that copies exclusively the `.output` folder (compiled Nitro).

**Important note for deployment:** In production, avoid applying the `docker-compose.override.yml` file. If it's present on the server, use:
```bash
docker compose -f docker-compose.yml up -d --build
```

### 🔒 Production Security Best Practices

Before deploying to a publicly accessible server, you must secure your environment:
1. **Secure `.env` File**: Never commit your `.env` to GitHub. On your VPS, create a `.env` file with strong, random passwords for `POSTGRES_PASSWORD`, `PGADMIN_PASSWORD`, and `SESSION_PASSWORD` (minimum 32 characters to encrypt cookies).
2. **Close Database Ports**: In your production `docker-compose.yml`, remove the `ports: - "5444:5432"` array from the `polyglot-db` service. The app will connect internally to the DB securely, preventing it from being exposed to the whole internet.
3. **Use HTTPS**: Configure a reverse proxy (like Nginx or Traefik) with SSL/TLS certificates (Let's Encrypt) in front of `polyglot-app` (port 3000).

---

## 💻 Useful Commands for the Team

- **View real-time logs (App):**
  ```bash
  docker compose logs -f polyglot-app
  ```

- **Stop and remove containers (Keeps DB intact):**
  ```bash
  docker compose down
  ```

- **⚠️ Stop, remove containers AND DELETE DB DATA:**
  ```bash
  docker compose down -v
  ```

- **Access the database via shell:**
  ```bash
  docker exec -it polyglot-db psql -U polyglot -d polyglot_path
  ```

---

## 🔐 Environment Variables

Deployment relies on your `.env` file. Key variables:
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`: Database credentials.
- `USE_OLLAMA` and `OLLAMA_MODEL`: Allows changing the local model (e.g., `phi4-mini`).

---

## 🆘 Troubleshooting

### 1. Migration Error (`relation "..." already exists`)
**Solution:** Delete the current database state (⚠️ Warning: This deletes local data):
```bash
docker compose down -v
docker compose up -d --build
```

### 2. Application doesn't load (`ERR_EMPTY_RESPONSE`)
**Cause:** Local AI tools like Genkit might be blocking the console waiting for user interaction.
**Solution:** Ensure the `dev` script in `package.json` includes the `--non-interactive` flag.

### 3. Permission denied on Linux (`EACCES node_modules`)
**Solution:** Change folder owner locally before mounting:
```bash
sudo chown -R 1000:1000 .
```

### 4. Ollama responds slowly the first time
**Cause:** The `polyglot-ollama-pull` helper is busy downloading several GBs of model files.
**Solution:** Check progress with:
```bash
docker compose logs -f polyglot-ollama-pull
```

---

## 🎩 Advanced Tricks (`docker exec`)

**1. Open an interactive terminal inside the App:**
```bash
docker exec -it polyglot-app sh
```

**2. Install an npm package on the fly:**
```bash
docker exec -it polyglot-app pnpm add <package-name>
```

**3. Run tests manually inside Docker:**
```bash
docker exec -it polyglot-app pnpm test
```
