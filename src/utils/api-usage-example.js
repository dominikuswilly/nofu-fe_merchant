/**
 * Example: Using the API utility to fetch merchant products
 * 
 * This is an example of how to update components to use authenticated API requests.
 * When you're ready to connect to real backend endpoints, use this pattern.
 */

import { ref, onMounted } from 'vue'
import { get, post } from '@/utils/api'

export default {
  name: 'ProductExample',
  setup() {
    const products = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Fetch products when component mounts
    const fetchProducts = async () => {
      loading.value = true
      error.value = null

      try {
        // The token will be automatically added by the API utility
        const response = await get('/merchants/123/products')
        
        // Handle the response format from your backend
        if (response.responseCode === "200" && response.data) {
          products.value = response.data
        } else {
          error.value = response.responseMessage || 'Failed to load products'
        }
      } catch (err) {
        error.value = err.message || 'Failed to load products'
        console.error('Error fetching products:', err)
      } finally {
        loading.value = false
      }
    }

    // Create a new transaction
    const createTransaction = async (transactionData) => {
      try {
        const response = await post('/merchants/123/transactions', {
          customerId: transactionData.customerId,
          items: transactionData.items,
          totalAmount: transactionData.totalAmount
        })

        if (response.responseCode === "200") {
          return response.data
        } else {
          throw new Error(response.responseMessage || 'Transaction failed')
        }
      } catch (err) {
        console.error('Error creating transaction:', err)
        throw err
      }
    }

    onMounted(() => {
      fetchProducts()
    })

    return {
      products,
      loading,
      error,
      fetchProducts,
      createTransaction
    }
  }
}
