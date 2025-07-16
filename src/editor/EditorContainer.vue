<script setup lang="ts">
import Message from '../Message.vue'
import WrapToggle from './WrapToggle.vue'
import { debounce } from '../utils'
import { inject } from 'vue'
import { Store } from '../store'
import MessageToggle from './MessageToggle.vue'
import type { EditorComponentType, EditorOptions } from './types'
import FileSelector from './FileSelector.vue'

const props = defineProps<{
  editorComponent: EditorComponentType
}>()

const store = inject('store') as Store
const editorOptions = inject<EditorOptions>('editor-options')

const onChange = debounce((code: string, filename: string) => {
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
    />
    <Message v-show="editorOptions?.showErrors" :err="store.state.errors[0]" />
    <MessageToggle
      :model-value="editorOptions?.showErrors"
      @update:model-value="editorOptions?.patch({ showErrors: $event })"
    />
    <WrapToggle
      :model-value="editorOptions?.monaco?.wordWrap == 'on' ? true : false"
      @update:model-value="
        editorOptions?.patch({ monaco: { wordWrap: $event ? 'on' : 'off' } })
      "
    />
  </div>
</template>

<style scoped>
.editor-container {
  height: calc(100% - 44px);
}
</style>
