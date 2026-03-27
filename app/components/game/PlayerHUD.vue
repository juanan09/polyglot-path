<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { Location, Mission } from '../../../types/game'

const player = usePlayerStore()

// Cargar datos de la localización actual
const { data: locationData } = await useFetch<Location>(
  () => `/api/location/${player.currentLocationId}`,
  {
    immediate: !!player.currentLocationId,
    watch: [() => player.currentLocationId]
  }
)

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
  <header v-if="!player.showMissionModal" class="player-hud hud-wrapper fixed top-0 left-0 w-full p-4 flex justify-center pointer-events-none animate-fade-in">
    <!-- Fila Única: De Jugador a Misión -->
    <div class="flex items-center bg-glass rounded-2xl p-4 border border-white/10 shadow-2xl pointer-events-auto h-16 max-w-[95vw]">
      <div class="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar">
        
        <!-- Player -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Player</span>
          <span class="text-sm md:text-base font-bold text-white flex items-center justify-end gap-2">{{ player.name }}</span>
        </div>
        
        <div class="divider hidden sm:block shrink-0"></div>
        
        <!-- Level -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Level</span>
          <span class="text-sm md:text-base font-bold text-white flex items-center justify-end gap-2">{{ player.level }}</span>
        </div>

        <div class="divider hidden sm:block shrink-0"></div>

        <!-- XP -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">XP</span>
          <span class="text-sm md:text-base font-bold text-white flex items-center justify-end gap-2">{{ player.xp }}</span>
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

        <!-- Bloque de Misión Integrado (Solo si hay misión) -->
        <template v-if="player.activeMissionId && currentMission">
          <div class="divider shrink-0"></div>

          <!-- Objective -->
          <div class="flex flex-col shrink-0">
            <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Objective</span>
            <span class="text-sm md:text-base font-bold text-white flex items-center justify-end gap-2">{{ currentMission.name }}</span>
          </div>
          
          <div class="divider shrink-0"></div>
          
          <!-- Description -->
          <div class="flex flex-col shrink-0 max-w-[200px] xl:max-w-md">
            <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Description</span>
            <span class="text-sm md:text-base font-bold text-white flex items-center justify-end gap-2">{{ currentMission.description }}</span>
          </div>
        </template>

        <div class="divider hidden sm:block shrink-0"></div>

        <GameHomeButton />

      </div>
    </div>
  </header>
</template>
