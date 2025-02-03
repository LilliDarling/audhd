const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
  resolver: {
    unstable_enablePackageExports: false,
    unstable_enableSymlinks: false,
  },
});

module.exports = withNativeWind(config, { input: "./global.css" });
