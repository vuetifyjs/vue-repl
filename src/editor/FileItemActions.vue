<template>
  <component :is="mobile ? VDialog : VMenu" max-width="450">
    <template v-slot:activator="{ props }">
      <v-icon-btn
        :icon="`svg:${mdiDotsVertical}`"
        size="small"
        variant="text"
        v-bind="props"
        @click.stop="menuActiveFile = file"
      />
    </template>

    <v-list
      min-width="200"
      density="compact"
      class="py-0"
      rounded="lg"
      border
      slim
    >
      <v-list-item size="small" title="Rename" @click="renameMenu = true">
        <template v-slot:prepend>
          <v-icon size="small" :icon="`svg:${mdiPencil}`" />
        </template>

        <template v-slot:append>
          <v-hotkey keys="f2" />
        </template>
      </v-list-item>

      <v-divider />

      <v-list-item title="Delete" @click="store.deleteFile(file)">
        <template v-slot:prepend>
          <v-icon size="small" :icon="`svg:${mdiDelete}`" />
        </template>

        <template v-slot:append>
          <v-hotkey keys="cmd+backspace" />
        </template>
      </v-list-item>
    </v-list>
  </component>
</template>

<script lang="ts" setup>
import type { Store } from 'src/store'
import { inject } from 'vue'
import { useFileSelector } from '../composables/useFileSelector'
import { VIconBtn } from 'vuetify/labs/components'
import { mdiDelete, mdiDotsVertical, mdiPencil } from '@mdi/js'
import { VDialog, VMenu } from 'vuetify/components'
import { useDisplay } from 'vuetify'

defineProps<{ file: string }>()

const store = inject('store') as Store

const { mobile } = useDisplay()
const { menuActiveFile, renameMenu } = useFileSelector()
</script>
