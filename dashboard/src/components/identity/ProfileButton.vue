<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="hidden sm:inline-flex justify-center gap-x-3 rounded-md p-4 text-sm bg-primary hover:bg-pop-secondary text-pop-secondary hover:text-primary"
    >
      <img
        class="inline-block h-6 w-6 rounded-full"
        :src="user?.picture"
        alt="User Profile Picture"
      />
      {{ user?.name }}
      <i
        class="fa-solid fa-chevron-down mt-1 text-pop-secondary text-sm"
        aria-hidden="true"
      ></i>
    </MenuButton>
    <MenuButton class="sm:hidden">
      <!-- Other options https://fontawesome.com/search?q=profile&o=a&m=free -->
      <i
        class="fa-solid fa-address-card mt-1 text-pop-secondary text-3xl"
        aria-hidden="true"
      ></i>
    </MenuButton>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 z-10 mt-5 sm:mt-2 w-56 rounded-md origin-top-right divide-y divide-pop-secondary bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <MenuItem v-for="item in user_navigation" :key="item.name">
          <a
            :href="`/${item.name.toLowerCase()}`"
            class="block w-full p-3 rounded-md bg-primary hover:bg-pop-secondary text-pop-secondary hover:text-primary text-sm"
          >
            <div class="flow-root">
              <p class="float-left">
                <i
                  :class="item.icon"
                  class="text-lg mx-1 shrink-0"
                  aria-hidden="true"
                ></i>
              </p>
              <p class="float-right pt-1">{{ item.name }}</p>
            </div>
          </a>
        </MenuItem>

        <MenuItem>
          <span
            class="block w-full p-3 rounded-md cursor-pointer bg-primary hover:bg-pop-secondary text-pop-secondary hover:text-primary text-sm"
          >
            <ThemeToggle />
          </span>
        </MenuItem>

        <MenuItem>
          <button
            @click="handleLogout"
            class="block w-full p-3 rounded-md bg-primary hover:bg-pop-secondary text-pop-secondary hover:text-primary text-sm"
          >
            <div class="flow-root">
              <p class="float-left">
                <i
                  class="fa-solid fa-arrow-right-from-bracket ml-1 mt-1 text-lg"
                  aria-hidden="true"
                ></i>
              </p>
              <p class="float-right pt-1">Sign Out</p>
            </div>
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDark } from "@vueuse/core";
import { useAuth0 } from "@auth0/auth0-vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { user_navigation } from "@/helpers/navigation";
import ThemeToggle from "@/components/ThemeToggle.vue";

const isDark = useDark(); // DO NOT DELETE THIS
const auth0 = useAuth0();
const { logout } = auth0;

const user = computed(() => {
  return auth0.user.value;
});

const handleLogout = () => {
  // TODO: clear all the pinia stores here
  logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};
</script>
