<script setup lang="ts">
/**
 * Botón con menú desplegable para navegación rápida.
 * Ofrece acceso al menú principal y al Códice de Aprendizaje (Fase 11).
 * Estilo Retro RPG (V4).
 */
const router = useRouter()

const items = [
  {
    label: 'HOME',
    icon: 'i-heroicons-home-solid',
    onSelect: () => router.push('/')
  },
  {
    label: 'LEARNING CODEX',
    icon: 'i-heroicons-academic-cap-solid',
    onSelect: () => router.push('/telemetry')
  }
]
</script>

<template>
  <UDropdownMenu 
    :items="items" 
    :ui="{ 
      content: 'bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 min-w-52 shadow-2xl z-[1000]',
      item: 'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg select-none outline-none text-white/80 data-highlighted:bg-amber-400/20 data-highlighted:text-amber-300 transition-all cursor-pointer',
      itemLeadingIcon: 'w-4 h-4 text-white/60 group-data-highlighted:text-amber-400',
    }"
  >
    <button class="home-btn group" title="Navegación">
      <div class="btn-content">
        <span class="label">Menu</span>
        <UIcon name="i-heroicons-chevron-down" class="text-white/50 w-3 h-3 group-hover:text-amber-400 transition-colors" />
      </div>
    </button>

    <template #item-label="{ item }">
      <span class="label tracking-widest">{{ item.label }}</span>
    </template>
  </UDropdownMenu>
</template>

<style scoped>
/* Estilos locales vacíos o movidos al CSS */
</style>
