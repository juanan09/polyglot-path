<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import InventoryItemIcon from './InventoryItemIcon.vue'

const player = usePlayerStore()
</script>

<template>
  <!-- Solo se muestra si hay items -->
  <aside 
    v-if="player.inventory && player.inventory.length > 0"
    class="inventory-horizontal-bar fixed top-0 left-0 w-full flex justify-center pointer-events-none animate-fade-in"
  >
    <div class="inventory-container flex items-center bg-glass border border-white/10 shadow-2xl pointer-events-auto overflow-hidden">
      
      <!-- Lista de items en fila horizontal con scroll y centrada -->
      <div class="items-list flex items-center justify-center gap-3 md:gap-4 overflow-x-auto no-scrollbar px-2">
        <transition-group name="list-horizontal">
          <InventoryItemIcon v-for="item in player.inventory" :key="item" :item-id="item" />
        </transition-group>
      </div>

    </div>
  </aside>
</template>

<style scoped>
/* === POSICIONAMIENTO EN ESPEJO CON PLAYERHUD === */

@media (min-width: 769px) {
  .inventory-horizontal-bar {
    padding: 6.5rem 1rem 0 1rem; /* Margen superior para situarse bajo el HUD */
  }
  .inventory-container {
    height: 4.5rem; 
    padding: 0 0.8rem;
    border-radius: 1.5rem;
    max-width: 90vw;
  }
}

@media (max-width: 768px) {
  .inventory-horizontal-bar {
    padding: 7.5rem 0.5rem 0 0.5rem; /* Margen superior para situarse bajo el HUD móvil */
  }
  .inventory-container {
    height: 3.5rem;
    padding: 0 0.5rem;
    border-radius: 1.2rem;
    max-width: 95vw;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animación horizontal */
.list-horizontal-enter-active,
.list-horizontal-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-horizontal-enter-from { opacity: 0; transform: translateX(-20px) scale(0.5); }
.list-horizontal-leave-to { opacity: 0; transform: translateX(20px) scale(0.5); }

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
