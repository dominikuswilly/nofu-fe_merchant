const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/', // Ensure assets are loaded from root regardless of route
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        // Define global variables explicitly
        args[0]['process.env'].VUE_APP_BACKEND_URL = JSON.stringify('https://merchantdev.bengkelfajarjaya.com/api/customer')
        args[0]['process.env'].VUE_APP_GPS_ENABLED = JSON.stringify('false') // Set to 'true' to enable GPS requirement
        return args
      })
  },
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    proxy: {
      '/api/customer': {  // Proxy any /api/* calls
        target: 'https://merchantdev.bengkelfajarjaya.com/api/customer',  // Your backend URL
        changeOrigin: true,  // Changes the origin of the host header to the target URL
        secure: false,  // For HTTP backends; set true for HTTPS
        logLevel: 'debug',  // Shows proxy logs in console
      },
    },
  },
})
