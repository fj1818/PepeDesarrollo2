module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = '/mainreact/';
      return webpackConfig;
    }
  }
}; 