module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    // '@babel/plugin-transform-classes',
    // [
    //   '@babel/preset-env',
    //   {
    //     targets: {
    //       esmodules: true
    //     }
    //   }
    // ],
    ['env', { exclude: ['transform-es2015-classes'] }]
    // [
    //   '@babel/env',
    //   {
    //     loose: true,
    //     modules: false
    //   }
    // ]
  ]
}
