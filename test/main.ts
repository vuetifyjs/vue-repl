import { createApp, h, watchEffect } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { Repl, ReplStore } from '../src'
import MonacoEditor from '../src/editor/MonacoEditor.vue'
// import CodeMirrorEditor from '../src/editor/CodeMirrorEditor.vue'
import { EditorComponentType } from '../src/editor/types'
;(window as any).process = { env: {} }

const App = {
  setup() {
    const query = new URLSearchParams(location.search)
    const store = ((window as any).store = new ReplStore({
      serializedState: location.hash.slice(1),
      showOutput: query.has('so'),
      outputMode: query.get('om') || 'preview',
      defaultVueRuntimeURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/src/vue-dev-proxy`,
      defaultVueServerRendererURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/src/vue-server-renderer-dev-proxy`,
    }))

    console.log(store)

    watchEffect(() => history.replaceState({}, '', store.serialize()))

    // setTimeout(() => {
    // store.setFiles(
    //   {
    //     'index.html': '<h1>yo</h1>',
    //     'main.js': 'document.body.innerHTML = "<h1>hello</h1>"',
    //     'foo.js': 'document.body.innerHTML = "<h1>hello</h1>"',
    //     'bar.js': 'document.body.innerHTML = "<h1>hello</h1>"',
    //     'baz.js': 'document.body.innerHTML = "<h1>hello</h1>"'
    //   },
    //   'index.html'
    // )
    // }, 1000);

    // store.setVueVersion('3.2.8')

    return () =>
      h(Repl, {
        store,
        theme: 'dark',
        editor: MonacoEditor as any as EditorComponentType,
        // editor: CodeMirrorEditor as any as EditorComponentType,
        // layout: 'vertical',
        ssr: true,
        sfcOptions: {
          script: {
            // inlineTemplate: false
          },
        },
        // showCompileOutput: false,
        // showImportMap: false
      })
  },
}

const app = createApp(App)
const vuetify = createVuetify({
  theme: { defaultTheme: 'dark'}
})
app.use(vuetify)
app.mount('#app')
