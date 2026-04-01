<div align="center">
  <h1>🌍 The Polyglot Path</h1>
  <p><strong>An AI-Powered Narrative RPG for Immersive Language Learning</strong></p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/nuxt/nuxt"><img src="https://img.shields.io/badge/Nuxt-4.4.2-00DC82?logo=nuxt.js" alt="Nuxt 4" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" /></a>
    <a href="https://firebase.google.com/docs/genkit"><img src="https://img.shields.io/badge/Genkit-1.30-FFCA28?logo=firebase" alt="Firebase Genkit" /></a>
    <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?logo=drizzle" alt="Drizzle ORM" /></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker Ready" /></a>
    <br>
    <a href="https://github.com/tu-usuario/polyglot-path/releases"><img src="https://img.shields.io/badge/version-v1.0.0-blue.svg" alt="Version 1.0.0" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" /></a>
  </p>

  <p>
    🇪🇸 <b>Español</b> | <a href="README-en.md">🇬🇧 English</a>
  </p>
</div>

---

**The Polyglot Path** es un RPG narrativo web diseñado para el aprendizaje inmersivo de idiomas. El jugador aprende conversando en lenguaje natural con NPCs (personajes del juego) impulsados por Inteligencia Artificial (LLMs). 

Nacido originalmente como un Trabajo Fin de Máster (TFM) enfocado en la aplicación de modelos de lenguaje en entornos educativos gamificados, el sistema está construido bajo una filosofía **Data-Driven**, donde todo el contenido narrativo reside en archivos JSON estructurados, logrando una altísima escalabilidad e integración directa con flujos pedagógicos gestionados por IA.

## 📑 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🚀 Empezando (Getting Started)](#-empezando-getting-started)
- [💻 Guía de Uso Rápido](#-guía-de-uso-rápido)
- [📚 Documentación](#-documentación)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)
- [👏 Créditos](#-créditos)

---

## ✨ Características Principales

* **🎙️ Diálogo Inteligente con IA:** Conversaciones dinámicas con NPCs que evalúan tu gramática, mantienen su personalidad y reaccionan a tus intenciones en tiempo real.
* **🧠 Telemetría Pedagógica (Learning Codex):** Panel que analiza precisión gramatical (Grammar Score), palabras aprendidas y frecuencia de uso de tiempos verbales.
* **🤖 Multi-Proveedor LLM:** Soporte *plug-and-play* para múltiples motores:
  * **Google AI:** Gemini 2.0 Flash/Pro (Cloud - Máximo razonamiento).
  * **Groq:** Llama 3.1 8B (Cloud - Máxima velocidad).
  * **Ollama:** phi4-mini / llama3 (Local - 100% privado y offline).
* **📜 Motor de Misiones Narrativas:** Historias encadenadas por objetivos comunicativos (ej. hacer el check-in en un hotel, negociar una reserva).
* **🎒 Inventario y Recompensas:** Interfaz inmersiva (HUD) para gestionar experiencia (XP), niveles y objetos obtenidos.
* **🛡️ Moderación Dual (Safety):** Filtro local determinista de +120 términos prohibidos combinado con guardias de seguridad semánticos por IA.

---

## 🛠️ Stack Tecnológico

El proyecto sigue una arquitectura **Monorepo** moderna, uniendo Frontend y Backend en el mismo entorno de desarrollo garantizando Tipado Estricto de extremo a extremo (End-to-End Type Safety).

- **Frontend:** [Nuxt 4](https://nuxt.com/) (Vue 3, [Pinia](https://pinia.vuejs.org/) para estado reactivo, Nuxt UI para accesibilidad y componentes).
- **Backend:** [Nitro](https://nitro.unjs.io/) (Servidor nativo de Nuxt) proporcionando API Rest, validación y lógica de IA.
- **Orquestación IA:** [Firebase Genkit](https://firebase.google.com/docs/genkit) para agentes, flujos, prompts y *Structured Outputs* (salidas JSON estrictas).
- **Base de Datos:** PostgreSQL 16 + [Drizzle ORM](https://orm.drizzle.team/) para una persistencia rápida y tipada.
- **Infraestructura:** Docker y Docker Compose para un despliegue *Zero-Touch*.

---

## 🚀 Empezando (Getting Started)

### Requisitos Previos

- [Docker](https://www.docker.com/) y Docker Compose instalados.
- Node.js 22 LTS y `pnpm` (solo si vas a desarrollar características fuera de contenedor).

### 1. Configuración de Entorno

Clona el repositorio y prepara tu archivo de variables de entorno:

```bash
git clone https://github.com/tu-usuario/polyglot-path.git
cd polyglot-path
cp .env.example .env
```
*(Asegúrate de incluir tus API Keys en el `.env` si usas proveedores Cloud, o cambia el `LLM_PROVIDER` a ollama).*

### 2. Despliegue Zero-Touch (Docker)

El proyecto viene preparado para un arranque indoloro. La base de datos, las migraciones e interfaces levantarán solas:

```bash
docker compose up -d
```

*(¿Prefieres usar la IA 100% en local? Lanza `docker compose --profile ollama up -d`)*.

La aplicación principal estará disponible al cabo de unos segundos en [http://localhost:3000](http://localhost:3000).

---

## 💻 Guía de Uso Rápido

El entorno Dockerizado expone los siguientes puertos clave a tu máquina anfitriona:

| Servicio | Ruta de acceso | Descripción |
| :--- | :--- | :--- |
| **Videojuego (App)** | [`http://localhost:3000`](http://localhost:3000) | Aplicación principal con soporte Hot-Reload para desarrollo. |
| **Panel Base de Datos** | [`http://localhost:5050`](http://localhost:5050) | pgAdmin 4 (Usuario: `admin@polyglot.com` / Pass: `admin123`). |
| **API Genkit Debug** | [`http://localhost:4000`](http://localhost:4000) | Herramienta de desarrollador visual para trazar llamadas a la IA y flujos. |

### Comandos Frecuentes

```bash
# Ver los logs en vivo del servidor web
docker compose logs -f polyglot-app

# Reiniciar la aplicación tras cambiar una variable de entorno
docker compose restart polyglot-app

# Apagar todos los servicios sin borrar datos
docker compose down

# Apagar los servicios y LIMPIAR completamente la BBDD (Wipeout)
docker compose down -v
```

---

## 📚 Documentación

Para desarrolladores, *Game Designers* o contribuidores que quieran adentrarse en la arquitectura o crear nuestro contenido:

- 📖 **[Cómo crear historas y NPCs nuevos](docs/CrearHistoriasNuevas.md)**: Guía sintáctica para el engine JSON.
- ⚙️ **[Despliegue y Troubleshooting Docker](docs/Despliegue_Docker.md)** ([🇬🇧 English Guide](docs/Docker_Deployment.md)): Guía detallada para Infraestructura.

---

## 🤝 Contribuir

¡Nos encantan las contribuciones! `Polyglot Path` versión 1.0.0 es de código abierto.
Siéntete libre de discutir nuevas propuestas estructurales, abrir _Issues_ para bugs, o mandar un _Pull Request_.

1. Haz un Fork del proyecto.
2. Crea una rama para tu característica (`git checkout -b feature/NuevaMateria`).
3. Haz Commit de tus cambios con semántica estándar (`git commit -m 'feat: añadir NPC de prueba'`).
4. Haz Push a la rama (`git push origin feature/NuevaMateria`).
5. Abre un **Pull Request**.

Asegúrate de cumplir con los tests (`pnpm test`) y las reglas de linting antes de someter tu propuesta.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia de código abierto **MIT License**. Consulta el archivo `LICENSE` para más información. 

Es libre y válido tanto para uso educativo, académico o uso comercial.

---

## 👏 Créditos

**Desarrollado y mantenido por:** [Juan Antonio Sánchez Santamaría]  
*Creado originalmente como Proyecto Final de Máster.*

<div align="center">
  <sub>Construido con ❤️ combinando filología e inteligencia artificial.</sub>
</div>
