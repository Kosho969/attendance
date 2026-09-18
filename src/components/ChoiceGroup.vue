<script setup>
defineProps({
  modelValue: { type: [String, Number, Boolean, null], default: null },
  options: { type: Array, required: true }, // [{ value, label }]
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-wrap gap-2" role="radiogroup">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      class="rounded-lg px-3.5 py-2 text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      :class="
        modelValue === option.value
          ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
      "
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
