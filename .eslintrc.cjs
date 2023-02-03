/* eslint-env node */
module.exports = {
    "root": true,
    "extends": [
        "plugin:vue/vue3-essential",
        "eslint:recommended"
    ],
    "env": {
        "node": true,
        "vue/setup-compiler-macros": true
    },
    "rules": {
        "no-unused-vars": 1,
        "vue/multi-word-component-names": 0,
    }
}
