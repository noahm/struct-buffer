const path = require("path");

// umd build

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    filename: "struct-buffer.js",
    path: path.resolve(__dirname, "dist/umd"),
    library: {
      name: "StructBuffer",
      type: "umd",
    },
    globalObject: "this",
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  experiments: { topLevelAwait: true },
};
