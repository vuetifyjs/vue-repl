import { Store, importMapFile, tsconfigFile, stripSrcPrefix } from '../store'
import { computed, inject, ref, VNode, Ref } from 'vue'

export function useFileSelector() {
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
      .filter(
        ([name, file]) =>
          ![importMapFile, linksFile, tsconfigFile].includes(name) &&
          !file.hidden
      )
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
    set: (val) => {
      if (!pending.value) store.setActive(val)
    },
  })

  return {
    files,
    pending,
    pendingFilename,
    startAddFile,
    cancelNameFile,
    focus,
    doneNameFile,
    fileSel,
    activeFile,
    showTsConfig,
    showImportMap,
    linksFile,
    tsconfigFile,
    importMapFile,
    stripSrcPrefix,
  }
}
