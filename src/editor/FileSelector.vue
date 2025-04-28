<template>
  <v-tabs
    v-model="activeFile"
    class="file-selector"
    :class="{ 'has-import-map': showImportMap }"
    ref="fileSel"
    color="primary"
    bg-color="background"
    density="comfortable"
    show-arrows
  >
    <v-tab v-for="(file, i) in files" :value="file" class="file" size="small">
      <span>{{ stripSrcPrefix(file) }}</span>
      <v-icon
        v-if="i > 0"
        @click.stop="store.deleteFile(file)"
        icon="$close"
        class="ms-2 remove"
      />
    </v-tab>
    <v-tab v-if="pending" class="file pending" size="small">
      <input
        v-model="pendingFilename"
        spellcheck="false"
        @blur="doneNameFile"
        @keyup.enter="doneNameFile"
        @keyup.esc="cancelNameFile"
        @vue:mounted="focus"
      />
    </v-tab>
    <v-btn variant="text" height="100%" @click="startAddFile">
      <v-icon :icon="`svg:${mdiPlus}`" />
    </v-btn>

    <v-tab
      v-if="showTsConfig"
      class="file import-map"
      size="small"
      :value="tsconfigFile"
    >
      tsconfig.json
    </v-tab>

    <v-tab
      v-if="showImportMap"
      class="file"
      size="small"
      :value="importMapFile"
    >
      Import Map
    </v-tab>
    <v-tab class="file" size="small" :value="linksFile"> Links </v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js'
import { inject } from 'vue'
import { Store } from '../store'
import { useFileSelector } from '../composables/useFileSelector'

const store = inject('store') as Store

const {
  activeFile,
  showImportMap,
  files,
  stripSrcPrefix,
  pending,
  pendingFilename,
  doneNameFile,
  cancelNameFile,
  focus,
  startAddFile,
  tsconfigFile,
  showTsConfig,
  importMapFile,
  linksFile,
} = useFileSelector()
</script>

<style scoped>
.remove {
  align-self: flex-end;
}

.file.import-map {
  /*position: sticky;*/
  /*right: 0;*/
  margin-left: auto;
  background: rgb(var(--v-theme-background)) !important;
}

.file.pending input {
  width: 90px;
  height: 30px;
  line-height: 30px;
  outline: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 0 0 10px;
  margin-top: 2px;
  margin-left: 6px;
  font-family: var(--font-code);
  font-size: 12px;
}
</style>
