const path = require("path")
const nodeExternals = require("webpack-node-externals")

const Dotenv = require("dotenv-webpack")

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, "./src/config/.env"),
    }),
  ],
}
