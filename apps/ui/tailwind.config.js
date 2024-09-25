const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--vscode-input-background)',
        //Default VSC colors
        'vsc-foreground': 'var(--vscode-foreground)',
        'vsc-disabledForeground': 'var(--vscode-disabledForeground)',
        'vsc-errorForeground': 'var(--vscode-errorForeground)',
        'vsc-input-background': 'var(--vscode-input-background)',
        'vsc-input-foreground': 'var(--vscode-input-foreground)',
        'vsc-descriptionForeground': 'var(--vscode-descriptionForeground)',
        'vsc-debugTokenExpression-name':
          'var(--vscode-debugTokenExpression-name)',
        'vsc-debugTokenExpression-type':
          'var(--vscode-debugTokenExpression-type)',
        'vsc-debugTokenExpression-value':
          'var(--vscode-debugTokenExpression-value)',
        'vsc-debugTokenExpression-string':
          'var(--vscode-debugTokenExpression-string)',
        'vsc-debugTokenExpression-boolean':
          'var(--vscode-debugTokenExpression-boolean)',
        'vsc-debugTokenExpression-number':
          'var(--vscode-debugTokenExpression-number)',
        'vsc-debugTokenExpression-error':
          'var(--vscode-debugTokenExpression-error)',
      },
    },
  },
  plugins: [],
};
