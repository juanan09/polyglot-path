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
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #0a0a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'VT323', monospace;
}

.nav-header {
  position: absolute;
  top: 2.5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 50;
}

.home-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #00ff88;
  text-decoration: none;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.6rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 4px;
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 1px;
}

.home-nav-btn:hover {
  background: rgba(0, 255, 136, 0.15);
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.home-nav-btn span {
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,100,0.03) 2px, rgba(0,255,100,0.03) 4px);
  pointer-events: none;
  z-index: 100;
}

.stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--s);
  height: var(--s);
  background: #fff;
  border-radius: 50%;
  animation: starPulse var(--d) ease-in-out infinite alternate;
}

@keyframes starPulse {
  0% { opacity: 0.2; }
  100% { opacity: 0.9; }
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  padding: 1rem;
}

.auth-card {
  background: linear-gradient(180deg, rgba(20,20,45,0.95), rgba(10,10,30,0.98));
  border: 2px solid #00ff88;
  border-radius: 4px;
  padding: 2.5rem 2rem;
  box-shadow: 0 0 30px rgba(0,255,136,0.15), inset 0 0 20px rgba(0,0,0,0.5);
  position: relative;
}

.card-top-bar, .card-bottom-bar {
  height: 4px;
  background: repeating-linear-gradient(90deg, #00ff88 0, #00ff88 8px, transparent 8px, transparent 12px);
  margin: -0.5rem -0.5rem 1.5rem;
}

.card-bottom-bar {
  margin: 1.5rem -0.5rem -0.5rem;
}

.auth-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 1.2rem;
  color: #00ff88;
  text-align: center;
  text-shadow: 0 0 10px #00ff88;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1.1rem;
  color: #8899aa;
  text-align: center;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  color: #00e5ff;
  letter-spacing: 2px;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.6rem;
}

.form-input {
  background: rgba(0,0,0,0.4);
  border: 1px solid #334;
  border-radius: 3px;
  padding: 0.8rem 1rem;
  color: #e0e0e0;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #00ff88;
  box-shadow: 0 0 8px rgba(0,255,136,0.3);
}

.form-input::placeholder {
  color: #445;
}

.auth-error {
  color: #ff4d6d;
  font-size: 1rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255,77,109,0.1);
  border: 1px solid rgba(255,77,109,0.3);
  border-radius: 3px;
}

.auth-btn {
  background: linear-gradient(180deg, #1a3a2a, #0d2218);
  border: 2px solid #00ff88;
  color: #00ff88;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.7rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  letter-spacing: 1px;
}

.auth-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #2a5a3a, #1a3a28);
  box-shadow: 0 0 15px rgba(0,255,136,0.3);
  transform: translateY(-1px);
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.auth-link-text {
  color: #667;
  font-size: 1rem;
}

.auth-link {
  color: #00e5ff;
  text-decoration: none;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.6rem;
  transition: text-shadow 0.2s;
}

.auth-link:hover {
  text-shadow: 0 0 8px #00e5ff;
}

.auth-link--guest {
  color: #ffe033;
  font-size: 0.6rem;
}

.auth-link--guest:hover {
  text-shadow: 0 0 8px #ffe033;
}

/* ── RESPONSIVE ── */
@media (max-width: 480px) {
  .nav-header {
    top: 1.5rem;
    padding: 0 1rem;
  }
  
  .home-nav-btn {
    font-size: 0.5rem;
    padding: 0.5rem 0.85rem;
    width: 100%;
    justify-content: center;
  }

  .auth-container {
    padding: 0.75rem;
    padding-top: 5rem;
  }

  .auth-card {
    padding: 1.75rem 1.25rem;
  }

  .auth-title {
    font-size: 0.9rem;
  }

  .auth-subtitle {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .form-input {
    font-size: 1.1rem;
    padding: 0.7rem;
  }

  .auth-btn {
    font-size: 0.6rem;
    padding: 0.85rem;
  }

  .auth-link-text, .auth-link, .auth-link--guest {
    font-size: 0.55rem;
  }
}
</style>
