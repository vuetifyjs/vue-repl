<script setup lang="ts">
import { Store } from '../store'
import { computed, inject, ref, VNode, Ref } from 'vue'

const store = inject('store') as Store

const pending = ref(false)
const pendingFilename = ref('Comp.vue')
const importMapFile = 'import-map.json'
const showImportMap = inject('import-map') as Ref<boolean>
const files = computed(() =>
  Object.entries(store.state.files)
    .filter(([name, file]) => name !== importMapFile && !file.hidden)
    .map(([name]) => name)
)

function startAddFile() {
  let i = 0
  let name = `Comp.vue`

  while (true) {
    let hasConflict = false
    for (const file in store.state.files) {
      if (file === name) {
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

function cancelAddFile() {
  pending.value = false
}

function focus({ el }: VNode) {
  ;(el as HTMLInputElement).focus()
}

function doneAddFile() {
  if (!pending.value) return
  const filename = pendingFilename.value

  if (!/\.(vue|js|ts|css)$/.test(filename)) {
    store.state.errors = [
      `Playground only supports *.vue, *.js, *.ts, *.css files.`
    ]
    return
  }

  if (filename in store.state.files) {
    store.state.errors = [`File "${filename}" already exists.`]
    return
  }

  store.state.errors = []
  cancelAddFile()
  store.addFile(filename)
}

const fileSel = ref(null)
function horizontalScroll(e: WheelEvent) {
  e.preventDefault()
  const el = fileSel.value! as HTMLElement
  const direction =
    Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  const distance = 30 * (direction > 0 ? 1 : -1)
  el.scrollTo({
    left: el.scrollLeft + distance
  })
}

const activeFile = computed({
  get: () => store.state.activeFile.filename,
  set: val => { if (!pending.value) store.setActive(val) }
})
</script>

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
      <span>{{ file }}</span>
      <span v-if="i > 0" class="remove" @click.stop="store.deleteFile(file)">
        <svg class="icon" width="12" height="12" viewBox="0 0 24 24">
          <line stroke="#999" x1="18" y1="6" x2="6" y2="18"></line>
          <line stroke="#999" x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    </v-tab>
    <v-tab v-if="pending" class="file pending" size="small">
      <input
        v-model="pendingFilename"
        spellcheck="false"
        @blur="doneAddFile"
        @keyup.enter="doneAddFile"
        @keyup.esc="cancelAddFile"
        @vnodeMounted="focus"
      />
    </v-tab>
    <v-btn variant="text" height="100%" @click="startAddFile">+</v-btn>

    <v-tab v-if="showImportMap" class="file import-map" size="small" :value="importMapFile">
      Import Map
    </v-tab>
  </v-tabs>
</template>

<style scoped>
.file-selector {
  /*border-bottom: 1px solid var(--border);*/
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
