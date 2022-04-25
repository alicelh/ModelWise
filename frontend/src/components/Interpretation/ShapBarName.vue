<template>
    <foreignObject x="0" y="0" :width="width" :height="titleheight">
    <div class="modelname" :title="shapvalue.model" @click="clickonmodelname(shapvalue.model)" :style="selectedmodelname===shapvalue.model&&layoutMethod==='FeatureName'?{color:'#08c'}:{}">
        <div :style="layoutMethod==='FeatureName'?{cursor: 'pointer'}:{}">
        {{shapvalue.model}}
        <SwapOutlined :rotate="90" v-show="layoutMethod==='FeatureName'" />
        </div>
    </div>
    </foreignObject>
    <g :transform='"translate(0,"+titleheight+")"'>
    <Axis orient="bottom" :scale="axisscale" :translateX="0" :translateY="0" :format="axisformat"/>
    </g>
</template>

<script>
import Axis from '../Common/Axis.vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { scaleLinear, max, format } from 'd3'
export default {
  name: 'ShapBarName',
  components: { Axis, SwapOutlined },
  data () {
    return {
      axisformat: (d) => {
        if (d < 0.001 && d > -0.001 && d !== 0) return format('.1e')(d)
        else return format('.2')(d)
      }
    }
  },
  props: ['shapvalue', 'normalizechecked', 'layoutMethod', 'titleheight', 'selectedmodelname', 'width', 'shapscale', 'charttype', 'shapbarscale', 'sortMetric', 'getShapMetrc'],
  emits: ['handleFeatureReorder'],
  computed: {
    shapscaleown: function () {
      const extend = Math.abs(max(this.shapvalue.values.flatMap(d => d.shap).flatMap(dd => [Math.abs(dd.max), Math.abs(dd.min)])))
      return scaleLinear().domain([-extend, extend]).range([0, this.width])
    },
    shapbarscaleown: function () {
      const extend = Math.abs(max(this.shapvalue.values.flatMap(d => d.shap).flatMap(dd => Math.abs(this.getShapMetrc(dd, this.sortMetric)))))
      if (this.sortMetric === 'std') return scaleLinear().domain([0, extend]).range([0, this.width])
      else return scaleLinear().domain([-extend, extend]).range([0, this.width])
    },
    axisscale: function () {
      if (this.charttype === 'boxplot' || this.charttype === 'violinplot') {
        if (this.normalizechecked) {
          return this.shapscale
        } else {
          return this.shapscaleown
        }
      } else {
        if (this.normalizechecked) {
          return this.shapbarscale
        } else {
          return this.shapbarscaleown
        }
      }
    }
  },
  methods: {
    clickonmodelname (modelname) {
      if (this.layoutMethod === 'FeatureName') {
        this.$emit('handleFeatureReorder', modelname)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.modelname{
    font-size: 1.1em;
}
</style>
