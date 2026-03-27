# 🌍 The Polyglot Path

**The Polyglot Path** es un RPG narrativo web diseñado para el aprendizaje inmersivo de idiomas. El jugador aprende conversando en lenguaje natural con NPCs (personajes del juego) impulsados por Inteligencia Artificial (LLM). Es el resultado de un proyecto de Trabajo Fin de Máster (TFM) enfocado en la aplicación de modelos de lenguaje en entornos educativos gamificados.

El sistema está construido bajo una filosofía **Data-Driven**, donde todo el contenido narrativo (escenarios, misiones, diálogos y personajes) reside en archivos JSON estructurados, permitiendo una gran escalabilidad y una integración directa con los flujos pedagógicos gestionados por IA.

---

## ✨ Características Principales

*   **🎙️ Diálogo Inteligente con IA:** Conversaciones dinámicas con NPCs que evalúan tu gramática, mantienen su personalidad y reaccionan a tus intenciones en tiempo real.
*   **🤖 Multi-Proveedor LLM:** Soporte para tres motores de IA configurables mediante variables de entorno:
    *   **Google AI:** Gemini 2.0 Flash (Cloud - Máximo rendimiento).
    *   **Groq:** Llama 3.1 8B (Cloud - Máxima velocidad).
    *   **Ollama:** phi4-mini (Local - 100% privado y sin internet).
*   **📜 Sistema de Misiones Narrativas:** Progresión de historias encadenadas por objetivos comunicativos (ej. hacer el check-in en un hotel, negociar una reserva).
*   **🎒 Inventario y Recompensas (HUD):** Interfaz visual premium para gestionar objetos ganados y seguimiento de XP/Nivel del jugador.
*   **🛡️ Moderación Híbrida:** Filtro local de +120 términos prohibidos (EN/ES) combinado con guardias de seguridad por IA.
*   **🎨 Estética 90s RPG:** Interfaz moderna inspirada en los juegos de rol clásicos, con efectos de *glassmorphism* y animaciones dinámicas.

---

## 🛠️ Stack Tecnológico

*   **Frontend:** [Nuxt 4](https://nuxt.com/) (Vue 3, Pinia para estado reactivo, Nuxt UI para componentes).
*   **Backend:** [Nitro](https://nitro.unjs.io/) (Servidor nativo de Nuxt) proporcionando API Rest y lógica de IA.
*   **IA Framework:** [Firebase Genkit](https://firebase.google.com/docs/genkit) para la orquestación de agentes, prompts y esquemas estructurados de salida.
*   **BBDD & Persistencia:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) para el progreso del jugador.
*   **Contenedores:** Docker & Docker Compose para el aislamiento total del entorno (Postgres, PGAdmin, Ollama).

---

## 🚀 Guía de Inicio Rápido (Docker)

### 1. Preparación
Crea tu archivo de configuración:
```bash
cp .env.example .env
```
*Añade tus API Keys (`GOOGLE_GENAI_API_KEY` o `GROQ_API_KEY`) si vas a usar proveedores Cloud.*

### 2. Despliegue con Docker
Lanza la aplicación completa:
```bash
docker compose up -d
```
Si deseas utilizar **Ollama local**, utiliza el perfil específico:
```bash
docker compose --profile ollama up -d
```

### 3. Servicios Disponibles
| Servicio | URL |
| :--- | :--- |
| **Videojuego (App)** | [http://localhost:3000](http://localhost:3000) |
| **Genkit UI (Debug AI)** | [http://localhost:4000](http://localhost:4000) |
| **pgAdmin (BBDD)** | [http://localhost:5050](http://localhost:5050) |

---

## 📚 Documentación para Desarrolladores

Si deseas extender el juego o entender su arquitectura profunda:
*   [Guía: Cómo crear historias nuevas](docs/CrearHistoriasNuevas.md)
*   [Registro de Decisiones (Fases 1-9)](docs/decisionesProyectoFase.md)
*   [Diseño Técnico (TDD)](docs/Technical%20Design%20Document.md)

---

*Construido para explorar los límites de los modelos de lenguaje en entornos web altamente interactivos.*
