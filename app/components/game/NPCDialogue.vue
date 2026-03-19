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
  <div v-if="!player.showMissionModal" class="dialogue-wrapper fixed bottom-0 left-0 w-full p-6 animate-slide-up">
    <div class="max-w-5xl mx-auto flex flex-col gap-4">
      
      <!-- Feedback Pedagógico (Si existe) -->
      <div v-if="dialogueStore.lastResponse?.feedback" class="feedback-toast self-end animate-bounce-subtle">
        <div class="flex items-center gap-3">
          <div v-if="dialogueStore.lastResponse?.grammarScore !== undefined" class="score-badge" :class="dialogueStore.lastResponse.grammarScore > 0.7 ? 'high' : 'low'">
            {{ Math.round(dialogueStore.lastResponse.grammarScore * 100) }}%
          </div>
          <p class="text-sm font-medium text-white/90">
             ✨ {{ dialogueStore.lastResponse.feedback }}
          </p>
        </div>
      </div>
      
      <!-- Error de Validación o Red -->
      <div v-if="dialogueStore.lastError" class="error-toast self-center animate-shake">
        <p class="text-xs font-bold text-white px-4 py-2 bg-red-500/80 backdrop-blur rounded-full shadow-lg">
          ⚠️ {{ dialogueStore.lastError }}
        </p>
      </div>

      <div class="flex gap-6 items-end">
        <!-- Caja de Diálogo -->
        <div class="flex-1 bg-glass rounded-3xl border p-6 shadow-2xl relative transition-all duration-300" :class="{ 'opacity-50 pointer-events-none': dialogueStore.isPending }">
          <!-- Nombre del NPC -->
          <div class="name-tag absolute px-4 py-1 bg-gold text-bg-dark rounded-full text-sm font-bold shadow-lg">
            {{ npcData?.name || 'Loading...' }}
          </div>

          <!-- Texto del NPC -->
          <div class="mb-6 mt-2 min-h-[4rem]">
            <p class="text-lg text-white/90 leading-relaxed italic" v-if="!npcPending && !npcError">
              "{{ currentNpcMessage }}"
            </p>
            <div v-else-if="npcPending || dialogueStore.isPending" class="animate-pulse text-white/30 italic">Thinking...</div>
            <p v-else class="text-red-400">Error loading NPC dialogue.</p>
          </div>

          <!-- Input del Jugador -->
          <div class="input-wrapper relative flex items-center" :class="{ 'loading-glow': dialogueStore.isPending }">
            <input 
              v-model="playerMessage"
              @keyup.enter="sendMessage"
              type="text" 
              :disabled="dialogueStore.isPending"
              placeholder="Type your message in English..." 
              class="player-input w-full"
            />
            <button 
              @click="sendMessage"
              :disabled="dialogueStore.isPending"
              class="send-btn"
            >
              <span v-if="!dialogueStore.isPending">Send</span>
              <span v-else class="flex gap-1"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>
            </button>
          </div>
          
          <div class="mt-3 flex justify-between items-center hint-text uppercase tracking-widest font-bold px-2">
            <div class="flex gap-4">
              <span>Press ENTER to send</span>
              <span class="dot-separator">•</span>
              <span>Hint: "Where is the bakery?"</span>
            </div>
            <button 
              @click="dialogueStore.clearHistory(targetNpcId)"
              class="reset-btn hover:text-gold transition-colors"
              title="Clear all conversation memory"
            >
              Reset Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialogue-wrapper {
  z-index: 1000;
}

.feedback-toast {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 8px 16px;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.score-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
}

.score-badge.high { background: #10b981; color: white; }
.score-badge.low { background: #f59e0b; color: white; }

.name-tag {
  top: -1rem;
  left: 2rem;
  z-index: 10;
}

.input-wrapper {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 4px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.1);
}

.loading-glow {
  border-color: rgba(251, 191, 36, 0.3);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { border-color: rgba(251, 191, 36, 0.3); }
  50% { border-color: rgba(251, 191, 36, 0.6); }
  100% { border-color: rgba(251, 191, 36, 0.3); }
}

.player-input {
  background: transparent;
  border: none;
  outline: none;
  padding: 12px 20px;
  color: white;
  font-size: 1.125rem;
  flex: 1;
}

.player-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.player-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.send-btn {
  background-color: var(--color-accent-gold);
  color: var(--color-bg-dark);
  border: none;
  border-radius: 0.75rem;
  padding: 10px 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 80px;
}

.send-btn:hover:not(:disabled) {
  background-color: var(--color-parchment);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.send-btn:disabled {
  background-color: #4b5563;
  color: #9ca3af;
  cursor: not-allowed;
}

.dot {
  animation: dot-pulse 1.5s infinite;
  display: inline-block;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

.hint-text {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.dot-separator {
  color: rgba(251, 191, 36, 0.5);
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.text-bg-dark {
  color: var(--color-bg-dark);
}

.text-red-400 {
  color: #f87171;
}

.min-h-\[4rem\] { min-height: 4rem; }
.reset-btn {
  font-size: 9px;
  opacity: 0.6;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
