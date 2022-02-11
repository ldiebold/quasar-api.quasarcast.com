<template>
  <doc-api
    v-if="item"
    ref="apiRef"
    :key="item"
    :file="item"
    page-link="page-link"
    slugified-title="meep"
    :default-tab="defaultTab"
    :default-inner-tab="innerTab"
    :scroll-to="scrollTo"
  />
  <div v-else>
    invalid url. Try adding "?item=QTable" at the end of the url 😊
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DocApi from 'components/DocApi'
import { useUrlSearchParams } from '@vueuse/core'

const params = useUrlSearchParams()

const defaultTab = ref(params.tab)
const innerTab = ref(params['inner-tab'])
const item = ref(params.item)
const scrollTo = ref(params['scroll-to'])
</script>
