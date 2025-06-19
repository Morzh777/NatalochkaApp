import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';

export default tseslint.config(
  // Игнорировать эти файлы
  {
    ignores: ['eslint.config.mjs', 'dist'],
  },

  // Базовые рекомендованные правила от ESLint
  eslint.configs.recommended,

  // Рекомендованные правила для TypeScript с проверкой типов
  ...tseslint.configs.recommendedTypeChecked,

  // Интеграция с Prettier
  eslintPluginPrettierRecommended,

  // Настройки языка и глобальных переменных
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Правила для проекта
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',       // Разрешаем any (для старта проектов)
      '@typescript-eslint/no-floating-promises': 'warn', // Предупреждаем об неотловленных промисах
      '@typescript-eslint/no-unsafe-argument': 'warn',   // Предупреждаем об опасных аргументах
      'import/order': [                                  // Красивый порядок импортов
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
    },
  },
);
