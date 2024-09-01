const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
    {
        watch: true,
        watchOptions: {
            ignored: /node_modules/,
        },
        mode: 'production',
        entry: './src/bootstrap-theme-toggler.js',
        output: {
            filename: 'bootstrap-theme-toggler.min.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'module',
            },
            globalObject: 'this',
            libraryTarget: 'module',
        },
        experiments: {
            outputModule: true,
        },
        optimization: {
            minimizer: [new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    mangle: {
                        properties: {
                            regex: /^_/ 
                        },
                        keep_classnames: false,
                        keep_fnames: false
                    },
                },
            })],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', { targets: 'defaults' }],
                            ],
                        },
                    },
                },
            ],
        },
    },
];
