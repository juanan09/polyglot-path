<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const router = useRouter()

// Guard: if no story is pending, redirect to home
if (!player.pendingStory) {
  await router.replace('/')
}

const storyId = player.pendingStory?.id ?? ''

const { data: response, error } = await useFetch<{
  success: boolean
  data: {
    story: {
      id: string; name: string; description: string; image: string
      language: string; level: string; estimated_minutes: number
    }
    missions: { id: string; name: string; description: string }[]
    npc: { id: string; name: string; avatar: string; intro_text: string | null } | null
  }
}>(`/api/game/briefing/${storyId}`)

const briefing = computed(() => response.value?.data ?? null)

const levelColor: Record<string, string> = {
  A1: '#00ff88', A2: '#00e5ff', B1: '#ffe033', B2: '#ff9900', C1: '#ff4d6d', C2: '#cc00ff'
}

function startQuest() {
  const s = player.pendingStory
  if (!s) return
  player.startGame(s.first_mission, s.startNpcId, s.startLocationId, s.name)
  router.push('/game')
}

function goBack() {
  player.clearPendingStory()
  router.push('/')
}

useHead({
  title: computed(() => `${briefing.value?.story.name ?? 'Briefing'} | The Polyglot Path`),
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

    <!-- Error state -->
    <div v-if="error" class="error-state">
      <p class="error-title">⚠ QUEST DATA CORRUPTED</p>
      <p class="error-hint">Could not load the story data.</p>
      <button class="back-btn" type="button" @click="goBack">◀ &nbsp; RETURN TO MENU</button>
    </div>

    <!-- Main content -->
    <div v-else-if="briefing" class="briefing-wrap">

      <!-- ══ STORY HEADER ══ -->
      <header class="story-header">
        <div
          class="story-hero-bg"
          :style="briefing.story.image ? `background-image: url('${briefing.story.image}')` : ''"
        />
        <div class="story-hero-overlay" />

        <div class="story-header-inner">
          <div
            class="level-badge"
            :style="`color:${levelColor[briefing.story.level] ?? '#fff'}`"
          >
            {{ briefing.story.level }}
          </div>
          <h1 class="story-title">{{ briefing.story.name }}</h1>
          <p class="story-desc">{{ briefing.story.description }}</p>
          <div class="story-meta">
            <span class="meta-chip">🌐 {{ briefing.story.language }}</span>
            <span class="meta-sep">░</span>
            <span class="meta-chip">⏱ {{ briefing.story.estimated_minutes }} min</span>
          </div>
        </div>
      </header>

      <main class="briefing-main">

        <!-- ══ NPC INTRO ══ -->
        <section v-if="briefing.npc" class="npc-section">
          <div class="section-header">
            <div class="section-line" />
            <span class="section-title">⚔ &nbsp; GUIDE &nbsp; ⚔</span>
            <div class="section-line" />
          </div>

          <div class="npc-card">
            <div class="npc-avatar-wrap">
              <img
                v-if="briefing.npc.avatar"
                :src="briefing.npc.avatar"
                :alt="briefing.npc.name"
                class="npc-avatar"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div v-else class="npc-avatar-placeholder">⚔</div>
            </div>
            <div class="npc-speech">
              <p class="npc-name">{{ briefing.npc.name }}</p>
              <div class="speech-bubble">
                <p class="speech-text">
                  {{ briefing.npc.intro_text ?? 'Welcome, traveler. Your quest awaits.' }}
                </p>
                <div class="speech-tail" />
              </div>
            </div>
          </div>
        </section>

        <!-- ══ MISSION LIST ══ -->
        <section class="missions-section">
          <div class="section-header">
            <div class="section-line" />
            <span class="section-title">📜 &nbsp; YOUR QUESTS &nbsp; 📜</span>
            <div class="section-line" />
          </div>

          <div class="mission-scroll">
            <ol class="mission-list">
              <li
                v-for="(mission, idx) in briefing.missions"
                :key="mission.id"
                class="mission-item"
                :class="{ 'mission-first': idx === 0 }"
              >
                <div class="mission-index">{{ String(idx + 1).padStart(2, '0') }}</div>
                <div class="mission-body">
                  <p class="mission-name">{{ mission.name }}</p>
                  <p class="mission-desc">{{ mission.description }}</p>
                </div>
                <div v-if="idx === 0" class="mission-active-tag">📍 FIRST TASK</div>
              </li>
            </ol>
          </div>
        </section>

        <!-- ══ READY CTA ══ -->
        <section class="cta-section">
          <p class="ready-label">— READY? —</p>
          <div class="cta-buttons">
            <button class="start-btn" type="button" @click="startQuest">
              ▶ &nbsp; START QUEST
            </button>
            <button class="back-btn" type="button" @click="goBack">
              ◀ &nbsp; GO BACK
            </button>
          </div>
        </section>

      </main>
    </div>

    <!-- Loading skeleton -->
    <div v-else class="skeleton-page">
      <div class="skeleton-header" />
      <div class="skeleton-body">
        <div class="skeleton-block" />
        <div class="skeleton-block tall" />
      </div>
    </div>

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
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
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

/* ── STORY HEADER ── */
.story-header {
  position: relative;
  z-index: 1;
  height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.story-hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(0.4) brightness(0.5) sepia(0.3);
  transform: scale(1.04);
}
.story-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(8, 11, 20, 0.3) 0%,
    rgba(8, 11, 20, 0.95) 100%
  );
}
.story-header-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 1.75rem;
}

.level-badge {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  padding: 4px 10px;
  border: 2px solid currentColor;
  display: inline-block;
  margin-bottom: 0.75rem;
  background: #080b14;
  letter-spacing: 0.1em;
}

.story-title {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(0.9rem, 2.5vw, 1.5rem);
  color: #e8dcc8;
  text-shadow: 2px 2px 0 #c9a84c, 0 0 24px rgba(201,168,76,0.5);
  margin: 0 0 0.6rem;
  line-height: 1.5;
}

.story-desc {
  font-family: 'VT323', monospace;
  font-size: 1.3rem;
  color: #7a7060;
  margin: 0 0 0.75rem;
  max-width: 640px;
}

.story-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  color: #4a4030;
}
.meta-chip { color: #6a5840; }
.meta-sep { color: #2a2010; }

/* ── MAIN ── */
.briefing-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.briefing-main {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem 2rem 1.5rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.briefing-main::-webkit-scrollbar { display: none; }

/* ── SECTION HEADERS ── */
.section-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}
.section-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c9a84c, transparent);
  box-shadow: 0 0 6px rgba(201,168,76,0.4);
}
.section-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #c9a84c;
  text-shadow: 0 0 10px rgba(201,168,76,0.6);
  white-space: nowrap;
  letter-spacing: 0.1em;
}

/* ── NPC CARD ── */
.npc-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.npc-avatar-wrap {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid #c9a84c;
  box-shadow: 0 0 16px rgba(201,168,76,0.35);
  overflow: hidden;
  clip-path: polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
}
.npc-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.7) sepia(0.2);
}
.npc-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d1220;
  font-size: 2rem;
}

.npc-speech {
  flex: 1;
}
.npc-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  color: #c9a84c;
  margin: 0 0 0.6rem;
  letter-spacing: 0.08em;
}
.speech-bubble {
  position: relative;
  background: #0d1220;
  border: 2px solid #2d2510;
  padding: 1rem 1.25rem;
  clip-path: polygon(
    0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px,
    100% calc(100% - 6px), calc(100% - 6px) 100%,
    6px 100%, 0 calc(100% - 6px)
  );
}
.speech-text {
  font-family: 'VT323', monospace;
  font-size: 1.35rem;
  color: #c4b49a;
  line-height: 1.55;
  margin: 0;
  font-style: italic;
}

/* ── MISSION LIST ── */
.mission-scroll {
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: none;
  padding-right: 2px;
}
.mission-scroll::-webkit-scrollbar { display: none; }

.mission-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mission-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: #0d1220;
  border: 2px solid #1a1c2a;
  position: relative;
  clip-path: polygon(
    0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px,
    100% calc(100% - 6px), calc(100% - 6px) 100%,
    6px 100%, 0 calc(100% - 6px)
  );
  transition: border-color 0.2s, box-shadow 0.2s;
}

.mission-item.mission-first {
  border-color: #c9a84c;
  box-shadow: 0 0 16px rgba(201,168,76,0.2), inset 0 0 20px rgba(201,168,76,0.04);
}

.mission-index {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #c9a84c;
  padding-top: 2px;
  flex-shrink: 0;
  opacity: 0.6;
}
.mission-first .mission-index { opacity: 1; }

.mission-body { flex: 1; }

.mission-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.58rem;
  color: #e8dcc8;
  margin: 0 0 0.4rem;
  line-height: 1.7;
}
.mission-first .mission-name { color: #c9a84c; }

.mission-desc {
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  color: #6a6050;
  margin: 0;
  line-height: 1.4;
}

.mission-active-tag {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.38rem;
  color: #c9a84c;
  border: 1px solid #c9a84c;
  padding: 3px 7px;
  flex-shrink: 0;
  letter-spacing: 0.08em;
  white-space: nowrap;
  align-self: center;
}

/* ── CTA ── */
.cta-section {
  text-align: center;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
  flex-shrink: 0;
}

.ready-label {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(0.9rem, 2.5vw, 1.4rem);
  color: #c9a84c;
  text-shadow: 0 0 20px rgba(201,168,76,0.7), 0 0 40px rgba(201,168,76,0.3);
  margin: 0 0 1.75rem;
  letter-spacing: 0.15em;
  animation: pulse-glow 2s ease-in-out infinite alternate;
}
@keyframes pulse-glow {
  from { text-shadow: 0 0 10px rgba(201,168,76,0.4), 0 0 20px rgba(201,168,76,0.2); }
  to   { text-shadow: 0 0 24px rgba(201,168,76,0.9), 0 0 48px rgba(201,168,76,0.5); }
}

.cta-buttons {
  display: flex;
  gap: 1.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

.start-btn {
  padding: 0.85rem 2.5rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
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
  box-shadow: 0 0 24px rgba(255,232,128,0.55);
}

.back-btn {
  padding: 0.85rem 2rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: #4a4030;
  background: transparent;
  border: 2px solid #2d2510;
  cursor: pointer;
  clip-path: polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px));
  transition: border-color 0.15s, color 0.15s;
}
.back-btn:hover {
  border-color: #c9a84c;
  color: #c9a84c;
}

/* ── ERROR STATE ── */
.error-state {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 4rem 1.5rem;
}
.error-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #ff4d6d;
  text-shadow: 0 0 16px rgba(255,77,109,0.5);
  margin: 0;
}
.error-hint {
  font-family: 'VT323', monospace;
  font-size: 1.4rem;
  color: #4a4030;
  margin: 0;
}

/* ── SKELETON ── */
.skeleton-page {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
}
.skeleton-header {
  height: 160px;
  background: linear-gradient(90deg, #0d1220 25%, #131a2b 50%, #0d1220 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.skeleton-block {
  height: 120px;
  background: linear-gradient(90deg, #0d1220 25%, #131a2b 50%, #0d1220 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  clip-path: polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px));
}
.skeleton-block.tall { height: 220px; }
@keyframes shimmer { to { background-position: -200% 0 } }

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
  margin-top: auto;
}
.footer-sep { color: #181408; }
</style>
