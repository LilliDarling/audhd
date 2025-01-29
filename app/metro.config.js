const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, {
  resolver: {
    unstable_enablePackageExports: false,
    unstable_enableSymlinks: false,
  },
});


module.exports = withNativeWind(config, { input: "./global.css" });