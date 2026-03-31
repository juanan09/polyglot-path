<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { useDialogueStore } from '@/stores/dialogue'
import type { NPC } from '../../../types/game'

const player = usePlayerStore()
const dialogueStore = useDialogueStore()

// Props opcionales
const props = defineProps<{
  npcId?: string
}>()

const targetNpcId = computed(() => player.currentNpcId || props.npcId || 'guard')
const playerMessage = ref('')

// Cargar datos reales del NPC
const { data: npcData, pending: npcPending, error: npcError } = await useFetch<NPC>(() => `/api/npc/${targetNpcId.value}`)

// El mensaje que se muestra arriba (el último del NPC)
const currentNpcMessage = computed(() => {
  if (npcPending.value) return 'Loading...'
  if (npcError.value || !npcData.value) return 'The NPC does not seem to want to talk right now...'
  
  // Si hay historial, mostrar el último mensaje del modelo
  const lastModelMessage = [...dialogueStore.history].reverse().find(m => m.role === 'model')
  if (lastModelMessage) return lastModelMessage.content
  
  // Si no hay historial, mostrar frase inicial
  return npcData.value.initial_phrases[0]
})

const sendMessage = async () => {
  if (!playerMessage.value.trim() || dialogueStore.isPending) return
  
  const originalMessage = playerMessage.value
  playerMessage.value = ''
  
  await dialogueStore.sendMessage(targetNpcId.value, originalMessage)
}
</script>

<template>
  <div v-if="!player.showMissionModal" class="dialogue-wrapper fixed bottom-0 left-0 w-full p-4 md:p-6 animate-slide-up sm:mb-0 mb-safe">
    <div class="max-w-5xl mx-auto flex flex-col gap-3 md:gap-4">
      
      <!-- Feedback Pedagógico (Si existe) -->
      <div v-if="dialogueStore.lastResponse?.feedback" class="feedback-toast self-end animate-bounce-subtle">
        <div class="flex items-center gap-2 md:gap-3">
          <div v-if="dialogueStore.lastResponse?.grammarScore !== undefined" class="score-badge" :class="dialogueStore.lastResponse.grammarScore > 0.7 ? 'high' : 'low'">
            {{ Math.round(dialogueStore.lastResponse.grammarScore * 100) }}%
          </div>
          <p class="text-xs md:text-sm font-medium text-white/90">
             ✨ {{ dialogueStore.lastResponse.feedback }}
          </p>
        </div>
      </div>
      
      <!-- Error de Validación o Red -->
      <div v-if="dialogueStore.lastError" class="error-toast self-center animate-shake">
        <p class="text-[10px] md:text-xs font-bold text-white px-4 py-2 bg-red-500/80 backdrop-blur rounded-full shadow-lg">
          ⚠️ {{ dialogueStore.lastError }}
        </p>
      </div>

      <div class="flex gap-4 md:gap-6 items-end">
        <!-- Caja de Diálogo -->
        <div class="flex-1 bg-glass rounded-2xl md:rounded-3xl border p-4 md:p-6 shadow-2xl relative transition-all duration-300" :class="{ 'opacity-50 pointer-events-none': dialogueStore.isPending }">
          <!-- Nombre del NPC -->
          <div class="name-tag absolute -top-4 left-4 md:top-auto md:left-auto px-4 py-1 bg-gold text-bg-dark rounded-full text-xs md:text-sm font-bold shadow-lg">
            {{ npcData?.name || 'Loading...' }}
          </div>

          <!-- Texto del NPC -->
          <div class="mb-4 md:mb-6 mt-2 min-h-[3rem] md:min-h-[4rem]">
            <p class="text-sm md:text-lg text-white/90 leading-relaxed italic" v-if="!npcPending && !npcError">
              "{{ currentNpcMessage }}"
            </p>
            <div v-else-if="npcPending || dialogueStore.isPending" class="animate-pulse text-white/30 italic text-sm">Thinking...</div>
            <p v-else class="text-red-400 text-sm">Error loading NPC dialogue.</p>
          </div>

          <!-- Input del Jugador -->
          <div class="input-wrapper relative flex items-center" :class="{ 'loading-glow': dialogueStore.isPending }">
            <input 
              v-model="playerMessage"
              @keyup.enter="sendMessage"
              type="text" 
              :disabled="dialogueStore.isPending"
              placeholder="Your answer..." 
              class="player-input w-full"
            />
            <button 
              @click="sendMessage"
              :disabled="dialogueStore.isPending"
              class="send-btn px-4 md:px-6"
            >
              <span v-if="!dialogueStore.isPending" class="text-xs md:text-sm">Send</span>
              <span v-else class="flex gap-1"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile adjustments for Safary / iOS toolbar padding */
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
