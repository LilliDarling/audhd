import type { NavigationGuard } from "vue-router";
import { AllRoles, userHasAllRoles, userHasAnyRoles } from "@/helpers";

export const applyRoleRouteGuard: NavigationGuard = (to, from, next) => {
  let guard_protected_routes = true;
  let role_check = false;
  const required_roles = to.meta?.roles as AllRoles[];

  if (to.meta?.roles) {
    role_check = userHasAnyRoles(required_roles);
  } else {
    role_check = userHasAllRoles(required_roles);
  }

  guard_protected_routes = !role_check;

  // console.debug("[applyRoleRouteGuard]", {
  //   role_check,
  //   required_roles,
  //   guard_protected_routes,
  // });

  if (guard_protected_routes) {
    next(to.meta.redirect as string);
  } else {
    next();
  }
};
