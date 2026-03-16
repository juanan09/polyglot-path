<template>
  <div class="p-8 font-sans max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 border-b pb-2">🕹️ Debug: Player Store</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Visualización del Estado -->
      <section class="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Estado Actual</h2>
        <ul class="space-y-2">
          <li><strong>Nombre:</strong> {{ player.name }}</li>
          <li><strong>Nivel:</strong> {{ player.level }}</li>
          <li><strong>XP:</strong> {{ player.xp }} / 100</li>
          <li><strong>Ubicación:</strong> <span class="bg-blue-100 px-2 py-1 rounded text-blue-800">{{ player.currentLocationId }}</span></li>
          <li><strong>Misión Activa:</strong> <span class="bg-yellow-100 px-2 py-1 rounded text-yellow-800">{{ player.activeMissionId || 'Ninguna' }}</span></li>
          <li>
            <strong>Inventario:</strong>
            <ul class="list-disc list-inside ml-4 mt-1">
              <li v-for="item in player.inventory" :key="item">{{ item }}</li>
              <li v-if="player.inventory.length === 0" class="text-gray-400 italic">Mochila vacía</li>
            </ul>
          </li>
        </ul>
      </section>

      <!-- Controles -->
      <section class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold mb-3 text-gray-700">Controles</h2>
          <div class="flex flex-wrap gap-2">
            <button @click="player.addXp(25)" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              +25 XP
            </button>
            <button @click="player.updateLocation('market')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Ir al Mercado
            </button>
            <button @click="player.addToInventory('bread')" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
              Añadir Pan
            </button>
             <button @click="player.addToInventory('key')" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
              Añadir Llave
            </button>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-3 text-gray-700">Misiones</h2>
          <select @change="(e) => player.startMission((e.target as HTMLSelectElement).value)" class="w-full p-2 border rounded shadow-sm">
            <option value="find_bakery">Find the Bakery</option>
            <option value="repair_cart">Repair the Cart</option>
            <option value="delivery">Deliver Secret Message</option>
          </select>
        </div>
      </section>
    </div>

    <div class="mt-8 text-sm text-gray-500 italic">
      Nota: Esta página es solo para propósitos de desarrollo (Fase 4).
    </div>
  </div>
</template>

<script setup lang="ts">
// En Nuxt 3/4 los componentes en stores/ se pueden auto-importar, 
// o usar @/stores/player (donde @ apunta a app/ si compatibilityVersion es 4)
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

// Título de la página para SEO/Browser tab
useHead({
  title: 'Debug Store | Polyglot Path'
})
</script>

<style scoped>
button {
  cursor: pointer;
}
</style>
