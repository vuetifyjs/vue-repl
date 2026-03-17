<script setup lang="ts">
import { useTemplateRef } from 'vue'
import Monaco from '../monaco/Monaco.vue'
import type { EditorEmits, EditorProps } from './types'

defineProps<EditorProps>()
const emit = defineEmits<EditorEmits>()

defineOptions({
  editorType: 'monaco',
})

const onChange = (code: string) => {
  emit('change', code)
}

const editor = useTemplateRef<typeof Monaco>('monaco')

function format () {
  editor.value?.format()
}

defineExpose({ format })
</script>

<template>
  <Monaco
    ref="monaco"
    @change="onChange"
    :filename="filename"
    :value="value"
    :readonly="readonly"
    :mode="mode"
  />
</template>
