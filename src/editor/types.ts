import { type FunctionalComponent } from 'vue'
import type { editor } from 'monaco-editor-core'

export type PreviewMode = 'js' | 'css' | 'ssr'

export interface EditorProps {
  value: string
  filename: string
  readonly?: boolean
  mode?: PreviewMode
}

export interface EditorEmits {
  (e: 'change', code: string): void
}

export type EditorComponentType = FunctionalComponent<
  EditorProps,
  { change: (code: string) => void }
> & {
  editorType: 'monaco' | 'codemirror'
}

export interface MonacoOptions {
  wordWrap?: editor.IEditorOptions['wordWrap']
  minimap?: editor.IEditorMinimapOptions
  inlineSuggest?: editor.IInlineSuggestOptions
  padding?: editor.IEditorOptions['padding']
}

export interface EditorOptions {
  monaco?: MonacoOptions
  showErrors?: boolean
  patch: (options: Partial<EditorOptions>) => void
}

declare const EditorComponent: EditorComponentType

export default EditorComponent
