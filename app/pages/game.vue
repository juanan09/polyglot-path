<script setup lang="ts">
import PlayerHUD from '@/components/game/PlayerHUD.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import NPCDialogue from '@/components/game/NPCDialogue.vue'
import InventoryPanel from '@/components/game/InventoryPanel.vue'
import MissionModal from '@/components/game/MissionModal.vue'
import StoryCompletedModal from '@/components/game/StoryCompletedModal.vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const router = useRouter()

// Guard: if no game is started (came directly via URL), redirect to mission selection
if (!player.currentLocationId) {
  await router.replace('/')
}

onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  document.documentElement.style.height = '100%'
  document.body.style.height = '100%'
})

onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.documentElement.style.height = ''
  document.body.style.height = ''
})


// Page title
useHead({
  title: computed(() => `${player.currentStoryName || 'Exploring Eldoria'} | The Polyglot Path`)
})
</script>

<template>
  <main class="game-container relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col">
    <!-- Tablero de Juego (Fondo y NPCs) -->
    <GameBoard />

    <!-- Viñeta global para estética RPG -->
    <div class="pointer-events-none absolute inset-0 z-[100] shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]"></div>

    <!-- UI Superior -->
    <PlayerHUD />
    <!-- Panel de Inventario (Flotante) -->
    <InventoryPanel />

    <!-- Game Interactions -->
    <NPCDialogue />
    <MissionModal />
    <StoryCompletedModal />
  </main>
</template>

<style scoped>
.game-container {
  /* Prevent scrolling at the root level */
  scrollbar-width: none;
}
.game-container::-webkit-scrollbar {
  display: none;
}
</style>

