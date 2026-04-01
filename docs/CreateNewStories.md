# 📖 Guide: How to Create New Stories in PolyglotPath

> [!NOTE]
> [🇪🇸 Versión en Español](./CrearHistoriasNuevas.md) | 🇬🇧 **English**

This guide explains step-by-step how to add a new story to the game without touching any code. All game content is defined via **JSON** files within the `game-data/` folder.

---

## 📁 `game-data/` Structure

```
game-data/
├── history/        ← Defines the story (cover, description, first mission)
├── missions/       ← Defines each mission and its objectives
├── npcs/           ← Defines the characters the player talks to
├── dialogues/      ← Defines intents and examples for each NPC
├── locations/      ← Defines game scenes
└── items/          ← Defines items earned as rewards
```

Every JSON file in these folders is **automatically loaded** by the server on startup. No code registration is required.

> **JSON Format:** Each file must contain a **single JSON object** `{...}`. Do not use arrays `[...]` as the root of the file.

---

## 🗺️ Story Flow Overview

```
Story (history/)
  └── first_mission → Mission 1 (missions/)
        ├── npc_giver → NPC (npcs/)  ←→  Dialogues (dialogues/)
        ├── objectives → [dialogue intent, location...]
        └── reward.unlocks_mission → Mission 2
              ├── npc_giver → NPC  ←→  Dialogues
              ├── objectives
              └── is_final_mission: true  ← End of story
```

---

## Step 1 — Create the Story (`history/`)

Create the file `game-data/history/<story_id>.json`:

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

| Field | Description |
|---|---|
| `id` | Unique identifier (lowercase, no spaces, use underscores) |
| `name` | Name shown to the player in the menu |
| `description` | Short description of the adventure |
| `image` | Path to the cover image (in `public/images/locations/`) |
| `language` | Language the player will learn (e.g., `"English"`) |
| `level` | CEFR level: `"A1"`, `"A2"`, `"B1"`, etc. |
| `tags` | Filter tags (e.g., `["beginner", "medieval"]`) |
| `estimated_minutes` | Estimated play time in minutes |
| `first_mission` | ID of the first mission for this story |

---

## Step 2 — Create Missions (`missions/`)

Each mission is a file: `game-data/missions/<mission_id>.json`. A story can have as many missions as you want, chained via `reward.unlocks_mission`.

### Normal Mission (with a next mission)

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

### Final Mission (end of story)

Add `"is_final_mission": true` and **do not include** `unlocks_mission` in the reward:

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

| Field | Description |
|---|---|
| `id` | Unique ID of the mission |
| `name` | Visible name of the mission |
| `npc_giver` | ID of the NPC giving the mission |
| `objectives` | List of objectives (see types below) |
| `reward.xp` | Experience points earned |
| `reward.items` | List of item IDs earned as rewards |
| `reward.unlocks_mission` | ID of the next mission (omit if final) |
| `is_final_mission` | `true` if this is the last mission of the story |

### Objective Types (`objectives`)

| `type` | `target` | `intent` | Description |
|---|---|---|---|
| `"dialogue"` | NPC ID | Intent ID | Player must say something specific to the NPC |
| `"location"` | Location ID | *(n/a)* | Player must reach a specific place |

> **Note:** With multiple objectives, the mission completes when **any** objective is met. If you need multiple mandatory steps, use chained missions.

---

## Step 3 — Create NPCs (`npcs/`)

Each NPC is a file: `game-data/npcs/<npc_id>.json`:

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

| Field | Description |
|---|---|
| `id` | Unique identifier for the NPC |
| `name` | Display name |
| `avatar` | Path to NPC image (in `public/images/npcs/`) |
| `personality` | Personality description (AI uses this for character tone) |
| `language_level` | Language level for NPC speech |
| `intro_text` | Briefing text shown before the mission *(optional)* |
| `initial_phrases` | Welcome phrases before the player speaks |
| `dialogue_ids` | List of dialogue IDs associated with this NPC |

---

## Step 4 — Create Dialogues (`dialogues/`)

Dialogues define which **intents** the AI can detect for each NPC. Create the file: `game-data/dialogues/<dialogue_id>.json`:

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

| Field | Description |
|---|---|
| `id` | Unique dialogue ID (must match `dialogue_ids` in the NPC file) |
| `npc_id` | ID of the owner NPC |
| `intent` | intent ID (must match `intent` in mission objectives) |
| `examples` | **Example phrases** the AI uses for intent detection. More variety is better. **Recommended minimum: 8 examples.** |
| `responses` | Possible NPC replies (AI uses these for tone reference) |
| `mission_trigger` | Mission ID linked to this dialogue *(informational)* |
| `language_focus` | Linguistic focus areas *(informational)* |

> **⚠️ Critical Note on Examples:** The AI detects intent by comparing player input semantically to these examples. If there are too few or too similar examples, the AI might return `"unknown"`, and **the mission will never complete**. Add variations with different grammar structures and vocabulary.

---

## Step 5 — Create Locations (`locations/`)

If the story takes place in new areas, create `game-data/locations/<location_id>.json`:

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

| Field | Description |
|---|---|
| `id` | Unique ID |
| `name` | Display name |
| `type` | Type of place: `"building"`, `"town"`, `"outdoor"`, etc. |
| `background` | Backdrop image (in `public/images/locations/`) |
| `npcs` | List of NPC IDs present at this location |
| `connections` | List of linked location IDs for navigation |

---

## Step 6 — Create Items (`items/`)

If your story gives items as rewards, create `game-data/items/<item_id>.json`:

```json
{
  "id": "ale_mug",
  "name": "Mug of Ale",
  "icon": "/images/items/ale_mug.webp",
  "type": "consumable",
  "description": "A cold mug of ale from the Silver Fox Inn."
}
```

| Field | Description |
|---|---|
| `id` | Unique ID (must match `reward.items` in missions) |
| `name` | Display name |
| `icon` | Item icon (in `public/images/items/`) |
| `type` | Type: `"consumable"`, `"key_item"`, `"collectible"`, etc. |
| `description` | Brief description |

---

## Step 7 — Add Images

Place images in `public/images/` within their respective folders:

```
public/images/
├── locations/    ← Scene backgrounds (.webp recommended, 1920×1080)
├── npcs/         ← NPC avatars (.webp recommended, 512×512)
└── items/        ← Item icons (.webp recommended, 128×128)
```

> **Recommended Format:** `.webp` for best performance. If using `.png` or `.jpg`, update JSON paths accordingly.

---

## ✅ New Story Checklist

Use this list to ensure everything is ready:

- [ ] `history/<id>.json` created with correct `first_mission`.
- [ ] `missions/<first_mission>.json` with `npc_giver`, `objectives`, and `unlocks_mission`.
- [ ] `missions/<final_mission>.json` with `is_final_mission: true` and no `unlocks_mission`.
- [ ] `npcs/<npc>.json` for each new character, with filled `dialogue_ids`.
- [ ] `dialogues/<dialogue>.json` for each NPC, with **≥ 8 varied examples**.
- [ ] `intent` in `dialogues/` matches `intent` in mission `objectives` exactly.
- [ ] `npc_giver` for each mission matches an existing NPC ID.
- [ ] Next mission NPC is in a location that exists in `locations/`.
- [ ] Images are in `public/images/` and paths in JSON are correct.
- [ ] All JSON files use the **flat object** format `{...}`, not an array `[...]`.

---

## 🔗 ID Relationships

```
history/my_story.json
  └─ first_mission: "my_first_mission"
        ↓
missions/my_first_mission.json
  ├─ npc_giver: "guard"              → npcs/guard.json
  ├─ objectives[0].target: "guard"   → npcs/guard.json
  ├─ objectives[0].intent: "ask_tavern_location"
  │       ↓ must match ↓
  │   dialogues/guard_tavern.json → intent: "ask_tavern_location"
  └─ reward.unlocks_mission: "my_second_mission"
        ↓
missions/my_second_mission.json
  ├─ npc_giver: "innkeeper"          → npcs/innkeeper.json
  ├─ objectives[0].intent: "order_drink_intent"
  │       ↓ must match ↓
  │   dialogues/innkeeper_drink.json → intent: "order_drink_intent"
  └─ is_final_mission: true
```

---

## 🐛 Troubleshooting

| Issue | Likely Cause | Solution |
|---|---|---|
| Mission never completes even with the right phrase | `examples` in dialogue are too few or uniform | Add more examples with diverse structures |
| Mission completes with any phrase | Intent is too generic or examples are too broad | Refine examples to be more specific |
| NPC does not reply | `npc_id` in dialogue doesn't match NPC `id` | Verify both values are identical |
| Story doesn't show in menu | Missing `history/` file or JSON error | Check JSON syntax with a validator |
| Game doesn't navigate to next NPC | `npc_giver` isn't assigned to any `location` | Update/create a location file containing the NPC |
