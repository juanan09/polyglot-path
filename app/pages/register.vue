<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { usePlayerStore } from '~/stores/player'

const auth = useAuthStore()
const player = usePlayerStore()
const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)

useHead({
  title: 'Register | The Polyglot Path',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap' }
  ]
})

const handleRegister = async () => {
  localError.value = null

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    localError.value = 'Password must be at least 6 characters'
    return
  }

  const success = await auth.register(email.value, password.value, name.value)
  if (success) {
    // Sincronizar el progreso que tenía como invitado a la nueva cuenta
    await player.saveToServer()
    await router.push('/')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="scanlines" aria-hidden="true" />
    <div class="stars" aria-hidden="true">
      <span
        v-for="n in 40"
        :key="n"
        class="star"
        :style="`--x:${(n * 17 % 100)}%;--y:${(n * 31 % 100)}%;--d:${((n % 3) + 1.5).toFixed(1)}s;--s:${((n % 2) + 1)}px`"
      />
    </div>

    <!-- Navigation -->
    <div class="nav-header">
      <NuxtLink to="/" class="home-nav-btn group">
        <UIcon name="i-heroicons-home-solid" class="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>RETURN TO START</span>
      </NuxtLink>
    </div>

    <div class="auth-page-content">
      <div class="auth-container">
        <div class="auth-card">
          <div class="card-top-bar" />

          <h1 class="auth-title">⚔ REGISTER ⚔</h1>
          <p class="auth-subtitle">Create your adventurer profile</p>

          <form class="auth-form" @submit.prevent="handleRegister">
            <div class="form-group">
              <label class="form-label" for="reg-name">NAME</label>
              <input
                id="reg-name"
                v-model="name"
                type="text"
                class="form-input"
                placeholder="Your adventurer name"
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">EMAIL</label>
              <input
                id="reg-email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="hero@eldoria.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">PASSWORD</label>
              <input
                id="reg-password"
                v-model="password"
                type="password"
                class="form-input"
                placeholder="Min. 6 characters"
                required
                autocomplete="new-password"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm">CONFIRM PASSWORD</label>
              <input
                id="reg-confirm"
                v-model="confirmPassword"
                type="password"
                class="form-input"
                placeholder="Repeat password"
                required
                autocomplete="new-password"
              />
            </div>

            <p v-if="localError || auth.error" class="auth-error">
              {{ localError || auth.error }}
            </p>

            <button
              type="submit"
              class="auth-btn"
              :disabled="auth.isLoading"
            >
              {{ auth.isLoading ? 'CREATING...' : '▶ CREATE ADVENTURER' }}
            </button>
          </form>

          <div class="auth-links">
            <span class="auth-link-text">Already have an account?</span>
            <NuxtLink to="/login" class="auth-link">LOGIN</NuxtLink>
          </div>

          <div class="auth-links" style="margin-top: 0.5rem;">
            <NuxtLink to="/" class="auth-link auth-link--guest">▶ PLAY AS GUEST</NuxtLink>
          </div>

          <div class="card-bottom-bar" />
        </div>
      </div>
    </div>
    <RetroFooter />
  </div>
</template>


