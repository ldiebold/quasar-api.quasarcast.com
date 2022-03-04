<script setup>
import { ref } from 'vue'
import DocApi from 'components/DocApi'
import apiList from 'quasar/dist/transforms/api-list.json'
import { copyToClipboard, Notify } from 'quasar'

const item = ref('QSelect')
const options = ref(apiList)

const split = ref(50)

const iframeUrl = ref('')

const currentTab = ref('')
const currentInnerTab = ref('')
const currentEntry = ref('')

function generateUrl () {
  const query = new URLSearchParams({
    item: item.value,
    current: currentTab.value,
    'inner-tab': currentInnerTab.value,
    'scroll-to': currentEntry.value
  })

  // const queryString = query.toString()
  //   .replace('+', '%20')

  iframeUrl.value = 'https://quasar-api.quasarcast.com/?' + query.toString()
}

function handleCopyIframeUrl () {
  const notifyOptions = {
    message: 'Copied Iframe Code',
    color: 'light-blue',
    icon: 'content_copy'
  }

  copyToClipboard(iframeUrl.value)
    .then(() => Notify.create(notifyOptions))
}

function filterFn (val, update) {
  update(() => {
    const needle = val.toLowerCase()
    options.value = apiList.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

function onEntryClicked (identifier) {
  currentEntry.value = identifier
  generateUrl()
}

</script>

<template>
  <q-page class="flex">
    <q-splitter
      v-model="split"
      class="full-width"
    >
      <template #before>
        <q-select
          v-model="item"
          outlined
          use-input
          hide-selected
          fill-input
          placeholder="Names of Quasar components, directives or plugins"
          input-debounce="0"
          :options="options"
          clearable
          options-dense
          virtual-scroll-slice-size="50"
          class="q-ma-md"
          @filter="filterFn"
        />

        <q-input
          v-if="iframeUrl"
          outlined
          dense
          type="textarea"
          rows="3"
          :model-value="iframeUrl"
          class="q-pa-md"
        >
          <template #append>
            <div class="col full-height justify-center">
              <div>
                <q-btn
                  :href="iframeUrl"
                  icon="mdi-open-in-new"
                  target="_blank"
                  type="a"
                  flat
                  dense
                  @click.stop
                />
              </div>
              <div>
                <q-btn
                  :href="iframeUrl"
                  icon="mdi-content-copy"
                  flat
                  dense
                  @click="handleCopyIframeUrl"
                />
              </div>
            </div>
          </template>
        </q-input>

        <doc-api
          v-if="item"
          ref="apiRef"
          :key="item"
          v-model:current-tab="currentTab"
          v-model:current-inner-tab="currentInnerTab"
          :file="item"
          page-link="page-link"
          slugified-title="meep"
          class="q-ma-md"
          clickable
          @entry-clicked="onEntryClicked"
        />
      </template>

      <template #after>
        <div class="q-pa-md">
          <h2 class="q-ma-none">
            Preview
          </h2>
          <iframe
            v-if="iframeUrl"
            style="min-height: calc(100vh - 120px); border: none;"
            class="full-width q-mt-md"
            :src="iframeUrl"
          />
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>
