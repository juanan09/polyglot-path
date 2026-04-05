# 🌊 Guía de Despliegue — DigitalOcean App Platform

🇪🇸 **Español** | [🇬🇧 English Version](./DigitalOcean_Deployment.md)

Esta guía explica paso a paso cómo desplegar **Polyglot Path** en [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform), usando tu Dockerfile existente y una base de datos PostgreSQL gestionada.

---

## 📋 Índice

1. [Requisitos Previos](#-1-requisitos-previos)
2. [Arquitectura del Despliegue](#-2-arquitectura-del-despliegue)
3. [Opción A — Despliegue desde el Panel Web (GUI)](#-3-opción-a--despliegue-desde-el-panel-web)
4. [Opción B — Despliegue con doctl (CLI)](#-4-opción-b--despliegue-con-doctl-cli)
5. [Configurar Variables de Entorno](#-5-configurar-variables-de-entorno)
6. [Verificar el Despliegue](#-6-verificar-el-despliegue)
7. [Subdominio Personalizado (polyglot.jassdev.tech)](#-7-subdominio-personalizado)
8. [Costes Estimados](#-8-costes-estimados)
9. [Solución de Problemas](#-9-solución-de-problemas)

---

## 🔧 1. Requisitos Previos

| Requisito | Descripción |
|:---|:---|
| **Cuenta DigitalOcean** | Crea una en [cloud.digitalocean.com](https://cloud.digitalocean.com/registrations/new) |
| **Repositorio en GitHub** | Tu código debe estar en `github.com/juanan09/polyglot-path` y la rama `main` actualizada |
| **API Key de Groq** | Necesaria si usas `LLM_PROVIDER=groq` (o Google AI, según tu config) |

> [!TIP]
> DigitalOcean ofrece **$200 de crédito gratis durante 60 días** para nuevas cuentas. Perfecto para un TFM.

---

## 🏗️ 2. Arquitectura del Despliegue

```
┌─────────────────────────────────────────────────────┐
│                DigitalOcean App Platform             │
│                                                     │
│  ┌───────────────────┐    ┌──────────────────────┐  │
│  │  polyglot-app      │    │  polyglot-db          │  │
│  │  (Nuxt 4 + Nitro) │◄──►│  (PostgreSQL 16)      │  │
│  │  Dockerfile        │    │  Managed Database     │  │
│  │  Puerto 3000       │    │  db-s-dev-database    │  │
│  └───────────────────┘    └──────────────────────┘  │
│         ▲                                           │
│  ┌──────┴────────────┐                              │
│  │ polyglot-migrator  │  ← PRE_DEPLOY Job           │
│  │ Dockerfile.migrate │  (Drizzle migrations)       │
│  └───────────────────┘                              │
└─────────────────────────────────────────────────────┘
          ▲
          │ HTTPS (automático)
          │
     🌐 Internet
```

**Componentes:**

- **`polyglot-app`**: Tu aplicación Nuxt 4 construida desde el `Dockerfile` multi-stage. Se expone en HTTPS automáticamente.
- **`polyglot-migrator`**: Job `PRE_DEPLOY` que ejecuta `pnpm run db:migrate` antes de cada despliegue. Usa `Dockerfile.migrate`.
- **`polyglot-db`**: Base de datos PostgreSQL 16 gestionada por DigitalOcean (backups automáticos, alta disponibilidad).

---

## 🖥️ 3. Opción A — Despliegue desde el Panel Web

### Paso 1: Conectar GitHub

1. Ve a [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Haz clic en **"Create App"**
3. Selecciona **GitHub** como fuente
4. Autoriza DigitalOcean para acceder a tu cuenta de GitHub
5. Selecciona el repositorio **`juanan09/polyglot-path`** y la rama **`main`**

### Paso 2: Configurar el Servicio Web

1. DigitalOcean detectará automáticamente tu `Dockerfile`
2. Verifica que:
   - **Source**: `juanan09/polyglot-path` → branch `main`
   - **Type**: Web Service
   - **Dockerfile**: `Dockerfile` (se detecta solo)
   - **HTTP Port**: `3000`
3. En la sección de **Plan**, selecciona:
   - **Professional** → `professional-xs` ($12/mes) — Recomendado
   - O **Basic** → `basic-xxs` ($5/mes) — Para pruebas rápidas

### Paso 3: Añadir la Base de Datos

1. Haz clic en **"Add Resource" → "Database"**
2. Selecciona:
   - **Engine**: PostgreSQL
   - **Version**: 16
   - **Plan**: `Dev Database` ($0/mes — gratuita) o `Basic` ($15/mes)
3. Nombra la base de datos: `polyglot-db`

### Paso 4: Añadir el Job de Migraciones

1. Haz clic en **"Add Resource" → "Job"**
2. Configura:
   - **Source**: Mismo repo (`juanan09/polyglot-path`, rama `main`)
   - **Dockerfile**: `Dockerfile.migrate`
   - **Kind**: `Pre Deploy`
   - **Nombre**: `polyglot-migrator`
3. En las env vars del job, añade:
   - `DATABASE_URL` = `${polyglot-db.DATABASE_URL}`

### Paso 5: Configurar Variables de Entorno

En la sección de **Environment Variables** del servicio `polyglot-app`, añade:

| Variable | Valor | Encrypt |
|:---|:---|:---|
| `DATABASE_URL` | `${polyglot-db.DATABASE_URL}` | No |
| `SESSION_PASSWORD` | *(genera una contraseña de +32 chars)* | ✅ Sí |
| `LLM_PROVIDER` | `groq` | No |
| `GROQ_API_KEY` | *(tu API key de Groq)* | ✅ Sí |
| `NODE_ENV` | `production` | No |

> [!IMPORTANT]
> La sintaxis `${polyglot-db.DATABASE_URL}` es especial de App Platform. Inyecta automáticamente la URL real de conexión a tu base de datos gestionada. **NO la escribas a mano.**

### Paso 6: Desplegar

1. Revisa el resumen de todos los componentes
2. Selecciona la **región** más cercana (ej: `fra` para Frankfurt, Europa)
3. Haz clic en **"Create Resources"**
4. Espera ~5-10 minutos mientras se construye la imagen y se ejecutan las migraciones

---

## ⌨️ 4. Opción B — Despliegue con doctl (CLI)

### Paso 1: Instalar doctl

```powershell
# Windows (con Chocolatey)
choco install doctl

# Windows (con Scoop)
scoop install doctl
```

```bash
# macOS
brew install doctl

# Linux
snap install doctl
```

### Paso 2: Autenticar

```bash
doctl auth init
# Te pedirá un API Token. Créalo desde:
# https://cloud.digitalocean.com/account/api/tokens
```

### Paso 3: Editar el App Spec

El archivo `.do/app.yaml` ya está creado en tu proyecto. **Reemplaza los valores marcados como `REPLACE_...`** antes de desplegar:

- `REPLACE_WITH_A_STRONG_SECRET_MIN_32_CHARS` → una contraseña aleatoria de +32 caracteres
- `REPLACE_WITH_YOUR_GROQ_API_KEY` → tu clave de API de Groq

> [!WARNING]
> **NUNCA hagas commit del `app.yaml` con secretos reales.** Opciones seguras:
> 1. Editar los valores localmente antes de ejecutar `doctl` y **no hacer commit** de esos cambios
> 2. Configurar los secretos por separado en el panel web después de crear la app
> 3. Añadir `.do/app.yaml` al `.gitignore` si vas a tener secretos ahí

### Paso 4: Crear la App

```bash
doctl apps create --spec .do/app.yaml
```

### Paso 5: Verificar el estado

```bash
# Listar tus apps
doctl apps list

# Ver detalles de la app (sustituye <APP_ID> por el ID real)
doctl apps get <APP_ID>

# Ver los logs
doctl apps logs <APP_ID> --type=build
doctl apps logs <APP_ID> --type=deploy
doctl apps logs <APP_ID> --type=run
```

### Paso 6: Actualizar la App (futuros cambios)

```bash
doctl apps update <APP_ID> --spec .do/app.yaml
```

> [!TIP]
> Con `deploy_on_push: true` en el app spec, cada `git push` a `main` dispara automáticamente un nuevo despliegue. No necesitas hacer nada manual después del setup inicial.

---

## 🔐 5. Configurar Variables de Entorno

### Generar un SESSION_PASSWORD seguro

```powershell
# PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

```bash
# Bash (Linux/macOS)
openssl rand -base64 48
```

### Variables requeridas

| Variable | Ejemplo | Componente |
|:---|:---|:---|
| `DATABASE_URL` | `${polyglot-db.DATABASE_URL}` | App + Migrador |
| `SESSION_PASSWORD` | `aG7xKm9pL2...` (mín. 32 chars) | App |
| `NODE_ENV` | `production` | App |
| `LLM_PROVIDER` | `groq` | App |
| `GROQ_API_KEY` | `gsk_...` | App |

### Variables opcionales (si usas Google AI en vez de Groq)

| Variable | Ejemplo |
|:---|:---|
| `LLM_PROVIDER` | `google` |
| `GOOGLE_GENAI_API_KEY` | `AIza...` |

---

## ✅ 6. Verificar el Despliegue

1. **URL pública**: App Platform asigna una URL tipo `https://polyglot-path-xxxxx.ondigitalocean.app`
2. **Comprueba la app**: Navega a la URL y verifica que la página de inicio carga correctamente
3. **Comprueba la BD**: Crea una cuenta de prueba y verifica que la sesión persiste
4. **Dominio personalizado** *(opcional)*: En el panel de la app → Settings → Domains, añade tu dominio propio con HTTPS automático

### Verificación desde CLI

```bash
# Ver la URL asignada
doctl apps list --format ID,DefaultIngress

# Ver logs de ejecución en tiempo real
doctl apps logs <APP_ID> --type=run --follow
```

---

## 🌐 7. Subdominio Personalizado

Tu dominio `jassdev.tech` está en Hostinger. Puedes crear un subdominio como `polyglot.jassdev.tech` apuntando a la app de DigitalOcean **sin mover nada ni cambiar nameservers**. Solo necesitas un registro CNAME.

> [!IMPORTANT]
> **Orden de operaciones**: Primero debes tener la app desplegada en DigitalOcean (secciones 3-6). El subdominio se configura **después** del primer despliegue exitoso.

### Paso 1: Obtener la URL de tu app en DigitalOcean

Después de desplegar, tu app tendrá una URL automática tipo:
```
https://polyglot-path-xxxxx.ondigitalocean.app
```
Anótala — la necesitarás para el paso 3.

### Paso 2: Registrar el subdominio en DigitalOcean

1. Ve a **Apps → polyglot-path → Settings → Domains**
2. Haz clic en **"Add Domain"**
3. Selecciona **"Use an existing domain you own"**
4. Escribe: `polyglot.jassdev.tech`
5. DigitalOcean te mostrará las instrucciones con el **valor CNAME** al que debes apuntar. Será algo como:
   ```
   polyglot-path-xxxxx.ondigitalocean.app.
   ```
6. **Copia ese valor exacto** (incluyendo el punto final `.`)

### Paso 3: Crear el registro CNAME en Hostinger

1. Ve a [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Selecciona tu dominio `jassdev.tech`
3. Ve a **DNS / Zona DNS** (o "DNS Zone Editor")
4. Haz clic en **"Añadir registro"** y rellena:

| Campo | Valor |
|:---|:---|
| **Tipo** | `CNAME` |
| **Nombre** (Host) | `polyglot` |
| **Apunta a** (Target) | `polyglot-path-xxxxx.ondigitalocean.app.` |
| **TTL** | `3600` (o el por defecto) |

5. Haz clic en **Guardar**

> [!WARNING]
> - El campo **Nombre** es solo `polyglot`, NO `polyglot.jassdev.tech` (Hostinger añade el dominio automáticamente)
> - El **Target** debe ser exactamente la URL que te dio DigitalOcean, con el punto `.` al final
> - **NO** toques los registros DNS existentes de `jassdev.tech` — tu web principal no se ve afectada

### Paso 4: Esperar la propagación DNS

- La propagación tarda normalmente **5-30 minutos**, aunque puede llegar a 48h en casos raros
- Puedes verificar el progreso con:

```powershell
# PowerShell (Windows)
nslookup polyglot.jassdev.tech
```

```bash
# Bash (Linux/macOS)
dig polyglot.jassdev.tech CNAME
```

- Cuando veas que resuelve a `polyglot-path-xxxxx.ondigitalocean.app`, ¡está listo!

### Paso 5: Verificar HTTPS

- DigitalOcean genera **automáticamente** un certificado SSL (Let's Encrypt) para tu subdominio
- No tienes que hacer nada extra
- Navega a `https://polyglot.jassdev.tech` y verifica que:
  - ✅ Carga la app correctamente
  - ✅ Aparece el candado 🔒 en la barra del navegador
  - ✅ El certificado es válido

### Resultado final

```
jassdev.tech              → Tu web actual en Hostinger (sin cambios)
polyglot.jassdev.tech     → Polyglot Path en DigitalOcean App Platform
```

Ambos funcionan de forma independiente. Tu web actual no se ve afectada.

---

## 💰 8. Costes Estimados

### Plan recomendado

| Componente | Plan | Coste/mes |
|:---|:---|---:|
| App (professional-xs) | 1 vCPU, 512 MB RAM | $12 |
| Database (dev) | PostgreSQL 16 Dev | $0 (gratis) |
| **Total** | | **~$12/mes** |

### Plan económico

| Componente | Plan | Coste/mes |
|:---|:---|---:|
| App (basic-xxs) | 1 vCPU, 256 MB RAM | $5 |
| Database (dev) | PostgreSQL 16 Dev | $0 |
| **Total** | | **~$5/mes** |

> [!NOTE]
> Con los **$200 de crédito** para nuevas cuentas de DigitalOcean, puedes mantener la app **~16 meses gratis** (plan recomendado) o **~40 meses** (plan económico). Más que suficiente para un TFM.

---

## 🆘 9. Solución de Problemas

### ❌ Error: "Build failed"

**Causa**: Normalmente son dependencias que fallan al compilarse en Alpine Linux.  
**Solución**: Revisa los build logs. Si ves errores de compilación nativa, puede que necesites añadir paquetes al `Dockerfile`:

```dockerfile
# Antes de la línea RUN pnpm install
RUN apk add --no-cache python3 make g++
```

### ❌ Error: "Port not detected" o "Health check failed"

**Causa**: La app no está escuchando en el puerto esperado.  
**Solución**: Verifica que tu `Dockerfile` tiene `ENV PORT=3000` y `EXPOSE 3000`, y que el `http_port` en el app spec es `3000`. Tu Dockerfile actual ya lo tiene configurado correctamente.

### ❌ Error: "Database connection refused"

**Causa**: La `DATABASE_URL` no se está inyectando correctamente.  
**Solución**:
1. Verifica que la variable usa la sintaxis `${polyglot-db.DATABASE_URL}` (exactamente así)
2. El nombre `polyglot-db` debe coincidir con el nombre de la BD en el app spec
3. Asegúrate de que la variable tiene scope `RUN_TIME`

### ❌ Migraciones no se ejecutan

**Causa**: El job PRE_DEPLOY puede fallar silenciosamente.  
**Solución**:
1. Ve a Apps → Tu App → Jobs → `polyglot-migrator` → Logs
2. Verifica que `DATABASE_URL` está configurada en las env vars del job
3. Comprueba que `Dockerfile.migrate` está en la raíz del repositorio

### ❌ Error: "Out of memory" (OOM Kill)

**Causa**: El plan `basic-xxs` tiene solo 256 MB RAM, que puede ser justo para Nuxt SSR.  
**Solución**: Sube a `professional-xs` (512 MB) o `professional-s` (1 GB).

### ❌ Genkit pide "Press Enter" y la app no arranca

**Causa**: El script `dev` incluye `genkit start` que es interactivo, pero esto **no afecta a producción** porque el `Dockerfile` ejecuta `node .output/server/index.mjs` directamente (sin genkit CLI).  
**Solución**: No es necesario hacer nada. Tu Dockerfile de producción ya está correcto.

---

## 📁 Archivos Creados para este Despliegue

| Archivo | Descripción |
|:---|:---|
| [`.do/app.yaml`](../.do/app.yaml) | App Spec de DigitalOcean con la configuración completa |
| [`Dockerfile.migrate`](../Dockerfile.migrate) | Dockerfile ligero exclusivo para ejecutar migraciones Drizzle |
| [`Dockerfile`](../Dockerfile) | *(Ya existía)* Multi-stage build para la app de producción |

---

## 🗺️ Orden Completo de Pasos (de principio a fin)

```
 PREPARACIÓN (tu PC)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ① Asegúrate de que la rama 'main' de GitHub
   está actualizada con tu último código
   → git push origin main

 ② Ten a mano tu GROQ_API_KEY
   (o GOOGLE_GENAI_API_KEY si usas Google)

 DIGITALOCEAN (cloud.digitalocean.com)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ③ Crear cuenta en DigitalOcean
   (aprovecha los $200 de crédito gratis)

 ④ Create App → Conectar repo GitHub
   juanan09/polyglot-path → rama main

 ⑤ Add Resource → Database
   PostgreSQL 16, plan Dev (gratis)

 ⑥ Add Resource → Job (Pre Deploy)
   Dockerfile.migrate → migraciones Drizzle

 ⑦ Configurar Variables de Entorno
   DATABASE_URL, SESSION_PASSWORD, GROQ_API_KEY...

 ⑧ Seleccionar región (fra = Frankfurt)
   → Create Resources → Esperar ~5-10 min

 ⑨ Verificar que la app funciona en
   https://polyglot-path-xxxxx.ondigitalocean.app

 HOSTINGER (hpanel.hostinger.com)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⑩ DNS → Añadir registro CNAME
   polyglot → polyglot-path-xxxxx.ondigitalocean.app.

 ⑪ Volver a DigitalOcean → Settings → Domains
   → Añadir polyglot.jassdev.tech

 ⑫ Esperar propagación DNS (~5-30 min)
   → Verificar https://polyglot.jassdev.tech 🎉
```

> 💡 **A partir de aquí**, cada `git push origin main` desplegará automáticamente. ¡No necesitas hacer nada más!
