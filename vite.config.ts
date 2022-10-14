import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

const genStub: Plugin = {
  name: 'gen-stub',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'ssr-stub.js',
      source: `module.exports = {}`
    })
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      styles: { configFile: 'src/settings.scss' },
    }),
    genStub,
  ],
  build: {
    target: 'esnext',
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => 'vue-repl.js'
    },
    rollupOptions: {
      external: ['vue', 'vue/compiler-sfc', /^vuetify/]
    }
  }
})
