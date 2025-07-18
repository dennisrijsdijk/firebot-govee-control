const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const packageJson = require("./package.json");
const DefinePlugin = require("webpack").DefinePlugin;

module.exports = {
  target: "node",
  mode: "production",
  devtool: false,
  entry: {
    main: "./src/main.ts",
  },
  output: {
    libraryTarget: "commonjs2",
    libraryExport: "default",
    path: path.resolve(__dirname, "./dist"),
    filename: `${packageJson.scriptOutputName}.js`,
  },
  plugins: [
    new DefinePlugin({
      PLUGIN_VERSION: JSON.stringify(packageJson.version),
    }),
  ],
  resolve: {
    extensions: [".ts", ".js", ".html"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
      {
        test: /\.html$/,
        loader: "html-loader",
      }
    ],
  },
  optimization: {
    minimize: process.env.NODE_ENV !== "development",

    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: /main/,
          mangle: false,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
