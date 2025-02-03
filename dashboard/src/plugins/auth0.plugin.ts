import { createAuth0, type Auth0VueClientOptions } from "@auth0/auth0-vue";
import CONFIG from "@/helpers/config";

const { AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID } = CONFIG;

const auth0_configs: Auth0VueClientOptions = {
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  cacheLocation: "localstorage",
  authorizationParams: {
    audience: AUTH0_AUDIENCE,
    redirect_uri: window.location.origin,
  },
};

export default createAuth0(auth0_configs);
