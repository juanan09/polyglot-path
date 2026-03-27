<script setup lang="ts">
interface ItemData {
  id: string
  name: string
  icon: string
  type: string
  description: string
}

const props = defineProps<{ itemId: string }>()

// Fetch del item por ID sin await para no requerir Suspense y renderizar la imagen inmediatamente
const { data: itemData } = useFetch<ItemData>(`/api/item/${props.itemId}`)
</script>

<template>
  <div class="inventory-item-icon-wrapper w-full flex justify-center animate-fade-up">
    <UPopover mode="hover" :popper="{ placement: 'left', arrow: true }" :ui="{ content: 'bg-transparent ring-0 shadow-none' }" class="w-full flex justify-center">
      
      <!-- Trigger: Solo la imagen -->
      <div 
        class="item-container rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner group transition-all hover:border-gold hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] cursor-help shrink-0"
        style="width: 64px; height: 64px; min-width: 64px;"
      >
        <!-- Icono cargado desde el JSON -->
        <img 
          v-if="itemData && itemData.icon"
          :src="itemData.icon" 
          :alt="itemData.name" 
          class="object-contain drop-shadow-md transition-transform group-hover:scale-125 duration-300 pointer-events-none" 
          style="width: 48px; height: 48px; max-width: 48px;"
        />
        <!-- Loader mientras descarga el JSON -->
        <UIcon v-else name="i-heroicons-arrow-path" class="text-white/30 animate-spin" style="width: 24px; height: 24px;" />
      </div>

      <!-- Panel Hover (Name, Type, Description) -->
      <template #content>
        <div v-show="itemData" class="p-3 w-48 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl relative">
          <h4 class="text-white font-bold text-sm mb-0.5 tracking-tight">{{ itemData?.name || props.itemId?.replace(/_/g, ' ') }}</h4>
          <span class="text-[9px] text-gold uppercase font-bold tracking-widest block mb-2">{{ itemData?.type || 'item' }}</span>
          <div class="w-full h-px bg-white/10 mb-2"></div>
          <p class="text-xs text-slate-300 leading-relaxed">{{ itemData?.description || 'No description available for this item.' }}</p>
        </div>
      </template>
      
    </UPopover>
  </div>
</template>
