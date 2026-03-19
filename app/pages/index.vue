<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'
import { useRouter } from 'vue-router'

const player = usePlayerStore()
const router = useRouter()

interface StarterMission {
  missionId: string
  name: string
  description: string
  levelRequired: string
  npcId: string
  npcName: string
  locationId: string
  locationName: string
}

// Fetch starter missions dynamically from game-data
const { data: response, pending } = await useFetch<{ success: boolean; data: StarterMission[] }>('/api/game/starters')
const starters = computed(() => response.value?.data ?? [])

const beginMission = (starter: StarterMission) => {
  player.startGame(starter.missionId, starter.npcId, starter.locationId)
  router.push('/game')
}

useHead({
  title: 'Welcome to Polyglot Path | Hero\'s Journey'
})
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white selection:bg-amber-500/30">
    <!-- Hero Section -->
    <header class="relative pt-24 pb-16 px-4 overflow-hidden">
      <!-- Decoración de fondo -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <UChip color="warning" size="2xl" class="mb-6">
          <UBadge color="warning" variant="soft" size="lg" class="px-4 py-1 font-bold tracking-widest uppercase">
            Phase 8 Alpha
          </UBadge>
        </UChip>
        
        <h1 class="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">
          POLYGLOT <span class="text-amber-500">PATH</span>
        </h1>
        
        <p class="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Master new languages through an immersive RPG experience. Your words are your weapons.
        </p>

        <div class="flex flex-wrap justify-center gap-4">
          <UButton 
            size="xl" 
            color="neutral" 
            variant="ghost" 
            icon="i-heroicons-book-open"
            class="px-8 rounded-2xl font-bold"
          >
            How to Play
          </UButton>
        </div>
      </div>
    </header>

    <!-- Main Content: Available Stories from game-data -->
    <main class="max-w-6xl mx-auto px-6 pb-32">
      <div class="flex items-center justify-between mb-12">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <UIcon name="i-heroicons-book-open" class="text-amber-500 w-8 h-8" />
          Choose Your Story
        </h2>
        <div class="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8"></div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <USkeleton v-for="i in 3" :key="i" class="h-72 rounded-3xl bg-slate-800/50" />
      </div>

      <!-- No starters available -->
      <div v-else-if="starters.length === 0" class="text-center py-24 text-slate-500 italic">
        No stories available yet. Add missions with <code class="text-amber-500">is_starter: true</code> in game-data.
      </div>

      <!-- Story cards (data-driven, one per starter mission) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="starter in starters"
          :key="starter.missionId"
          class="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col"
          @click="beginMission(starter)"
        >
          <!-- NPC avatar placeholder -->
          <div class="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            <img
              :src="`/images/npcs/${starter.npcId}.webp`"
              :alt="starter.npcName"
              class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 opacity-80"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <UBadge class="absolute top-4 right-4 capitalize" color="warning" variant="subtle">
              Level {{ starter.levelRequired }}
            </UBadge>
            <UBadge class="absolute top-4 left-4" color="neutral" variant="soft">
              {{ starter.locationName }}
            </UBadge>
          </div>

          <div class="flex flex-col flex-1 p-6">
            <h3 class="text-2xl font-bold mb-2 text-white group-hover:text-amber-400 transition-colors">
              {{ starter.name }}
            </h3>
            <p class="text-slate-400 text-sm mb-6 line-clamp-2 italic flex-1">
              {{ starter.description }}
            </p>
            <div class="flex items-center gap-2 text-slate-500 text-xs mb-4">
              <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
              <span>Talk to <strong class="text-slate-300">{{ starter.npcName }}</strong></span>
            </div>

            <UButton
              block
              color="warning"
              variant="soft"
              class="rounded-xl font-bold py-3 group-hover:variant-solid transition-all"
              icon="i-heroicons-arrow-right"
            >
              Start Mission
            </UButton>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-24 text-center border-t border-slate-800 pt-12">
        <div class="flex justify-center gap-8 text-slate-500 text-sm font-medium tracking-widest uppercase">
          <a href="#" class="hover:text-amber-500 transition-colors">Discord</a>
          <a href="#" class="hover:text-amber-500 transition-colors">Roadmap</a>
          <a href="#" class="hover:text-amber-500 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

