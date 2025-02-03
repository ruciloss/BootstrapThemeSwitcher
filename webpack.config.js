const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = [
    {
        watch: true,
        watchOptions: {
            ignored: /node_modules/,
        },
        mode: 'production',
        entry: './src/index.js',
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
        plugins: [
            new webpack.BannerPlugin({
            banner: 
`Bootstrap Theme Toggler
 
You can easily switch between light and dark modes. 
The theme can be set automatically based on the system's preference and will remember the user's choice. 
Using Bootstrap's dropdown menu, users can select their preferred theme, and Bootstrap Icons can be included for an enhanced visual experience.

@author Ruciloss
@version 1.0.0
@license MIT
@see {@link https://ruciloss.github.io}
 
@requires Bootstrap 5.2 or later
Build date: ${new Date().toLocaleString()}`,
            }),
        ],        
    },
];
