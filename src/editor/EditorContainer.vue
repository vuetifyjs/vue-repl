<script setup lang="ts">
import Message from '../Message.vue'
import WrapToggle from './WrapToggle.vue'
import { debounce } from '../utils'
import { inject, ref, watch } from 'vue'
import { Store } from '../store'
import MessageToggle from './MessageToggle.vue'
import type { EditorComponentType } from './types'
import FileSelector from './FileSelector.vue'

const SHOW_ERROR_KEY = 'repl_show_error'
const TOGGLE_WRAP_KEY = 'repl_toggle_wrap'

const props = defineProps<{
  editorComponent: EditorComponentType
}>()

const store = inject('store') as Store
const readonly = inject('readonly', ref(false))
const showMessage = ref((getItem(SHOW_ERROR_KEY) ?? 'true') === 'true')
store.state.wordWrap = (getItem(TOGGLE_WRAP_KEY) ?? 'false') === 'true'

const onChange = debounce((code: string, filename: string) => {
  if (readonly.value) return
  store.state.files[filename].code = code
}, 250)

function setItem(key: string, value: boolean) {
  localStorage.setItem(key, value ? 'true' : 'false')
}

function getItem(key: string) {
  return localStorage.getItem(key)
}

watch(showMessage, () => {
  setItem(SHOW_ERROR_KEY, showMessage.value)
})

watch(
  () => store.state.wordWrap,
  () => {
    setItem(TOGGLE_WRAP_KEY, store.state.wordWrap ?? false)
  }
)
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
    <Message v-show="showMessage" :err="store.state.errors[0]" />
    <MessageToggle v-model="showMessage" />
    <WrapToggle v-model="store.state.wordWrap" />
  </div>
</template>

<style scoped>
.editor-container {
  height: calc(100% - 44px);
}
</style>
