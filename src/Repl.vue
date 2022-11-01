<script setup lang="ts">
import SplitPane from './SplitPane.vue'
import Editor from './editor/Editor.vue'
import Output from './output/Output.vue'
import { Store, ReplStore, SFCOptions } from './store'
import { provide, toRef } from 'vue'

export interface Props {
  store?: Store
  autoResize?: boolean
  showCompileOutput?: boolean
  showImportMap?: boolean
  clearConsole?: boolean
  sfcOptions?: SFCOptions
  layout?: string
  ssr?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  store: () => new ReplStore(),
  autoResize: true,
  showCompileOutput: true,
  showImportMap: true,
  clearConsole: true,
  ssr: false
})

props.store.options = props.sfcOptions
props.store.init()

provide('store', props.store)
provide('autoresize', props.autoResize)
provide('import-map', toRef(props, 'showImportMap'))
provide('clear-console', toRef(props, 'clearConsole'))
</script>

<template>
  <v-theme-provider with-background class="vue-repl">
    <SplitPane :layout="layout">
      <template #left>
        <Editor />
      </template>
      <template #right>
        <Output
          :showCompileOutput="props.showCompileOutput"
          :ssr="!!props.ssr"
        />
      </template>
    </SplitPane>
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

  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  overflow: hidden;
  background-color: var(--bg-soft);
}
</style>
