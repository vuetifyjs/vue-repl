import vuetify from 'vite-plugin-vuetify'
import { Plugin, mergeConfig } from 'vite'
import dts from 'vite-plugin-dts'
import base from './vite.preview.config'

const genStub: Plugin = {
  name: 'gen-stub',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'ssr-stub.js',
      source: `module.exports = {}`,
    })
  },
}

export default mergeConfig(base, {
  plugins: [
    dts({
      rollupTypes: true,
    }),
    vuetify({
      styles: { configFile: 'src/settings.scss' },
    }),
    genStub,
  ],
  optimizeDeps: {
    // avoid late discovered deps
    include: [
      'path-browserify',
      'onigasm',
      'typescript',
      '@volar/cdn',
      '@vue/language-service',
      'monaco-editor-core/esm/vs/editor/editor.worker',
      '@volar/monaco/worker',
      'vue/server-renderer',
    ],
  },
  base: './',
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        'vue-repl': './src/index.ts',
        'monaco-editor': './src/editor/MonacoEditor.vue',
        'codemirror-editor': './src/editor/CodeMirrorEditor.vue',
      },
      formats: ['es'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
      external: ['vue', 'vue/compiler-sfc', /^vuetify/],
    },
  },
})
