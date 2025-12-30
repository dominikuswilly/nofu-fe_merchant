<template>
  <div class="merchant-restock">
    <div class="form-section">
      <h3>Permintaan Restock</h3>
      
      <!-- Input Form -->
      <div class="restock-form">
        <div class="form-row">
          <div class="form-group product-group">
            <label for="product">Pilih Produk</label>
            <select id="product" v-model="form.productId" class="input-field">
              <option value="">-- Pilih Produk --</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} (Stok: {{ product.stock }})
              </option>
            </select>
          </div>

          <div class="form-group quantity-group">
            <label for="quantity">Jumlah</label>
            <input 
              id="quantity" 
              v-model.number="form.quantity" 
              type="number" 
              min="1" 
              class="input-field"
              placeholder="Qty"
            />
          </div>
        </div>



        <button @click="addToCart" class="add-btn" :disabled="!canAdd">
          + Tambah ke Daftar
        </button>
      </div>

      <!-- Draft List (Cart) -->
      <div v-if="cart.length > 0" class="cart-section">
        <h4>Daftar Permintaan ({{ cart.length }} Item)</h4>
        <div class="cart-list">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <span class="cart-product">{{ item.productName }}</span>
              <span class="cart-details">
                {{ item.quantity }} pcs 
              </span>
            </div>
            <button @click="removeFromCart(index)" class="remove-btn" title="Hapus">
              ✕
            </button>
          </div>
        </div>
        
        <div class="cart-actions">
          <button @click="submitCart" class="submit-btn full-width">
            Kirim {{ cart.length }} Permintaan
          </button>
        </div>
      </div>
    </div>

    <div class="requests-section">
      <h3>Riwayat Permintaan</h3>
      <div v-if="restockRequests.length === 0" class="empty-state">
        Belum ada permintaan restock
      </div>
      <div v-else class="requests-list">
        <div v-for="request in restockRequests" :key="request.id" class="request-item" :class="'status-' + request.status">
          <div class="item-header">
            <div class="product-info">
              <span class="product-name">{{ request.productName }}</span>
              <span class="request-id">ID: {{ request.id }}</span>
            </div>
            <span class="status-badge" :class="request.status">
              {{ getStatusLabel(request.status) }}
            </span>
          </div>
          <div class="item-details">


            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">{{ getStatusLabel(request.status) }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Waktu:</span>
              <span class="value">{{ formatDate(request.date) }}</span>
            </div>
          </div>

          <div class="item-actions">
            <button class="action-btn-outline">Detail</button>
            <button class="action-btn-outline">History</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { transactionApi } from '@/utils/api'
import { getMerchantId } from '@/utils/auth'

// Products data
const products = ref([])
const isLoading = ref(false)
const error = ref(null)

const form = ref({
  productId: '',
  quantity: null,

})

const cart = ref([])
const restockRequests = ref([])

const fetchProducts = async () => {
  isLoading.value = true
  error.value = null
  try {
    const merchantId = getMerchantId()
    if (!merchantId) {
      throw new Error('Merchant ID not found')
    }
    
    const response = await transactionApi.get(`/stock?merchant_id=${merchantId}`)
    if (response && response.data && response.data.stockDetail) {
      products.value = response.data.stockDetail.map(item => ({
        id: item.productId,
        name: item.productName,
        stock: item.qty,
        price: parseFloat(item.priceSell || 0)
      }))
    }
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = 'Gagal memuat data produk'
  } finally {
    isLoading.value = false
  }
}

const fetchRestockList = async () => {
  try {
    const response = await transactionApi.get('/restock')
    // Handle both { data: { restockDetail: [] } } and { data: [] }
    const list = response?.data?.restockDetail || response?.data || []
    
    if (Array.isArray(list)) {
      restockRequests.value = list.map(item => ({
        id: item.id || item.transactionId || Math.random().toString(),
        productName: item.productName || item.product?.name || 'Produk',
        quantity: item.qty || item.quantity || 0,
        status: item.status || 'pending',
        date: item.tsCreatedAt || item.ts_created_at || item.createdAt || new Date().toISOString(),
        latitude: item.latitude,
        longitude: item.longitude
      }))
    }
  } catch (err) {
    console.error('Failed to fetch restock history:', err)
  }
}

onMounted(() => {
  fetchProducts()
  fetchRestockList()
})

const canAdd = computed(() => {
  return form.value.productId && form.value.quantity && form.value.quantity > 0
})

const addToCart = () => {
  // form.value.productId is now the string UUID from API
  const product = products.value.find(p => p.id === form.value.productId)
  if (!product) return

  cart.value.push({
    productId: product.id,
    productName: product.name,
    quantity: form.value.quantity,

  })

  // Reset form partialy
  form.value.productId = ''
  form.value.quantity = null

  // keep priority
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const getGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (err) => {
          reject(err)
        }
      )
    }
  })
}

const submitCart = async () => {
  if (cart.value.length === 0) return
  isLoading.value = true

  try {
    let location = { latitude: 0, longitude: 0 }
    try {
      location = await getGeolocation()
    } catch (locErr) {
      console.warn('Could not get geolocation:', locErr)
      // Proceed with 0,0 or handle as error? User example shows them included.
    }

    const payload = {
      item: cart.value.map(item => ({
        productId: item.productId,
        qty: item.quantity
      })),
      latitude: location.latitude,
      longitude: location.longitude
    }

    const response = await transactionApi.post('/restock/create', payload)
    
    if (response) {
      alert(`${cart.value.length} permintaan restock berhasil dikirim`)
      cart.value = []
      await fetchRestockList()
    }
  } catch (err) {
    console.error('Failed to submit restock:', err)
    alert('Gagal mengirim permintaan restock. Silakan coba lagi.')
  } finally {
    isLoading.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.merchant-restock {
  padding-bottom: 20px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.form-section h3 {
  margin-top: 0;
  color: #2d3748;
  margin-bottom: 20px;
}

.restock-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.product-group {
  flex: 2;
}

.quantity-group {
  flex: 1;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-btn {
  background-color: #48bb78;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.2s;
}

.add-btn:hover:not(:disabled) {
  background-color: #38a169;
}

.add-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

/* Cart Styles */
.cart-section h4 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 1em;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7fafc;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-product {
  font-weight: 600;
  color: #2d3748;
}

.cart-details {
  font-size: 0.85em;
  color: #718096;
}



.remove-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  color: #cbd5e0;
  cursor: pointer;
  padding: 4px;
}

.remove-btn:hover {
  color: #fc8181;
}

.submit-btn {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn.full-width {
  width: 100%;
}

.submit-btn:hover {
  background-color: #5a67d8;
}

/* Requests List (Existing) */
.requests-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.requests-section h3 {
  margin-top: 0;
  color: #2d3748;
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  color: #a0aec0;
  padding: 40px 20px;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  background-color: #f7fafc;
}

.request-item.status-pending {
  border-left: 4px solid #f6ad55;
}

.request-item.status-approved {
  border-left: 4px solid #48bb78;
}

.request-item.status-rejected {
  border-left: 4px solid #fc8181;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-name {
  font-weight: 600;
  color: #2d3748;
}

.request-id {
  font-size: 0.75em;
  color: #a0aec0;
  font-family: monospace;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fef5e7;
  color: #d97706;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9em;
}

.detail-row {
  display: flex;
  gap: 8px;
}

.detail-row .label {
  color: #718096;
  min-width: 80px;
}

.detail-row .value {
  color: #2d3748;
  font-weight: 500;
}

.location-text {
  font-family: monospace;
  font-size: 0.9em;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #edf2f7;
}

.action-btn-outline {
  flex: 1;
  background: white;
  border: 1px solid #cbd5e0;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-outline:hover {
  background: #f7fafc;
  border-color: #a0aec0;
  color: #2d3748;
}



@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .product-group, .quantity-group {
    width: 100%;
  }

  .add-btn {
    width: 100%;
    align-self: stretch;
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  .form-section, .requests-section {
    padding: 16px;
  }

  .detail-row .label {
    min-width: 70px;
  }
}
</style>
