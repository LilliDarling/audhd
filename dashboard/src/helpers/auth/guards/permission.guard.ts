import type { NavigationGuard } from "vue-router";

import { getPermissions, Permissions } from "@/helpers";

export const applyPermissionRouteGuard: NavigationGuard = (to, from, next) => {
  let guard_protected_routes = true;
  const user_permissions = getPermissions();
  const required_permissions = to.meta.permissions as Permissions[];

  let permission_check = true;
  if (to.meta.has_any_permissions) {
    permission_check = required_permissions.some((permission) =>
      user_permissions?.includes(permission),
    );
  } else {
    permission_check = required_permissions.every((permission) =>
      user_permissions?.includes(permission),
    );
  }

  guard_protected_routes = !permission_check;

  // console.debug("[applyPermissionRouteGuard]", {
  //   user_permissions,
  //   required_permissions,
  //   permission_check,
  //   guard_protected_routes,
  // });

  if (guard_protected_routes) {
    next(to.meta.redirect as string);
  } else {
    next();
  }
};
