<template>
  <header class="merchant-header">
    <div class="header-content">
      <h1 class="brand">Merchant Portal</h1>
      <div class="actions">
        <!-- Placeholder for potential profile/notification icons -->
        <span class="icon">🔔</span>
        <span class="icon">👤</span>
      </div>
    </div>
  </header>
</template>

<script setup>
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
}

.icon {
  font-size: 1.2em;
  cursor: pointer;
}
</style>
