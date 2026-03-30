<script setup lang="ts">
import { useTelemetryStore } from '@/stores/telemetry'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const telemetry = useTelemetryStore()
const auth = useAuthStore()
const player = usePlayerStore()
const router = useRouter()

onMounted(async () => {
  document.documentElement.style.overflowY = 'auto'
  if (auth.isAuthenticated) {
    await telemetry.fetchTelemetry()
  }
})


function goBack() {
  router.push(player.currentLocationId ? '/game' : '/')
}

const words = computed(() => telemetry.allVocabulary.filter(v => v.wordType === 'word'))
const phrases = computed(() => telemetry.allVocabulary.filter(v => v.wordType === 'phrase'))
const phrasalVerbs = computed(() => telemetry.allVocabulary.filter(v => v.wordType === 'phrasal_verb'))


useHead({ title: 'Learning Codex | The Polyglot Path' })
</script>

<template>
  <div class="telemetry-page text-white  ">
    <!-- Botón volver: sticky y alineado con el contenido -->
      <div class="max-w-5xl mx-auto px-4 py-6">
        <button @click="goBack" class="home-btn group shadow-lg pointer-events-auto relative">
          <div class="btn-content">
            <UIcon name="i-heroicons-arrow-left" class="text-secondary group-hover:text-amber-400 transition-colors" />
            <span class="label">BACK</span>
          </div>
        </button>
      </div>

    <div class="telemetry-container max-w-5xl mx-auto px-4 pb-12 flex flex-col gap-12">

      <!-- Título -->
      <div class="flex flex-col items-center text-center gap-2 animate-fade-in pt-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Learning <span class="text-amber-400">Codex</span>
        </h1>
        <p class="text-slate-400 max-w-lg">
          Log of conversational missions, unlocked vocabulary, and linguistic accuracy.
        </p>
      </div>

      <!-- Banner Invitado -->
      <UAlert
        v-if="!auth.isAuthenticated"
        icon="i-heroicons-exclamation-triangle-solid"
        color="warning"
        variant="subtle"
        title="Guest Session"
        description="You are playing as a guest. This data is saved in local memory and will be lost when you close the tab. Sign up to save your academic progress permanently."
        :actions="[{ label: 'Create Account', variant: 'solid', onClick: () => { router.push('/register') } }]"
        class="animate-slide-up bg-amber-500/10 border-amber-500/20"
      />

      <!-- Quick Stats -->
      <div class="stats-grid animate-slide-up" style="animation-delay: 0.1s">
        <div class="stat-box">
          <span class="stat-label">Grammar Accuracy</span>
          <span class="stat-value">{{ (telemetry.averageScore * 100).toFixed(0) }}%</span>
          <div class=" h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div
              class=" bg-amber-400 transition-all duration-1000"
              :style="{ width: `${telemetry.averageScore * 100}%` }"
            />
          </div>
        </div>
        <div class="stat-box">
          <span class="stat-label">Master Vocabulary</span>
          <span class="stat-value">{{ telemetry.allVocabulary.length }}</span>
          <p class="text-xs text-slate-500 mt-2">Words and phrases used successfully</p>
        </div>
        <div class="stat-box">
          <span class="stat-label">Interactions</span>
          <span class="stat-value">{{ telemetry.serverData?.performance.totalInteractions || telemetry.sessionVocabulary.length + 5 }}</span>
          <p class="text-xs text-slate-500 mt-2">NPC Exchanges</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-slide-up" style="animation-delay: 0.2s">

        <!-- Vocabulary Panel -->
        <div class="lg:col-span-2 flex flex-col gap-6 p-4 ">
          <div class="telemetry-card  p-2 overflow-hidden ">
            <UCollapsible default-open class="">
              <template #default="{ open }">
                <div class="flex items-center justify-between  cursor-pointer hover:bg-white/5  rounded-t-[24px] transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                      <UIcon name="i-heroicons-book-open" class="text-amber-400 w-6 h-6" />
                    </div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-2xl font-bold">
                        <span class="text-amber-400">Discovered</span> Vocabulary
                      </h2>
                      <UBadge
                        :label="telemetry.allVocabulary.length"
                        color="warning"
                        variant="soft"
                        size="sm"
                        class="tabular-nums"
                      />
                    </div>
                  </div>
                  <UIcon
                    :name="open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="text-slate-400 w-6 h-6 transition-transform duration-300"
                  />
                </div>
              </template>

              <template #content>
                <!-- ScrollArea solo para el vocabulario, altura máxima -->
                  <div class="vocabulary-section p-2 pt-0 flex flex-col gap-8">

                    <!-- Words -->
                    <div v-if="words.length" class="vocabulary-group">
                      <div class="group-title">
                        <UIcon name="i-heroicons-tag" class="text-slate-400 w-4 h-4" />
                        Words
                        <UBadge :label="words.length" color="neutral" variant="subtle" size="xs" />
                      </div>
                      <TransitionGroup name="word" tag="div" class="vocabulary-list">
                        <UBadge                        
                          v-for="v in words"
                          :key="v.word"
                          :label="v.word"
                          color="neutral"
                          variant="soft"
                          size="md"
                          class="rounded-lg px-4 py-1.5 border border-white/5 hover:border-amber-500/50 transition-colors cursor-default"
                        />
                      </TransitionGroup>
                    </div>

                    <!-- Expressions -->
                    <div v-if="phrases.length" class="vocabulary-group">
                      <div class="group-title">
                        <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="text-slate-400 w-4 h-4" />
                        Expressions
                        <UBadge :label="phrases.length" color="info" variant="subtle" size="xs" />
                      </div>
                      <TransitionGroup name="word" tag="div" class="vocabulary-list">
                        <UBadge
                          v-for="v in phrases"
                          :key="v.word"
                          :label="v.word"
                          color="info"
                          variant="soft"
                          size="md"
                          class="rounded-lg px-4 py-1.5 border border-blue-500/10 hover:border-blue-400/50 transition-colors cursor-default"
                        />
                      </TransitionGroup>
                    </div>

                    <!-- Phrasal Verbs -->
                    <div v-if="phrasalVerbs.length" class="vocabulary-group">
                      <div class="group-title">
                        <UIcon name="i-heroicons-sparkles" class="text-slate-400 w-4 h-4" />
                        Phrasal Verbs
                        <UBadge :label="phrasalVerbs.length" color="warning" variant="subtle" size="xs" />
                      </div>
                      <TransitionGroup name="word" tag="div" class="vocabulary-list">
                        <UBadge
                          v-for="v in phrasalVerbs"
                          :key="v.word"
                          :label="v.word"
                          color="warning"
                          variant="soft"
                          size="md"
                          class="rounded-lg px-4 py-1.5 border border-amber-500/10 hover:border-amber-400/50 transition-colors cursor-default"
                        />
                      </TransitionGroup>
                    </div>

                    <!-- Empty state -->
                    <div v-if="telemetry.allVocabulary.length === 0" class="flex flex-col items-center py-20 text-center opacity-40">
                      <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 mb-4" />
                      <p>You haven't discovered new vocabulary yet.<br>Talk to an NPC in the game!</p>
                    </div>

                  </div>
              </template>
            </UCollapsible>
          </div>
        </div>

        <!-- Errors Panel -->
        <div class="lg:col-span-1 p-4 " >
          <div class="telemetry-card  p-2 overflow-hidden">
            <UCollapsible default-open class="">
              <template #default="{ open }">
                <div class="flex items-center justify-between  cursor-pointer hover:bg-white/5 rounded-t-[24px] transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                      <UIcon name="i-heroicons-clipboard-document-check" class="text-red-400 w-6 h-6" />
                    </div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-2xl font-bold">
                        Mistakes <span class="text-red-400">Log</span>
                      </h2>
                      <UBadge
                        v-if="telemetry.allErrors.length"
                        :label="telemetry.allErrors.length"
                        color="error"
                        variant="soft"
                        size="sm"
                        class="tabular-nums"
                      />
                    </div>
                  </div>
                  <UIcon
                    :name="open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="text-slate-400 w-6 h-6 transition-transform duration-300"
                  />
                </div>
              </template>

              <template #content>
                <!-- ScrollArea solo para los errores -->
                  <div class="error-list p-8 pt-0 pr-2">
                    <div
                      v-for="(err, idx) in telemetry.allErrors"
                      :key="idx"
                      class="error-item group hover:bg-red-500/10 transition-colors"
                    >
                      <p class="error-text text-slate-100">{{ err }}</p>
                    </div>

                    <div v-if="telemetry.allErrors.length === 0" class="flex flex-col items-center py-10 text-center opacity-40">
                      <UIcon name="i-heroicons-check-circle" class="w-12 h-12 mb-4 text-green-400" />
                      <p>Your grammar is impeccable (for now).<br>No errors have been recorded.</p>
                    </div>
                  </div>
              </template>
            </UCollapsible>
          </div>
        </div>
      </div>
    </div>

    <UToaster />
  </div>
</template>

