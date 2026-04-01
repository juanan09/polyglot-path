<script setup lang="ts">
interface ItemData {
  id: string
  name: string
  icon: string
  type: string
  description: string
}

const props = defineProps<{ itemId: string }>()

// Fetch item by ID without await to avoid requiring Suspense and render image immediately
const { data: itemData } = useFetch<ItemData>(`/api/item/${props.itemId}`)
</script>

<template>
  <div class="inventory-item-icon-wrapper w-full flex justify-center animate-fade-up">
    <!-- Restore the UPopover as it was, but adjusting position for the top bar -->
    <UPopover mode="hover" :popper="{ placement: 'bottom', arrow: true, offsetDistance: 12 }" :ui="{ content: 'bg-transparent ring-0 shadow-none z-[1000]' }" class="w-full flex justify-center">
      
      <!-- Trigger: Image only (64px) -->
      <div 
        class="item-container rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner group transition-all hover:border-gold hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] cursor-help shrink-0"
        style="width: 64px; height: 64px; min-width: 64px;"
      >
        <!-- Icon loaded from JSON -->
        <img 
          v-if="itemData && itemData.icon"
          :src="itemData.icon" 
          :alt="itemData.name" 
          class="object-contain drop-shadow-md transition-transform group-hover:scale-125 duration-300 pointer-events-none" 
          style="width: 48px; height: 48px; max-width: 48px;"
        />
        <!-- Loader while downloading JSON -->
        <UIcon v-else name="i-heroicons-arrow-path" class="text-white/30 animate-spin" style="width: 24px; height: 24px;" />
      </div>

      <!-- Hover Panel with dark blue gradient background (project style) -->
      <template #content>
        <div v-if="itemData" class="p-4 w-60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative animate-fade-in ring-1 ring-amber-500/10" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 1) 100%);">
          <h4 class="text-white font-extrabold text-sm tracking-tight">{{ itemData.name }}</h4>
          <span class="text-[9px] text-amber-400 uppercase font-black tracking-widest block ">{{ itemData.type }}</span>
          <div class="w-full h-px bg-white/10 "></div>
          <p class="text-[11px] text-slate-300 leading-relaxed italic">"{{ itemData.description }}"</p>
          
          <!-- Indicator triangle with same base color -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e293b] rotate-45 border-t border-l border-white/20"></div>
        </div>
      </template>
      
    </UPopover>
  </div>
</template>


