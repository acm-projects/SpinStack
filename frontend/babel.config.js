module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['module:react-native-dotenv', {
                moduleName: '@env',
                path: 'frontend\.env.d.ts',
                safe: false,        // set true if you want a .env.example check
                allowUndefined: true
            }]
        ]
    };
};
