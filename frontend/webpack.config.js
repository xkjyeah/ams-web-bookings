const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')

const defaultExport = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: path.resolve('./www/dist'),
    publicPath: 'dist/',
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: 'style-loader!css-loader!sass-loader'
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
    ],
  },
  mode: process.env.NODE_ENV || 'development',
  plugins: [
    new VueLoaderPlugin()
  ]
};

// The other files:
module.exports = defaultExport
