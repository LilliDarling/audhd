<template>
  <!-- the X value needs to match b/w the lg:w-X of the side column and the lg:pl-X of the main column -->

  <!-- Side Column -->
  <div
    v-if="isAuthenticated"
    class="hidden lg:fixed lg:flex lg:flex-col lg:inset-y-0 lg:z-50 lg:w-80"
  >
    <SideMenu />
  </div>

  <!-- Main Column  -->
  <div
    class="flex flex-col h-screen justify-between"
    :class="isAuthenticated ? 'lg:pl-80' : ''"
  >
    <div v-if="isAuthenticated" class="sticky top-0 z-40 lg:px-8">
      <TopMenu />
    </div>
    <main
      class="mb-auto mx-auto w-full py-10 px-4 sm:px-6 lg:px-44 overflow-auto scrollbar"
    >
      <router-view v-if="!isLoading" />
    </main>

    <div class="sticky border-t-2 z-40 mx-8 border-pop-secondary">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import SideMenu from "./SideMenu.vue";
import TopMenu from "./TopMenu.vue";
import Footer from "./Footer.vue";

const { isLoading, isAuthenticated } = useAuth0();
</script>
