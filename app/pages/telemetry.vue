<script setup lang="ts">
import { useTelemetryStore } from '@/stores/telemetry'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const telemetry = useTelemetryStore()
const auth = useAuthStore()
const player = usePlayerStore()
const router = useRouter()

// Cargar datos al montar si el usuario está logueado
onMounted(async () => {
  if (auth.isAuthenticated) {
    await telemetry.fetchTelemetry()
  }
})

// Navigation
function goBack() {
  if (player.currentLocationId) {
    router.push('/game')
  } else {
    router.push('/')
  }
}

// Helpers
const words = computed(() => telemetry.allVocabulary.filter(v => v.type === 'word'))
const phrases = computed(() => telemetry.allVocabulary.filter(v => v.type === 'phrase'))
const phrasalVerbs = computed(() => telemetry.allVocabulary.filter(v => v.type === 'phrasal_verb'))

// Page metadata
useHead({
  title: 'Códice de Aprendizaje | The Polyglot Path'
})
</script>

<template>
  <div class="telemetry-page text-white overflow-y-auto w-full h-full custom-scroll">
    <!-- Navegación y Botón Volver -->
    <div class="fixed top-6 left-6 z-50">
      <button @click="goBack" class="home-btn group shadow-lg">
        <div class="btn-content">
          <UIcon name="i-heroicons-arrow-left" class="text-secondary group-hover:text-amber-400 transition-colors" />
          <span class="label">VOLVER</span>
        </div>
      </button>
    </div>

    <div class="telemetry-container max-w-5xl mx-auto px-4 py-12 flex flex-col gap-12">
      
      <!-- Título de Página -->
      <div class="flex flex-col items-center text-center gap-2 animate-fade-in pt-10">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Códice de <span class="text-amber-400">Aprendizaje</span>
        </h1>
        <p class="text-slate-400 max-w-lg">
          Registro de misiones conversacionales, vocabulario desbloqueado y precisión lingüística.
        </p>
      </div>

      <!-- Banner de Invitado -->
      <UAlert
        v-if="!auth.isAuthenticated"
        icon="i-heroicons-exclamation-triangle-solid"
        color="warning"
        variant="subtle"
        title="Sesión de Invitado"
        description="Estás jugando como invitado. Estos datos se guardan en la memoria local y se perderán al cerrar la pestaña. Regístrate para guardar tu progreso académico permanentemente."
        :actions="[{ label: 'Crear Cuenta', variant: 'solid', onClick: () => { router.push('/') } }]"
        class="animate-slide-up bg-amber-500/10 border-amber-500/20"
      />

      <!-- Quick Stats -->
      <div class="stats-grid animate-slide-up" style="animation-delay: 0.1s">
        <!-- Grammar Score -->
        <div class="stat-box">
          <span class="stat-label">Precisión Gramatical</span>
          <span class="stat-value">{{ (telemetry.averageScore * 100).toFixed(0) }}%</span>
          <div class="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div 
              class="h-full bg-amber-400 transition-all duration-1000" 
              :style="{ width: `${telemetry.averageScore * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Total Vocabulary -->
        <div class="stat-box">
          <span class="stat-label">Vocablos Maestros</span>
          <span class="stat-value">{{ telemetry.allVocabulary.length }}</span>
          <p class="text-xs text-slate-500 mt-2">Palabras y frases usadas con éxito</p>
        </div>

        <!-- Total Interactions -->
        <div class="stat-box">
          <span class="stat-label">Interacciones</span>
          <span class="stat-value">{{ telemetry.serverData?.performance.totalInteractions || telemetry.sessionVocabulary.length + 5 }}</span>
          <p class="text-xs text-slate-500 mt-2">Intercambios con NPCs</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-slide-up" style="animation-delay: 0.2s">
        
        <!-- Vocabulary Panel -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div class="telemetry-card h-full">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <UIcon name="i-heroicons-book-open" class="text-amber-400 w-6 h-6" />
              </div>
              <h2 class="text-2xl font-bold">Vocabulario <span class="text-amber-400">Descubierto</span></h2>
            </div>
            
            <!-- Grupos -->
            <div class="vocabulary-section">
              <!-- Words -->
              <div v-if="words.length" class="vocabulary-group">
                <div class="group-title">
                  <UIcon name="i-heroicons-tag" class="text-slate-400 w-4 h-4" />
                  Palabras
                </div>
                <div class="vocabulary-list">
                  <UBadge 
                    v-for="v in words" 
                    :key="v.word" 
                    color="neutral" 
                    variant="soft" 
                    size="lg"
                    class="rounded-lg px-4 py-1.5 border border-white/5 hover:border-amber-500/50 transition-colors"
                  >
                    {{ v.word }}
                  </UBadge>
                </div>
              </div>

              <!-- Phrases -->
              <div v-if="phrases.length" class="vocabulary-group">
                <div class="group-title">
                  <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="text-slate-400 w-4 h-4" />
                  Expresiones
                </div>
                <div class="vocabulary-list">
                  <UBadge 
                    v-for="v in phrases" 
                    :key="v.word" 
                    color="info" 
                    variant="soft" 
                    size="lg"
                    class="rounded-lg px-4 py-1.5 border border-blue-500/10 hover:border-blue-400/50 transition-colors"
                  >
                    {{ v.word }}
                  </UBadge>
                </div>
              </div>

              <!-- Phrasal Verbs -->
              <div v-if="phrasalVerbs.length" class="vocabulary-group">
                <div class="group-title">
                  <UIcon name="i-heroicons-sparkles" class="text-slate-400 w-4 h-4" />
                  Phrasal Verbs
                </div>
                <div class="vocabulary-list">
                  <UBadge 
                    v-for="v in phrasalVerbs" 
                    :key="v.word" 
                    color="primary" 
                    variant="soft" 
                    size="lg"
                    class="rounded-lg px-4 py-1.5 border border-teal-500/10 hover:border-teal-400/50 transition-colors"
                  >
                    {{ v.word }}
                  </UBadge>
                </div>
              </div>

              <div v-if="telemetry.allVocabulary.length === 0" class="flex flex-col items-center py-20 text-center opacity-40">
                <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 mb-4" />
                <p>Aún no has descubierto vocabulario nuevo.<br>¡Habla con algún NPC en el juego!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Errors Panel -->
        <div class="lg:col-span-1">
          <div class="telemetry-card h-full">
             <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <UIcon name="i-heroicons-clipboard-document-check" class="text-red-400 w-6 h-6" />
              </div>
              <h2 class="text-2xl font-bold">Bitácora de <span class="text-red-400">Deslices</span></h2>
            </div>

            <div class="error-list">
              <div v-for="(err, idx) in telemetry.allErrors" :key="idx" class="error-item group hover:bg-red-500/10 transition-colors">
                <UIcon name="i-heroicons-x-circle-solid" class="error-marker" />
                <div class="flex flex-col">
                  <p class="error-text text-slate-100">{{ err }}</p>
                </div>
              </div>

              <div v-if="telemetry.allErrors.length === 0" class="flex flex-col items-center py-10 text-center opacity-40">
                <UIcon name="i-heroicons-check-circle" class="w-12 h-12 mb-4 text-green-400" />
                <p>Tu gramática es impecable (por ahora).<br>No se han registrado errores.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Viñeta global -->
    <div class="pointer-events-none fixed inset-0 z-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] opacity-40"></div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.3);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.6);
}
</style>
