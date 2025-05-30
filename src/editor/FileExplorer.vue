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
      <v-list-item
        v-for="file in files"
        :key="file"
        :value="file"
        rounded
        :title="stripSrcPrefix(file)"
        slim
        @click="activeFile = file"
      >
        <template v-slot:prepend>
          <v-icon
            :icon="`svg:${getFileIcon(file)}`"
            :color="getFileIconColor(file)"
            size="small"
          />
        </template>

        <template v-slot:append>
          <v-icon-btn
            icon="$close"
            size="26"
            icon-size="14"
            variant="plain"
            @click.stop="store.deleteFile(file)"
          />
        </template>
      </v-list-item>

      <v-text-field
        v-if="pending"
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
import { inject } from 'vue'
import { useFileSelector } from '../composables/useFileSelector'
import { VIconBtn } from 'vuetify/labs/components'
import {
  mdiFilePlusOutline,
  mdiLanguageTypescript,
  mdiMap,
  mdiLink,
  mdiDockLeft,
} from '@mdi/js'

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
  startAddFile,
  tsconfigFile,
  showTsConfig,
  importMapFile,
  linksFile,
  getFileIcon,
  getFileIconColor,
} = useFileSelector()
</script>
