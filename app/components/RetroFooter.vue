<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const runtimeConfig = useRuntimeConfig()
const appVersion = runtimeConfig.public.appVersion
</script>

<template>
  <footer class="retro-footer">
    <span>© {{ new Date().getFullYear() }} POLYGLOT PATH [V{{ appVersion }}]</span>
    <span class="footer-sep">░░░</span>
    <span>DEVELOPED BY: JUAN ANTONIO SANCHEZ SANTAMARIA</span>
    <span class="footer-sep">░░░</span>
    <span>
      <NuxtLink to="/privacy" class="hover:text-amber-400 transition-colors" style="text-decoration:none; color:inherit;">
        PRIVACY POLICY
      </NuxtLink>
    </span>
    <span class="footer-sep">░░░</span>
    <span>{{ auth.isAuthenticated ? `PLAYER: ${auth.user?.name}` : 'INSERT COIN ▮' }}</span>
  </footer>
</template>

<style scoped>
/* Any additional specific styles for the component if needed */
</style>
