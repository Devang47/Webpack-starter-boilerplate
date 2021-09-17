const { merge } = require("webpack-merge");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "../src/index.ts"),
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.[contenthash].js",
  },
  devtool: "source-map",
  plugins: [
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, "../static") }],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/index.html"),
      minify: true,
    }),
    new MiniCssExtractPlugin(),
  ],

  module: {
    rules: [
      // HTML
      {
        test: /\.(html)$/i,
        use: ["html-loader"],
      },

      // JS
      {
        test: /\.m?js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },

      // TS
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
      },

      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },

      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/images/",
            },
          },
        ],
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/fonts/",
            },
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: [
      ".tsx",
      ".ts",
      ".js",
      ".scss",
      ".gif",
      ".png",
      ".jpg",
      ".jpeg",
      ".svg",
      ".ttf",
      ".oet",
      ".woff",
      ".woff2",
    ],
  },
};
