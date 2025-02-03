<template>
  <footer>
    <div
      class="px-4 py-8 md:flex md:items-center md:justify-between text-pop-secondary"
    >
      <div class="flex justify-center space-x-6 md:order-2">
        <a
          v-for="item in socials"
          :key="item.name"
          :href="item.href"
          class="hover:text-pop-primary text-lg"
          target="_blank"
        >
          <span class="sr-only">{{ item.name }}</span>
          <span :class="item.icon"></span>
        </a>
      </div>

      <div class="md:order-1 mt-5 md:mt-0">
        <p class="text-center text-sm leading-5">
          <i class="fa-regular fa-copyright"></i> 2024 - Present. All rights
          reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// https://fontawesome.com/search
const socials = [
  {
    name: "website",
    href: "https://www.adeptexec.com/",
    icon: "fa-solid fa-globe",
  },
  {
    name: "GitHub",
    href: "https://github.com/XXXXXX",
    icon: "fa-brands fa-github",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/adeptexec/",
    icon: "fa-brands fa-linkedin",
  },
  {
    name: "X",
    href: "https://x.com/XXXXX",
    icon: "fa-brands fa-twitter",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/XXXXX",
    icon: "fa-brands fa-instagram",
  },
  // {
  //   name: "facebook",
  //   href: "https://discord.gg/XXXXXX",
  //   icon: "fa-brands fa-facebook",
  // },
  // {
  //   name: "Discord",
  //   href: "https://discord.gg/XXXXXX",
  //   icon: "fa-brands fa-discord",
  // },
  // {
  //   name: "YouTube",
  //   href: "https://www.youtube.com/XXXXX",
  //   icon: "fa-brands fa-youtube",
  // },
];
</script>
