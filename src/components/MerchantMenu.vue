<template>
  <nav class="merchant-menu">
    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="dropdown-overlay"
      @click="showDropdown = false"
    >
      <div class="dropdown-content" @click.stop>
        <div class="dropdown-header">
          <span class="dropdown-title">📦 Produk</span>
          <button class="close-btn" @click="showDropdown = false">✕</button>
        </div>
        <div
          v-for="option in productOptions"
          :key="option.id"
          class="dropdown-item"
          :class="{ active: modelValue === option.id }"
          @click="selectProductOption(option.id)"
        >
          <span class="icon">{{ option.icon }}</span>
          <span class="label">{{ option.label }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Menu Items -->
    <div
      v-for="item in menuItems"
      :key="item.id"
      class="menu-item"
      :class="{ active: isActive(item.id) }"
      @click="handleMenuClick(item.id)"
    >
      <span class="icon">{{ item.icon }}</span>
      <span class="label">{{ item.label }}</span>
    </div>
  </nav>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const showDropdown = ref(false);

const menuItems = [
  { id: "transaction", label: "Transaksi", icon: "💳" },
  { id: "product", label: "Produk", icon: "📦", hasDropdown: true },
  { id: "history", label: "Riwayat", icon: "🕒" },
  { id: "balance", label: "Saldo", icon: "💰" },
];

const productOptions = [
  { id: "product", label: "Daftar Produk", icon: "📦" },
  { id: "defective", label: "Produk Rusak", icon: "⚠️" },
  { id: "restock", label: "Restock", icon: "📥" },
];

const isActive = (itemId) => {
  if (itemId === "product") {
    // Product menu is active if any of the product options is selected
    return ["product", "defective", "restock"].includes(props.modelValue);
  }
  return props.modelValue === itemId;
};

const handleMenuClick = (itemId) => {
  if (itemId === "product") {
    showDropdown.value = true;
  } else {
    emit("update:modelValue", itemId);
  }
};

const selectProductOption = (optionId) => {
  emit("update:modelValue", optionId);
  showDropdown.value = false;
};
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
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #718096;
  transition: all 0.3s ease;
  flex: 1;
  padding: 8px 12px;
}

.menu-item.active {
  color: #667eea;
  font-weight: 700;
  background-color: #eef2ff;
  border-radius: 12px;
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

/* Dropdown Styles */
.dropdown-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dropdown-content {
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
  margin-bottom: 70px; /* Space for bottom menu */
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.dropdown-title {
  font-size: 1.2em;
  font-weight: 700;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #718096;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #edf2f7;
  color: #2d3748;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin: 8px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f7fafc;
}

.dropdown-item:hover {
  background-color: #edf2f7;
  transform: translateX(4px);
}

.dropdown-item.active {
  background-color: #eef2ff;
  color: #667eea;
  font-weight: 700;
}

.dropdown-item .icon {
  font-size: 2em;
  margin-right: 16px;
  margin-bottom: 0;
}

.dropdown-item .label {
  font-size: 1em;
  font-weight: 600;
}
</style>
