# 🌍 The Polyglot Path

**The Polyglot Path** es un RPG narrativo web diseñado para el aprendizaje inmersivo de idiomas. El jugador aprende conversando en lenguaje natural con NPCs (personajes del juego) impulsados por Inteligencia Artificial (LLM). Es el resultado de un proyecto de Trabajo Fin de Máster (TFM).

El sistema está construido bajo una filosofía **Data-Driven**, donde todo el contenido narrativo (escenarios, misiones, diálogos y personajes) reside en archivos JSON estructurados, permitiendo una gran escalabilidad, fácil mantenimiento y una integración directa con los flujos pedagógicos gestionados por IA.

---

## 🛠️ Stack Tecnológico

La arquitectura de este proyecto se divide en diferentes capas integradas armónicamente mediante Docker:

*   **Frontend & Interfaz:** Nuxt 4 (Vue 3) compilado y orquestado con herramientas modernas.
*   **Backend & API:** Nitro (Servidor nativo de Nuxt) proporcionando los puntos de acceso de la base de datos y la IA.
*   **Inteligencia Artificial:** Google Firebase Genkit + LLM Gemini 1.5 Flash (utilizada como motor de evaluación gramatical y generador conversacional).
*   **Base de Datos & ORM:** PostgreSQL + Drizzle ORM (Se utiliza exclusivamente para guardar el estado y progreso guardado de las partidas del jugador).
*   **Game Data (JSON):** Todos los componentes del entorno (NPCs, misiones, escenarios) son cargados en tiempo de ejecución.

---

## 🚀 Entorno de Desarrollo (Docker)

Todo el proyecto (App, Base de Datos y Gestión) se ha dockerizado para un despliegue sin fricciones en cualquier sistema operativo.

### Requisitos Previos
1. Tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
2. (Opcional) Node.js y `pnpm` en tu sistema anfitrión si necesitas interactuar con dependencias fuera de Docker.

### 1. Variables de Entorno
Clona la plantilla de configuración. Nunca incluyas claves secretas directamente en el repositorio:
```bash
cp .env.example .env
```
*(Deberás añadir tu propia `GOOGLE_GENAI_API_KEY` dentro del archivo `.env` recién creado si deseas que funcione la Inteligencia Artificial).*

### 2. Arrancar los Servicios
Lanza la aplicación completa utilizando Docker Compose en segundo plano (`-d`):
```bash
docker compose up -d
```
Este comando levantará **3 servicios** interconectados:
*   **polyglot-db**: Tu base de datos PostgreSQL 16.
*   **polyglot-pgadmin**: Tu gestor de base de datos visual.
*   **polyglot-app**: Tu App principal (instalando en segundo plano las dependencias vía `pnpm` silenciosamente).

### 3. Servicios y Accesos
Una vez que los contenedores estén funcionando, los servicios estarán disponibles en:

| Servicio         | URL Local                                      | Descripción e Info de acceso                                                                                             |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **App (Nuxt 4)** | [http://localhost:3000](http://localhost:3000) | Aplicación principal con *Hot Module Reload* activo.                                                                     |
| **pgAdmin 4**    | [http://localhost:5050](http://localhost:5050) | Gestor de Base de datos visual.<br>**Usuario:** `admin@polyglot.com`<br>**Password:** `admin123`                         |
| **PostgreSQL**   | `localhost:5444`                               | Accesible también desde cliente local (ej. DBeaver). URL: `postgres://polyglot:polyglot123@localhost:5444/polyglot_path` |

### 🛑 Detener el entorno
Para detener los servicios sin destruir los datos de la base de datos:
```bash
docker compose stop
```
*(Para encenderlos de nuevo posteriormente sólo debes ejecutar `docker compose start`)*.

### 💡 Notas y Resolución de Problemas (Troubleshooting)

#### 🔄 Cambios Estructurales y Reinicio de Docker
Si realizas cambios profundos en la estructura del proyecto (como mover carpetas de nivel o cambiar la configuración de Nuxt 4 `app/`), es posible que el contenedor no detecte el cambio automáticamente. Si la aplicación no carga las nuevas rutas, reinicia el servicio:
```bash
docker compose restart polyglot-app
```
O de forma más radical para limpiar la caché:
```bash
docker compose down && docker compose up -d
```

#### 🏗️ Estructura Nuxt 4
Este proyecto utiliza la nueva convención de directorios de **Nuxt 4**. Todo el código fuente de la aplicación reside en la carpeta `/app` (incluyendo `pages/`, `stores/`, `components/`, etc.), mientras que la lógica de backend reside en `/server`.

---

---

