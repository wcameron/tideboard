const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


module.exports = {
    entry: './client/js/app.js',
    mode: 'production',
    devServer: {
        contentBase: './public'
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'client/static'
        }]),
        new UglifyJsPlugin({
            uglifyOptions: {
                ecma: 8,
                mangle: true
            },
            sourceMap: true
        }),
        new webpack.ContextReplacementPlugin(
            /moment[\/\\]locale$/, /en/
        ),
        new webpack.DefinePlugin({
            API_URL: JSON.stringify('/api')
        })
    ],
    devtool: 'source-map',
    output: {
        filename: 'bundle.js',
        sourceMapFilename: 'bundle.map',
        path: path.resolve(__dirname, 'public')
    },
    resolve: {
        alias: {
            'moment-timezone': path.resolve(__dirname, 'node_modules/moment-timezone')
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ]
            },
            {
                test: /\.woff$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 50000,
                    }
                }
            }
        ]
    }
};
