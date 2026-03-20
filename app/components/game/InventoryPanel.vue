<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

const isOpen = ref(false)
const activeTab = ref<'inventory' | 'missions'>('inventory')

const togglePanel = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="inventory-panel">
    <!-- Botón Toggle de mochila (Fixed Float) -->
    <button 
      @click="togglePanel"
      class="fixed top-24 right-6 w-14 h-14 bg-glass rounded-full border-2 border-gold flex items-center justify-center text-2xl shadow-2xl z-50 hover:scale-110 transition-transform cursor-pointer"
    >      
    </button>

    <!-- Panel Lateral (Drawer) -->
    <div 
      class="side-panel fixed top-0 right-0 h-full w-80 bg-glass z-60 transition-transform shadow-drawer"
      :class="{ 'open': isOpen }"
    >
      <div class="p-8 h-full flex flex-col">
        <!-- Header del Panel -->
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-2xl font-bold text-gold tracking-tight">Player Menu</h2>
          <button @click="togglePanel" class="close-btn hover:text-white transition-colors text-3xl">×</button>
        </div>

        <!-- Tabs -->
        <div class="tabs flex mb-8">
          <button 
            @click="activeTab = 'inventory'"
            class="tab-btn flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-colors"
            :class="{ 'active': activeTab === 'inventory' }"
          >
            Inventory
          </button>
          <button 
            @click="activeTab = 'missions'"
            class="tab-btn flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-colors"
            :class="{ 'active': activeTab === 'missions' }"
          >
            Missions
          </button>
        </div>

        <!-- Contenido -->
        <div class="flex-1 overflow-y-auto">
          <!-- Inventario -->
          <div v-if="activeTab === 'inventory'" class="animate-fade-in">
            <div v-if="player.inventory.length === 0" class="empty-state">
              Your inventory is empty...
            </div>
            <div class="inventory-grid">
              <div 
                v-for="item in player.inventory" 
                :key="item"
                class="inventory-item bg-white-5 border rounded-2xl p-4 flex flex-col items-center group transition-all shadow-lg"
              >
                <img :src="`/images/items/${item}.webp`" :alt="item" class="item-icon mb-3 transition-transform" />
                <span class="text-[10px] uppercase font-bold text-secondary text-center">{{ item }}</span>
              </div>
            </div>
          </div>

          <!-- Misiones -->
          <div v-if="activeTab === 'missions'" class="space-y-4 animate-fade-in">
             <div v-if="!player.activeMissionId" class="empty-state">
              You have no active missions.
            </div>
            <div v-else class="mission-card rounded-2xl p-6 relative overflow-hidden group">
               <div class="mission-glow absolute"></div>
               <h3 class="text-gold font-bold mb-2">Active Mission</h3>
               <p class="text-white font-semibold text-lg uppercase tracking-tight">{{ player.activeMissionId.replace('_', ' ') }}</p>
               <div class="mt-4 flex items-center gap-2 status-text">
                 <span class="dot-active rounded-full animate-pulse"></span>
                 In progress...
               </div>
            </div>
          </div>
        </div>

        <!-- Footer / Nivel -->
        <div class="panel-footer mt-8 pt-8 border-t border-white-10 flex justify-between items-center px-2">
          <div class="flex flex-col">
             <span class="text-xs text-secondary font-bold uppercase tracking-widest">Current Level</span>
             <span class="text-2xl font-bold">{{ player.level }}</span>
          </div>
          <div class="version-tag px-4 py-2 bg-white-5 rounded-xl border text-[10px] font-bold tracking-widest text-gold">
            V.0.4 - PHASE 5
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
