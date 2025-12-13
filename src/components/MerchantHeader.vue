<template>
  <header class="merchant-header">
    <div class="header-content">
      <h1 class="brand">Merchant Portal</h1>
      <div class="actions">
        <div class="user-menu-container">
          <span class="icon" @click="toggleMenu">👤</span>
          <div v-if="showMenu" class="dropdown-menu">
            <div class="profile-info">
              <p class="name">{{ merchant.name || 'Merchant' }}</p>
              <p class="email">{{ merchant.email || 'email@example.com' }}</p>
              <p class="username">@{{ merchant.username || 'username' }}</p>
            </div>
            <div class="divider"></div>
            <div class="menu-item logout" @click="$emit('logout')">
              🚪 Keluar
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, defineEmits, onMounted } from 'vue'

defineEmits(['logout'])

const showMenu = ref(false)
const merchant = ref({})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

onMounted(() => {
  try {
    const storedMerchant = localStorage.getItem('merchant')
    if (storedMerchant) {
      merchant.value = JSON.parse(storedMerchant)
    }
  } catch (e) {
    console.error('Failed to parse merchant data', e)
  }
})
</script>

<style scoped>
.merchant-header {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.brand {
  font-size: 1.25em;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon {
  font-size: 1.2em;
  cursor: pointer;
  user-select: none;
}

.user-menu-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  min-width: 200px;
  padding: 8px 0;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.profile-info {
  padding: 12px 16px;
}

.profile-info p {
  margin: 4px 0;
  font-size: 0.9em;
  color: #718096;
}

.profile-info .name {
  font-weight: 700;
  color: #2d3748;
  font-size: 1em;
}

.profile-info .username {
  font-size: 0.85em;
  color: #a0aec0;
}

.divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 4px 0;
}

.menu-item {
  padding: 10px 16px;
  cursor: pointer;
  color: #4a5568;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background-color: #f7fafc;
}

.menu-item.logout:hover {
  background-color: #fff5f5;
  color: #e53e3e;
}
</style>
