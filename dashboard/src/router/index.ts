import { kebabCase } from "lodash";
import { createRouter, createWebHistory } from "vue-router";
import {
  primary_navigation,
  secondary_navigation,
  user_navigation,
} from "@/helpers/index";
import { applyRoleRouteGuard } from "@/helpers/index";
import { authGuard } from "@auth0/auth0-vue";

const NotAllowed = () => import("@/views/common/NotAllowed.vue");
const NotFoundPage = () => import("@/views/common/NotFound.vue");
const Landing = () => import("@/views/common/LandingPage.vue");

const static_routes = [
  {
    path: "/",
    name: "LandingPage",
    component: Landing,
  },
  {
    path: "/not-allowed",
    name: "NotAllowed",
    component: NotAllowed,
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFoundPage,
  },
];

const dynamic_routes = [];
for (const [index, route] of [
  ...primary_navigation,
  ...secondary_navigation,
].entries()) {
  const routeJson = {
    path: `/${kebabCase(route.name)}`,
    name: route.name,
    component: () => import(`@/views/${route.page}.vue`),
    meta: {
      redirect: "/not-allowed",
      roles: route.roles,
    },
    beforeEnter: [authGuard, applyRoleRouteGuard],
  };
  dynamic_routes.push(routeJson);
}

for (const route of user_navigation) {
  const routeJson = {
    path: `/${route.name.toLowerCase()}`,
    name: route.name,
    component: () => import(`@/views/${route.name.replace(" ", "")}.vue`),
    beforeEnter: [authGuard],
  };
  dynamic_routes.push(routeJson);
}

const routes = [...static_routes, ...dynamic_routes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
