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
} from 'vue'
import * as monaco from 'monaco-editor-core'
import { initMonaco } from './env'
import { getOrCreateModel } from './utils'
import { loadGrammars, loadTheme } from 'monaco-volar'
import { Store } from '../store'
import type { EditorOptions, PreviewMode } from '../editor/types'
import parserBabel from 'prettier/plugins/babel'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import prettier from 'prettier/standalone'

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
const editorOptions = inject<EditorOptions>('editor-options')

initMonaco(store)

const lang = computed(() => (props.mode === 'css' ? 'css' : 'javascript'))
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
    ...(props.readonly
      ? { value: props.value, language: lang.value }
      : { model: null }),
    fontSize: 13,
    theme: replTheme.value === 'light' ? theme.light : theme.dark,
    readOnly: props.readonly,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: editorOptions?.monaco?.minimap,
    inlineSuggest: editorOptions?.monaco?.inlineSuggest,
    'semanticHighlighting.enabled': true,
    fixedOverflowWidgets: true,
    wordWrap: editorOptions?.monaco?.wordWrap,
    padding: editorOptions?.monaco?.padding,
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

  watch(
    () => props.value,
    (value) => {
      if (editorInstance.getValue() === value) return
      editorInstance.setValue(value || '')
    },
    { immediate: true }
  )

  watch(lang, (lang) =>
    monaco.editor.setModelLanguage(editorInstance.getModel()!, lang)
  )

  if (!props.readonly) {
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
  }

  watch(
    () => editorOptions?.monaco?.wordWrap,
    () => {
      editorInstance.updateOptions({
        wordWrap: editorOptions?.monaco?.wordWrap,
      })
    }
  )

  await loadGrammars(monaco, editorInstance)

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    // ignore save event
  })

  editorInstance.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
    editorOptions?.patch?.({
      monaco: {
        wordWrap: editorOptions?.monaco?.wordWrap === 'on' ? 'off' : 'on',
      },
    })
  })

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
    store.state.showFileExplorer = !store.state.showFileExplorer
  })

  editorInstance.onDidChangeModelContent(() => {
    emit('change', editorInstance.getValue())
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
      code = await prettier.format(code, options)
    } catch (err) {}

    if (code !== props.value) {
      emit('change', code)
    }
  })

  // update theme
  watch(replTheme, (n) => {
    editorInstance.updateOptions({
      theme: n === 'light' ? theme.light : theme.dark,
    })
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
