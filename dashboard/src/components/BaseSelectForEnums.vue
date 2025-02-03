<template>
  <label class="block mb-2 text-sm font-medium leading-6 text-pop-secondary">
    {{ label }}
  </label>
  <select
    :value="modelValue"
    v-bind="$attrs"
    @change="handleChange"
    class="h-10 p-4"
  >
    <option v-for="(option, i) in options" :key="i" :value="option">
      {{ option }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { Events } from "@/helpers/index";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number],
    required: true,
    default: "",
  },
  options: {
    type: Array,
    required: true,
    default: [],
  },
});

const emit = defineEmits([Events.UPDATE_MODEL_VALUE]);

const handleChange = (event) => {
  const selectedValue = event.target.value;
  const selectedOption = props.options.find(
    (option) => option === selectedValue,
  );
  emit(Events.UPDATE_MODEL_VALUE, selectedOption);
};
</script>
