<script setup lang="ts">
import PlayerHUD from '@/components/game/PlayerHUD.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import NPCDialogue from '@/components/game/NPCDialogue.vue'
import InventoryPanel from '@/components/game/InventoryPanel.vue'

// Page title
useHead({
  title: 'Exploring Eldoria | The Polyglot Path'
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

    <!-- Capa de Diálogo -->
    <NPCDialogue />

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
