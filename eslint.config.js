const js = require('@eslint/js');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  js.configs.recommended,
  prettierRecommended,
  {
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
    },
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        console: 'readonly',
      },
    },
  },
];
