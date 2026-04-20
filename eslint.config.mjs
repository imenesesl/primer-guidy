import { base } from '@primer-guidy/eslint-config'

export default [
  ...base,
  {
    ignores: ['dist-landing/', '.github/'],
  },
  {
    files: [
      'apps/brain-server/**/*.module.ts',
      'apps/prompt-validation-server/**/*.module.ts',
      'libs/nest-shared/**/*.module.ts',
    ],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: [
      'apps/brain-server/**/*.{controller,service,guard}.ts',
      'apps/prompt-validation-server/**/*.{controller,service,guard}.ts',
      'libs/nest-shared/**/*.{controller,service,guard}.ts',
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
]
