var webpack = require('webpack');

const defaultExport = {
  entry: './src/index.js',
  output: {
    path: './www/dist',
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
        // edit this for additional asset file types
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader?name=[name].[ext]?[hash]',
      },
      {
        test: /\.woff$|\.png$/,
        loader: 'url-loader?prefix=/&limit=10000&mimetype=application/font-woff'
      }
    ],
  },
};

if (process.env.NODE_ENV === 'production') {
  defaultExport.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ];
} else {
  defaultExport.devtool = 'source-map';
}

// The other files:
module.exports = [defaultExport]
