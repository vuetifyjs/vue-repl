<template>
  <v-navigation-drawer v-model="store.state.showFileExplorer" :width="240">
    <v-list-item height="43px">
      <template v-slot:prepend>
        <v-btn
          class="px-0 rounded-md"
          variant="flat"
          size="small"
          min-width="30px"
          @click="store.state.showFileExplorer = false"
        >
          <IconPanelLeftClose />
        </v-btn>
      </template>
      <template v-slot:append>
        <v-btn
          class="px-0 rounded-md"
          variant="flat"
          size="small"
          min-width="30px"
          @click="startAddFile"
        >
          <v-icon :size="24" :icon="`svg:${mdiFilePlusOutline}`" />
        </v-btn>
      </template>
    </v-list-item>

    <v-divider />

    <v-list
      :selected="[activeFile]"
      class="py-1 px-1 overflow-y-scroll file-list"
      density="compact"
      :style="{ 'max-height': 'calc(100% - 44px)' }"
    >
      <v-list-item
        v-for="file in files"
        :key="file"
        :value="file"
        rounded
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
        <v-list-item-title :title="stripSrcPrefix(file)" class="file-name">
          {{ stripSrcPrefix(file) }}
        </v-list-item-title>
        <template v-slot:append>
          <v-icon-btn
            icon="$close"
            size="26px"
            icon-size="20px"
            variant="text"
            @click.stop="store.deleteFile(file)"
          />
        </template>
      </v-list-item>

      <v-list-item
        v-if="pending"
        :prepend-icon="`svg:${getFileIcon(pendingFilename)}`"
        slim
      >
        <v-list-item-title>
          <v-text-field
            v-model="pendingFilename"
            density="compact"
            hide-details
            autofocus
            single-line
            base-color="primary"
            color="primary"
            @blur="doneNameFile"
            @keyup.enter="doneNameFile"
            @keyup.esc="cancelNameFile"
          />
        </v-list-item-title>
      </v-list-item>
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
import IconPanelLeftClose from '../icons/IconPanelLeftClose.vue'
import {
  mdiFilePlusOutline,
  mdiLanguageTypescript,
  mdiMap,
  mdiLink,
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
