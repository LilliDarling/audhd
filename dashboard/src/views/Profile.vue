<template>
  <PageDivisionLayout>
    <template #divisionTitle> Profile </template>
    <template #divisionContent>
      <div v-if="!isLoading">
        <pre
          class="mt-10 p-5 text-primary bg-pop-secondary rounded-md overflow-x-auto"
          >{{ user }}</pre
        >
      </div>
    </template>
  </PageDivisionLayout>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import PageDivisionLayout from "@/components/layout/PageDivisionLayout.vue";

const { user, isLoading } = useAuth0();
</script>
