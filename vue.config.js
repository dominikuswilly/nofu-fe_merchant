const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/', // Ensure assets are loaded from root regardless of route
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        // Define global variables - read from env with fallback defaults
        const backendUrl = process.env.VUE_APP_BACKEND_URL || 'https://apinofudev.bengkelfajarjaya.com'
        const gpsEnabled = process.env.VUE_APP_GPS_ENABLED || 'false'
        
        args[0]['process.env'].VUE_APP_BACKEND_URL = JSON.stringify(backendUrl)
        args[0]['process.env'].VUE_APP_GPS_ENABLED = JSON.stringify(gpsEnabled)
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
        target: 'https://apinofudev.bengkelfajarjaya.com',  // Your backend URL
        changeOrigin: true,  // Changes the origin of the host header to the target URL
        secure: false,  // For HTTP backends; set true for HTTPS
        logLevel: 'debug',  // Shows proxy logs in console
      },
    },
  },
})
