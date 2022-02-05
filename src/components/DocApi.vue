<template>
  <q-card
    class="doc-api"
    flat="flat"
    bordered="bordered"
  >
    <q-toolbar class="text-grey-8">
      <card-title
        :title="nameBanner"
        prefix="api--"
      />
      <q-btn
        v-if="pageLink"
        class="q-mr-sm"
        size="sm"
        padding="xs sm"
        color="brand-primary"
        no-caps="no-caps"
        unelevated="unelevated"
        :to="docPath"
      >
        <q-icon name="launch" />
        <div class="q-ml-xs">
          Docs
        </div>
      </q-btn>
      <q-input
        ref="inputRef"
        v-model="filter"
        class="col"
        dense="dense"
        input-class="text-right"
        borderless="borderless"
        placeholder="Filter..."
        style="min-width: 6em"
      >
        <template #append>
          <q-icon
            class="cursor-pointer"
            :name="inputIcon"
            @click="onFilterClick"
          />
        </template>
      </q-input>
    </q-toolbar>
    <q-linear-progress
      v-if="loading"
      color="brand-primary"
      indeterminate="indeterminate"
    /><template v-else-if="nothingToShow">
      <q-separator />
      <div class="doc-api__nothing-to-show">
        Nothing to display
      </div>
    </template><template v-else>
      <q-separator />
      <q-tabs
        v-model="currentTab"
        class="bg-grey-2 text-grey-7"
        active-color="brand-primary"
        indicator-color="brand-primary"
        align="left"
        :breakpoint="0"
        dense="dense"
      >
        <q-tab
          v-for="tab in tabsList"
          :key="`api-tab-${tab}`"
          :name="tab"
        >
          <div class="row no-wrap items-center">
            <span class="q-mr-xs text-capitalize text-weight-medium">{{ tab }}</span>
            <q-badge
              v-if="filteredApiCount[tab].overall"
              :label="filteredApiCount[tab].overall"
            />
          </div>
        </q-tab>
      </q-tabs>
      <q-separator />
      <q-tab-panels
        v-model="currentTab"
        animated="animated"
      >
        <q-tab-panel
          v-for="tab in tabsList"
          :key="tab"
          class="q-pa-none"
          :name="tab"
        >
          <div
            v-if="innerTabsList[tab].length !== 1"
            class="row no-wrap api-container"
          >
            <div class="col-auto row no-wrap text-grey-7 q-py-sm">
              <q-tabs
                v-model="currentInnerTab"
                active-color="brand-primary"
                indicator-color="brand-primary"
                :breakpoint="0"
                vertical="vertical"
                dense="dense"
                shrink="shrink"
              >
                <q-tab
                  v-for="innerTab in innerTabsList[tab]"
                  :key="`api-inner-tab-${innerTab}`"
                  class="inner-tab"
                  :name="innerTab"
                >
                  <div class="row no-wrap items-center self-stretch">
                    <span class="q-mr-xs text-capitalize text-weight-medium">{{ innerTab }}</span>
                    <div class="col" />
                    <q-badge
                      v-if="filteredApiCount[tab].category[innerTab]"
                      :label="filteredApiCount[tab].category[innerTab]"
                    />
                  </div>
                </q-tab>
              </q-tabs>
            </div>
            <q-separator vertical="vertical" />
            <q-tab-panels
              v-model="currentInnerTab"
              class="col"
              animated="animated"
              transition-prev="slide-down"
              transition-next="slide-up"
            >
              <q-tab-panel
                v-for="innerTab in innerTabsList[tab]"
                :key="innerTab"
                class="q-pa-none"
                :name="innerTab"
              >
                <DocApiEntry
                  :type="tab"
                  :definition="filteredApi[tab][innerTab]"
                />
              </q-tab-panel>
            </q-tab-panels>
          </div>
          <div
            v-else
            class="api-container"
          >
            <DocApiEntry
              :type="tab"
              :definition="filteredApi[tab][defaultInnerTabName]"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-card>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { mdiClose, mdiMagnify } from '@quasar/extras/mdi-v6'

import CardTitle from './CardTitle.vue'
import DocApiEntry from './DocApiEntry.js'

const defaultInnerTabName = '__default'

function getPropsCategories (props) {
  const acc = new Set()

  for (const key in props) {
    if (props[key] !== void 0) {
      const value = props[key]

      value.category.split('|').forEach(groupKey => {
        acc.add(groupKey)
      })
    }
  }

  return acc.size === 1
    ? [defaultInnerTabName]
    : Array.from(acc).sort()
}

function getInnerTabs (api, tabs, apiType) {
  const acc = {}

  tabs.forEach(tab => {
    acc[tab] = apiType === 'component' && tab === 'props'
      ? getPropsCategories(api[tab])
      : [defaultInnerTabName]
  })

  return acc
}

function parseApi (api, tabs, innerTabs) {
  const acc = {}

  tabs.forEach(tab => {
    const apiValue = api[tab]

    if (innerTabs[tab].length > 1) {
      const inner = {}

      innerTabs[tab].forEach(subTab => {
        inner[subTab] = {}
      })

      for (const key in apiValue) {
        if (apiValue[key] !== void 0) {
          const value = apiValue[key]

          value.category.split('|').forEach(groupKey => {
            inner[groupKey][key] = value
          })
        }
      }

      acc[tab] = inner
    } else {
      acc[tab] = {}
      acc[tab][defaultInnerTabName] = apiValue
    }
  })

  return acc
}

function passesFilter (filter, name, desc) {
  return (name.toLowerCase().indexOf(filter) > -1) ||
    (desc !== void 0 && desc.toLowerCase().indexOf(filter) > -1)
}

function getFilteredApi (parsedApi, filter, tabs, innerTabs) {
  if (filter === '') {
    return parsedApi
  }

  const acc = {}

  tabs.forEach(tab => {
    const tabApi = parsedApi[tab]
    const tabCategories = innerTabs[tab]

    acc[tab] = {}
    tabCategories.forEach(categ => {
      const subTabs = {}
      const categoryEntries = tabApi[categ]

      for (const name in categoryEntries) {
        const entry = categoryEntries[name]
        if (passesFilter(filter, name, entry.desc) === true) {
          subTabs[name] = entry
        }
      }

      acc[tab][categ] = subTabs
    })
  })

  return acc
}

function getApiCount (parsedApi, tabs, innerTabs) {
  const acc = {}

  tabs.forEach(tab => {
    const tabApi = parsedApi[tab]
    const tabCategories = innerTabs[tab]

    if (['value', 'arg', 'quasarConfOptions', 'injection'].includes(tab)) {
      acc[tab] = {
        overall: Object.keys(tabApi[tabCategories[0]]).length === 0
          ? 0
          : 1
      }
      return
    }

    acc[tab] = { overall: 0 }

    if (tabCategories.length === 1) {
      const categ = tabCategories[0]
      const count = Object.keys(tabApi[categ]).length

      acc[tab] = {
        overall: count,
        category: { [categ]: count }
      }
    } else {
      acc[tab].category = {}

      tabCategories.forEach(categ => {
        const count = Object.keys(tabApi[categ]).length
        acc[tab].category[categ] = count
        acc[tab].overall += count
      })
    }
  })

  return acc
}

export default {
  name: 'DocApi',

  components: {
    CardTitle,
    DocApiEntry
  },

  props: {
    file: {
      type: String,
      required: true
    },

    defaultTab: {
      required: false,
      type: String,
      default: null
    },
    defaultInnerTab: {
      required: false,
      type: String,
      default: null
    },

    pageLink: Boolean
  },

  setup (props) {
    const inputRef = ref(null)

    const loading = ref(true)
    const nameBanner = ref('Loading API...')
    const nothingToShow = ref(false)

    const docPath = ref('')

    const filter = ref('')
    const apiDef = ref({})

    const tabsList = ref([])
    const innerTabsList = ref({})

    const currentTab = ref(props.defaultTab)
    const currentInnerTab = ref(props.defaultInnerTab)

    watch(currentTab, val => {
      currentInnerTab.value = props.defaultInnerTab || innerTabsList.value[val][0]
    })

    const inputIcon = computed(() => filter.value !== '' ? mdiClose : mdiMagnify)
    const filteredApi = computed(() => getFilteredApi(apiDef.value, filter.value.toLowerCase(), tabsList.value, innerTabsList.value))
    const filteredApiCount = computed(() => getApiCount(filteredApi.value, tabsList.value, innerTabsList.value))

    function parseApiFile (name, { type, behavior, meta, addedIn, ...api }) {
      nameBanner.value = name
      docPath.value = meta.docsUrl.replace(/^https:\/\/v[\d]+\.quasar\.dev/, '')

      const tabs = Object.keys(api)

      if (tabs.length === 0) {
        nothingToShow.value = true
        return
      }

      tabsList.value = tabs
      currentTab.value = currentTab.value || tabs[0]

      const subTabs = getInnerTabs(api, tabs, type)
      innerTabsList.value = subTabs
      apiDef.value = parseApi(api, tabs, subTabs)
    }

    function onFilterClick () {
      if (filter.value !== '') {
        filter.value = ''
      }

      inputRef.value.focus()
    }

    onMounted(() => {
      import(
        /* webpackChunkName: "quasar-api" */
        /* webpackMode: "lazy-once" */
        'quasar/dist/api/' + props.file + '.json'
      ).then(json => {
        parseApiFile(props.file, json.default)
        loading.value = false
      })
    })

    return {
      loading,
      nameBanner,
      nothingToShow,
      docPath,

      filteredApi,
      filteredApiCount,

      tabsList,
      innerTabsList,
      defaultInnerTabName,

      currentTab,
      currentInnerTab,

      inputRef,
      filter,
      inputIcon,
      onFilterClick
    }
  }
}
</script>

<style lang="sass">
.doc-api
  .q-tab
    height: 40px

  .inner-tab
    justify-content: left
    .q-tab__content
      width: 100%

  .api-container
    max-height: 600px

  &__nothing-to-show
    padding: 16px
    color: $grey
    font-size: .8em
    font-style: italic
</style>
