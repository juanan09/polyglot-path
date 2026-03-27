# 🌍 The Polyglot Path

**The Polyglot Path** is a web-based narrative RPG designed for immersive language learning. The player learns by interacting in natural language with AI-powered NPCs (Non-Playable Characters). It is the result of a Master's Thesis (TFM) project focused on the application of language models in gamified educational environments.

The system is built under a **Data-Driven** philosophy, where all narrative content (locations, missions, dialogues, and characters) resides in structured JSON files, allowing great scalability and integration with AI-managed pedagogical workflows.

---

## ✨ Key Features

*   **🎙️ Intelligent AI Dialogue:** Dynamic conversations with NPCs that evaluate your grammar, maintain their personality, and react to your intents in real-time.
*   **🤖 Multi-Provider LLM:** Support for three AI engines configurable via environment variables:
    *   **Google AI:** Gemini 2.0 Flash (Cloud - Best performance).
    *   **Groq:** Llama 3.1 8B (Cloud - Fastest response).
    *   **Ollama:** phi4-mini (Local - 100% private and offline).
*   **📜 Narrative Quest System:** Progression through stories chained by communicative goals (e.g., checking into a hotel, negotiating a reservation).
*   **🎒 Inventory & Rewards (HUD):** Premium visual interface to manage earned items and track player XP/Level.
*   **🛡️ Hybrid Moderation:** Local filter for +120 banned terms (EN/ES) combined with AI safety guards.
*   **🎨 Retro RPG Aesthetic:** Modern interface inspired by classic role-playing games, with *glassmorphism* effects and dynamic animations.

---

## 🛠️ Technology Stack

*   **Frontend:** [Nuxt 4](https://nuxt.com/) (Vue 3, Pinia for state management, Nuxt UI for components).
*   **Backend:** [Nitro](https://nitro.unjs.io/) (Nuxt's native server engine) providing REST API and AI logic.
*   **AI Framework:** [Firebase Genkit](https://firebase.google.com/docs/genkit) for agent orchestration, prompts, and structured output schemas.
*   **Database & Persistence:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) for player progression.
*   **Containers:** Docker & Docker Compose for full environment isolation (Postgres, PGAdmin, Ollama).

---

## 🚀 Quick Start Guide (Docker)

### 1. Preparation
Clone the configuration template:
```bash
cp .env.example .env
```
*Add your API Keys (`GOOGLE_GENAI_API_KEY` or `GROQ_API_KEY`) if you're using Cloud providers.*

### 2. Deployment with Docker
Spin up the entire application stack (App + DB + PgAdmin):
```bash
docker compose up -d
```
If you wish to use **local Ollama**, use the specific profile:
```bash
docker compose --profile ollama up -d
```

### 3. Running services separately
If you only need part of the system (e.g., for local development with `pnpm run dev`):

| Action | Service | Command | URL / Port |
| :--- | :--- | :--- | :--- |
| **Only Database** | PostgreSQL | `docker compose up polyglot-db -d` | `localhost:5444` |
| **Only pgAdmin** | DB Interface | `docker compose up pgadmin -d` | [http://localhost:5050](http://localhost:5050) |
| **Only Ollama** | LLM Server | `docker compose --profile ollama up polyglot-ollama -d` | [http://localhost:11434](http://localhost:11434) |
| **Only Application** | Web App | `docker compose up polyglot-app -d` | [http://localhost:3000](http://localhost:3000) |

### 4. Environment Management Commands
| Action | Command |
| :--- | :--- |
| **View logs** | `docker compose logs -f` |
| **Stop containers** | `docker compose stop` |
| **Down (Stop & Remove)** | `docker compose down` |
| **Restart App** | `docker compose restart polyglot-app` |
| **Check status** | `docker compose ps` |

### 5. Database Management & Visualization
To interact with data and see the tables, you have two options:

#### Option A: Drizzle Studio (Recommended for Dev)
A lightweight UI that connects directly to your code schema.
1. Make sure the database container is running: `docker compose up polyglot-db -d`
2. Run the command:
   ```bash
   pnpm run db:studio
   ```
3. Open: [https://local.drizzle.studio](https://local.drizzle.studio)

#### Option B: pgAdmin 4 (Full Management)
PostgreSQL management UI pre-configured in Docker.
1. Open: [http://localhost:5050](http://localhost:5050)
2. **Login**: `admin@polyglot.com` / `admin123` (see `.env`)
3. **Connection**: Pre-configured to connect to the `polyglot-db` container.

#### Other DB Commands:
```bash
# Generate new migration (after changing schema/*.ts)
pnpm run db:generate

# Apply migrations to the live DB
pnpm run db:migrate
```

### 6. Available Services
| Service | URL |
| :--- | :--- |
| **Video Game (App)** | [http://localhost:3000](http://localhost:3000) |
| **Genkit UI (Debug AI)** | [http://localhost:4000](http://localhost:4000) |
| **pgAdmin (Database)** | [http://localhost:5050](http://localhost:5050) |

---

## 📚 Developer Documentation

If you want to extend the game or dive into its internal architecture:
*   [Guide: How to create new stories](docs/CreateNewStories.md)
*   [Decision Log (Phases 1-9)](docs/decisionesProyectoFase.md)
*   [Technical Design (TDD)](docs/Technical%20Design%20Document.md)

---

*Built to explore the limits of language models on heavily interactive web environments.*
