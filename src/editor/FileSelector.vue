<template>
  <div class="d-flex gap-1">
    <v-btn
      v-if="!store.state.showFileExplorer"
      :icon="`svg:${mdiFileMultiple}`"
      :ripple="false"
      variant="plain"
      size="small"
      min-width="46px"
      @click="store.state.showFileExplorer = true"
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
        v-for="file in validRecentFiles"
        :key="file"
        :value="file"
        size="small"
        @click="activeFile = file"
      >
        <template v-slot:prepend>
          <v-icon
            :icon="`svg:${getFileIcon(file)}`"
            :color="getFileIconColor(file)"
            size="small"
          />
        </template>
        <span>{{ stripSrcPrefix(file) }}</span>
        <v-icon-btn
          v-if="recentFiles.length > 1"
          icon="$close"
          size="20px"
          icon-size="15px"
          variant="text"
          class="ms-2"
          @click.stop="closeFile(file)"
        />
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup lang="ts">
import { inject, watch, ref, nextTick, computed } from 'vue'
import { Store } from '../store'
import { useFileSelector } from '../composables/useFileSelector'
import { mdiFileMultiple } from '@mdi/js'
import { VIconBtn } from 'vuetify/labs/components'
import { useDisplay } from 'vuetify'

const MAX_RECENT_FILES = 10

const store = inject('store') as Store
const { mdAndDown } = useDisplay()
const { activeFile, stripSrcPrefix, getFileIcon, getFileIconColor } =
  useFileSelector()

const localActiveFile = ref(activeFile.value)
const recentFiles = ref([activeFile.value])

// Filters the list of recent files to include only files that still exist in the current store state
const validRecentFiles = computed(() => {
  const files = Object.keys(store.state.files)
  return recentFiles.value.filter((file) => files.includes(file))
})

watch(activeFile, async (newVal) => {
  if (!newVal) return

  const index = recentFiles.value.indexOf(newVal)
  if (index === -1) {
    if (recentFiles.value.length >= MAX_RECENT_FILES) {
      recentFiles.value.shift()
    }
    recentFiles.value.push(newVal)
  }

  await nextTick()
  localActiveFile.value = activeFile.value
})

function closeFile(file: string) {
  const index = recentFiles.value.indexOf(file)
  if (index == -1) return

  recentFiles.value.splice(index, 1)
  if (activeFile.value === file)
    activeFile.value = recentFiles.value[recentFiles.value.length - 1] || ''
}

if (mdAndDown.value) {
  store.state.showFileExplorer = false
  recentFiles.value = Object.keys(store.state.files)
    .filter((f) => f.startsWith('src/') && !store.state.files[f]?.hidden)
    .slice(0, MAX_RECENT_FILES)
}
</script>
