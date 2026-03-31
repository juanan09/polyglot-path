<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import InventoryItemIcon from './InventoryItemIcon.vue'

const player = usePlayerStore()
</script>

<template>
  <aside 
    class="inventory-sidebar hud-wrapper fixed z-[1000] pointer-events-none animate-fade-in"
  >
    <div class="inventory-container flex flex-col items-center bg-glass border border-white/10 shadow-2xl pointer-events-auto">
      
      <!-- Título de sección (Oculto en móvil para ahorrar espacio) -->
      <div class="header-section flex flex-col shrink-0 items-center w-full text-center">
        <span class="text-[12px] text-white uppercase tracking-widest font-bold">Items</span>
        <div class="divider-horizontal w-full h-px bg-white/10 mt-2 mb-4 shrink-0"></div>
      </div>
      
      <!-- Estado vacío -->
      <div v-if="!player.inventory || player.inventory.length === 0" class="empty-state text-[10px] text-white/50 text-center py-2 italic w-full">
        Empty
      </div>

      <!-- Lista de items -->
      <div v-else class="items-list flex flex-col gap-3 md:gap-4 overflow-y-auto w-full no-scrollbar items-center pb-2">
        <transition-group name="list">
          <InventoryItemIcon v-for="item in player.inventory" :key="item" :item-id="item" />
        </transition-group>
      </div>

    </div>
  </aside>
</template>

<style scoped>
/* === DESKTOP LAYOUT === */
@media (min-width: 769px) {
  .inventory-sidebar {
    left: 2.5rem; /* Separado del borde izquierdo */
    top: 50%;
    transform: translateY(-50%);
    width: 110px;
  }
  .inventory-container {
    padding: 1.5rem 0.8rem;
    border-radius: 1.5rem;
    max-height: 80vh;
  }
}

/* === MOBILE LAYOUT === */
@media (max-width: 768px) {
  .inventory-sidebar {
    left: 0.75rem;
    top: 6.5rem; /* Posicionado justo debajo del HUD superior izquierdo */
    width: 64px;
    z-index: 30;
  }
  .inventory-container {
    padding: 0.6rem 0.4rem;
    border-radius: 1rem;
    max-height: 45vh;
  }
  .header-section {
    display: none;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.9);
}
</style>
