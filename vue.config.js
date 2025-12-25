const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/', // Ensure assets are loaded from root regardless of route
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        // Define global variables - read from env with fallback defaults
        const backendUrl = process.env.VUE_APP_BACKEND_URL || 'https://apinofudev.bengkelfajarjaya.com/api'
        const customerApiUrl = process.env.VUE_APP_CUSTOMER_API_URL || `${backendUrl}/customer`
        const productApiUrl = process.env.VUE_APP_PRODUCT_API_URL || `${backendUrl}/product`
        const transactionApiUrl = process.env.VUE_APP_TRANSACTION_API_URL || `${backendUrl}/transaction`
        const gpsEnabled = process.env.VUE_APP_GPS_ENABLED || 'false'
        
        args[0]['process.env'].VUE_APP_BACKEND_URL = JSON.stringify(backendUrl)
        args[0]['process.env'].VUE_APP_CUSTOMER_API_URL = JSON.stringify(customerApiUrl)
        args[0]['process.env'].VUE_APP_PRODUCT_API_URL = JSON.stringify(productApiUrl)
        args[0]['process.env'].VUE_APP_TRANSACTION_API_URL = JSON.stringify(transactionApiUrl)
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
      '/api/customer': {
        target: 'https://apinofudev.bengkelfajarjaya.com',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      '/api/product': {
        target: 'https://apinofudev.bengkelfajarjaya.com',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      '/api/transaction': {
        target: 'https://apinofudev.bengkelfajarjaya.com',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
})
