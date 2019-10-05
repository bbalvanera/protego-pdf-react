module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    strict: 'off',
    'linebreak-style': ['warn', 'windows'],
    'arrow-parens': 'off',
    'max-len': ['warn', { code: 140 }],
    'no-unused-expressions': ['warn', { allowTernary: true }],
    'no-console': ['error', { allow: ['info', 'error'] }],
  },
};
