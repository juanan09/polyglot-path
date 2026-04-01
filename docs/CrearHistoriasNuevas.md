# 📖 Guía: Cómo Crear Historias Nuevas en PolyglotPath

> [!NOTE]
> 🇪🇸 **Español** | [🇬🇧 English Version](./CreateNewStories.md)

Esta guía explica paso a paso cómo añadir una historia nueva al juego sin tocar código. Todo el contenido del juego se define mediante archivos **JSON** dentro de la carpeta `game-data/`.

---

## 📁 Estructura de `game-data/`

```
game-data/
├── history/        ← Define la historia (portada, descripción, primera misión)
├── missions/       ← Define cada misión y sus objetivos
├── npcs/           ← Define los personajes con los que habla el jugador
├── dialogues/      ← Define los intents y ejemplos para cada NPC
├── locations/      ← Define los escenarios del juego
└── items/          ← Define los objetos que se pueden ganar como recompensa
```

Cada archivo JSON dentro de estas carpetas es **cargado automáticamente** por el servidor al arrancar. No es necesario registrar nada en el código.

> **Formato de los JSON:** Cada archivo debe contener un **único objeto JSON** `{...}`. No uses arrays `[...]` como raíz del archivo.

---

## 🗺️ Visión general del flujo de una historia

```
Historia (history/)
  └── first_mission → Misión 1 (missions/)
        ├── npc_giver → NPC (npcs/)  ←→  Diálogos (dialogues/)
        ├── objectives → [dialogue intent, location...]
        └── reward.unlocks_mission → Misión 2
              ├── npc_giver → NPC  ←→  Diálogos
              ├── objectives
              └── is_final_mission: true  ← Fin de la historia
```

---

## Paso 1 — Crear la Historia (`history/`)

Crea el archivo `game-data/history/<id_historia>.json`:

```json
{
  "id": "my_story",
  "name": "My New Story",
  "description": "A short description of what the player will do in this story.",
  "image": "/images/locations/my_location.webp",
  "language": "English",
  "level": "A1",
  "tags": ["beginner", "adventure"],
  "estimated_minutes": 20,
  "first_mission": "my_first_mission"
}
```

| Campo | Descripción |
|---|---|
| `id` | Identificador único (sin espacios, en minúsculas con guiones bajos) |
| `name` | Nombre que verá el jugador en el menú |
| `description` | Descripción corta de la aventura |
| `image` | Ruta a la imagen de portada (en `public/images/locations/`) |
| `language` | Idioma que aprenderá el jugador (ej: `"English"`) |
| `level` | Nivel MCER: `"A1"`, `"A2"`, `"B1"`, etc. |
| `tags` | Etiquetas para filtrar (ej: `["beginner", "medieval"]`) |
| `estimated_minutes` | Tiempo estimado en minutos |
| `first_mission` | ID de la primera misión de esta historia |

---

## Paso 2 — Crear las Misiones (`missions/`)

Cada misión es un archivo `game-data/missions/<id_mision>.json`. Una historia puede tener tantas misiones como quieras, encadenadas mediante `reward.unlocks_mission`.

### Misión normal (con siguiente misión)

```json
{
  "id": "my_first_mission",
  "name": "Find the Tavern",
  "description": "Ask the guard where the tavern is.",
  "npc_giver": "guard",
  "objectives": [
    {
      "type": "dialogue",
      "target": "guard",
      "intent": "ask_tavern_location"
    }
  ],
  "reward": {
    "xp": 50,
    "items": [],
    "unlocks_mission": "my_second_mission"
  },
  "level_required": "A1"
}
```

### Misión final (última de la historia)

Añade `"is_final_mission": true` y **no incluyas** `unlocks_mission` en el reward:

```json
{
  "id": "my_second_mission",
  "name": "Order a Drink",
  "description": "Talk to the innkeeper and order a drink.",
  "npc_giver": "innkeeper",
  "objectives": [
    {
      "type": "dialogue",
      "target": "innkeeper",
      "intent": "order_drink_intent"
    }
  ],
  "reward": {
    "xp": 100,
    "items": ["ale_mug"]
  },
  "level_required": "A1",
  "is_final_mission": true
}
```

| Campo | Descripción |
|---|---|
| `id` | Identificador único de la misión |
| `name` | Nombre visible de la misión |
| `npc_giver` | ID del NPC que protagoniza la misión |
| `objectives` | Lista de objetivos (ver tipos abajo) |
| `reward.xp` | Puntos de experiencia que gana el jugador |
| `reward.items` | Lista de IDs de objetos que recibe como recompensa |
| `reward.unlocks_mission` | ID de la siguiente misión (omitir si es la final) |
| `is_final_mission` | `true` si es la última misión de la historia |

### Tipos de objetivos (`objectives`)

| `type` | `target` | `intent` | Descripción |
|---|---|---|---|
| `"dialogue"` | ID del NPC | ID del intent | El jugador debe decirle algo específico al NPC |
| `"location"` | ID de la localización | *(no aplica)* | El jugador debe llegar a un lugar |

> **Nota:** Con múltiples objetivos, la misión se completa cuando **cualquiera** de ellos se cumple. Si necesitas que todos sean obligatorios, usa misiones encadenadas.

---

## Paso 3 — Crear los NPCs (`npcs/`)

Cada NPC es un archivo `game-data/npcs/<id_npc>.json`:

```json
{
  "id": "innkeeper",
  "name": "The Innkeeper",
  "avatar": "/images/npcs/innkeeper.webp",
  "personality": "jovial and talkative",
  "language_level": "A1",
  "intro_text": "Welcome to the Silver Fox Inn! What can I do for you, traveler?",
  "initial_phrases": [
    "Welcome to my tavern!",
    "Can I get you something to drink?"
  ],
  "dialogue_ids": [
    "innkeeper_drink_dialogue"
  ]
}
```

| Campo | Descripción |
|---|---|
| `id` | Identificador único del NPC |
| `name` | Nombre que se muestra en el juego |
| `avatar` | Ruta a la imagen del NPC (en `public/images/npcs/`) |
| `personality` | Descripción de personalidad (la IA la usa para responder con ese carácter) |
| `language_level` | Nivel del idioma que usa el NPC (afecta la complejidad de sus respuestas) |
| `intro_text` | Texto introductorio que aparece en el briefing *(opcional)* |
| `initial_phrases` | Frases de bienvenida antes de que el jugador hable |
| `dialogue_ids` | Lista de IDs de diálogos asociados a este NPC |

---

## Paso 4 — Crear los Diálogos (`dialogues/`)

Los diálogos definen qué **intents** puede detectar la IA para cada NPC. Crea el archivo `game-data/dialogues/<id_dialogo>.json`:

```json
{
  "id": "innkeeper_drink_dialogue",
  "npc_id": "innkeeper",
  "intent": "order_drink_intent",
  "examples": [
    "I would like a drink",
    "Can I have an ale?",
    "Give me something to drink",
    "What do you have to drink?",
    "I'll have a beer, please",
    "One ale, please",
    "I want something to drink",
    "Could I get a cup of ale?"
  ],
  "responses": [
    "Coming right up! One ale for the traveler!",
    "Excellent choice! Here you go."
  ],
  "mission_trigger": "my_second_mission",
  "language_focus": [
    "ordering food and drinks",
    "polite requests"
  ]
}
```

| Campo | Descripción |
|---|---|
| `id` | Identificador único del diálogo (debe coincidir con `dialogue_ids` del NPC) |
| `npc_id` | ID del NPC al que pertenece |
| `intent` | Identificador del intent (debe coincidir con `intent` del objetivo de la misión) |
| `examples` | **Frases de ejemplo** que la IA usará para detectar el intent. Cuantos más y más variados, mejor. **Mínimo recomendado: 8 ejemplos.** |
| `responses` | Respuestas que puede dar el NPC (la IA las usa como referencia de tono) |
| `mission_trigger` | ID de la misión a la que está asociado este diálogo *(informativo)* |
| `language_focus` | Campos lingüísticos que trabaja este diálogo *(informativo)* |

> **⚠️ Importante sobre los ejemplos:** La IA detecta el intent comparando el mensaje del jugador con estos ejemplos semánticamente. Si los ejemplos son muy pocos o muy parecidos entre sí, la IA puede devolver `"unknown"` y **la misión nunca se completará**. Añade variantes con distintas estructuras gramaticales y vocabulario.

---

## Paso 5 — Crear las Localizaciones (`locations/`)

Si la historia ocurre en lugares nuevos, crea `game-data/locations/<id_localizacion>.json`:

```json
{
  "id": "tavern",
  "name": "The Silver Fox Inn",
  "type": "building",
  "background": "/images/locations/tavern.webp",
  "npcs": ["innkeeper"],
  "connections": ["village_square", "market"]
}
```

| Campo | Descripción |
|---|---|
| `id` | Identificador único |
| `name` | Nombre visible |
| `type` | Tipo de lugar: `"building"`, `"town"`, `"outdoor"`, etc. |
| `background` | Imagen de fondo de la escena (en `public/images/locations/`) |
| `npcs` | Lista de IDs de NPCs presentes en esta localización |
| `connections` | Lista de IDs de otras localizaciones conectadas (para la navegación futura) |

---

## Paso 6 — Crear los Objetos / Items (`items/`)

Si la historia da objetos como recompensa, crea `game-data/items/<id_item>.json`:

```json
{
  "id": "ale_mug",
  "name": "Mug of Ale",
  "icon": "/images/items/ale_mug.webp",
  "type": "consumable",
  "description": "A cold mug of ale from the Silver Fox Inn."
}
```

| Campo | Descripción |
|---|---|
| `id` | Identificador único (debe coincidir con lo que pones en `reward.items` de la misión) |
| `name` | Nombre visible del objeto |
| `icon` | Icono del objeto (en `public/images/items/`) |
| `type` | Tipo: `"consumable"`, `"key_item"`, `"collectible"`, etc. |
| `description` | Descripción breve |

---

## Paso 7 — Añadir las imágenes

Coloca las imágenes en `public/images/` dentro de las subcarpetas correspondientes:

```
public/images/
├── locations/    ← Fondos de escena (.webp recomendado, 1920×1080)
├── npcs/         ← Avatares de personajes (.webp recomendado, 512×512)
└── items/        ← Iconos de objetos (.webp recomendado, 128×128)
```

> **Formato recomendado:** `.webp` para mejor rendimiento. Si usas `.png` o `.jpg`, actualiza las rutas en los JSON.

---

## ✅ Checklist de nueva historia

Usa esta lista para asegurarte de que no falta nada:

- [ ] `history/<id>.json` creado con `first_mission` correcto
- [ ] `missions/<primera_mision>.json` con `npc_giver`, `objectives` e `unlocks_mission`
- [ ] `missions/<mision_final>.json` con `is_final_mission: true` y sin `unlocks_mission`
- [ ] `npcs/<npc>.json` por cada personaje nuevo, con `dialogue_ids` relleno
- [ ] `dialogues/<dialogo>.json` por cada NPC, con **≥ 8 ejemplos** variados
- [ ] El `intent` en `dialogues/` coincide exactamente con el `intent` en `objectives` de la misión
- [ ] El `npc_giver` de cada misión coincide con un NPC que existe en `npcs/`
- [ ] El NPC de la siguiente misión está en una `location` que existe en `locations/`
- [ ] Las imágenes están en `public/images/` y las rutas en los JSON son correctas
- [ ] Todos los JSON usan formato de **objeto plano** `{...}`, no array `[...]`

---

## 🔗 Relación de IDs entre archivos

```
history/my_story.json
  └─ first_mission: "my_first_mission"
        ↓
missions/my_first_mission.json
  ├─ npc_giver: "guard"              → npcs/guard.json
  ├─ objectives[0].target: "guard"   → npcs/guard.json
  ├─ objectives[0].intent: "ask_tavern_location"
  │       ↓ debe coincidir con ↓
  │   dialogues/guard_tavern.json → intent: "ask_tavern_location"
  └─ reward.unlocks_mission: "my_second_mission"
        ↓
missions/my_second_mission.json
  ├─ npc_giver: "innkeeper"          → npcs/innkeeper.json
  ├─ objectives[0].intent: "order_drink_intent"
  │       ↓ debe coincidir con ↓
  │   dialogues/innkeeper_drink.json → intent: "order_drink_intent"
  └─ is_final_mission: true
```

---

## 🐛 Solución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| La misión nunca se completa aunque digas la frase correcta | Los `examples` en el diálogo son pocos o poco variados | Añade más ejemplos con distintas estructuras |
| La misión se completa con cualquier frase | El `intent` es muy genérico o los ejemplos son demasiado amplios | Refina los ejemplos para que sean más específicos del objetivo |
| El NPC no responde | El `npc_id` en el diálogo no coincide con el `id` del NPC | Verifica que ambos valores son idénticos |
| La historia no aparece en el menú | Falta el archivo en `history/` o tiene un error JSON | Revisa la sintaxis del JSON con un validador |
| El juego no navega al siguiente NPC | El `npc_giver` no pertenece a ninguna `location` | Crea o actualiza el archivo de localización con ese NPC |
