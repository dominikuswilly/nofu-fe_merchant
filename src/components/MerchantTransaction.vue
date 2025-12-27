<template>
  <div class="merchant-transaction">
    <div v-if="loading" class="state-message">
      <div class="loader"></div>
      <p>Memuat produk...</p>
    </div>

    <div v-else-if="error" class="state-message error">
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="retry-btn">Coba Lagi</button>
    </div>

    <div v-else-if="products.length === 0" class="state-message">
      <p>Tidak ada produk yang tersedia.</p>
    </div>

    <div v-else class="product-grid">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
        :class="{ 'low-stock-limit': product.stock < 50 }"
        @click="increment(product)"
      >
        <div class="product-image-placeholder" :style="{ backgroundColor: product.color }">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="product-img" @error="onImageError(product)" />
          <span v-else class="icon">{{ product.icon }}</span>
          <div v-if="cart[product.id]" class="qty-controls" @click.stop>
            <button class="control-btn minus" @click="decrement(product)">-</button>
            <span class="qty">{{ cart[product.id] }}</span>
            <button 
              class="control-btn plus" 
              @click="increment(product)"
              :disabled="cart[product.id] >= product.stock"
            >+</button>
          </div>
          <div v-else class="add-hint">
            <span class="plus-icon">+</span>
          </div>
        </div>
        <div class="product-info">
          <p class="name">{{ product.name }}</p>
          <div class="meta">
            <p class="price">{{ formatCurrency(product.price) }}</p>
            <span class="stock-info" :class="{ 'low-stock': product.stock < 50 }">
              Stok: {{ product.stock }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="checkout-bar" v-if="totalItems > 0">
      <div class="total-info">
        <p class="label">Total</p>
        <p class="amount">{{ formatCurrency(totalPrice) }}</p>
      </div>
      <button class="checkout-btn" @click="handleCheckout">
        Checkout ({{ totalItems }})
      </button>
    </div>

    <div v-if="showSummary" class="modal-overlay">
      <div class="modal-content">
        <h3>Ringkasan Pesanan</h3>
        <div class="summary-list">
          <div v-for="item in cartItems" :key="item.id" class="summary-item">
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-qty">x{{ item.qty }}</span>
            </div>
            <span class="item-price">{{ formatCurrency(item.subtotal) }}</span>
          </div>
        </div>
        <div class="summary-footer">
          <div class="summary-total">
            <span>Total Bayar</span>
            <span class="total-amount">{{ formatCurrency(totalPrice) }}</span>
          </div>
          <div class="action-buttons">
            <button class="discard-btn" @click="cancelCheckout">
              <span class="btn-icon">🗑️</span>
              Batalkan Pesanan
            </button>
            <button class="confirm-btn" @click="proceedToPayment">
              <span class="btn-icon">💰</span>
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Modal -->
    <div v-if="showQR" class="modal-overlay">
      <div class="modal-content text-center">
        <h3>Scan untuk Membayar</h3>
        <div class="qr-container">
          <img 
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Payment:${totalPrice}`" 
            alt="QR Code" 
            class="qr-image"
          />
        </div>
        <p class="qr-amount">Total: {{ formatCurrency(totalPrice) }}</p>
        <div class="action-buttons">
          <button class="confirm-btn cancel" @click="cancelTransaction">Batalkan</button>
          <button class="confirm-btn success" @click="finishTransaction" :disabled="submitting">
            {{ submitting ? 'Menyimpan...' : 'Selesai' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelConfirm" class="modal-overlay confirmation-overlay">
      <div class="modal-content confirmation-modal">
        <div class="warning-icon">⚠️</div>
        <h3>Batalkan Pesanan?</h3>
        <p class="confirmation-message">
          Apakah Anda yakin ingin membatalkan pesanan? Semua produk yang dipilih akan dihapus dan Anda harus memilih ulang.
        </p>
        <div class="confirmation-actions">
          <button class="discard-btn" @click="confirmCancelOrder">
            <span class="btn-icon">🗑️</span>
            Batalkan Pesanan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { transactionApi } from '@/utils/api'
import { getMerchantId } from '@/utils/auth'

const products = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)

const onImageError = (product) => {
  console.error('MerchantTransaction: Image load error:', product.name, 'URL:', product.image)
}

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
    
    console.log('Transaction API Response:', response)
    
    // Handle response based on the API structure
    if (response.responseCode === "200" || response.status === "success" || Array.isArray(response.data)) {
      // Check for stockDetail in response.data (new format) or direct array (legacy)
      const dataObj = response.data || response || {}
      const rawData = Array.isArray(dataObj.stockDetail) 
        ? dataObj.stockDetail 
        : (Array.isArray(dataObj) ? dataObj : [])

      if (Array.isArray(rawData)) {
        products.value = rawData.map(p => ({
          ...p,
          id: p.id,
          stockDetailId: p.id,
          productId: p.productId,
          name: p.productName || p.name || p.product_name,
          price: p.priceSell || p.price || p.product_price || 0,
          stock: p.qty || p.stock || 0,
          image: p.productImage || p.url || p.image || p.image_url || p.product_image || null,
          color: p.color || getRandomColor(),
          icon: p.icon || '📦'
        }))
        console.log('MerchantTransaction: Loaded products:', products.value.length)
        if (products.value.length > 0) {
          console.log('Sample product mapping:', {
            raw: rawData[0],
            mapped: products.value[0]
          })
        }
      }
    } else if (Array.isArray(response)) {
      products.value = response.map(p => ({
        ...p,
        id: p.id || p.id_product || p.product_id,
        name: p.name || p.product_name,
        price: p.price || p.product_price || 0,
        stock: p.stock || p.qty || 0,
        image: p.url || p.image || p.image_url || p.product_image || null,
        color: p.color || getRandomColor(),
        icon: p.icon || '📦'
      }))
    }
 else {
      error.value = response.responseMessage || 'Gagal memuat data produk'
    }
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Terjadi kesalahan saat memuat data produk'
  } finally {
    loading.value = false
  }
}

const getRandomColor = () => {
  const colors = ['#D6BCFA', '#F6E05E', '#FEB2B2', '#9AE6B4', '#FBD38D', '#90CDF4', '#E9D8FD', '#FAF089']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Cart: { productId: quantity }
const cart = ref({})
const showSummary = ref(false)
const showQR = ref(false)
const showCancelConfirm = ref(false)
const summaryRef = ref(null)

const increment = (product) => {
  const currentQty = cart.value[product.id] || 0
  if (currentQty < product.stock) {
    if (cart.value[product.id]) {
      cart.value[product.id]++
    } else {
      cart.value[product.id] = 1
    }
  } else {
    alert(`Stok tidak mencukupi. Maksimal: ${product.stock}`)
  }
}

const decrement = (product) => {
  if (cart.value[product.id]) {
    cart.value[product.id]--
    if (cart.value[product.id] === 0) {
      delete cart.value[product.id]
    }
  }
}

const totalItems = computed(() => {
  return Object.values(cart.value).reduce((a, b) => a + b, 0)
})

const cartItems = computed(() => {
  return Object.keys(cart.value).map(id => {
    const product = products.value.find(p => String(p.id) === String(id))
    return {
      ...product,
      qty: cart.value[id],
      subtotal: product.price * cart.value[id]
    }
  })
})

const totalPrice = computed(() => {
  return Object.keys(cart.value).reduce((total, id) => {
    const product = products.value.find(p => String(p.id) === String(id))
    return total + (product.price * cart.value[id])
  }, 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const handleCheckout = async () => {
  showSummary.value = true
  
  // Auto-scroll to summary modal after it's rendered
  await nextTick()
  if (summaryRef.value) {
    summaryRef.value.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
  }
}

const cancelCheckout = () => {
  // Show confirmation modal instead of directly canceling
  showSummary.value = false
}

const proceedToPayment = () => {
  showSummary.value = false
  showQR.value = true
}

const finishTransaction = async () => {
  submitting.value = true
  try {
    const salesDetails = cartItems.value.map(item => {
      const price = parseFloat(item.price)
      return {
        productId: String(item.productId),
        qty: item.qty,
        price: Number.isNaN(price) ? 0 : price,  // Fallback to 0
        currency: "IDR",
        stockDetailId: item.stockDetailId
      }
    })

    const payload = {
      salesDetails
    }

    const response = await transactionApi.post('/sales/create', payload)
    
    // 2xx response (api.js throws if not ok, but let's check response code if present)
    if (response) {
      showQR.value = false
      cart.value = {}
      alert('Transaksi sudah disimpan')
      await fetchProducts()
    }
  } catch (err) {
    console.error('Transaction error:', err)
    const retry = confirm(`Gagal menyimpan transaksi: ${err.message}\n\nCoba lagi?`)
    if (retry) {
      finishTransaction()
    } else {
      // User cancelled retry, stay in modal?
    }
  } finally {
    submitting.value = false
  }
}

const cancelTransaction = () => {
  showQR.value = false
  cart.value = {}
  alert('Transaksi sudah dibatalkan')
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.merchant-transaction {
  padding-bottom: 80px; /* Space for checkout bar */
  position: relative;
}

.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  color: #718096;
  margin-bottom: 20px;
}

.state-message.error {
  color: #e53e3e;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Locked Overlay Styles */
.locked-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 95;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(2px);
}

.lock-message {
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  animation: slideDown 0.4s ease;
}

.lock-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 12px;
  animation: shake 0.5s ease;
}

.lock-message p {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1em;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 Columns */
  gap: 16px;
  transition: all 0.3s ease;
}

.product-grid.locked {
  filter: grayscale(40%) brightness(0.7);
  pointer-events: none;
  opacity: 0.5;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.product-card.low-stock-limit {
  border-color: #f6e05e; /* Highlight border for low stock */
}

.control-btn:disabled {
  background-color: #cbd5e0 !important;
  color: #a0aec0 !important;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  padding: 20px;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  position: relative;
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
  from {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Focus Pulse Animation */
.summary-focused {
  position: relative;
  z-index: 201;
}

.focus-pulse {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 20px;
  border: 3px solid #667eea;
  animation: pulse 2s infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 0 15px rgba(102, 126, 234, 0);
    opacity: 0.8;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
    opacity: 1;
  }
}

.modal-content h3 {
  margin-top: 0;
  color: #2d3748;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.summary-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 8px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f7fafc;
  border-radius: 8px;
  font-size: 0.95em;
  color: #4a5568;
  transition: all 0.2s ease;
}

.summary-item:hover {
  background-color: #edf2f7;
  transform: translateX(4px);
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  color: #2d3748;
}

.item-qty {
  font-size: 0.85em;
  color: #718096;
  margin-top: 4px;
}

.item-price {
  font-weight: 700;
  color: #667eea;
}

.summary-footer {
  border-top: 2px solid #e2e8f0;
  padding-top: 16px;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 1.2em;
  color: #2d3748;
  padding: 12px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 8px;
}

.total-amount {
  color: #667eea;
  font-size: 1.3em;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  background-color: transparent;
  color: #718096;
  border: 2px solid #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
  color: #4a5568;
  transform: translateY(-2px);
}

.cancel-btn:active {
  transform: translateY(0);
}

.confirm-btn {
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.confirm-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 1.2em;
}

.confirm-btn.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
}

.confirm-btn.success:hover {
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.6);
}

.confirm-btn.cancel {
  background: white;
  color: #e53e3e;
  border: 2px solid #e53e3e;
  box-shadow: none;
}

.confirm-btn.cancel:hover {
  background-color: #fff5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
}

.text-center {
  text-align: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-image {
  border: 4px solid #cbd5e0;
  border-radius: 12px;
}

.qr-amount {
  font-weight: 700;
  font-size: 1.25em;
  color: #2d3748;
  margin-bottom: 24px;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 6px;
  gap: 2px;
}

.stock-info {
  font-size: 0.75em;
  color: #718096;
}

.stock-info.low-stock {
  color: #d69e2e;
  font-weight: 600;
}

.product-card:active {
  transform: scale(0.98);
}

.product-image-placeholder {
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.icon {
  font-size: 3em;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qty-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  backdrop-filter: blur(4px);
}

.control-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  transition: all 0.2s ease;
}

.control-btn.minus {
  background-color: #feb2b2;
  color: #c53030;
}

.control-btn.plus {
  background-color: #9ae6b4;
  color: #22543d;
}

.control-btn:active {
  transform: scale(0.9);
}

.qty {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1em;
}

.add-hint {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.plus-icon {
  font-size: 1.5em;
  color: #4a5568;
  font-weight: light;
}

.product-info {
  padding: 12px;
}

.name {
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
  font-size: 0.95em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  color: #667eea;
  font-weight: 700;
  font-size: 0.9em;
  margin: 0;
}

.checkout-bar {
  position: fixed;
  bottom: 85px; /* Increased spacing to avoid menu collision */
  left: 20px;
  right: 20px;
  max-width: 760px; /* Constrain width max-width of content area minus padding */
  margin: 0 auto;
  background-color: #2d3748;
  color: white;
  padding: 12px 20px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 90;
  transition: all 0.3s ease;
}

.checkout-bar.locked {
  opacity: 0.5;
  filter: grayscale(50%);
  pointer-events: none;
}

.total-info .label {
  font-size: 0.75em;
  margin: 0;
  color: #cbd5e0;
}

.total-info .amount {
  font-size: 1.1em;
  font-weight: 700;
  margin: 0;
}

.checkout-btn {
  background-color: #48bb78;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s ease;
}

.checkout-btn:hover:not(:disabled) {
  background-color: #38a169;
  transform: scale(1.05);
}

.checkout-btn:disabled {
  background-color: #718096;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Confirmation Modal Styles */
.confirmation-overlay {
  z-index: 300;
  background-color: rgba(0, 0, 0, 0.7);
}

.confirmation-modal {
  max-width: 360px;
  text-align: center;
}

.warning-icon {
  font-size: 4em;
  margin-bottom: 16px;
  animation: warningPulse 1.5s infinite;
}

@keyframes warningPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.confirmation-modal h3 {
  color: #c53030;
  margin-bottom: 16px;
  font-size: 1.4em;
}

.confirmation-message {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 0.95em;
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.keep-shopping-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.keep-shopping-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.keep-shopping-btn:active {
  transform: translateY(0);
}

.discard-btn {
  width: 100%;
  background-color: transparent;
  color: #e53e3e;
  border: 2px solid #fc8181;
  padding: 14px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.discard-btn:hover {
  background-color: #fff5f5;
  border-color: #e53e3e;
  color: #c53030;
  transform: translateY(-2px);
}

.discard-btn:active {
  transform: translateY(0);
  background-color: #fed7d7;
}
</style>
