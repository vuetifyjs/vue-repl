<template>
  <v-navigation-drawer v-model="store.state.showFileExplorer" :width="240">
    <v-list-item class="px-2">
      <template v-slot:prepend>
        <v-btn
          variant="flat"
          size="small"
          :icon="`svg:${mdiDockLeft}`"
          @click="store.state.showFileExplorer = false"
        ></v-btn>
      </template>

      <template v-slot:append>
        <v-btn
          v-if="!readonly"
          variant="text"
          size="small"
          :append-icon="`svg:${mdiFilePlusOutline}`"
          text="Add File"
          border
          slim
          @click="startAddFile"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider />

    <v-list
      :selected="[activeFile]"
      class="py-1 px-1 overflow-y-auto d-flex flex-column ga-1"
      density="compact"
      max-height="calc(100% - 44px)"
    >
      <FileItem
        v-for="file in files"
        :key="file"
        :file
        :ref="(el) => setActiveListItem(el, file)"
      />

      <v-text-field
        v-if="pending && !readonly"
        v-model="pendingFilename"
        density="compact"
        hide-details
        autofocus
        single-line
        :prepend-inner-icon="`svg:${getFileIcon(pendingFilename)}`"
        base-color="primary"
        color="primary"
        variant="outlined"
        @blur="doneNameFile"
        @keyup.enter="doneNameFile"
        @keyup.esc="cancelNameFile"
      />
    </v-list>

    <FileRename :list-item="listItem" :file="menuActiveFile" />

    <template v-slot:append>
      <v-divider />

      <v-list
        :selected="[activeFile]"
        @update:selected="activeFile = $event[0] ?? activeFile"
        density="compact"
        class="px-1"
        slim
      >
        <v-list-item v-if="showTsConfig" :value="tsconfigFile" rounded>
          <template v-slot:prepend>
            <v-icon
              size="small"
              :icon="`svg:${mdiLanguageTypescript}`"
              color="info"
            />
          </template>
          <v-list-item-title>tsconfig.json</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="showImportMap" :value="importMapFile" rounded>
          <template v-slot:prepend>
            <v-icon size="small" :icon="`svg:${mdiMap}`" color="warning" />
          </template>
          <v-list-item-title>import-map.json</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="linksFile" :value="linksFile" rounded>
          <template v-slot:prepend>
            <v-icon size="small" :icon="`svg:${mdiLink}`" color="success" />
          </template>
          <v-list-item-title>links.json</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { Store } from 'src/store'
import { inject, ref } from 'vue'
import { useHotkey } from 'vuetify'
import { useFileSelector } from '../composables/useFileSelector'

import FileItem from './FileItem.vue'
import FileRename from './FileRename.vue'

import {
  mdiFilePlusOutline,
  mdiLanguageTypescript,
  mdiMap,
  mdiLink,
  mdiDockLeft,
} from '@mdi/js'

const store = inject('store') as Store
const readonly = inject('readonly', ref(false))

const {
  activeFile,
  showImportMap,
  files,
  pending,
  pendingFilename,
  tsconfigFile,
  showTsConfig,
  importMapFile,
  linksFile,
  menuActiveFile,
  renameMenu,

  doneNameFile,
  cancelNameFile,
  startAddFile,
  getFileIcon,
} = useFileSelector()

const listItem = ref<any>(null)

useHotkey('f2', handleRename)
useHotkey('cmd+backspace', handleDelete)

function setActiveListItem(el: any, file: string) {
  if (menuActiveFile.value !== file) return

  listItem.value = el
}

function handleRename() {
  if (readonly.value) return

  menuActiveFile.value = activeFile.value
  renameMenu.value = true
}

function handleDelete() {
  if (readonly.value) return

  store.deleteFile(activeFile.value)
}
</script>
