<script setup lang="ts">
import Message from '../Message.vue'
import { debounce } from '../utils'
import { inject, ref } from 'vue'
import { Store } from '../store'
import type { EditorComponentType } from './types'
import FileSelector from './FileSelector.vue'

const props = defineProps<{
  editorComponent: EditorComponentType
}>()

const store = inject('store') as Store
const readonly = inject('readonly', ref(false))
const showError = inject('showError', ref(true))

const onChange = debounce((code: string, filename: string) => {
  if (readonly.value) return
  store.state.files[filename].code = code
}, 250)
</script>

<template>
  <FileSelector />
  <div class="overflow-hidden position-relative editor-container">
    <props.editorComponent
      @change="onChange($event, store.state.activeFile.filename)"
      :value="store.state.activeFile.code"
      :filename="store.state.activeFile.filename"
      :readonly="readonly"
    />
    <Message v-show="showError" :err="store.state.errors[0]" />
  </div>
</template>

<style scoped>
.editor-container {
  height: calc(100% - 44px);
}
</style>
