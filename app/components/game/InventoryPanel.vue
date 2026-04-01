<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import InventoryItemIcon from './InventoryItemIcon.vue'

const player = usePlayerStore()
</script>

<template>
  <!-- Only shown if there are items -->
  <aside 
    v-if="player.inventory && player.inventory.length > 0"
    class="inventory-horizontal-bar fixed top-0 left-0 w-full flex justify-center pointer-events-none animate-fade-in"
  >
    <div class="inventory-container flex items-center bg-glass border border-white/10 shadow-2xl pointer-events-auto overflow-hidden">
      
      <!-- Horizontal row of items with scroll and centered -->
      <div class="items-list flex items-center justify-center gap-3 md:gap-4 overflow-x-auto no-scrollbar px-2">
        <transition-group name="list-horizontal">
          <InventoryItemIcon v-for="item in player.inventory" :key="item" :item-id="item" />
        </transition-group>
      </div>

    </div>
  </aside>
</template>


