<script setup lang="ts">
const visible = defineModel<boolean>()
</script>

<template>
  <div class="wrapper" @click.self="visible = !visible">
    <v-switch v-model="visible" label="Word wrap" color="primary" inset hide-details density="compact" />
  </div>
</template>

<style scoped>
.wrapper {
  position: absolute;
  bottom: 8px;
  right: 180px;
  z-index: 11;
  display: flex;
  align-items: center;
  background-color: var(--bg);
  color: var(--text-light);
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 16px;
  user-select: none;
  transform: scale(0.85);
  transform-origin: right;
}
</style>
