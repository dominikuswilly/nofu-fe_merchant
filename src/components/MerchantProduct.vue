<template>
  <div class="merchant-product">
    <div v-if="loading" class="state-message">
      <div class="loader"></div>
      <p>Memuat data produk...</p>
    </div>

    <div v-else-if="error" class="state-message error">
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="retry-btn">Coba Lagi</button>
    </div>

    <div v-else-if="products.length === 0" class="state-message">
      <p>Tidak ada produk yang ditemukan.</p>
    </div>

    <div v-else class="product-table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th class="text-right">Stok</th>
            <th class="text-right">Harga</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="product in products" 
            :key="product.id || product.id_product"
            :class="{ 'low-stock': (product.stock || product.qty) < 10 }"
          >
            <td>{{ product.name || product.product_name }}</td>
            <td class="text-right">{{ product.stock || product.qty || 0 }}</td>
            <td class="text-right">{{ formatCurrency(product.price || product.product_price || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { transactionApi } from '@/utils/api'
import { getMerchantId } from '@/utils/auth'

const products = ref([])
const loading = ref(false)
const error = ref(null)

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Get merchant_id from JWT token
    const merchantId = getMerchantId()
    
    if (!merchantId) {
      error.value = 'Merchant ID tidak ditemukan. Silakan login kembali.'
      loading.value = false
      return
    }
    
    // Call transaction stock endpoint with merchant_id
    const response = await transactionApi.get(`/stock?merchant_id=${merchantId}`)
    
    console.log('Transaction API Response (Product):', response)
    
    // Based on api-usage-example.js, we expect a response structure
    if (response.responseCode === "200" || response.status === "success" || Array.isArray(response.data)) {
      // Check for stockDetail in response.data (new format) or direct array (legacy)
      const dataObj = response.data || response || {}
      const rawData = Array.isArray(dataObj.stockDetail) 
        ? dataObj.stockDetail 
        : (Array.isArray(dataObj) ? dataObj : [])

      if (Array.isArray(rawData)) {
        products.value = rawData.map(p => ({
          ...p,
          id: p.productId || p.id || p.id_product,
          name: p.productName || p.name || p.product_name,
          price: p.priceSell || p.price || p.product_price || 0,
          stock: p.qty || p.stock || 0,
          image: p.productImage || p.url || p.image || p.image_url || p.product_image || null
        }))
        console.log('MerchantProduct: Loaded products from transaction API:', products.value.length)
        if (products.value.length > 0) {
          console.log('Sample product mapping (Product):', {
            raw: rawData[0],
            mapped: products.value[0]
          })
        }
      }
    } else if (Array.isArray(response)) {
      products.value = response.map(p => ({
        ...p,
        id: p.id || p.id_product,
        name: p.name || p.product_name,
        price: p.price || p.product_price || 0,
        stock: p.stock || p.qty || 0,
        image: p.url || p.image || p.image_url || p.product_image || null
      }))
    } else {
      error.value = response.responseMessage || 'Gagal memuat data produk'
    }
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Terjadi kesalahan saat memuat data produk'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.merchant-product {
  width: 100%;
}

.product-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.product-table th {
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9em;
  white-space: nowrap;
}

.product-table tr:last-child td {
  border-bottom: none;
}

.product-table td {
  color: #2d3748;
  font-size: 0.95em;
}

.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: #718096;
}

.state-message.error {
  color: #e53e3e;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #5a67d8;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.text-right {
  text-align: right;
}

/* Low stock warning */
.low-stock {
  background-color: #fffbeb; /* Yellow-50 equivalent */
}

.low-stock:hover {
  background-color: #fef3c7; /* Yellow-100 */
}

.product-img-mini-container {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
}

.product-img-mini {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder-mini {
  font-size: 1.2em;
}
</style>
