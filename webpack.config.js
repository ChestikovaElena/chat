const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = (env) => {
  const isProd = env.production ? true : false;

  return {
    entry: path.resolve(__dirname, 'src/main.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[hash].js',
    },
    mode: isProd ? 'production' : 'development',
    devServer: {hot: true,open: true},
    // devServer: {port: 5050, open: true},
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader :
            {loader: 'style-loader'},
            {loader: 'css-loader'},
            {loader: 'sass-loader'},
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|wow|ico|wow2)$/i,
          //type: 'asset/resource',

          loader: 'file-loader',
          options: {
            name: 'assets/[hash].[ext]',
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[hash].css'
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
      }),
    ]
  }
  
}