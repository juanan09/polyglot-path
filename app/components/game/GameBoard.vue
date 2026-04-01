<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { NPC, Location } from '../../../types/game'

const player = usePlayerStore()

// Load current location data reactively
const { data: locationData } = await useAsyncData(
  'current-location',
  async () => {
    if (!player.currentLocationId) return null
    return $fetch<Location>(`/api/location/${player.currentLocationId}` as string)
  },
  { watch: [() => player.currentLocationId] }
)

// NPC data loaded dynamically based on location
const { data: npcsData } = await useAsyncData(
  'location-npcs',
  async () => {
    if (!locationData.value?.npcs) return []
    const results = await Promise.all(
      locationData.value.npcs.map((id: string) => $fetch<NPC>(`/api/npc/${id}` as string).catch(() => null))
    )
    return results.filter((npc: NPC | null): npc is NPC => npc !== null)
  },
  { watch: [locationData] }
)

const npcs = computed<NPC[]>(() => npcsData.value || [])

// Estilo del fondo reactivo
const backgroundStyle = computed(() => {
  if (!player.currentLocationId) return {}

  const bg = locationData.value?.background || `/images/locations/${player.currentLocationId}.webp`
  return {
    backgroundImage: `url('${bg}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})
</script>

<template>
  <div class="game-board relative w-full h-screen overflow-hidden flex items-center justify-center bg-black">
    <!-- Fondo del Escenario -->
    <div 
      class="absolute inset-0 transition-all duration-1000 ease-in-out"
      :style="backgroundStyle"
    >
      <!-- Depth overlay -->
      <div class="absolute inset-0 background-overlay"></div>
    </div>

    <!-- Render de NPCs -->
    <div v-if="!player.showMissionModal" class="relative z-10 w-full max-w-6xl h-full flex items-end justify-around pb-32">
      <div 
        v-for="npc in npcs" 
        :key="npc.id"
        class="group cursor-pointer flex flex-col items-center animate-slide-up"
      >
        
        <!-- Avatar/Sprite del NPC -->
        <div class="relative npc-container">
          <img 
            :src="`/images/npcs/${npc.id}.webp`" 
            :alt="npc.name"
            class="npc-sprite drop-shadow-heavy transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Vignette / Bordes cinematicos -->
    <div class="absolute inset-0 pointer-events-none vignette"></div>
  </div>
</template>
