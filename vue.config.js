const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    proxy: {
      '/api/customer': {  // Proxy any /api/* calls
        target: 'http://kopinofu.com/api/customer',  // Your backend URL
        changeOrigin: true,  // Changes the origin of the host header to the target URL
        secure: false,  // For HTTP backends; set true for HTTPS
        logLevel: 'debug',  // Shows proxy logs in console
      },
    },
  },
})
