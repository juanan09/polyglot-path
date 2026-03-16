<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { Location } from '../../../types/game'

const player = usePlayerStore()

// Cargar datos de la localización actual
const { data: locationData } = await useFetch<Location>(() => `/api/location/${player.currentLocationId}`)

// Localización legible dinámica
const locationName = computed(() => {
  return locationData.value?.name || player.currentLocationId
})
</script>

<template>
  <header class="fixed top-0 left-0 w-full p-4 z-50 animate-fade-in">
    <div class="max-w-7xl mx-auto flex justify-between items-center bg-glass rounded-2xl p-4 border border-white/10">
      <!-- Info del Jugador -->
      <div class="flex items-center gap-6">
        <div class="flex flex-col">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">Player</span>
          <span class="text-xl font-bold text-gold">{{ player.name }}</span>
        </div>
        
        <div class="divider hidden md:block"></div>
        
        <div class="hidden md:flex flex-col">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">Level</span>
          <span class="text-xl font-bold text-center">{{ player.level }}</span>
        </div>
      </div>

      <!-- Barra de XP -->
      <div class="flex-1 max-w-md mx-8 group">
        <div class="flex justify-between text-xs mb-1 px-1">
          <span class="text-secondary font-bold uppercase tracking-wider">XP Progress</span>
          <span class="text-gold font-bold">{{ player.xp }}%</span>
        </div>
        <div class="xp-container h-3 w-full rounded-full overflow-hidden border p-[2px]">
          <div 
            class="xp-bar h-full rounded-full transition-all ease-out"
            :style="{ width: `${player.xp}%` }"
          ></div>
        </div>
      </div>

      <!-- Localización Actual -->
      <div class="flex items-center gap-3">
        <div class="text-right flex flex-col">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">Location</span>
          <span class="text-lg font-bold text-white flex items-center gap-2">
            <span class="status-dot rounded-full animate-pulse"></span>
            {{ locationName }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.divider {
  height: 2.5rem;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.xp-container {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.xp-bar {
  background: linear-gradient(90deg, #fbbf24 0%, #d97706 100%);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
  transition-duration: 0.7s;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

/* Custom spacing logic if needed elsewhere */
.mx-8 { margin-left: 2rem; margin-right: 2rem; }
.md\:block { display: none; }
.md\:flex { display: none; }

@media (min-width: 768px) {
  .md\:block { display: block; }
  .md\:flex { display: flex; }
}
</style>
