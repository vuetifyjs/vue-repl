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
    <v-tab
      v-for="(file, i) in files"
      :value="file"
      class="file"
      size="small"
    >
      <span>{{ stripSrcPrefix(file) }}</span>
      <v-icon v-if="i > 0" @click.stop="store.deleteFile(file)" icon="$close" class="ms-2 remove" />
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

    <v-tab v-if="showTsConfig" class="file import-map" size="small" :value="tsconfigFile">
      tsconfig.json
    </v-tab>

    <v-tab v-if="showImportMap" class="file" size="small" :value="importMapFile">
      Import Map
    </v-tab>
    <v-tab class="file" size="small" :value="linksFile">
      Links
    </v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import { Store, importMapFile, tsconfigFile, stripSrcPrefix } from '../store'
import { computed, inject, ref, VNode, Ref } from 'vue'
import { mdiPlus } from '@mdi/js'

const store = inject('store') as Store

/**
 * When `true`: indicates adding a new file
 * When `string`: indicates renaming a file, and holds the old filename in case
 * of cancel.
 */
const pending = ref<boolean | string>(false)
/**
 * Text shown in the input box when editing a file's name
 * This is a display name so it should always strip off the `src/` prefix.
 */
const pendingFilename = ref('Comp.vue')
const linksFile = 'links.json'
const showTsConfig = inject<Ref<boolean>>('tsconfig')
const showImportMap = inject('import-map') as Ref<boolean>
const files = computed(() =>
  Object.entries(store.state.files)
    .filter(([name, file]) => ![importMapFile, linksFile, tsconfigFile].includes(name) && !file.hidden)
    .map(([name]) => name)
)

function startAddFile() {
  let i = 0
  let name = `Comp.vue`

  while (true) {
    let hasConflict = false
    for (const filename in store.state.files) {
      if (stripSrcPrefix(filename) === name) {
        hasConflict = true
        name = `Comp${++i}.vue`
        break
      }
    }
    if (!hasConflict) {
      break
    }
  }

  pendingFilename.value = name
  pending.value = true
}

function cancelNameFile() {
  pending.value = false
}

function focus({ el }: VNode) {
  ;(el as HTMLInputElement).focus()
}

function doneNameFile() {
  if (!pending.value) return
  // add back the src prefix
  const filename = 'src/' + pendingFilename.value
  const oldFilename = pending.value === true ? '' : pending.value

  if (!/\.(vue|js|ts|css|json)$/.test(filename)) {
    store.state.errors = [
      `Playground only supports *.vue, *.js, *.ts, *.css, *.json files.`,
    ]
    return
  }

  if (filename !== oldFilename && filename in store.state.files) {
    store.state.errors = [`File "${filename}" already exists.`]
    return
  }

  store.state.errors = []
  cancelNameFile()

  if (filename === oldFilename) {
    return
  }

  if (oldFilename) {
    store.renameFile(oldFilename, filename)
  } else {
    store.addFile(filename)
  }
}

const fileSel = ref(null)

const activeFile = computed({
  get: () => store.state.activeFile.filename,
  set: val => { if (!pending.value) store.setActive(val) }
})
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
