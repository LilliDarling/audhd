import { AllRoles } from "@/helpers";
import { getRoles } from ".";

export const userHasAllRoles = (all_required_roles: AllRoles[]) => {
  const user_roles = getRoles();
  const user_has_role = all_required_roles?.every((role) =>
    user_roles?.includes(role),
  );

  // console.debug(`[userHasAllRoles]`, {
  //   all_required_roles,
  //   user_roles,
  //   user_has_role,
  // });
  return user_has_role;
};

export const userHasAnyRoles = (any_required_roles: AllRoles[]) => {
  const user_roles = getRoles();
  const user_has_role = any_required_roles.some((role) =>
    user_roles?.includes(role),
  );

  // console.debug(`[userHasAnyRoles]`, {
  //   any_required_roles,
  //   user_roles,
  //   user_has_role,
  // });
  return user_has_role;
};
