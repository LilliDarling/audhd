const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, {
  resolver: {
    unstable_enablePackageExports: true,
    unstable_enableSymlinks: true,
  }
});

module.exports = withNativeWind(config, { input: "./global.css" });