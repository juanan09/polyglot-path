<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import InventoryItemIcon from './InventoryItemIcon.vue'

const player = usePlayerStore()
</script>

<template>
  <aside 
    class="inventory-sidebar hud-wrapper fixed right-0 top-1/2 -translate-y-1/2 p-1 md:p-2 flex flex-col pointer-events-none animate-fade-in z-[1000]"
  >
    <div class="flex flex-col items-center bg-glass rounded-xl md:rounded-2xl p-2 md:p-4 border border-white/10 shadow-2xl pointer-events-auto max-h-[70vh] md:max-h-[85vh] w-16 md:w-28">
      
      <!-- Título de sección -->
      <div class="flex flex-col shrink-0 items-center mb-2 w-full text-center">
        <span class="text-[12px] text-white uppercase tracking-widest font-bold">Items</span>
      </div>
      
      <div class="divider-horizontal w-full h-px bg-white/10 mb-4 shrink-0"></div>

      <!-- Estado vacío -->
      <div v-if="!player.inventory || player.inventory.length === 0" class="text-[10px] text-white/50 text-center py-2 italic w-full">
        Empty
      </div>

      <!-- Lista de items -->
      <div v-else class="flex flex-col gap-4 overflow-y-auto w-full no-scrollbar items-center pb-2">
        <transition-group name="list">
          <InventoryItemIcon v-for="item in player.inventory" :key="item" :item-id="item" />
        </transition-group>
      </div>

    </div>
  </aside>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-up {
  animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.hover\:border-gold:hover {
  border-color: #fbbf24;
}
</style>
