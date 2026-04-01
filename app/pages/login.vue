<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

useHead({
  title: 'Login | The Polyglot Path',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap' }
  ]
})

const handleLogin = async () => {
  const success = await auth.login(email.value, password.value)
  if (success) {
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

          <h1 class="auth-title">⚔ LOGIN ⚔</h1>
          <p class="auth-subtitle">Enter your credentials, adventurer</p>

          <form class="auth-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label" for="login-email">EMAIL</label>
              <input
                id="login-email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="hero@eldoria.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">PASSWORD</label>
              <input
                id="login-password"
                v-model="password"
                type="password"
                class="form-input"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>

            <p v-if="auth.error" class="auth-error">{{ auth.error }}</p>

            <button
              type="submit"
              class="auth-btn"
              :disabled="auth.isLoading"
            >
              {{ auth.isLoading ? 'LOADING...' : '▶ ENTER THE REALM' }}
            </button>
          </form>

          <div class="auth-links">
            <span class="auth-link-text">No account yet?</span>
            <NuxtLink to="/register" class="auth-link">CREATE ONE</NuxtLink>
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


