<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '~/stores/player'
import { useDialogueStore } from '~/stores/dialogue'

const player = usePlayerStore()

const isOpen = computed(() => player.showMissionModal)

const accept = async () => {
  // The next NPC and location were resolved on the server and are stored in stagedReward.
  // acceptMissionReward() applies them automatically.
  player.acceptMissionReward(true)

  // Clear the dialogue history for the new NPC session
  if (player.currentNpcId) {
    const dialogueStore = useDialogueStore()
    await dialogueStore.clearHistory(player.currentNpcId)
  }
}

const decline = () => {
  player.acceptMissionReward(false)
}
</script>

<template>
  <div v-if="isOpen" class="mission-modal fixed bottom-0 left-0 w-full p-6 animate-slide-up" style="z-index: 9999;">
    <div class="max-w-5xl mx-auto flex flex-col gap-4">
      <div class="flex gap-6 items-end">
        <!-- Caja Estilo Diálogo -->
        <div class="flex-1 bg-glass rounded-3xl border p-8 shadow-2xl relative transition-all duration-300 border-amber-500/40">
          
          <!-- Nombre (Etiqueta superior simulada) -->
          <div class="name-tag absolute px-4 py-1 bg-gold text-bg-dark rounded-full text-sm font-bold shadow-lg">
            System
          </div>

          <!-- Contenido: Textos -->
          <div class="mb-6 mt-2 text-center">
            <h2 class="text-4xl font-black text-amber-500 uppercase tracking-widest mb-4 drop-shadow-lg">Congratulations!</h2>
            <p class="text-xl text-white/90 italic leading-relaxed font-serif">
              "{{ player.stagedReward?.message || 'You have successfully completed the task.' }}"
            </p>
          </div>

          <!-- Contenido: Recompensas -->
          <div class="flex justify-center gap-6 mb-8 mt-6">
             <!-- XP -->
             <div v-if="player.stagedReward?.xp" class="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-amber-500/20 shadow-inner">
               <div class="p-2 bg-yellow-500/20 rounded-lg">
                 <UIcon name="i-heroicons-star" class="w-8 h-8 text-yellow-400" />
               </div>
               <span class="text-2xl font-bold text-white">{{ player.stagedReward.xp }} XP</span>
             </div>
             
             <!-- Objetos -->
             <div v-for="item in player.stagedReward?.items" :key="item" class="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-blue-500/20 shadow-inner">
               <div class="p-2 bg-blue-500/20 rounded-lg">
                 <UIcon name="i-heroicons-cube" class="w-8 h-8 text-blue-400" />
               </div>
               <span class="text-2xl font-bold text-white capitalize">{{ item }}</span>
             </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-4 border-t border-white/10 pt-6 mt-4">
             <button 
               @click="decline" 
               class="close-btn"
             >
               Close
             </button>
             <button 
               v-if="player.stagedReward?.unlocks_mission" 
               @click="accept" 
               class="continue-btn"
             >
               <span class="flex items-center gap-2">Continue <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" /></span>
             </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
