/* eslint-env node */
module.exports = {
    'root': true,
    'extends': [
        'plugin:vue/vue3-essential',
        'plugin:json/recommended',
        'eslint:recommended'
    ],
    'env': {
        'node': true,
        'vue/setup-compiler-macros': true
    },
    'rules': {
        'no-unused-vars': 1,
        'quotes': [2, 'single'],
        'vue/multi-word-component-names': 0,
    }
}
