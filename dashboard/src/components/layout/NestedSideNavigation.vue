<template>
  <!-- https://iriscompanyio.medium.com/how-to-build-recursive-side-navbar-menu-component-with-vue-3-e87878fb94b6 -->
  <ul>
    <li v-for="item in items" :key="item.name">
      <details>
        <summary class="flex max-w-xs my-1 text-left group">
          <div
            class="items-center flow-root w-full gap-0 py-1 rounded-md cursor-pointer"
          >
            <div
              class="float-left"
              :class="item.items.length === 0 ? 'w-full' : 'w-[90%]'"
            >
              <a
                :href="item.name.toLowerCase()"
                :class="[
                  item.current
                    ? 'bg-primary text-pop-secondary'
                    : 'text-pop-secondary hover:bg-secondary hover:text-white',
                  'group flex gap-x-3 rounded-md py-2 text-sm font-semibold leading-6',
                ]"
              >
                <div class="flex group">
                  <i
                    :class="item.icon"
                    class="text-lg mx-3 shrink-0"
                    aria-hidden="true"
                  ></i>

                  {{ item.name }}
                </div>
              </a>
            </div>

            <div class="float-right" v-if="item.items && item.items.length > 0">
              <i
                class="fa-solid fa-chevron-down mt-3 text-pop-secondary"
                aria-hidden="true"
              ></i>
            </div>
          </div>
        </summary>
        <div>
          <RecursiveSidebar
            v-if="item.items && item.items.length > 0"
            :items="item.items"
            :level="level + 1"
            class="ml-8"
          />
        </div>
      </details>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Item } from "@/helpers/index";
import RecursiveSidebar from "./SideNavigation.vue";

const { items } = defineProps<{
  level: number;
  items: Item[];
}>();
</script>
