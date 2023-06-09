const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = "Piping SSH";
        return args;
      });
  },
  transpileDependencies: true,
});
