# 🌍 The Polyglot Path

**The Polyglot Path** is a web-based narrative RPG designed for immersive language learning. The player learns by conversational interactions in natural language with AI-powered NPCs (Non-Playable Characters). It is the result of a Master's Thesis (TFM) project.

The system is built under a **Data-Driven** philosophy, where all the narrative content (locations, missions, dialogues, and characters) resides in structured JSON files, allowing great scalability and a tight integration with AI-managed pedagogical flows.

---

## 🛠️ Technology Stack

The architecture of this project is decoupled into different layers seamlessly orchestrated using Docker:

*   **Frontend & Interface:** Nuxt 4 (Vue 3) transpiled and served with modern tooling.
*   **Backend & API:** Nitro (Nuxt native server engine) providing the database and AI access points.
*   **Artificial Intelligence:** Google Firebase Genkit + Gemini 1.5 Flash LLM (Used as the core conversational and grammatical evaluation engine).
*   **Database & ORM:** PostgreSQL + Drizzle ORM (Used exclusively to save the player's saved state and progression).
*   **Game Data (JSON):** All environment artifacts (NPCs, quests, locations) are dynamically loaded at runtime.

---

## 🚀 Development Environment (Docker)

The entire project (App, Database, and Visual Management) has been dockerized for frictionless deployment on any Operating System.

### Prerequisites
1. Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
2. (Optional) Node.js and `pnpm` on your host system if you need to manage dependencies outside Docker.

### 1. Environment Variables
Clone the configuration template. Never push secret keys to the git repository:
```bash
cp .env.example .env
```
*(You will need to manually add your own `GOOGLE_GENAI_API_KEY` inside the newly created `.env` file for the AI conversational engines to work).*

### 2. Spinning up the Services
Launch the entire application stack using Docker Compose in the background (`-d` flag):
```bash
docker compose up -d
```
This single command will spin up **3 isolated services**:
*   **polyglot-db**: Your local PostgreSQL 16 database.
*   **polyglot-pgadmin**: Your visual database management tool.
*   **polyglot-app**: Your main App (running a silent `pnpm install` in the background).

### 3. Services and Access
Once the containers are successfully running, the services will be available at:

| Service          | Local URL                                      | Description & Access info                                                                                                                  |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **App (Nuxt 4)** | [http://localhost:3000](http://localhost:3000) | Main App running with *Hot Module Reload*                                                                                                  |
| **pgAdmin 4**    | [http://localhost:5050](http://localhost:5050) | Visual Database manager.<br>**User:** `admin@polyglot.com`<br>**Password:** `admin123`                                                     |
| **PostgreSQL**   | `localhost:5432`                               | Exposed on the host. Accessible via Desktop clients (e.g., DBeaver) on URL: `postgres://polyglot:polyglot123@localhost:5432/polyglot_path` |

### 🛑 Stopping the Environment
To gracefully stop the services without wiping the existing database data:
```bash
docker compose stop
```
*(Next time, just run `docker compose start` to pick up exactly where you left off).*



---
*Built to learn and explore the limits of LLMs on heavily interactive web environments.*
