const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
    entry: './client/js/app.js',
    mode: 'development',
    devServer: {
        contentBase: './public'
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'client/static'
        }]),
        new webpack.ContextReplacementPlugin(
            /moment[\/\\]locale$/, /en/
        ),
        new webpack.DefinePlugin({
            API_URL:  JSON.stringify('http://localhost:5000/api')
        })
    ],
    devtool: 'inline-source-map',
    output: {
    filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
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
