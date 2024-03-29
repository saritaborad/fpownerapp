const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  parser: 'babel-eslint',
  plugins: ['prettier'],
  env: {
    browser: true,
  },
  extends: ['airbnb', 'prettier', 'prettier/react'],
  globals: {
    React: 'readable',
    grecaptcha: 'readable',
    PriceSpider: 'readable',
  },
  rules: {
    'class-methods-use-this': 0,
    'no-nested-ternary': 0,
    'linebreak-style': 0,
    'max-len': 0,
    'consistent-return': 0,
    'object-curly-newline': 0,
    'no-await-in-loop': 1,
    'no-alert': 1,
    'newline-before-return': 2,
    'no-confusing-arrow': 0,
    'no-cycle': 0,
    'no-underscore-dangle': 0,
    'react/jsx-no-bind': [0],
    'no-console': [1, { allow: ['warn', 'error', 'info'] }],
    'no-param-reassign': [2, { props: false }],
    'no-shadow': [2, { allow: ['res', 'err'] }],
    'no-use-before-define': 'off',
    'no-new': 0,
    'comma-dangle': [
      2,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'import/no-unresolved': 1,
    'import/no-extraneous-dependencies': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': [
      2,
      {
        components: ['Link'],
        specialLink: ['to', 'hrefLeft', 'hrefRight'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/label-has-for': [
      2,
      {
        required: {
          every: ['id'],
        },
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      2,
      {
        labelComponents: ['label'],
        labelAttributes: ['htmlFor'],
        controlComponents: ['input'],
      },
    ],
    'react/prop-types': 0,
    'react/require-default-props': 0,
    'react/destructuring-assignment': 0,
    'react/jsx-one-expression-per-line': [2, { allow: 'single-child' }],
    'react/no-array-index-key': 1,
    'react/no-danger': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/jsx-props-no-spreading': 0,
    'react/react-in-jsx-scope': 0,
    'react/no-did-update-set-state': 0,
    'react/state-in-constructor': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-unused-expressions': 0,
    'no-undef': 0,
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['src'],
      },
      alias: [
        ['views', './src/views'],
        ['services', './src/services'],
        ['components', './src/components'],
        ['styles', './src/styles'],
        ['helpers', './src/helpers'],
        ['assets', './src/assets'],
        ['translations', './src/translations'],
        ['interceptors', './src/interceptors'],
      ],
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'prettier', 'react-hooks', 'simple-import-sort'],
      env: {
        browser: true,
      },
      extends: [
        'airbnb',
        'airbnb/hooks',
        'prettier',
        'plugin:import/typescript',
        'plugin:react-hooks/recommended',
      ],
      globals: {
        React: 'readable',
      },
      rules: {
        'no-restricted-exports': [ERROR, { restrictedNamedExports: [] }],
        'react/function-component-definition': [
          ERROR,
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function',
          },
        ],
        'class-methods-use-this': OFF,
        'no-nested-ternary': ERROR,
        'linebreak-style': OFF,
        'max-len': OFF,
        'consistent-return': [ERROR, { treatUndefinedAsUnspecified: false }],
        'object-curly-newline': OFF,
        'no-alert': WARN,
        'newline-before-return': ERROR,
        'no-confusing-arrow': OFF,
        'import/no-cycle': ERROR,
        'no-underscore-dangle': ERROR,
        'no-console': WARN,
        'no-param-reassign': ERROR,
        'no-new': ERROR,
        'no-shadow': OFF,
        '@typescript-eslint/no-shadow': ERROR,
        'no-use-before-define': OFF,
        '@typescript-eslint/no-use-before-define': ERROR,
        'comma-dangle': [
          ERROR,
          {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
          },
        ],
        'import/no-named-as-default': OFF,
        'import/prefer-default-export': OFF,
        'import/extensions': OFF,
        'import/no-unresolved': ERROR,
        'import/no-extraneous-dependencies': OFF,
        'import/first': ERROR,
        'import/newline-after-import': ERROR,
        'import/no-absolute-path': ERROR,
        'import/no-duplicates': ERROR,
        'import/order': OFF,
        'simple-import-sort/imports': ERROR,
        'simple-import-sort/exports': ERROR,
        'jsx-a11y/click-events-have-key-events': ERROR,
        'jsx-a11y/no-noninteractive-element-interactions': ERROR,
        'jsx-a11y/anchor-is-valid': ERROR,
        'jsx-a11y/no-static-element-interactions': ERROR,
        'jsx-a11y/label-has-for': [
          ERROR,
          {
            required: {
              every: ['id'],
            },
          },
        ],
        'jsx-a11y/label-has-associated-control': ERROR,
        'react/prop-types': OFF,
        'react/require-default-props': OFF,
        'react/destructuring-assignment': ERROR,
        'react/jsx-one-expression-per-line': [WARN, { allow: 'single-child' }],
        'react/no-array-index-key': ERROR,
        'react/no-danger': ERROR,
        'react/jsx-filename-extension': [ERROR, { extensions: ['.js', '.jsx', '.tsx', '.ts'] }],
        'react/jsx-props-no-spreading': [
          WARN,
          {
            explicitSpread: 'ignore',
          },
        ],
        'react/react-in-jsx-scope': OFF,
        'react/no-did-update-set-state': OFF,
        'react/state-in-constructor': OFF,
        'no-plusplus': ERROR,
        'no-undef': ERROR,
        'no-unused-expressions': OFF,
        '@typescript-eslint/no-unused-expressions': ERROR,
        'no-unused-vars': OFF,
        '@typescript-eslint/no-unused-vars': ERROR,
        '@typescript-eslint/no-explicit-any': WARN,
        'prettier/prettier': [
          ERROR,
          {
            endOfLine: 'auto',
          },
        ],
        'array-callback-return': ERROR,
        complexity: [ERROR, 6],
        eqeqeq: ERROR,
        'max-statements': [ERROR, 10],
        'max-statements-per-line': [
          ERROR,
          {
            max: WARN,
          },
        ],
        'max-nested-callbacks': [ERROR, 3],
        'max-depth': [
          ERROR,
          {
            max: 3,
          },
        ],
        'no-eval': ERROR,
        'no-return-assign': ERROR,
        'no-var': ERROR,
        'prefer-const': ERROR,
      },
      settings: {
        'import/resolver': {
          typescript: {},
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            moduleDirectory: ['src'],
          },
        },
      },
    },
  ],
};
