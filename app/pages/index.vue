<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'

const player = usePlayerStore()
const router = useRouter()

interface EnrichedStory {
  id: string
  name: string
  description: string
  image: string
  language: string
  level: string
  tags: string[]
  estimated_minutes: number
  first_mission: string
  startNpcId: string | null
  startNpcName: string | null
  startLocationId: string | null
  startLocationName: string | null
}

const { data: response, pending } = await useFetch<{ success: boolean; data: EnrichedStory[] }>('/api/game/stories')
const stories = computed(() => response.value?.data ?? [])

const levelColor: Record<string, string> = {
  A1: '#00ff88', A2: '#00e5ff', B1: '#ffe033', B2: '#ff9900', C1: '#ff4d6d', C2: '#cc00ff'
}
const levelGlow: Record<string, string> = {
  A1: '0 0 12px #00ff88', A2: '0 0 12px #00e5ff', B1: '0 0 12px #ffe033',
  B2: '0 0 12px #ff9900', C1: '0 0 12px #ff4d6d', C2: '0 0 12px #cc00ff'
}

const beginStory = (story: EnrichedStory) => {
  if (!story.startNpcId || !story.startLocationId) return
  player.startGame(story.first_mission, story.startNpcId, story.startLocationId)
  router.push('/game')
}

useHead({
  title: 'Polyglot Path | Choose Your Quest',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap' }
  ]
})
</script>

<template>
  <div class="retro-page">
    <!-- CRT Scanlines overlay -->
    <div class="scanlines" aria-hidden="true" />
    <!-- Animated star field -->
    <div class="stars" aria-hidden="true">
      <span
        v-for="n in 60"
        :key="n"
        class="star"
        :style="`--x:${(n * 17 % 100)}%;--y:${(n * 31 % 100)}%;--d:${((n % 3) + 1.5).toFixed(1)}s;--s:${((n % 2) + 1)}px`"
      />
    </div>

    <!-- ══ HERO ══ -->
    <header class="hero">
      <div class="hero-inner">
        <h1 class="game-title">
          <span class="title-poly">POLYGLOT</span>
          <span class="title-sep"> &nbsp; </span>
          <span class="title-path">PATH</span>
        </h1>

        <p class="hero-sub">
          Master English through medieval quests &nbsp;·&nbsp; Your words are your weapons.
        </p>
      </div>
    </header>

    <!-- ══ QUEST BOARD ══ -->
    <main class="quest-section">
      <div class="board-header">
        <div class="board-line" />
        <span class="board-title">⚔ &nbsp; QUEST BOARD &nbsp; ⚔</span>
        <div class="board-line" />
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="quest-grid">
        <div v-for="i in 3" :key="i" class="quest-card skeleton-card" />
      </div>

      <!-- Empty -->
      <div v-else-if="stories.length === 0" class="empty-state">
        NO QUESTS AVAILABLE<br />
        <span class="empty-hint">Add a JSON file to game-data/history/ to begin.</span>
      </div>

      <!-- Quest Cards -->
      <div v-else class="quest-grid">
        <div
          v-for="story in stories"
          :key="story.id"
          class="quest-card"
          role="button"
          @click="beginStory(story)"
          @keydown.enter="beginStory(story)"
        >
          <!-- Top pixel bar -->
          <div class="card-top-bar" />

          <!-- Card image -->
          <div class="card-image-wrap">
            <img
              :src="story.image"
              :alt="story.name"
              class="card-image"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div class="card-image-overlay" />
          </div>

          <!-- Level badge -->
          <div
            class="level-badge"
            :style="`color:${levelColor[story.level] ?? '#fff'};box-shadow:${levelGlow[story.level] ?? 'none'};border-color:${levelColor[story.level] ?? '#fff'}`"
          >
            {{ story.level }}
          </div>

          <!-- Card body -->
          <div class="card-body">
            <h3 class="card-title">{{ story.name }}</h3>
            <p class="card-desc">{{ story.description }}</p>

            <!-- Stats row -->
            <div class="stat-row">
              <div class="stat">
                <span class="stat-label">LANG</span>
                <span class="stat-value">{{ story.language }}</span>
              </div>
              <div class="stat-divider">│</div>
              <div class="stat">
                <span class="stat-label">LEVEL</span>
                <span class="stat-value" :style="`color:${levelColor[story.level]}`">{{ story.level }}</span>
              </div>
              <div class="stat-divider">│</div>
              <div class="stat">
                <span class="stat-label">TIME</span>
                <span class="stat-value">{{ story.estimated_minutes }}m</span>
              </div>
            </div>

            <!-- CTA -->
            <button class="start-btn" type="button" @click.stop="beginStory(story)">
              ▶ &nbsp; START QUEST
            </button>
          </div>

          <!-- Bottom pixel bar -->
          <div class="card-bottom-bar" />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="retro-footer">
      <span>© 2025 POLYGLOT PATH</span>
      <span class="footer-sep">░░░</span>
      <span>PHASE VIII ALPHA</span>
      <span class="footer-sep">░░░</span>
      <span>INSERT COIN ▮</span>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

/* ── BASE ── */
.retro-page {
  font-family: 'VT323', monospace;
  background-color: #080b14;
  color: #e8dcc8;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* ── CRT SCANLINES ── */
.scanlines {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.13) 2px,
    rgba(0, 0, 0, 0.13) 4px
  );
}

/* ── STAR FIELD ── */
.stars { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--s);
  height: var(--s);
  background: #fff;
  border-radius: 50%;
  opacity: 0;
  animation: twinkle var(--d) ease-in-out infinite alternate;
}
@keyframes twinkle { from { opacity: 0.1 } to { opacity: 0.85 } }

/* ── HERO ── */
.hero {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2.5rem 1.5rem 2rem;
  background: radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255,180,0,0.08) 0%, transparent 70%);
}
.hero-inner { max-width: 860px; margin: 0 auto; }

.game-title {
  font-family: 'Press Start 2P', monospace;
  line-height: 1.3;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.title-sep { display: none; }
.title-poly {
  font-size: clamp(1.2rem, 3.5vw, 2.2rem);
  color: #e8dcc8;
  text-shadow: 2px 2px 0 #c9a84c, 0 0 20px rgba(201,168,76,0.5);
}
.title-path {
  font-size: clamp(1.5rem, 4.5vw, 3rem);
  color: #c9a84c;
  text-shadow: 3px 3px 0 #8b6914, 0 0 30px rgba(201,168,76,0.7), 0 0 60px rgba(201,168,76,0.3);
}

.hero-sub {
  font-family: 'VT323', monospace;
  font-size: 1.3rem;
  color: #7a7060;
  line-height: 1.5;
  margin-bottom: 0;
}

/* ── QUEST BOARD ── */
.quest-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 5rem;
}

.board-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.board-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c9a84c, transparent);
  box-shadow: 0 0 6px rgba(201,168,76,0.4);
}
.board-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75rem;
  color: #c9a84c;
  text-shadow: 0 0 10px rgba(201,168,76,0.6);
  white-space: nowrap;
  letter-spacing: 0.1em;
}

/* ── QUEST CARDS ── */
.quest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.quest-card {
  position: relative;
  background: #0d1220;
  border: 2px solid #2d2510;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  clip-path: polygon(
    0 8px, 8px 0,
    calc(100% - 8px) 0, 100% 8px,
    100% calc(100% - 8px), calc(100% - 8px) 100%,
    8px 100%, 0 calc(100% - 8px)
  );
}
.quest-card:hover {
  transform: translateY(-6px);
  border-color: #c9a84c;
  box-shadow:
    0 0 0 1px #c9a84c,
    0 0 24px rgba(201,168,76,0.35),
    inset 0 0 20px rgba(201,168,76,0.04);
}

.card-top-bar, .card-bottom-bar {
  height: 4px;
  background: linear-gradient(90deg, transparent 8px, #2d2510 8px, #2d2510 calc(100% - 8px), transparent calc(100% - 8px));
  transition: background 0.2s;
}
.quest-card:hover .card-top-bar,
.quest-card:hover .card-bottom-bar {
  background: linear-gradient(90deg, transparent 8px, #c9a84c 8px, #c9a84c calc(100% - 8px), transparent calc(100% - 8px));
}

.card-image-wrap {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #060910;
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.6) sepia(0.25) brightness(0.8);
  transition: filter 0.35s, transform 0.4s;
}
.quest-card:hover .card-image {
  filter: saturate(1) sepia(0) brightness(1);
  transform: scale(1.05);
}
.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, #0d1220 100%);
}

.level-badge {
  position: absolute;
  top: 148px;
  right: 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  padding: 4px 8px;
  border: 2px solid;
  background: #0d1220;
  letter-spacing: 0.08em;
}

.card-body { padding: 1.1rem 1.3rem 0; }

.card-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.68rem;
  color: #e8dcc8;
  line-height: 1.75;
  margin: 0 0 0.85rem;
  transition: color 0.2s;
}
.quest-card:hover .card-title { color: #c9a84c; }

.card-desc {
  font-family: 'VT323', monospace;
  font-size: 1.25rem;
  color: #8a7f68;
  line-height: 1.5;
  margin: 0 0 1.1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-top: 1px solid #1a1c2a;
  border-bottom: 1px solid #1a1c2a;
  padding: 0.65rem 0;
  margin-bottom: 1.2rem;
}
.stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.38rem;
  color: #4a4030;
  letter-spacing: 0.1em;
}
.stat-value {
  font-family: 'VT323', monospace;
  font-size: 1.45rem;
  color: #c9a84c;
  line-height: 1;
}
.stat-divider { color: #252010; font-size: 1.4rem; line-height: 1; }

.start-btn {
  display: block;
  width: 100%;
  margin: 0 0 1.3rem;
  padding: 0.75rem 1rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  color: #0a0e1a;
  background: #c9a84c;
  border: none;
  cursor: pointer;
  clip-path: polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px));
  transition: background 0.15s, box-shadow 0.15s;
}
.start-btn:hover {
  background: #ffe880;
  box-shadow: 0 0 20px rgba(255,232,128,0.5);
}

/* ── SKELETON ── */
.skeleton-card {
  height: 400px;
  background: linear-gradient(90deg, #0d1220 25%, #131a2b 50%, #0d1220 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { to { background-position: -200% 0 } }

/* ── EMPTY STATE ── */
.empty-state {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #4a4030;
  text-align: center;
  padding: 5rem 1rem;
  line-height: 2.5;
}
.empty-hint {
  font-family: 'VT323', monospace;
  font-size: 1.3rem;
  color: #2a2010;
}

/* ── FOOTER ── */
.retro-footer {
  position: relative;
  z-index: 1;
  border-top: 2px solid #14120a;
  padding: 1.5rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.42rem;
  color: #2d2510;
  letter-spacing: 0.12em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}
.footer-sep { color: #181408; }
</style>
