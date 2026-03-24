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
  player.selectStory({
    id: story.id,
    name: story.name,
    first_mission: story.first_mission,
    startNpcId: story.startNpcId,
    startLocationId: story.startLocationId
  })
  router.push('/briefing')
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
        <button
          v-for="story in stories"
          :key="story.id"
          class="quest-card"
          type="button"
          :aria-label="`Start quest: ${story.name}`"
          @click="beginStory(story)"
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
            <div class="start-btn" aria-hidden="true">
              ▶ &nbsp; START QUEST
            </div>
          </div>

          <!-- Bottom pixel bar -->
          <div class="card-bottom-bar" />
        </button>
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

