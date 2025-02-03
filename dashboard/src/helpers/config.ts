/**
 * Config file
 * @summary This file should contain all the central configuration variables for the whole project.
 * @howToUse Define the general name of the variable, map that name on the LOCAL, DEV, RC, PROD sections to map the right value from Doppler
 * @return Config JS standard object
 */

const CONFIGS = {
  [import.meta.env.VITE_LOCAL_DOMAIN]: {
    AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID_MGNT_API: import.meta.env.VITE_AUTH0_CLIENT_ID_MGNT_API,
    AUTH0_CLIENT_SECRET_MGNT_API: import.meta.env
      .VITE_AUTH0_CLIENT_SECRET_MGNT_API,
  },
};

const VITE_CONFIG = CONFIGS[import.meta.env.VITE_LOCAL_DOMAIN];
const CONFIG = {
  ...VITE_CONFIG,
  IS_PROD: window.location.origin === import.meta.env.VITE_PROD_DOMAIN,
  IS_DEV: window.location.origin === import.meta.env.VITE_DEV_DOMAIN,
};

export default CONFIG;
