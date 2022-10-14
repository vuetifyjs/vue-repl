<script setup lang="ts">
import Preview from './Preview.vue'
import CodeMirror from '../codemirror/CodeMirror.vue'
import { Store } from '../store'
import { inject, ref, computed } from 'vue'
import type { OutputModes } from './types'

const props = defineProps<{
  showCompileOutput?: boolean
  ssr: boolean
}>()

const store = inject('store') as Store
const modes = computed(() =>
  props.showCompileOutput
    ? (['preview', 'js', 'css', 'ssr'] as const)
    : (['preview'] as const)
)

const mode = ref<OutputModes>(
  (modes.value as readonly string[]).includes(store.initialOutputMode)
    ? store.initialOutputMode as OutputModes
    : 'preview'
)
</script>

<template>
  <v-tabs v-model="mode" class="tab-buttons" color="primary" density="comfortable" show-arrows bg-color="background">
    <v-tab
      v-for="m of modes"
      :value="m"
      size="small"
    >{{ m }}</v-tab>
  </v-tabs>

  <div class="output-container">
    <Preview :show="mode === 'preview'" :ssr="ssr" />
    <CodeMirror
      v-if="mode !== 'preview'"
      readonly
      :mode="mode === 'css' ? 'css' : 'javascript'"
      :value="store.state.activeFile.compiled[mode]"
    />
  </div>
</template>

<style scoped>
.output-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}

.tab-buttons {
  /*border-bottom: 1px solid var(--border);*/
}
.tab-buttons button {
  text-transform: uppercase;
}
</style>
