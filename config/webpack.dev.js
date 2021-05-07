// webpack.dev.js
const { merge } = require("webpack-merge");
const base = require("./webpack.base");

module.exports = merge(base, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    open: false,
    port: 8888,
    historyApiFallback: true,
    hot: true,
  },
  
});
