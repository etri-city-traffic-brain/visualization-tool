module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module"
  },
  extends: [
    // add more generic rulesets here, such as:
    "eslint:recommended",
    // 'plugin:vue/essential',
    "plugin:vue/base"
    // 'airbnb-base'
  ],
  rules: {
    indent: ["error", 2],
    "import/no-unresolved": 0,
    "prefer-destructuring": 0,
    "no-param-reassign": 0
  }
};
