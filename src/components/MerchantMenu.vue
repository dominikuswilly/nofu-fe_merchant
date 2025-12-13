<template>
  <nav class="merchant-menu">
    <div 
      v-for="item in menuItems" 
      :key="item.id"
      class="menu-item"
      :class="{ active: modelValue === item.id }"
      @click="$emit('update:modelValue', item.id)"
    >
      <span class="icon">{{ item.icon }}</span>
      <span class="label">{{ item.label }}</span>
    </div>
  </nav>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])

const menuItems = [
  { id: 'transaction', label: 'Transaksi', icon: '💳' },
  { id: 'product', label: 'Produk', icon: '📦' },
  { id: 'history', label: 'Riwayat', icon: '🕒' },
  { id: 'defective', label: 'Rusak', icon: '⚠️' },
  { id: 'restock', label: 'Restock', icon: '📥' },
  { id: 'balance', label: 'Saldo', icon: '💰' }
]
</script>

<style scoped>
.merchant-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #718096;
  transition: color 0.3s ease;
  flex: 1;
}

.menu-item.active {
  color: #667eea;
  font-weight: 700;
  background-color: #eef2ff;
  border-radius: 12px;
  padding: 8px 12px;
  transform: scale(1.05);
}

.menu-item.active .icon {
  transform: scale(1.1);
}

.icon {
  font-size: 1.5em;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
}

.label {
  font-size: 0.8em;
  font-weight: 600;
}
</style>
