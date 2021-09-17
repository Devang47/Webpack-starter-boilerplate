const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const ip = require("internal-ip");
const portFinderSync = require("portfinder-sync");

const infoColor = (_message) => {
  return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`;
};

module.exports = merge(commonConfiguration, {
  mode: "development",
  devServer: {
    port: portFinderSync.getPort(8080),
    static: {
      //   contentBase: "./dist",
    },
    open: true,
    https: false,
    host: "0.0.0.0",
    allowedHosts: "all",
    hot: true,
    onAfterSetupMiddleware: function (devServer) {

    },
  },
});
