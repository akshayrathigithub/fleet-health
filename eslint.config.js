import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'public/mockServiceWorker.js'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Two places where restating an element's native role is deliberate:
      // - <ul role="list">: Safari/VoiceOver stops announcing a list as a
      //   list once `list-style: none` is applied.
      // - table parts: some browsers drop table semantics when CSS changes
      //   `display`, which the phone card layout in DeviceTable does.
      'jsx-a11y/no-redundant-roles': [
        'error',
        { nav: ['navigation'], ul: ['list'], thead: ['rowgroup'], tbody: ['rowgroup'] },
      ],
      'jsx-a11y/no-interactive-element-to-noninteractive-role': [
        'error',
        {
          tr: ['none', 'presentation'],
          canvas: ['img'],
          th: ['columnheader', 'rowheader'],
          td: ['cell'],
        },
      ],
    },
  },
);
