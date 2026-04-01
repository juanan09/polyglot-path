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
- **Calidad de Código:** Husky (Hooks), ESLint, SonarJS, Vitest.
- **Arquitectura**: Desacoplamiento total (Data, Logic, UI).

---

## 🏗️ Arquitectura y Desacoplamiento

El proyecto está diseñado siguiendo principios de **Alta Cohesión** y **Bajo Acoplamiento**, permitiendo que cada capa sea independiente:

### 📄 Arquitectura Orientada a Contenidos (Data)
Toda la lógica del "mundo" del juego está definida en archivos JSON dentro de la carpeta `game-data/`. Esto incluye NPCs, misiones, historias y diálogos.
- **Independencia**: Se pueden añadir nuevas historias o traducir el juego entero simplemente editando los JSON, **sin necesidad de programar** ni recompilar la aplicación.
- **Carga Dinámica**: El servidor carga estos datos en tiempo de ejecución de forma transparente (`server/utils/loadGameData.ts`).

### 🧠 Inteligencia en el Servidor (Logic)
La lógica pesada reside en el backend (Nuxt Nitro + Google Genkit).
- **IA Desacoplada**: Los prompts, esquemas de validación de lenguaje y lógica de misiones están centralizados en el servidor para garantizar que el cliente nunca tenga acceso a las API Keys ni a la lógica de decisión de la IA.
- **Persistencia**: La base de datos guarda el estado del jugador de manera independiente a la interfaz.

### 🎨 Cliente Reactivo (UI)
El frontend (Nuxt 4 + Pinia) se comporta como un "cliente delgado" (*Thin Client*). 
- **Estado Sincronizado**: Solo almacena y muestra el estado actual que le dicta el servidor, lo que facilita enormemente el testing y la escalabilidad de la interfaz sin romper la lógica del juego.

---

## 🛠️ Estándares de Calidad y Desarrollo

Este proyecto implementa un flujo de trabajo de "Cero Errores" mediante herramientas de calidad automatizadas:

### 🛡️ Calidad de Código (Quality Gate)
- **ESLint (v10)**: Configurado con soporte para Nuxt 4, Vue 3 y TypeScript.
- **SonarJS**: Integrado directamente en el linter para detectar *Code Smells*, vulnerabilidades de seguridad y lógica excesivamente compleja.
- **TypeScript**: Tipado estricto en todo el proyecto (`npx nuxi typecheck`).

### ⚓ Hooks de Git (Husky)
Hemos configurado **Husky** para que se ejecuten las siguientes validaciones automáticamente antes de cada `commit`:
1. **Lint-staged**: Ejecuta `eslint --fix` solo en los archivos modificados. Si se detectan problemas de calidad o seguridad (reglas Sonar) que no se pueden arreglar automáticamente, el commit se cancela.
2. **Type-check**: Valida que no haya errores de TypeScript en todo el proyecto.

### 🧪 Pruebas Unitarias
- **Vitest**: Suite de tests para lógica de servidor, componentes y stores.
- **Cobertura**: Puedes generar reportes de cobertura de código ejecutando:
  ```bash
  pnpm test:coverage
  ```

### 🗄️ Gestión Visual de la Base de Datos
- **Drizzle Studio**: Puedes explorar y modificar los datos de tu base de datos local de forma visual ejecutando:
  ```bash
  pnpm db:studio
  ```

### 🧠 Entorno de Desarrollo de IA
- **Genkit UI**: El flujo de desarrollo de IA está integrado con Google Genkit, lo que permite testear prompts y flujos de IA en tiempo real sobre la instancia de desarrollo:
  ```bash
  pnpm dev
  ```
  Esto abrirá tanto la aplicación como el panel de control de Genkit para depurar las respuestas de los modelos LLM.

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
