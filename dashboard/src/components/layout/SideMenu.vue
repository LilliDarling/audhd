<template>
  <div
    class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-pop-secondary bg-primary px-2"
  >
    <div class="flex m-4 shrink-0 justify-center">
      <img
        src="/landing.png"
        alt="logo"
        class="w-full p-2 rounded-md bg-pop-secondary/90 dark:bg-pop-secondary/90"
      />

      <!-- <span class="border-b border-pop-secondary text-pop-secondary ml-4">
        AdeptExec | AI
      </span> -->
    </div>

    <SideNavigation
      :level="1"
      :primary_items="primary_navigation"
      :secondary_items="secondary_navigation"
    />
  </div>
</template>

<script setup lang="ts">
import { primary_navigation, secondary_navigation } from "@/helpers/navigation";
import SideNavigation from "./SideNavigation.vue";
</script>
