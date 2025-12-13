<template>
  <div class="merchant-transaction">
    <div class="product-grid">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
        :class="{ 'low-stock-limit': product.stock < 50 }"
        @click="increment(product)"
      >
        <div class="product-image-placeholder" :style="{ backgroundColor: product.color }">
          <span class="icon">{{ product.icon }}</span>
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
          <button class="confirm-btn" @click="proceedToPayment">Bayar</button>
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
        <button class="confirm-btn success" @click="finishTransaction">Transaksi Selesai</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const products = ref([
  { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, color: '#D6BCFA', icon: '☕', stock: 120 },
  { id: 2, name: 'Croissant Butter', price: 25000, color: '#F6E05E', icon: '🥐', stock: 30 },
  { id: 3, name: 'Americano Hot', price: 15000, color: '#FEB2B2', icon: '☕', stock: 8 },
  { id: 4, name: 'Matcha Latte', price: 22000, color: '#9AE6B4', icon: '🍵', stock: 75 },
  { id: 5, name: 'Sandwich Tuna', price: 30000, color: '#FBD38D', icon: '🥪', stock: 45 },
  { id: 6, name: 'Mineral Water', price: 5000, color: '#90CDF4', icon: '💧', stock: 200 },
  { id: 7, name: 'Donut Coklat', price: 12000, color: '#E9D8FD', icon: '🍩', stock: 12 },
  { id: 8, name: 'Lemon Tea', price: 10000, color: '#FAF089', icon: '🍋', stock: 55 }
])

// Cart: { productId: quantity }
const cart = ref({})
const showSummary = ref(false)
const showQR = ref(false)

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
    const product = products.value.find(p => p.id === parseInt(id))
    return {
      ...product,
      qty: cart.value[id],
      subtotal: product.price * cart.value[id]
    }
  })
})

const totalPrice = computed(() => {
  return Object.keys(cart.value).reduce((total, id) => {
    const product = products.value.find(p => p.id === parseInt(id))
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

const handleCheckout = () => {
  showSummary.value = true
}

const proceedToPayment = () => {
  showSummary.value = false
  showQR.value = true
}

const finishTransaction = () => {
  showQR.value = false
  cart.value = {}
  alert('Transaksi Berhasil!')
}
</script>

<style scoped>
.merchant-transaction {
  padding-bottom: 80px; /* Space for checkout bar */
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 Columns */
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.1s;
  border: 2px solid transparent;
}

.product-card.low-stock-limit {
  border-color: #f6e05e; /* Highlight border for low stock */
}

.control-btn:disabled {
  background-color: #cbd5e0 !important;
  color: #a0aec0 !important;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #2d3748;
  text-align: center;
  margin-bottom: 20px;
}

.summary-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.95em;
  color: #4a5568;
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
}

.summary-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 1.1em;
  color: #2d3748;
}

.confirm-btn {
  width: 100%;
  background-color: #667eea;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1em;
}

.confirm-btn:hover {
  background-color: #5a67d8;
}

.confirm-btn.success {
  background-color: #48bb78;
}

.confirm-btn.success:hover {
  background-color: #38a169;
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
  transition: background 0.2s;
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
  bottom: 70px; /* Just above menu bar */
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
}

.checkout-btn:hover {
  background-color: #38a169;
}
</style>
