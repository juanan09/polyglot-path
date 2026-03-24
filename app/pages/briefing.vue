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
  <div class="retro-page briefing-layout">
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
      <button class="briefing-back-btn" type="button" @click="goBack">◀ &nbsp; RETURN TO MENU</button>
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
            class="briefing-level-badge"
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
            <button class="briefing-start-btn" type="button" @click="startQuest">
              ▶ &nbsp; START QUEST
            </button>
            <button class="briefing-back-btn" type="button" @click="goBack">
              ◀ &nbsp; GO BACK
            </button>
          </div>
        </section>

      </main>
    </div>

    <!-- Loading skeleton -->
    <div v-else class="skeleton-page">
      <div class="story-header skeleton-header-wrap">
        <div class="story-header-inner">
          <USkeleton class="h-6 w-16 mb-4 bg-[#1a1c2a] rounded-none" />
          <USkeleton class="h-12 w-3/4 mb-4 bg-[#1a1c2a] rounded-none" />
          <USkeleton class="h-6 w-1/2 mb-4 bg-[#1a1c2a] rounded-none" />
          <div class="flex gap-4">
            <USkeleton class="h-5 w-24 bg-[#1a1c2a] rounded-none" />
            <USkeleton class="h-5 w-24 bg-[#1a1c2a] rounded-none" />
          </div>
        </div>
      </div>

      <div class="briefing-main">
        <!-- NPC Skeleton -->
        <div class="space-y-6">
          <USkeleton class="h-4 w-full bg-[#0d1220] rounded-none" />
          <div class="flex gap-6">
            <USkeleton class="h-20 w-20 flex-shrink-0 bg-[#0d1220] rounded-none" />
            <div class="flex-1 space-y-4">
              <USkeleton class="h-4 w-32 bg-[#0d1220] rounded-none" />
              <USkeleton class="h-24 w-full bg-[#0d1220] rounded-none" />
            </div>
          </div>
        </div>

        <!-- Missions Skeleton -->
        <div class="space-y-6">
          <USkeleton class="h-4 w-full bg-[#0d1220] rounded-none" />
          <div class="space-y-4">
            <USkeleton v-for="i in 2" :key="i" class="h-24 w-full bg-[#0d1220] rounded-none" />
          </div>
        </div>
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
