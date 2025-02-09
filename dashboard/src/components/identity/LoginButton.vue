<template>
  <button
    class="text-2xl rounded-xl w-40 h-16 hover:border-transparent bg-pop-primary/90 dark:bg-pop-secondary/90 text-white hover:text-pop-secondary dark:hover:text-primary"
    @click="handleLogin"
  >
    Log In
  </button>
</template>

<script setup lang="ts">
import { kebabCase } from "lodash";
import { useAuth0 } from "@auth0/auth0-vue";
import { primary_navigation } from "@/helpers/index";

const { loginWithRedirect } = useAuth0();
const home_page = primary_navigation.find((n) => n.page === "Page1");

const handleLogin = () => {
  loginWithRedirect({
    appState: {
      target: `/${kebabCase(home_page.name)}`,
    },
    authorizationParams: {
      prompt: "login",
    },
  });
};
</script>


// 9Gjic4TTOyjQSe