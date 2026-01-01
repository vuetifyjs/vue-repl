<template>
  <component
    :is="mobile ? VDialog : VMenu"
    v-model="renameMenu"
    :open-on-click="false"
    :close-on-content-click="false"
    max-width="450"
    location="end"
    :activator="listItem"
  >
    <v-card min-width="300" elevation="8">
      <v-card-text class="pa-4">
        <v-text-field
          v-if="!readonly"
          v-model="newFilename"
          density="compact"
          hide-details="auto"
          autofocus
          :prepend-inner-icon="`svg:${getFileIcon(menuActiveFile)}`"
          base-color="primary"
          color="primary"
          variant="outlined"
          :rules="rules"
          @keydown.enter="doneRename"
          @keydown.esc="renameMenu = false"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="renameMenu = false"> Cancel </v-btn>
        <v-btn
          variant="text"
          color="primary"
          :disabled="!isValidRename"
          @click="doneRename"
        >
          Rename
        </v-btn>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script lang="ts" setup>
import type { Store } from 'src/store'

import { inject, ref, watch, computed } from 'vue'
import { useFileSelector } from '../composables/useFileSelector'
import { useDisplay } from 'vuetify'
import { VDialog, VMenu } from 'vuetify/components'

defineProps<{ listItem: any }>()

const store = inject('store') as Store
const readonly = inject('readonly', ref(false))

const { getFileIcon, menuActiveFile, renameMenu } = useFileSelector()
const { mobile } = useDisplay()

const newFilename = ref('')

const rules = [
  (v: string) => !!v || 'Filename cannot be empty',
  (v: string) => isValidFilename(v) || 'A file with this name already exists',
]

const isValidRename = computed(
  () =>
    rules.every((rule) => rule(newFilename.value) === true) &&
    newFilename.value !== menuActiveFile.value
)

watch(renameMenu, (newVal) => {
  if (!newVal) return

  newFilename.value = menuActiveFile.value.replace(/^src\//, '')
})

function isValidFilename(filename: string) {
  return Object.keys(store.state.files).every(
    (file) => file === menuActiveFile.value || file !== `src/${filename}`
  )
}

function doneRename() {
  if (!isValidRename.value) return

  store.renameFile(menuActiveFile.value, `src/${newFilename.value}`)
  menuActiveFile.value = `src/${newFilename.value}`
  renameMenu.value = false
}
</script>
