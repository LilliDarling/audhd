<template>
  <div
    class="flex items-center border-b border-pop-secondary shadow-sm lg:shadow-none h-16 gap-x-4 sm:gap-x-6 px-4 sm:px-6 lg:px-0"
  >
    <!-- Collapsed Sidebar -->
    <button
      type="button"
      class="-m-2.5 p-2.5 text-pop-secondary lg:hidden"
      @click="sidebarOpen = true"
    >
      <span class="sr-only">Open sidebar</span>
      <i
        class="fa-solid fa-bars text-pop-secondary mt-1 text-2xl"
        aria-hidden="true"
      ></i>
    </button>

    <!-- Separator small screen-->
    <div class="h-6 w-px bg-pop-secondary lg:hidden" aria-hidden="true" />
    <!-- End Collapsed Sidebar -->

    <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <!-- Search  -->
      <form class="relative flex flex-1 m-1" action="#" method="GET">
        <label for="search-field" class="sr-only">Search</label>
        <i
          class="fa-solid fa-magnifying-glass text-pop-secondary pointer-events-none absolute inset-y-5 left-2 text-lg"
          aria-hidden="true"
        ></i>
        <input
          id="search-field"
          class="block h-full w-full pl-10 pr-0 text-pop-secondary placeholder:text-pop-secondary focus:ring-0 sm:text-sm bg-primary border-2 border-secondary/20 rounded-md"
          placeholder="Search ..."
          type="search"
          name="search"
        />
      </form>
      <!-- End Search -->

      <div class="flex items-center gap-x-4 lg:gap-x-6">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-pop-secondary hover:text-secondary"
        >
          <span class="sr-only">View notifications</span>
          <i
            class="fa-regular fa-bell fa-shake text-pop-secondary mt-1 text-xl"
            style="
              --fa-animation-delay: 10s;
              --fa-animation-duration: 3s;
              --fa-animation-iteration-count: 1;
            "
            aria-hidden="true"
          ></i>
        </button>

        <!-- Separator large screen -->
        <div
          class="hidden lg:block lg:h-6 lg:w-px lg:bg-pop-secondary"
          aria-hidden="true"
        />

        <ProfileButton />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ProfileButton from "@/components/identity/ProfileButton.vue";

const sidebarOpen = ref(false);
</script>
