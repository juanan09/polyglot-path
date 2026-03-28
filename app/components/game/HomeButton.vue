<script setup lang="ts">
/**
 * Botón con menú desplegable para navegación rápida.
 * Ofrece acceso al menú principal y al Códice de Aprendizaje (Fase 11).
 * Estilo Retro RPG (V4).
 */
const router = useRouter()

const items = [
  {
    label: 'INICIO',
    icon: 'i-heroicons-home-solid',
    onSelect: () => router.push('/')
  },
  {
    label: 'CODICE APRENDIZAJE',
    icon: 'i-heroicons-academic-cap-solid',
    onSelect: () => router.push('/telemetry')
  }
]
</script>

<template>
  <UDropdownMenu 
    :items="items" 
    :ui="{ 
      content: 'bg-[#0d1220] border-2 border-[#c9a84c] rounded-none p-1 min-w-48 shadow-[4px_4px_0_rgba(0,0,0,0.5)]',
      item: 'group flex items-center gap-3 px-3 py-2 text-white hover:bg-[#c9a84c] hover:text-[#0d1220] cursor-pointer transition-none',
      itemLeadingIcon: 'w-5 h-5 text-[#c9a84c] group-hover:text-[#0d1220]',
    }"
  >
    <button class="home-btn group" title="Navegación">
      <div class="btn-content">
        <span class="label">HUD</span>
        <UIcon name="i-heroicons-chevron-down" class="text-white/50 w-3 h-3 group-hover:text-amber-400 transition-colors" />
      </div>
    </button>

    <template #item-label="{ item }">
      <span class="retro-font text-lg tracking-wider">{{ item.label }}</span>
    </template>
  </UDropdownMenu>
</template>

<style scoped>
.retro-font {
  font-family: 'VT323', monospace;
}
</style>
