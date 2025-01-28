import { getPermissions } from "./token.utils";
import { Permissions } from "@/helpers";

export const userHasAllPermissions = (
  all_required_permissions: Permissions[],
) => {
  const user_permissions = getPermissions();

  const user_has_permission = all_required_permissions.every((permission) =>
    user_permissions?.includes(permission),
  );

  // console.debug(`[userHasAllPermissions]`, {
  //   user_permissions,
  //   all_required_permissions,
  //   user_has_permission,
  // });
  return user_has_permission;
};

export const userHasAnyPermissions = (
  any_required_permissions: Permissions[],
) => {
  const user_permissions = getPermissions();
  const user_has_permission = any_required_permissions.some((permission) =>
    user_permissions?.includes(permission),
  );

  // console.debug(`[userHasAnyPermissions]`, {
  //   user_permissions,
  //   any_required_permissions,
  //   user_has_permission,
  // });
  return user_has_permission;
};
