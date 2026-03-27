<script setup lang="ts">
import PlayerHUD from '@/components/game/PlayerHUD.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import NPCDialogue from '@/components/game/NPCDialogue.vue'
import InventoryPanel from '@/components/game/InventoryPanel.vue'
import MissionModal from '@/components/game/MissionModal.vue'
import StoryCompletedModal from '@/components/game/StoryCompletedModal.vue'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'

const player = usePlayerStore()
const auth = useAuthStore()
const router = useRouter()

// Guard: if no game is started (came directly via URL), redirect to mission selection
if (!player.currentLocationId) {
  await router.replace('/')
}

// Auto-save cada 60 segundos para usuarios autenticados
let autoSaveInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // Cargar progreso desde la DB si el usuario está autenticado
  if (auth.isAuthenticated) {
    await player.loadFromServer()
  }

  // Iniciar auto-save periódico
  if (auth.isAuthenticated) {
    autoSaveInterval = setInterval(() => {
      player.saveToServer()
    }, 60_000) // Cada 60 segundos
  }
})

onUnmounted(() => {
  // Guardar antes de salir y limpiar el intervalo
  if (auth.isAuthenticated) {
    player.saveToServer()
  }
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
})

// Page title
useHead({
  title: computed(() => `${player.currentStoryName || 'Exploring Eldoria'} | The Polyglot Path`)
})
</script>

<template>
  <main class="relative w-full h-screen bg-black overflow-hidden flex flex-col">
    <!-- HUD superior -->
    <PlayerHUD />

    <!-- Tablero de Juego (Fondo y NPCs) -->
    <GameBoard />

    <!-- Panel de Inventario y Misiones (Flotante) -->
    <InventoryPanel />

    <!-- Game Interactions -->
    <NPCDialogue />
    <MissionModal />
    <StoryCompletedModal />

    <!-- Viñeta global para estética RPG -->
    <div class="pointer-events-none absolute inset-0 z-50 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]"></div>
  </main>
</template>

<style>
/* Reset global para evitar saltos de layout */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#__nuxt {
  height: 100%;
}
</style>
