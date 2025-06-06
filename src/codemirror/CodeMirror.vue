<template>
  <div class="editor" ref="el"></div>
</template>

<script setup lang="ts">
import type { ModeSpec, ModeSpecOptions } from 'codemirror'
import { ref, onMounted, watchEffect, inject } from 'vue'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import { debounce } from '../utils'
import CodeMirror from './codemirror'

export interface Props {
  mode?: string | ModeSpec<ModeSpecOptions>
  value?: string
  readonly?: boolean
  extension?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'htmlmixed',
  value: '',
  readonly: false,
})

const emit = defineEmits<(e: 'change', value: string) => void>()

const el = ref()
const needAutoResize = inject('autoresize')

onMounted(() => {
  const addonOptions = {
    autoCloseBrackets: true,
    autoCloseTags: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
      'Tab': 'emmetExpandAbbreviation',
      'Esc': 'emmetResetAbbreviation',
      'Enter': 'emmetInsertLineBreak'
    },
    emmet: {
      mark: true,
      markTagPairs: true,
      previewOpenTag: true,
      preview: true,
      autoRenameTags: true,
    }
  }

  const editor = CodeMirror(el.value!, {
    value: '',
    mode: props.mode,
    readOnly: props.readonly,
    tabSize: 2,
    lineWrapping: true,
    lineNumbers: true,
    inputStyle: 'contenteditable',
    ...addonOptions
  })

  editor.on('change', () => {
    emit('change', editor.getValue())
  })

  editor.on('blur', async () => {
    const parser = props.extension === 'vue' ? 'html'
      : props.extension === 'html' ? 'html'
      : props.extension === 'css' ? 'css'
      : props.extension === 'js' ? 'babel'
      : props.extension === 'ts' ? 'babel'
      : props.extension || props.mode

    const options = {
      parser,
      plugins: [parserBabel, parserHtml, parserPostcss],
      semi: false,
      singleQuote: true,
      arrowParens: 'avoid' as const,
    }

    let code = editor.getValue()
    try {
      code = await prettier.format(code, options)
    } catch (err) {}

    emit('change', code)
  })

  watchEffect(() => {
    const cur = editor.getValue()
    if (props.value !== cur) {
      editor.setValue(props.value)
    }
  })

  watchEffect(() => {
    editor.setOption('mode', props.mode)
  })

  setTimeout(() => {
    editor.refresh()
  }, 50)

  if (needAutoResize) {
    window.addEventListener(
      'resize',
      debounce(() => {
        editor.refresh()
      })
    )
  }
})
</script>

<style>
.editor {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.CodeMirror {
  font-family: var(--font-code);
  line-height: 1.5;
  height: 100%;
}
</style>
