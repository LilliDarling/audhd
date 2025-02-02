const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
  resolver: {
    unstable_enablePackageExports: true,
    unstable_enableSymlinks: true,
  }
});

module.exports = withNativeWind(config, { input: "./global.css" });
