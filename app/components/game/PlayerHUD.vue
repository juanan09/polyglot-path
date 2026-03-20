<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { Location, Mission } from '../../../types/game'

const player = usePlayerStore()

// Cargar datos de la localización actual
const { data: locationData } = await useFetch<Location>(() => `/api/location/${player.currentLocationId}`)

// Cargar datos de la misión actual reactivamente
const { data: currentMission } = await useAsyncData(
  'current-mission-hud',
  async () => {
    if (!player.activeMissionId) return null
    try {
      const response = await $fetch<{ success: boolean; data: Mission }>(`/api/game/mission/${player.activeMissionId}`)
      return response.data
    } catch (e) {
      console.error('Error fetching mission for HUD:', e)
      return null
    }
  },
  { watch: [() => player.activeMissionId] }
)

const locationName = computed(() => {
  return locationData.value?.name || player.currentLocationId
})
</script>

<template>
  <!-- Usamos el mismo patrón que NPCDialogue (fixed, high z-index) -->
  <header v-if="!player.showMissionModal" class="player-hud hud-wrapper fixed top-0 left-0 w-full p-4 flex flex-col items-center gap-2 pointer-events-none animate-fade-in">
    <!-- Fila 1: Información del Jugador (Compacta) -->
    <div class="flex items-center bg-glass rounded-2xl p-4 border border-white/10 shadow-2xl pointer-events-auto h-16">
      <div class="flex items-center gap-4 md:gap-6">
        
        <!-- Player -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Player</span>
          <span class="text-lg font-bold text-gold">{{ player.name }}</span>
        </div>
        
        <div class="divider hidden sm:block shrink-0"></div>
        
        <!-- Level -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Level</span>
          <span class="text-lg text-center font-bold text-gold">{{ player.level }}</span>
        </div>

        <div class="divider hidden sm:block shrink-0"></div>

        <!-- Texto de progreso de XP -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">XP</span>
          <span class="text-lg text-center font-bold text-gold">{{ player.xp }}</span>
        </div>

        <!-- Barra visual de XP (Más compacta) -->
        <div class="flex items-center shrink-0 w-32 md:w-48">
          <div class="xp-container h-2 w-full rounded-full overflow-hidden border p-[1px]">
            <div 
               class="xp-bar h-full rounded-full transition-all ease-out"
              :style="{ width: `${player.xp}%` }"
            ></div>
          </div>
        </div>

        <div class="divider hidden lg:block shrink-0"></div>

        <!-- Location -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold text-right">Location</span>
          <span class="text-sm md:text-base font-bold text-white flex items-center justify-end gap-2">
            <span class="status-dot rounded-full animate-pulse"></span>
            {{ locationName }}
          </span>
        </div>

        <div class="divider hidden sm:block shrink-0"></div>

        <GameHomeButton />

      </div>
    </div>

    <!-- Fila 2: Objetivo de Misión (Consistente con Fila 1) -->
    <div v-if="player.activeMissionId && currentMission" class="flex items-center bg-glass rounded-2xl p-4 border border-white/10 shadow-2xl pointer-events-auto animate-slide-up h-16">
       <div class="flex items-center gap-4 md:gap-6">
         <!-- Objetivo -->
         <div class="flex flex-col shrink-0">
           <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Objective</span>
           <span class="text-lg font-bold text-gold">{{ currentMission.name }}</span>
         </div>
         
         <div class="divider shrink-0"></div>
         
         <!-- Descripción -->
         <div class="flex flex-col shrink-0 max-w-sm md:max-w-xl">
           <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Description</span>
           <span class="text-sm text-white font-medium italic truncate">{{ currentMission.description }}</span>
         </div>
       </div>
    </div>
  </header>
</template>
