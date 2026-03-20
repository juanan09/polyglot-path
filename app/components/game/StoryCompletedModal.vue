<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { useRouter } from 'vue-router'

const player = usePlayerStore()
const router = useRouter()

const handleReturnToMenu = () => {
  player.showStoryCompletedModal = false
  player.stagedReward = null
  player.clearPendingStory()
  player.currentStoryName = null
  player.currentLocationId = null
  player.currentNpcId = null
  // Reset all relevant state on exiting
  router.push('/')
}
</script>

<template>
  <div v-if="player.showStoryCompletedModal" class="story-completed-modal fixed inset-0 flex items-center justify-center p-4 animate-fade-in">
    <!-- Overlay oscurecido -->
    <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

    <!-- Modal Content -->
    <div class="content-wrapper relative w-full max-w-2xl rounded-3xl p-8 md:p-12 text-center animate-slide-up flex flex-col items-center">
      
      <!-- Icono Celebración -->
      <div class="mb-6 relative">
        <div class="absolute inset-0 bg-gold blur-2xl opacity-30 rounded-full animate-pulse"></div>
        <UIcon name="i-heroicons-sparkles-solid" class="w-20 h-20 text-gold relative z-10" />
      </div>

      <!-- Textos principales -->
      <h2 class="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
        Story Completed!
      </h2>
      <p class="text-xl md:text-2xl text-gold font-medium mb-8">
        {{ player.currentStoryName || 'Your Adventure' }}
      </p>

      <p class="text-secondary mb-8 max-w-lg leading-relaxed">
        Excellent work, traveler! You have successfully completed all language challenges in this area. Your linguistic journey continues to progress.
      </p>

      <!-- Recompensas Finales -->
      <div v-if="player.stagedReward" class="w-full bg-slate-800/50 rounded-2xl p-6 border border-white/5 mb-10">
        <h3 class="text-xs text-secondary uppercase tracking-widest font-bold mb-4">Final Rewards</h3>
        
        <div class="flex flex-wrap justify-center gap-4">
          <!-- XP Reward -->
          <div v-if="player.stagedReward.xp > 0" class="reward-item flex items-center gap-3 px-5 py-3 rounded-xl">
             <UIcon name="i-heroicons-star-solid" class="w-6 h-6 text-gold" />
             <div class="flex flex-col text-left">
               <span class="text-lg font-bold text-white">+{{ player.stagedReward.xp }}</span>
               <span class="text-[10px] text-secondary uppercase font-bold tracking-widest">XP Gained</span>
             </div>
          </div>

          <!-- Items Reward -->
          <div v-for="item in player.stagedReward.items" :key="item" class="reward-item flex items-center gap-3 px-5 py-3 rounded-xl">
             <UIcon name="i-heroicons-cube-solid" class="w-6 h-6 text-blue-400" />
             <div class="flex flex-col text-left">
               <span class="text-lg font-bold text-white capitalize">{{ item.replace('_', ' ') }}</span>
               <span class="text-[10px] text-secondary uppercase font-bold tracking-widest">Item Acquired</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Botón de acción -->
      <button 
        @click="handleReturnToMenu"
        class="btn-primary w-full md:w-auto px-12 py-4 rounded-xl text-lg flex items-center justify-center gap-3 group"
      >
        <span>Return to Story Selection</span>
        <UIcon name="i-heroicons-arrow-right-solid" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

    </div>
  </div>
</template>
