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

<style scoped>
.home-btn {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 12px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-emoji {
  font-size: 1.25rem;
  line-height: 1;
}

.label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.1em;
}

/* Efectos Hover */
.home-btn:hover {
  background-color: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.home-btn:active {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .label { display: none; }
  .home-btn { padding: 6px 10px; }
}
</style>
