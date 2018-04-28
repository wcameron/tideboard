const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


module.exports = {
  entry: './client/js/app.js',
  devServer: {
      contentBase: './public'
  },
  plugins: [
        new CopyWebpackPlugin([{
            from: 'client/static'
        }]),
        new UglifyJsPlugin()
    ],
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')
  }
};
