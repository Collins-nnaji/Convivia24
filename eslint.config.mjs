import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: { '@typescript-eslint/no-explicit-any': 'warn', '@typescript-eslint/no-unused-vars': 'warn', 'react-hooks/set-state-in-effect': 'off', 'react-hooks/refs': 'off', 'react-hooks/purity': 'off', 'react-hooks/immutability': 'off', 'react-hooks/preserve-manual-memoization': 'off' } },
  globalIgnores(['.next/**','node_modules/**','android/**','ios/**','next-env.d.ts']),
]);
