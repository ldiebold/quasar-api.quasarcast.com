<script setup>
import { ref } from 'vue'
import DocApi from 'components/DocApi'
import { useUrlSearchParams } from '@vueuse/core'

const params = useUrlSearchParams()

const currentTab = ref(params.current || '__default')
const innerTab = ref(params['inner-tab'])
const item = ref(params.item)
const scrollTo = ref(params['scroll-to'])
</script>

<template>
  <doc-api
    v-if="item"
    ref="apiRef"
    :key="item"
    v-model:current-tab="currentTab"
    v-model:current-inner-tab="innerTab"
    :file="item"
    page-link
    slugified-title="meep"
    :scroll-to="scrollTo"
  />
  <div v-else>
    invalid url. Try adding "?item=QTable" at the end of the url 😊
  </div>
</template>
