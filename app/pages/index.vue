<script setup lang="ts">
import type { Location } from '../../types/game'
import { usePlayerStore } from '~/stores/player'

const player = usePlayerStore()
const router = useRouter()

// Cargar todas las localizaciones (historias/puntos de entrada)
const { data: locations, pending } = await useFetch<Location[]>('/api/location')

const startGame = (locationId: string) => {
  player.currentLocationId = locationId
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
            Phase 5 Alpha
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
            color="warning" 
            variant="solid" 
            icon="i-heroicons-play-solid"
            class="px-8 py-4 font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            @click="startGame('village_square')"
          >
            Start Adventure
          </UButton>
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

    <!-- Main Content: Available Stories/Locations -->
    <main class="max-w-6xl mx-auto px-6 pb-32">
      <div class="flex items-center justify-between mb-12">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <UIcon name="i-heroicons-map" class="text-amber-500 w-8 h-8" />
          Available Stories
        </h2>
        <div class="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8"></div>
      </div>

      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <USkeleton v-for="i in 3" :key="i" class="h-64 rounded-3xl bg-slate-800/50" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard 
          v-for="location in locations" 
          :key="location.id"
          class="group relative overflow-hidden rounded-3xl border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10"
        >
          <template #header>
            <div class="relative h-48 -m-4 overflow-hidden">
               <img 
                 :src="location.background" 
                 :alt="location.name"
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
               <UBadge 
                 class="absolute top-4 right-4 capitalize" 
                 color="warning" 
                 variant="subtle"
               >
                 {{ location.type }}
               </UBadge>
            </div>
          </template>

          <div class="py-2">
            <h3 class="text-2xl font-bold mb-2 text-white group-hover:text-amber-400 transition-colors">
              {{ location.name }}
            </h3>
            <p class="text-slate-400 text-sm mb-6 line-clamp-2 italic">
              Explore the secrets of {{ location.name }} and practice your English with its inhabitants.
            </p>

            <UButton 
              block 
              color="warning" 
              variant="soft" 
              class="rounded-xl font-bold py-3 group-hover:variant-solid transition-all"
              icon="i-heroicons-arrow-right"
              @click="startGame(location.id)"
            >
              Enter Region
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Footer-like section -->
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
