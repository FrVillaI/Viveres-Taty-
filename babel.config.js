module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        ['babel-plugin-dotenv-import', {
            moduleName: '@env',
            path: '.env',
            safe: false,
            allowUndefined: true
        }]
    ]
};
