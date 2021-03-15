const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

/**
 * Determine base path where the application is hosted. Essentially for hosting
 * the application in a subdirectory, such as www.server.com/composer.
 *
 * @param {*} env - Environment configuration.
 * @return {string} - Basename used to host the application.
 */
function baseName(env) {
  if (env && env.baseName) {
    return env.baseName;
  }
  return "";
}

/**
 * Insert basename before local imports.
 *
 * @param {*} buffer JSON string buffer.
 * @param {*} env Webpack env variable collection.
 * @return {*} The modified string buffer.
 */
function modifyImportMap(buffer, env) {
  var importMapContents = JSON.parse(buffer.toString());
  if (env && env.baseName) {
    Object.keys(importMapContents.imports).forEach((k) => {
      if (importMapContents.imports[k].startsWith('/')) {
        importMapContents.imports[k] = env.baseName + importMapContents.imports[k];
      }
    })
  }
  return JSON.stringify(importMapContents);
}

module.exports = (env) => {
  const result = {
    entry: path.resolve(__dirname, "src/root-config"),
    output: {
      filename: "visdom-poc-root-config.js",
      libraryTarget: "system",
      path: path.resolve(__dirname, "dist"),
    },
    devtool: "sourcemap",
    module: {
      rules: [
        { parser: { system: false } },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [{ loader: "babel-loader" }],
        },
        {
          test: /\.(ttf|eot|svg|woff2?)$/,
          use: "url-loader?name=[name].[ext]",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    devServer: {
      historyApiFallback: true,
      disableHostCheck: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      https: true,
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: "src/importmap.json",
            to: "./",
            transform(content, path) {
              return modifyImportMap(content, env);
            },
          },
          { from: "public", to: "public" },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: false,
        template: "src/index.ejs",
        templateParameters: {
          isLocal: env && env.isLocal === "true",
          baseName: baseName(env),
        },
      }),
      new CleanWebpackPlugin(),
    ],
    externals: ["single-spa", /^@react-mf\/.+$/],
  };

  return result;
};
