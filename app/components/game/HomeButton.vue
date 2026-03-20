<script setup lang="ts">
/**
 * Botón simplificado para volver al menú principal.
 */
const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <button 
    @click="goHome" 
    class="home-btn group"
    title="Volver al Menú"
  >
    <div class="btn-content">
      <span class="label">MENU</span>
    </div>
  </button>
</template>
