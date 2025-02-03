import { jwtDecode, JwtPayload } from "jwt-decode";
import { useAuth0 } from "@auth0/auth0-vue";
import { Permissions, AllRoles } from "@/helpers";

const auth_namespace = "adeptexec.com";
const su_domain = "adeptexec.com";

export interface IDecodedAccessToken extends JwtPayload {
  roles: AllRoles[];
  permissions: Permissions[];
}
// For FE with Pinia Store
export const getAccessToken = async () => {
  const { getAccessTokenSilently } = useAuth0();
  const access_token = await getAccessTokenSilently();
  return access_token;
};

export const getDecodedAccessToken = (access_token: string) => {
  // we shouldnt decode and utilize Access Token on the client side,
  // except the `permissions` are only in the access_token and not in the id_token
  const decoded_access_token: IDecodedAccessToken = jwtDecode(access_token);
  const decoded_access_token_str = JSON.stringify(
    decoded_access_token,
    null,
    2,
  );

  // console.debug('[getDecodedAccessToken]', { decoded_access_token });
  return { decoded_access_token, decoded_access_token_str };
};

export const getPermissions = () => {
  const { user_profile } = getUserProfile();
  const { permissions } = user_profile;
  return permissions;
};

export const getRoles = () => {
  const { user_profile } = getUserProfile();
  if (!user_profile) {
    return undefined;
  }
  const roles = user_profile[`${auth_namespace}/roles`];
  return roles;
};

export const isSecurityTeamMember = () => {
  const { user_profile } = getUserProfile();
  const condition = user_profile?.email.split("@")[1] === su_domain;
  return condition;
};

export const isOrgMemeber = () => {
  const { user_profile } = getUserProfile();
  const condition = user_profile?.org_name !== undefined;
  return condition;
};

export const getIdToken = () => {
  // console.debug('[getIdToken]');

  const { idTokenClaims } = useAuth0();
  const id_token = idTokenClaims?.value?.__raw ?? "";

  return id_token;
};

export const getUserProfile = () => {
  // console.debug('[getUserProfile]');

  const auth0 = useAuth0();
  const user = auth0.user.value;

  if (user && Object.keys(user).length > 0) {
    const decoded_id_token_str = user ? JSON.stringify(user, null, 2) : "";
    const user_profile = JSON.parse(decoded_id_token_str || "{}"); // interface IUserInfo
    // console.debug('[getUserProfile]', { user_profile });
    return { user_profile, decoded_id_token_str };
  } else {
    return { user_profile: undefined, decoded_id_token_str: undefined };
  }
};
