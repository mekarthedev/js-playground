const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  output: {
    path: path.resolve(__dirname, 'outputs'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({template: "./src/index.html"})
  ]
}
