<template>
  <v-list-item
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
      <FileItemActions v-if="!readonly" :file />
    </template>
  </v-list-item>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue'
import { useFileSelector } from '../composables/useFileSelector'
import FileItemActions from './FileItemActions.vue'

const props = defineProps<{ file: string }>()

const readonly = inject('readonly', ref(false))

const { activeFile, stripSrcPrefix, getFileIcon, getFileIconColor } =
  useFileSelector()
</script>
