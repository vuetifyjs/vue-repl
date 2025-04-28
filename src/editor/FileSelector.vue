<template>
  <div class="d-flex gap-1">
    <v-btn
      :icon="`svg:${mdiFileMultipleOutline}`"
      :ripple="false"
      variant="plain"
      size="small"
      @click="store.state.showFileExplorer = !store.state.showFileExplorer"
    />
    <v-tabs
      :model-value="localActiveFile"
      color="primary"
      bg-color="background"
      density="comfortable"
      show-arrows
      class="flex-grow-1"
    >
      <v-tab
        v-for="file in recentFiles"
        :key="file"
        :value="file"
        @click="activeFile = file"
        class="file"
        size="small"
      >
        <span>{{ stripSrcPrefix(file) }}</span>
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup lang="ts">
import { inject, watch, ref, nextTick } from 'vue'
import { Store } from '../store'
import { useFileSelector } from '../composables/useFileSelector'
import { mdiFileMultipleOutline } from '@mdi/js'

const MAX_RECENT_FILES = 5

const store = inject('store') as Store

const { activeFile, stripSrcPrefix } = useFileSelector()
const recentFiles = ref([activeFile.value])
const localActiveFile = ref(activeFile.value)

watch(activeFile, async (newVal) => {
  if (newVal && !recentFiles.value.includes(newVal)) {
    if (recentFiles.value.length >= MAX_RECENT_FILES)
      recentFiles.value.splice(0, 1, newVal)
    else recentFiles.value.push(newVal)
  }

  await nextTick()
  localActiveFile.value = activeFile.value
})
</script>
