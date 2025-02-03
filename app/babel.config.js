module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins:
      [
        '@babel/plugin-transform-runtime',
        // [
        //   '@tamagui/babel-plugin',
        //   {
        //     components: ['tamagui'],
        //     config: './tamagui.config.ts',
        //     logTimings: true,
        //     disableExtraction: process.env.NODE_ENV === 'development',
        //   },
        // ],
        ['module-resolver', {
          root: ['./'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json'
          ],
          alias: {
            '@': './',
            '@shared': './shared',
            '@screens': './shared/screens'
          }
        }],
      ]
  };
};