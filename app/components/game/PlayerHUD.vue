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
  <header v-if="!player.showMissionModal" class="player-hud fixed top-0 left-0 w-full p-4 flex justify-center pointer-events-none animate-fade-in z-50">
    
    <!-- DESKTOP HUD (Original Styles) -->
    <div id="hud-desktop" class="hud-container desktop-only bg-glass rounded-2xl p-4 border border-white/10 shadow-2xl pointer-events-auto h-16 max-w-[95vw]">
      <div class="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <!-- Player -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Player</span>
          <span class="text-sm font-bold text-white flex items-center justify-end gap-2">{{ player.name }}</span>
        </div>
        <div class="divider shrink-0"></div>
        <!-- Level -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Level</span>
          <span class="text-sm font-bold text-white flex items-center justify-end gap-2">{{ player.level }}</span>
        </div>
        <div class="divider shrink-0"></div>
        <!-- XP -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">XP</span>
          <span class="text-sm font-bold text-white flex items-center justify-end gap-2">{{ player.xp }}</span>
        </div>
        <div class="divider hidden lg:block shrink-0"></div>
        <!-- Location -->
        <div class="flex flex-col shrink-0">
          <span class="text-[10px] text-secondary uppercase tracking-widest font-bold text-right">Location</span>
          <span class="text-sm font-bold text-white flex items-center justify-end gap-2">
            <span class="status-dot rounded-full animate-pulse bg-cyan-400 w-2 h-2"></span>
            {{ locationName }}
          </span>
        </div>
        <!-- Mission Block -->
        <template v-if="player.activeMissionId && currentMission">
          <div class="divider shrink-0"></div>
          <div class="flex flex-col shrink-0">
            <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Objective</span>
            <span class="text-sm font-bold text-white flex items-center justify-end gap-2">{{ currentMission.name }}</span>
          </div>
          <div class="divider shrink-0"></div>
          <div class="flex flex-col shrink-0 max-w-md">
            <span class="text-[10px] text-secondary uppercase tracking-widest font-bold">Description</span>
            <span class="text-sm font-bold text-white flex items-center justify-end gap-2">{{ currentMission.description }}</span>
          </div>
        </template>
        <div class="divider shrink-0"></div>
        <GameHomeButton />
      </div>
    </div>

    <!-- MOBILE HUD (Two Rows layout) -->
    <div id="hud-mobile" class="hud-container mobile-only flex-col bg-glass rounded-t-none rounded-b-2xl p-2 border-b border-x border-white/10 shadow-2xl pointer-events-auto w-full">
      <div class="flex items-center justify-around gap-2 px-2 py-1">
        <div class="flex flex-col items-center">
          <span class="text-[8px] text-secondary uppercase font-bold">Player</span>
          <span class="text-[11px] font-bold text-white">{{ player.name }}</span>
        </div>
        <div class="w-px h-6 bg-white/10"></div>
        <div class="flex flex-col items-center">
          <span class="text-[8px] text-secondary uppercase font-bold">Level</span>
          <span class="text-[11px] font-bold text-white">{{ player.level }}</span>
        </div>
        <div class="w-px h-6 bg-white/10"></div>
        <div class="flex flex-col items-center">
          <span class="text-[8px] text-secondary uppercase font-bold">XP</span>
          <span class="text-[11px] font-bold text-white">{{ player.xp }}</span>
        </div>
      </div>
      <div class="h-px bg-white/10 mx-2 my-1"></div>
      <div class="flex items-center justify-between gap-4 px-2 py-1">
        <div class="flex flex-col">
          <span class="text-[8px] text-secondary uppercase font-bold">Location</span>
          <span class="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
            <span class="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
            {{ locationName }}
          </span>
        </div>
        <div v-if="player.activeMissionId && currentMission" class="flex flex-col max-w-[120px]">
          <span class="text-[8px] text-secondary uppercase font-bold">Objective</span>
          <span class="text-[11px] font-bold text-white truncate">{{ currentMission.name }}</span>
        </div>
        <GameHomeButton />
      </div>
    </div>

  </header>
</template>


