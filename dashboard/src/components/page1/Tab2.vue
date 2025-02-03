<template>
  <PageDivisionLayout>
    <template #divisionTitle>{{ title }}</template>
    <template #divisionContent> </template>
  </PageDivisionLayout>
</template>

<script setup lang="ts">
import PageDivisionLayout from "@/components/layout/PageDivisionLayout.vue";
defineProps<{
  title: string;
}>();
</script>
