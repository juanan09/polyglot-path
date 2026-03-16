<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import type { NPC } from '../../../types/game'

const player = usePlayerStore()

// Props opcionales
const props = defineProps<{
  npcId?: string
}>()

const targetNpcId = computed(() => props.npcId || 'guard')
const playerMessage = ref('')

// Cargar datos reales del NPC de forma asíncrona pero reactiva
const { data: npcData, pending, error } = await useFetch<NPC>(() => `/api/npc/${targetNpcId.value}`)

// Mensaje actual
const currentNpcMessage = computed(() => {
  if (pending.value) return 'Loading...'
  if (error.value || !npcData.value) return 'The NPC does not seem to want to talk right now...'
  return npcData.value.initial_phrases[0]
})

const sendMessage = () => {
  if (!playerMessage.value.trim()) return
  console.log('Mensaje enviado:', playerMessage.value)
  
  if (playerMessage.value.toLowerCase().includes('bakery')) {
    player.addXp(10)
    player.addToInventory('bread')
  }
  
  playerMessage.value = ''
}
</script>

<template>
  <!-- Z-Index alto para asegurar interacción -->
  <div class="dialogue-wrapper fixed bottom-0 left-0 w-full p-6 animate-slide-up">
    <div class="max-w-5xl mx-auto flex gap-6 items-end">
      
      <!-- Retrato eliminado para evitar duplicidad según feedback del usuario -->

      <!-- Caja de Diálogo -->
      <div class="flex-1 bg-glass rounded-3xl border p-6 shadow-2xl relative">
        <!-- Nombre del NPC -->
        <div class="name-tag absolute px-4 py-1 bg-gold text-bg-dark rounded-full text-sm font-bold shadow-lg">
          {{ npcData?.name || 'Loading...' }}
        </div>

        <!-- Texto del NPC -->
        <div class="mb-6 mt-2 min-h-[4rem]">
          <p class="text-lg text-white/90 leading-relaxed italic" v-if="!pending && !error">
            "{{ currentNpcMessage }}"
          </p>
          <div v-else-if="pending" class="animate-pulse text-white/30 italic">Thinking...</div>
          <p v-else class="text-red-400">Error loading NPC dialogue.</p>
        </div>

        <!-- Input del Jugador -->
        <div class="input-wrapper relative flex items-center">
          <input 
            v-model="playerMessage"
            @keyup.enter="sendMessage"
            type="text" 
            placeholder="Type your message in English..." 
            class="player-input w-full"
          />
          <button 
            @click="sendMessage"
            class="send-btn"
          >
            Send
          </button>
        </div>
        
        <div class="mt-3 flex gap-4 hint-text uppercase tracking-widest font-bold px-2">
          <span>Press ENTER to send</span>
          <span class="dot-separator">•</span>
          <span>Hint: "Where is the bakery?"</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialogue-wrapper {
  z-index: 1000;
}

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
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-wrapper:focus-within {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.1);
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
}

.send-btn:hover {
  background-color: var(--color-parchment);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.send-btn:active {
  transform: translateY(0);
}

.hint-text {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.dot-separator {
  color: rgba(251, 191, 36, 0.5);
}

.text-bg-dark {
  color: var(--color-bg-dark);
}

.text-red-400 {
  color: #f87171;
}

.min-h-\[4rem\] { min-height: 4rem; }
</style>
