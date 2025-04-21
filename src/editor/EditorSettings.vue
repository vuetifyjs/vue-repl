<script setup lang="ts">
import { inject } from 'vue'
import { Store } from '../store'
import { VIconBtn } from 'vuetify/lib/labs/components'

const store = inject('store') as Store
const showMessage = defineModel<boolean>('showMessage')
</script>

<template>
  <div class="wrapper">
    <v-menu :close-on-content-click="false" location="top end">
      <template v-slot:activator="{ props }">
        <v-icon-btn icon="mdi-cog" v-bind="props" variant="tonal" />
      </template>

      <v-list density="compact">
        <v-list-item>
          <v-switch
            v-model="showMessage"
            label="Show errors"
            color="primary"
            inset
            hide-details
            density="compact"
          />
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-switch
            v-model="store.state.wordWrap"
            label="Word wrap"
            color="primary"
            inset
            hide-details
            density="compact"
          />
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style>
.wrapper {
  position: absolute;
  bottom: 10px;
  right: 24px;
  z-index: 1000;
}
</style>
