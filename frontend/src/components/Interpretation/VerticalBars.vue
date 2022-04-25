<template>
    <g v-for="(feature, index) in orderedshap" :key="shapvalue.model+feature.feature" :transform="'translate(0,'+barchartheight*index+')'">
        <VerticalBar :featureshap='feature' :width="width" :height="barchartheight" :titleheight="titleheight" :shapscale='normalizechecked?shapscale:shapscaleown' :yscale="yscale" :shapbarscale="normalizechecked?shapbarscale:shapbarscaleown" :colorscale="colorscale" @handleFeatureSelect="handleFeatureSelect" :charttype="charttype" :modelname="shapvalue.model" :sortMetric="sortMetric" :getShapMetrc="getShapMetrc"/>
    </g>
</template>

<script>
import { scaleBand, scaleLinear, max } from 'd3'
import VerticalBar from './VerticalBar.vue'
import Axis from '../Common/Axis.vue'
import { SwapOutlined } from '@ant-design/icons-vue'
export default {
  name: 'VerticalBars',
  props: ['shapvalue', 'width', 'colorscale', 'barchartheight', 'titleheight', 'layoutMethod', 'charttype', 'sortMetric', 'sortClass', 'shapscale', 'shapbarscale', 'normalizechecked', 'sortedfeaturenames', 'getShapMetrc'],
  components: { VerticalBar, SwapOutlined, Axis },
  emits: ['handleFeatureSelect', 'handleFeatureReorder'],
  computed: {
    // sort shapvalues in one column according to shap value from selected metric
    orderedshap: function () {
      const getShapMetrc = this.getShapMetrc
      if (this.layoutMethod !== 'FeatureName') {
        if (this.sortClass === 'all') {
          return this.shapvalue.values.sort((b, a) => {
            return max(a.shap.map(d => getShapMetrc(d, this.sortMetric))) - max(b.shap.map(d => getShapMetrc(d, this.sortMetric)))
          })
        } else {
          return this.shapvalue.values.sort((b, a) => {
            return getShapMetrc(a.shap.find(d => d.class === this.sortClass), this.sortMetric) - getShapMetrc(b.shap.find(d => d.class === this.sortClass), this.sortMetric)
          })
        }
      } else {
        return this.sortedfeaturenames.map((feasturename) => {
          const shapvalue = this.shapvalue.values.find(d => d.feature === feasturename)
          if (shapvalue) {
            return shapvalue
          } else {
            return { feature: feasturename, shap: null }
          }
        })
      }
    },
    shapbarscaleown: function () {
      const extend = Math.abs(max(this.shapvalue.values.flatMap(d => d.shap).flatMap(dd => Math.abs(this.getShapMetrc(dd, this.sortMetric)))))
      if (this.sortMetric === 'std') return scaleLinear().domain([0, extend]).range([0, this.width])
      else return scaleLinear().domain([-extend, extend]).range([0, this.width])
    },
    shapscaleown: function () {
      const extend = Math.abs(max(this.shapvalue.values.flatMap(d => d.shap).flatMap(dd => [Math.abs(dd.max), Math.abs(dd.min)])))
      return scaleLinear().domain([-extend, extend]).range([0, this.width])
    },
    // Y scale for classes
    yscale: function () {
      return scaleBand().domain(this.shapvalue.values[0].shap.map(d => d.class)).range([0, this.barchartheight - this.titleheight]).padding(0.2)
    }
  },
  methods: {
    handleFeatureSelect (feature) {
      this.$emit('handleFeatureSelect', feature)
    }
  }
}
</script>
