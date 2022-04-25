<template>
    <div style="height:100px;" :id="`feature-${feature.feature}`">
        <div class="featurehead">
            <div class="featurename" :title="feature.feature">
            {{feature.feature}}
            </div>
            <div class="featurebuttons">
            <a-button size="small" @click="togglefeatureinfo" v-if="feature.type==='categorical'">
                <template #icon><InfoOutlined /></template>
            </a-button>
            <a-button size="small" @click="encodeProjection">
                <template #icon><BgColorsOutlined/></template>
            </a-button>
            <a-button size="small" @click="handleAddFeature">
                <template #icon><PlusOutlined /></template>
            </a-button>
            <a-button size="small" @click="handleDeleteFeature">
                <template #icon><MinusOutlined /></template>
            </a-button>
            </div>
        </div>
        <div>
            <svg :width="width" :height="height">
                <g :transform='"translate("+margin.left+","+margin.top+")"'>
                    <BarFeature v-if="feature.type==='categorical'" :data="feature.data" :colorScale="colorScale" :colorScaleDark="colorScaleDark" :chartWidth="chartWidth" :chartHeight="chartHeight"  :subset="feature.subset" :subsetchecked="subsetchecked" :isDensityShow="isDensityShow" :classes="classes" :feautureinfoshow="feautureinfoshow"/>
                    <HistogramFeature v-else :data="feature.data" :colorScale="colorScale" :colorScaleDark="colorScaleDark" :chartWidth="chartWidth"  :chartHeight="chartHeight" :subset="feature.subset" :subsetchecked="subsetchecked" :isDensityShow="isDensityShow" />
                </g>
                <g :transform='"translate("+10+","+(chartHeight+margin.top+15)+")"'>
                    <FeatureUse :featureusestate="featureusestate" :chartWidth="width-10" :chartHeight="margin.bottom-15"/>
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import BarFeature from './BarFeature.vue'
import HistogramFeature from './HistogramFeature.vue'
import FeatureUse from './FeatureUse.vue'
import { PlusOutlined, MinusOutlined, BgColorsOutlined, InfoOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'FeatureInfo',
  props: ['feature', 'subsetchecked', 'featureusestate', 'chartWidth', 'chartHeight', 'transform', 'isDensityShow', 'classes'],
  components: { BarFeature, HistogramFeature, FeatureUse, PlusOutlined, MinusOutlined, BgColorsOutlined, InfoOutlined },
  setup (props) {
    const store = useStore()
    const width = 408
    const height = 75
    const margin = { left: 25, bottom: 25, top: 9, right: 10 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const handleAddFeature = () => {
      if (store.state.selectedfeatures.includes(props.feature.feature)) {} else { store.commit('updateSelectedFeatures', store.state.selectedfeatures.concat([props.feature.feature])) }
    }

    const handleDeleteFeature = () => {
      if (store.state.selectedfeatures.includes(props.feature.feature)) { store.commit('updateSelectedFeatures', store.state.selectedfeatures.filter(item => item !== props.feature.feature)) } else {}
    }

    const encodeProjection = () => {
      store.dispatch('changeEncodeFeature', props.feature.feature)
    }

    const feautureinfoshow = ref(false)
    const togglefeatureinfo = () => {
      feautureinfoshow.value = !feautureinfoshow.value
    }

    return {
      handleAddFeature,
      handleDeleteFeature,
      colorScale: computed(() => store.state.colorscale),
      colorScaleDark: computed(() => store.state.colorscaledark),
      width,
      height,
      chartWidth,
      chartHeight,
      margin,
      encodeProjection,
      feautureinfoshow,
      togglefeatureinfo
    }
  }
})
</script>

<style lang="less" scoped>
.featurehead{
    width:100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
}

.featurename{
    flex: 0 1 180px;
    font-size: 13px;
}

button{
    width:20px !important;
    height: 20px !important;
    margin-left: 2px;
}

.featurehead :deep(.anticon) {
  font-size: 12px;
  vertical-align: text-top;
  color: rgba(0,0,0,0.5);
}
</style>
