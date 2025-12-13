<template>
  <transition name="toast-fade">
    <div v-if="visible" :class="['toast', type]" role="alert">
      <div class="toast-icon">
        <span v-if="type === 'success'">✅</span>
        <span v-else-if="type === 'error'">❌</span>
        <span v-else>ℹ️</span>
      </div>
      <div class="toast-message">{{ message }}</div>
      <button class="toast-close" @click="hide">×</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // 'success', 'error', 'info'
    validator: (value) => ['success', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
let timer = null

// Watch for external changes to visibility
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    startTimer()
  } else {
    clearTimeout(timer)
  }
})

const startTimer = () => {
  clearTimeout(timer)
  if (props.duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, props.duration)
  }
}

const hide = () => {
  visible.value = false
  emit('update:modelValue', false)
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border-left: 6px solid #ccc;
  z-index: 9999;
  min-width: 300px;
  max-width: 400px;
  font-family: 'Segoe UI', sans-serif;
  overflow: hidden;
}

.toast.success {
  border-left-color: #48bb78;
}

.toast.error {
  border-left-color: #f56565;
}

.toast.info {
  border-left-color: #667eea;
}

.toast-icon {
  margin-right: 12px;
  font-size: 1.25em;
}

.toast-message {
  flex-grow: 1;
  color: #2d3748;
  font-weight: 500;
  font-size: 0.95em;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #a0aec0;
  cursor: pointer;
  margin-left: 12px;
  transition: color 0.2s;
  padding: 0;
  line-height: 1;
}

.toast-close:hover {
  color: #4a5568;
}

/* Transitions */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
