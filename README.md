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
Lanza la aplicación completa (App + DB + PgAdmin):
```bash
docker compose up -d
```
Si deseas utilizar **Ollama local**, utiliza el perfil específico:
```bash
docker compose --profile ollama up -d
```

### 3. Lanzar servicios por separado
Si solo necesitas una parte del sistema (ej. para desarrollo local con `pnpm run dev`):

| Acción | Servicio | Comando | URL / Puerto |
| :--- | :--- | :--- | :--- |
| **Solo Base de Datos** | PostgreSQL | `docker compose up polyglot-db -d` | `localhost:5444` |
| **Solo pgAdmin** | Interfaz BD | `docker compose up pgadmin -d` | [http://localhost:5050](http://localhost:5050) |
| **Solo Ollama** | Servidor LLM | `docker compose --profile ollama up polyglot-ollama -d` | [http://localhost:11434](http://localhost:11434) |
| **Solo Aplicación** | App Web | `docker compose up polyglot-app -d` | [http://localhost:3000](http://localhost:3000) |

### 4. Comandos de Gestión del Entorno
| Acción | Comando |
| :--- | :--- |
| **Ver logs** | `docker compose logs -f` |
| **Parar contenedores** | `docker compose stop` |
| **Bajar y eliminar red** | `docker compose down` |
| **Reiniciar App** | `docker compose restart polyglot-app` |
| **Ver estado** | `docker compose ps` |

### 5. Gestión y Visualización de Base de Datos
Para interactuar con los datos y ver las tablas, tienes dos opciones:

#### Opción A: Drizzle Studio (Recomendado para Dev)
Es una interfaz ligera que se conecta directamente a tu esquema de código.
1. Asegúrate de que el contenedor de la base de datos está corriendo: `docker compose up polyglot-db -d`
2. Ejecuta el comando:
   ```bash
   pnpm run db:studio
   ```
3. Abre: [https://local.drizzle.studio](https://local.drizzle.studio)

#### Opción B: pgAdmin 4 (Gestión completa)
Interfaz profesional de administración de PostgreSQL preconfigurada en Docker.
1. Abre: [http://localhost:5050](http://localhost:5050)
2. **Login**: `admin@polyglot.com` / `admin123` (ver `.env`)
3. **Conexión**: Ya viene preconfigurada para conectar con el contenedor `polyglot-db`.

#### Otros comandos de BBDD:
```bash
# Generar nueva migración (si cambias schema/*.ts)
pnpm run db:generate

# Aplicar migraciones a la DB real
pnpm run db:migrate
```

### 6. Servicios Disponibles
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
