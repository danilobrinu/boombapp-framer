const path = require('path')

const SOURCE_PATH = path.join(__dirname, '/app')
const DISTRIBUTION_PATH = path.join(__dirname, '/dist')
const FRAMER_PATH = path.join(DISTRIBUTION_PATH, '/framer')

module.exports = {
  entry: './app/index.js',

  output: {
    path: FRAMER_PATH,
    filename: 'framer.generated.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },

  devServer: {
    contentBase: DISTRIBUTION_PATH,
    publicPath: '/framer',
    compress: true,
    port: 3000
  }
}
