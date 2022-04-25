<template>
    <div id="parallelset" ref="resizeRef">
        <div class="controlpanel">
            <span style="vertical-align:middle">Misclassification View: </span>
        <a-switch v-model:checked="compresschecked" size="small"/>
        <div style="position:relative;float:right;margin-right:14px;margin-top:2px; color: #898989">* <span style="font-weight:bold">Drag</span> : <span class="keyboard">Shift</span> + Click
        </div>
        </div>
        <svg id="sankeysvg">
            <g :transform="'translate('+margin.left+','+margin.top+')'">
                <SankeyGraph :sankeyGraph="sankeyGraph" :sankey="sankey" :compresschecked="compresschecked" :predictions="predictions" :sortedmodelnames="sortedmodelnames"/>
            </g>
        </svg>
    </div>
</template>

<script lang="ts">
import { getSankeyNodes, getSankeyLinks, renderQueue } from '@/utils/utils'
import ModelSankey from './ModelSankey/modelsankey'
import useResizeObserver from '@/utils/resizeObserver'
import SankeyGraph from './SankeyGraph.vue'

import * as d3 from 'd3'
import { watch, ref, onMounted, watchEffect, computed } from 'vue'

export default {
  name: 'ParallelSet',
  props: {
    predictions: {
      type: Array,
      default: [{ name: 'label', value: [] }]
    },
    sortedmodelnames: {
      type: Array
    }
  },
  components: {
    SankeyGraph
  },
  setup (props) {
    const { resizeRef, resizeState } = useResizeObserver()
    const margin = { top: 40, bottom: 20, left: 20, right: 20 }
    const bnodewidth = 4
    const sankey = ref()
    const sankeyGraph = ref()
    const compresschecked = ref < boolean > (false)
    let sankeynodes
    let sankeylinks

    const getSankeyGraph = (dimensions) => {
      const svg = d3.select('#sankeysvg')
      const { width, height } = dimensions
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom
      svg.attr('viewBox', [0, 0, width, height])
      if (props.predictions.length > 0) {
        sankeynodes = getSankeyNodes(props.predictions, props.sortedmodelnames)
        sankeylinks = getSankeyLinks(props.predictions, null, props.sortedmodelnames)
        sankey.value = ModelSankey().extent([[0, margin.top], [chartWidth, chartHeight]]).interval(3).outnodewidth(bnodewidth + 2)
        sankeyGraph.value = sankey.value({ nodes: sankeynodes, links: sankeylinks, compressed: compresschecked.value })
        sankey.value.getsortedmodelnames(props.sortedmodelnames)
      }
    }

    // onMounted(()=>{
    //     watchEffect(()=>{
    //         getSankeyGraph(resizeState.dimensions);
    //         console.log(sankeyGraph.value)
    //     })
    // })

    // 每次初始化，dimensions都有mounted时从{}到有值的这个过程，所以RenderView总会初始渲染一次，那onmount也不需要调渲染函数了
    watch(() => resizeState.dimensions, (dimensions, old) => {
      if (dimensions.width !== old.width || dimensions.height !== old.height) {
        getSankeyGraph(dimensions)
      }
    })

    watch(() => props.sortedmodelnames, () => {
      getSankeyGraph(resizeState.dimensions)
    })

    watch(compresschecked, (checked) => {
      sankeyGraph.value = sankey.value({ nodes: sankeynodes, links: sankeylinks, compressed: checked })
      console.log(checked, sankeyGraph.value)
    })

    return { sankey, sankeyGraph, resizeRef, margin, compresschecked }
  }
}
</script>

<style lang="less" scoped>
#parallelset{
    width: 100%;
    height: 100%;
    padding: 0;
    position: relative;
}

#selectedNodes{
    pointer-events:none;
}

.selected{
    stroke: black !important;
}

svg{
    position: absolute;
    display: block;
    fill: none;
    stroke: none;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.controlpanel{
    position: absolute;
    z-index: 1;
    padding-left: 4px;
    width:inherit;
}

.keyboard{
    border: 1px solid #787878;
    border-radius: 3px; /* Making border radius */
    width: auto; /* Making auto-sizable width */
    height: auto; /* Making auto-sizable height */
    padding: 2px 5px 2px 5px; /* Making space around letters */

}
</style>
