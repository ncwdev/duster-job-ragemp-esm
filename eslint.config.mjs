import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
    {files: ['**/*.{js,mjs,cjs,vue}']},
    {files: ['**/*.js'], languageOptions: {sourceType: 'module'}},
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                mp: 'readonly',
                rpc: 'readonly',
                dbg: 'readonly',
            }
        }
    },
    {
        files: ['client_packages/**/*.js'],
        languageOptions: {
            globals: {
                localPlayer: 'readonly',
                outputChatBox: 'readonly',
                notify: 'readonly',
            }
        }
    },
    {
        rules: {
            semi: 'error',
            quotes: ['error', 'single'],
            'prefer-const': 'error',
            'eol-last': 'error',
            'no-multiple-empty-lines': ['error', {'max': 1}],
            'brace-style': ['error', '1tbs'],
            'indent': ['error', 4, {'SwitchCase': 1}],
            'no-trailing-spaces': 'error',
            'padded-blocks': ['error', { 'classes': 'never' }],
            'no-multi-spaces': ['error', { exceptions: { 'Property': false } }],
            'key-spacing': ['error'],
            'spaced-comment': ['error', 'always', { 'exceptions': ['-', '+'] }],
            camelcase: 'error',
            'space-infix-ops': 'error',
        }
    },
    pluginJs.configs.recommended,
    ...pluginVue.configs['flat/essential'],
];
