<script setup lang="ts">
import SplitPane from './SplitPane.vue'
import Output from './output/Output.vue'
import { Store, ReplStore, SFCOptions } from './store'
import { provide, ref, toRef } from 'vue'
import type { EditorComponentType, EditorOptions } from './editor/types'
import EditorContainer from './editor/EditorContainer.vue'
import FileExplorer from './editor/FileExplorer.vue'
import { deepMerge } from './utils'

export interface Props {
  theme?: 'dark' | 'light'
  editor: EditorComponentType
  store?: Store
  autoResize?: boolean
  showCompileOutput?: boolean
  showImportMap?: boolean
  showTsConfig?: boolean
  clearConsole?: boolean
  sfcOptions?: SFCOptions
  layout?: 'horizontal' | 'vertical'
  ssr?: boolean
  previewOptions?: {
    headHTML?: string
    bodyHTML?: string
    customCode?: {
      importCode?: string
      useCode?: string
    }
  }
  editorOptions?: EditorOptions
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  store: () => new ReplStore(),
  autoResize: true,
  showCompileOutput: true,
  showImportMap: true,
  showTsConfig: true,
  clearConsole: true,
  ssr: false,
  previewOptions: () => ({
    headHTML: '',
    bodyHTML: '',
    customCode: {
      importCode: '',
      useCode: '',
    },
  }),
})

const defaultEditorOptions = ref<EditorOptions>({
  showErrors: true,
  monaco: {
    wordWrap: 'off',
    minimap: { enabled: false },
    inlineSuggest: { enabled: false },
    padding: { top: 0, bottom: 0 },
  },
  patch: (options) => {
    deepMerge(defaultEditorOptions.value, options)
  },
})

if (!props.editor) {
  throw new Error('The "editor" prop is now required.')
}

const outputRef = ref<InstanceType<typeof Output>>()
const { store } = props
const sfcOptions = (store.options = props.sfcOptions || {})
if (!sfcOptions.script) {
  sfcOptions.script = {}
}
// @ts-ignore only needed in 3.3
sfcOptions.script.fs = {
  fileExists(file: string) {
    if (file.startsWith('/')) file = file.slice(1)
    return !!store.state.files[file]
  },
  readFile(file: string) {
    if (file.startsWith('/')) file = file.slice(1)
    return store.state.files[file].code
  },
}

store.init()

provide('store', store)
provide('autoresize', props.autoResize)
provide('import-map', toRef(props, 'showImportMap'))
provide('tsconfig', toRef(props, 'showTsConfig'))
provide('clear-console', toRef(props, 'clearConsole'))
provide('preview-options', props.previewOptions)
provide('theme', toRef(props, 'theme'))
provide('editor-options', props.editorOptions ?? defaultEditorOptions.value)
/**
 * Reload the preview iframe
 */
function reload() {
  outputRef.value?.reload()
}

defineExpose({ reload })
</script>

<template>
  <v-theme-provider with-background class="vue-repl">
    <v-layout class="h-100">
      <FileExplorer />

      <v-main class="h-100">
        <SplitPane :layout="layout">
          <template #left>
            <EditorContainer :editorComponent="editor" />
          </template>
          <template #right>
            <Output
              ref="outputRef"
              :editorComponent="editor"
              :showCompileOutput="props.showCompileOutput"
              :ssr="!!props.ssr"
            />
          </template>
        </SplitPane>
      </v-main>
    </v-layout>
  </v-theme-provider>
</template>

<style scoped>
.vue-repl {
  --bg: rgb(var(--v-theme-background));
  --bg-soft: rgb(var(--v-theme-surface));
  --border: #383838;
  --text-light: #aaa;
  --color-branding: #42d392;
  --color-branding-dark: #89ddff;
  --font-code: Menlo, Monaco, Consolas, 'Courier New', monospace;
  --header-height: 44px;

  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-soft);
}
</style>
