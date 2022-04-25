<template>
    <div class="featureselection">
      <div>
        <a-radio-group v-model:value="projectionmethod" @change="changeprojectionmethod">
          <a-radio :value="'tsne_num'">TSNE(num)</a-radio>
          <a-radio :value="'tsne_categorical'">TSNE(cat)</a-radio>
          <!-- <a-radio :value="'tsne_gower'">TSNE(gower))</a-radio> -->
          <a-radio :value="'tsne_all'">TSNE(all)</a-radio>
          <!-- <a-radio :value="'umap'">UMAP</a-radio> -->
          <!-- <a-radio :value="'fa'">FAMD</a-radio> -->
        </a-radio-group>
      </div>
      <a-select
        mode="multiple"
        v-model:value="value"
        style="width: 100%; height:45px"
        size="small"
        placeholder="Please select"
      >
        <a-select-option v-for="name in featurenames" :key="name">
          {{ name }}
        </a-select-option>
      </a-select>
      <a-button size="small" @click="selectAll">SelectAll</a-button>
      <a-button size="small" @click="clearFeatures">Clear</a-button>
      <a-button size="small" @click="calProjection" id="projectbutton">Project</a-button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'FeatureSelection',
  setup () {
    const projectionmethod = ref < string > ('tsne_all')
    const store = useStore()

    const calProjection = () => {
      store.dispatch('getProjectionResult', projectionmethod.value)
    }

    const clearFeatures = () => {
      store.commit('updateSelectedFeatures', [])
    }

    const selectAll = () => {
      store.commit('updateSelectedFeatures', store.state.featurenames)
    }

    const changeprojectionmethod = () => {
      store.commit('changeProjectionMethod', projectionmethod.value)
    }

    return {
      value: computed({
        get: () => store.state.selectedfeatures,
        set: (value) => {
          store.commit('updateSelectedFeatures', value)
        }
      }),
      featurenames: computed(() => store.state.featurenames),
      calProjection,
      clearFeatures,
      selectAll,
      projectionmethod,
      changeprojectionmethod
    }
  }
})
</script>

<style lang="less" scoped>
:deep(.ant-select-selector){
    height:45px;
    align-items: start;
    align-content: flex-start;
}

:deep(.ant-select-selection-placeholder){
  transform: translateY(0) !important;
  top:0 !important;
}

#projectbutton{
  float:right;
}
</style>
