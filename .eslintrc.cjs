module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        "@typescript-eslint/no-this-alias": "off",
        "no-unused-vars": ["error", { "argsIgnorePattern": "_\\w*" }],
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "_\\w*" }]
    }
};