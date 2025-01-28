<template>
  <div
    @click="toggleDark()"
    class="flow-root text-pop-secondary hover:text-primary"
  >
    <p class="float-left mr-4">
      <component
        v-if="is_dark"
        :is="MoonIcon"
        class="w-6 shrink-0"
        aria-hidden="true"
      />
      <component
        v-if="!is_dark"
        :is="SunIcon"
        class="w-6 shrink-0"
        aria-hidden="true"
      />
    </p>
    <p class="float-right pt-1">{{ is_dark ? "Go Light" : "Go Dark" }} Theme</p>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { MoonIcon, SunIcon } from "@heroicons/vue/24/outline";

const is_dark = useDark();
const toggleDark = useToggle(is_dark);
</script>
