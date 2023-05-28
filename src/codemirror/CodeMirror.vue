<template>
  <div class="editor" ref="el"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, inject } from 'vue'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserPostcss from 'prettier/parser-postcss'
import { debounce } from '../utils'
import CodeMirror from './codemirror'

export interface Props {
  mode?: string
  value?: string
  readonly?: boolean
  extension?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'htmlmixed',
  value: '',
  readonly: false
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

  editor.on('blur', () => {
    const parser = props.mode === 'vue' ? 'html'
      : props.mode === 'htmlmixed' ? 'html'
      : props.mode === 'javascript' ? 'babel'
      : props.mode === 'css' ? 'postcss'
      : props.extension || props.mode
    emit('change', prettier.format(
      editor.getValue(),
      {
        parser,
        plugins: [parserBabel, parserHtml, parserPostcss],
        semi: false,
        singleQuote: true,
        arrowParens: 'avoid',
      }
    ))
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
