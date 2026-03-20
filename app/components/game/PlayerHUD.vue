<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { Location } from '../../../types/game'

const player = usePlayerStore()

// Cargar datos de la localización actual
const { data: locationData } = await useFetch<Location>(() => `/api/location/${player.currentLocationId}`)

const locationName = computed(() => {
  return locationData.value?.name || player.currentLocationId
})

</script>

<template>
  <!-- Usamos el mismo patrón que NPCDialogue (fixed, high z-index) -->
  <header v-if="!player.showMissionModal" class="hud-wrapper fixed top-0 left-0 w-full p-4 flex justify-center pointer-events-none animate-fade-in">
    <div class="flex items-center bg-glass rounded-2xl p-4 border border-white/10 shadow-2xl pointer-events-auto">
      
      <div class="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
        
        <!-- Player -->
        <div class="flex flex-col shrink-0">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">Player</span>
          <span class="text-xl font-bold text-gold">{{ player.name }}</span>
        </div>
        
        <div class="divider hidden sm:block shrink-0"></div>
        
        <!-- Level -->
        <div class="flex flex-col shrink-0">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">Level</span>
          <span class="text-xl text-center font-bold text-gold">{{ player.level }}</span>
        </div>

        <div class="divider hidden sm:block shrink-0"></div>

        <!-- Texto de progreso de XP -->
        <div class="flex flex-col shrink-0">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">XP Progress</span>
          <span class="text-xl text-center font-bold text-gold">{{ player.xp }}</span>
        </div>

        <!-- Barra visual de XP (Restaurada) -->
        <div class="flex flex-1 min-w-[200px] w-full items-center shrink-0">
          <div class="xp-container h-3 w-full rounded-full overflow-hidden border p-[2px]">
            <div 
              class="xp-bar h-full rounded-full transition-all ease-out"
              :style="{ width: `${player.xp}%` }"
            ></div>
          </div>
        </div>

        <div class="divider hidden lg:block shrink-0"></div>

        <!-- Location -->
        <div class="flex flex-col shrink-0">
          <span class="text-xs text-secondary uppercase tracking-widest font-bold">Location</span>
          <span class="text-lg font-bold text-white flex items-center justify-end gap-2">
            <span class="status-dot rounded-full animate-pulse"></span>
            {{ locationName }}
          </span>
        </div>

        <div class="divider hidden sm:block shrink-0"></div>

        <GameHomeButton />

      </div>
    </div>
  </header>
</template>

<style scoped>
.hud-wrapper {
  z-index: 1000; /* Igual que el diálogo para asegurar visibilidad */
}

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

.back-home-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 0.8rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-home-btn:hover {
  background: rgba(251, 191, 36, 0.15);
  border-color: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
}

/* Utils reactivas para el HUD */
@media (max-width: 768px) {
  .mx-4 { margin-left: 0.5rem; margin-right: 0.5rem; }
}
</style>
