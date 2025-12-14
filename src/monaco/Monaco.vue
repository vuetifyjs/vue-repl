<script lang="ts" setup>
import {
  onMounted,
  onBeforeUnmount,
  ref,
  shallowRef,
  nextTick,
  inject,
  watch,
  computed,
  type Ref,
  watchEffect,
} from 'vue'
import * as monaco from 'monaco-editor-core'
import { initMonaco } from './env'
import { getOrCreateModel } from './utils'
import { loadGrammars, loadTheme } from 'monaco-volar'
import { Store } from '../store'
import type { PreviewMode } from '../editor/types'
import parserBabel from 'prettier/plugins/babel'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import prettier from 'prettier/standalone'
import debounce from 'lodash-es/debounce'

const props = withDefaults(
  defineProps<{
    filename: string
    value?: string
    readonly?: boolean
    mode?: PreviewMode
  }>(),
  {
    readonly: false,
  }
)

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const containerRef = ref<HTMLDivElement>()
const ready = ref(false)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()
const store = inject<Store>('store')!
const autoFormat = inject<Ref<boolean>>('autoFormat', ref(true))
const wordWrap = inject<Ref<boolean>>('wordWrap', ref(false))

initMonaco(store)

const extension = computed(() => props.filename.split('.').at(-1))

const replTheme = inject<Ref<'dark' | 'light'>>('theme')!
onMounted(async () => {
  const theme = await loadTheme(monaco.editor)
  ready.value = true
  await nextTick()

  if (!containerRef.value) {
    throw new Error('Cannot find containerRef')
  }

  const editorInstance = monaco.editor.create(containerRef.value, {
    fontSize: 13,
    theme: replTheme.value === 'light' ? theme.light : theme.dark,
    readOnly: props.readonly,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    inlineSuggest: {
      enabled: false,
    },
    'semanticHighlighting.enabled': true,
    fixedOverflowWidgets: true,
    wordWrap: wordWrap.value ? 'on' : 'off',
  })
  editor.value = editorInstance

  // Support for semantic highlighting
  const t = (editorInstance as any)._themeService._theme
  t.getTokenStyleMetadata = (
    type: string,
    modifiers: string[],
    _language: string
  ) => {
    const _readonly = modifiers.includes('readonly')
    switch (type) {
      case 'function':
      case 'method':
        return { foreground: 12 }
      case 'class':
        return { foreground: 11 }
      case 'variable':
      case 'property':
        return { foreground: _readonly ? 21 : 9 }
      default:
        return { foreground: 0 }
    }
  }

  watchEffect(() => {
    if (editorInstance.getValue() !== props.value)
      editorInstance.setValue(props.value || '')

    editorInstance.updateOptions({
      readOnly: props.readonly,
      wordWrap: wordWrap.value ? 'on' : 'off',
      theme: replTheme.value === 'light' ? theme.light : theme.dark,
    })
  })

  watch(
    () => props.filename,
    (_, oldFilename) => {
      if (!editorInstance) return
      const file = store.state.files[props.filename]
      if (!file) return null
      const model = getOrCreateModel(
        monaco.Uri.parse(`file:///${props.filename}`),
        file.language,
        file.code
      )

      const oldFile = oldFilename ? store.state.files[oldFilename] : null
      if (oldFile) {
        oldFile.editorViewState = editorInstance.saveViewState()
      }

      editorInstance.setModel(model)

      if (file.editorViewState) {
        editorInstance.restoreViewState(file.editorViewState)
        editorInstance.focus()
      }
    },
    { immediate: true }
  )

  await loadGrammars(monaco, editorInstance)

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    // ignore save event
  })

  editorInstance.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
    wordWrap.value = !wordWrap.value
  })

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
    store.state.showFileExplorer = !store.state.showFileExplorer
  })

  function onUpdate() {
    emit('change', editorInstance.getValue())
  }

  let debouncedUpdate = debounce(onUpdate, 2000)

  watch(
    () => !!store.state.errors.length,
    (hasErrors) => {
      debouncedUpdate.cancel()
      debouncedUpdate = hasErrors
        ? debounce(onUpdate, 5000)
        : debounce(onUpdate, 2000)
    }
  )

  editorInstance.onDidChangeModelContent(() => {
    debouncedUpdate()
  })

  editorInstance.onDidBlurEditorWidget(async () => {
    const parser =
      {
        vue: 'html',
        html: 'html',
        css: 'css',
        js: 'babel',
        ts: 'babel',
        json: 'json',
      }[extension.value!] || props.mode

    const options = {
      parser,
      plugins: [parserBabel, parserHtml, parserPostcss],
      semi: false,
      singleQuote: true,
      arrowParens: 'avoid' as const,
    }

    let code = editorInstance.getValue()
    try {
      if (autoFormat.value) {
        code = await prettier.format(code, options)
      }
    } catch (err) {}

    if (code !== props.value) {
      debouncedUpdate.cancel()
      emit('change', code)
    }
  })
})

onBeforeUnmount(() => {
  editor.value?.dispose()
})
</script>

<template>
  <div class="editor" ref="containerRef"></div>
</template>

<style>
.editor {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
