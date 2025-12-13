<template>
  <header class="merchant-header">
    <div class="header-content">
      <h1 class="brand">Merchant Portal</h1>
      <div class="actions">
        <!-- Placeholder for potential profile/notification icons -->
        <span class="icon">🔔</span>
        <div class="user-menu-container">
          <span class="icon" @click="toggleMenu">👤</span>
          <div v-if="showMenu" class="dropdown-menu">
            <div class="menu-item" @click="$emit('logout')">
              🚪 Keluar
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

defineEmits(['logout'])

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 150px;
  padding: 8px 0;
  border: 1px solid #e2e8f0;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  color: #4a5568;
  transition: background 0.2s;
}

.menu-item:hover {
  background-color: #f7fafc;
  color: #e53e3e;
}
</style>
