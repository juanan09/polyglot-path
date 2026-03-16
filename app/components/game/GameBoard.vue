<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { NPC } from '../../../types/game'

const player = usePlayerStore()

// Cargar datos de la localización actual de forma reactiva
const { data: locationData } = await useFetch(() => `/api/location/${player.currentLocationId}`)

// Datos de NPCs cargados dinámicamente según la localización
const { data: npcsData } = await useAsyncData(
  'location-npcs',
  async () => {
    if (!locationData.value?.npcs) return []
    const results = await Promise.all(
      locationData.value.npcs.map((id: string) => $fetch<NPC>(`/api/npc/${id}`).catch(() => null))
    )
    return results.filter((npc: NPC | null): npc is NPC => npc !== null)
  },
  { watch: [locationData] }
)

const npcs = computed<NPC[]>(() => npcsData.value || [])

// Estilo del fondo reactivo
const backgroundStyle = computed(() => {
  const bg = locationData.value?.background || `/images/locations/${player.currentLocationId}.webp`
  return {
    backgroundImage: `url('${bg}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black">
    <!-- Fondo del Escenario -->
    <div 
      class="absolute inset-0 transition-all duration-1000 ease-in-out"
      :style="backgroundStyle"
    >
      <!-- Overlay para profundidad -->
      <div class="absolute inset-0 background-overlay"></div>
    </div>

    <!-- Render de NPCs -->
    <div class="relative z-10 w-full max-w-6xl h-full flex items-end justify-around pb-32">
      <div 
        v-for="npc in npcs" 
        :key="npc.id"
        class="group cursor-pointer flex flex-col items-center animate-slide-up"
      >
        <!-- Nombre del NPC (Dorado y elegante) -->
        <span class="mb-4 px-3 py-1 bg-glass rounded-full text-xs font-bold border-gold opacity-80 group-hover:opacity-100 transition-all shadow-xl">
          {{ npc.name }}
        </span>
        
        <!-- Avatar/Sprite del NPC -->
        <div class="relative npc-container">
          <img 
            :src="`/images/npcs/${npc.id}.webp`" 
            :alt="npc.name"
            class="npc-sprite drop-shadow-heavy transition-all"
          />
          <!-- Glow effect on hover -->
          <div class="absolute inset-glow blur-3xl rounded-full opacity-0 group-hover-opacity transition-opacity"></div>
        </div>
      </div>
    </div>

    <!-- Vignette / Bordes cinematicos -->
    <div class="absolute inset-0 pointer-events-none vignette"></div>
  </div>
</template>

<style scoped>
.background-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%, rgba(0,0,0,0.3) 100%);
}

.npc-container {
  height: 500px;
  display: flex;
  align-items: flex-end;
}

.npc-sprite {
  height: 100%;
  width: auto;
  object-fit: contain;
}

.drop-shadow-heavy {
  filter: drop-shadow(0 20px 50px rgba(0,0,0,0.9));
}

.vignette {
  box-shadow: inset 0 0 150px rgba(0,0,0,0.8);
}

.transform-hover:hover {
  transform: scale(1.1);
}

.group:hover .npc-sprite {
  filter: drop-shadow(0 20px 50px rgba(0,0,0,0.9)) brightness(1.1);
}

.inset-glow {
  top: -1rem;
  right: -1rem;
  bottom: -1rem;
  left: -1rem;
  background-color: rgba(251, 191, 36, 0.2);
}

.group:hover .group-hover-opacity {
  opacity: 1;
}
</style>
