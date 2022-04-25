<template>
    <div ref="resizeRef" id="statisticsview">
        <svg ref="svgRef">
            <g :transform="'translate(0,0)'">
            <text :x="2" :y="margin.top-10">Data Count</text>
            <StackedBar :bardata="datacount" :width="chartWidth" :height="chartHeight" :margin="margin" :colorscale="colorscale" :mouseEnterModelBar="mouseEnterModelBar" :mouseLeaveModelBar="mouseLeaveModelBar"/>
            </g>
            <g :transform="'translate(0,'+chartHeight+')'">
            <text :x="2" :y="margin.top-10">Accuracy</text>
            <BarStatistics :bardata="accuracy" :width="chartWidth" :height="chartHeight" :margin="margin" :mouseEnterModelBar="mouseEnterModelBar" :mouseLeaveModelBar="mouseLeaveModelBar"
            :selectedmodel="selectedmodel"/>
            </g>
            <g :transform="'translate(0,'+2*chartHeight+')'">
            <text :x="2" :y="margin.top-10">Precision</text>
            <BarStatistics :bardata="precision" :width="chartWidth" :height="chartHeight" :margin="margin" :mouseEnterModelBar="mouseEnterModelBar" :mouseLeaveModelBar="mouseLeaveModelBar"
            :selectedmodel="selectedmodel"/>
            </g>
            <g :transform="'translate(0,'+3*chartHeight+')'">
            <text :x="2" :y="margin.top-10">Recall</text>
            <BarStatistics :bardata="recall" :width="chartWidth" :height="chartHeight" :margin="margin" :mouseEnterModelBar="mouseEnterModelBar" :mouseLeaveModelBar="mouseLeaveModelBar"
            :selectedmodel="selectedmodel"/>
            </g>
            <g :transform="'translate(0,'+4*chartHeight+')'">
            <text :x="2" :y="margin.top-10">F1</text>
            <BarStatistics :bardata="f1" :width="chartWidth" :height="chartHeight" :margin="margin" :mouseEnterModelBar="mouseEnterModelBar" :mouseLeaveModelBar="mouseLeaveModelBar"
            :selectedmodel="selectedmodel"/>
            </g>
        </svg>
    </div>
</template>

<script>
import { onMounted, watch, ref, computed, defineComponent, reactive } from 'vue'
import useResizeObserver from '@/utils/resizeObserver'
import BarStatistics from './BarStatistics.vue'
import StackedBar from './StackedBar.vue'
import { select } from 'd3'

export default defineComponent({
  name: 'SummaryBars',
  props: ['predictions', 'statistics', 'selecteddata', 'colorscale'],
  components: { BarStatistics, StackedBar },
  setup (props) {
    const svgRef = ref(null)
    const chartWidth = ref(150)
    const chartHeight = ref(474)
    const { resizeRef, resizeState } = useResizeObserver()
    const margin = reactive({ top: 20, right: 5, bottom: 35, left: 24 })

    const accuracy = computed(() => {
      const result = props.statistics.map(d => {
        return { name: d.name, value: d.accuracy }
      })
      return result.sort((b, a) => a.value - b.value)
    })
    const precision = computed(() => {
      const result = props.statistics.map(d => {
        return { name: d.name, value: d.precision }
      })
      return result.sort((b, a) => a.value - b.value)
    })
    const recall = computed(() => {
      const result = props.statistics.map(d => {
        return { name: d.name, value: d.recall }
      })
      return result.sort((b, a) => a.value - b.value)
    })
    const f1 = computed(() => {
      const result = props.statistics.map(d => {
        return { name: d.name, value: d.f1 }
      })
      return result.sort((b, a) => a.value - b.value)
    })

    // const item = ref({});
    // const toolTipX = ref(0);
    // const toolTipY = ref(0);

    const selectedmodel = ref('')
    const mouseEnterModelBar = (model ) => {
      if (model !== 'label') {
        const svg = select(svgRef.value)
        svg.selectAll(`.info-${model}`)
          .attr('stroke', '#333333')
          .attr('stroke-width', '1')

        selectedmodel.value = model
      }
    }

    const mouseLeaveModelBar = (model) => {
      if (model !== 'label') {
        const svg = select(svgRef.value)
        svg.selectAll(`.info-${model}`)
          .attr('stroke', 'none')
        // item.value = {}
        selectedmodel.value = ''
      }
    }

    /**
         * @description: calculate selected data amount for data count bar chart
         * @param {*} computed
         * @return {*}
         */
    const datacount = computed(() => {
      if (props.selecteddata.length === 0) {
        return caldataamount(props.predictions)
      } else {
        const predictions = []
        props.predictions.forEach(prediction => {
          const tmp = { name: prediction.name }
          tmp.value = props.selecteddata.map(d => prediction.value[d])
          predictions.push(tmp)
        })
        return caldataamount(predictions)
      }
    })

    const caldataamount = function (predctions) {
      return predctions.map(d => {
        const counts = {}
        d.value.forEach(dd => {
          counts[dd] = counts[dd] ? counts[dd] + 1 : 1
        })
        const result = []
        let sum = 0
        Object.entries(counts).forEach(dd => {
          sum += dd[1]
          result.push({ class: dd[0], height: dd[1], yend: sum })
        })
        return { name: d.name, value: result }
      })
    }

    watch(() => resizeState.dimensions, (dimensions, old) => {
      if (dimensions.width !== old.width || dimensions.height !== old.height) {
        const svg = select(svgRef.value)
        const { width, height } = resizeState.dimensions
        svg.attr('viewBox', [0, 0, width, height])
        chartHeight.value = height / 5
        chartWidth.value = width
      }
    })

    onMounted(() => {
      const svg = select(svgRef.value)
      const { width, height } = resizeState.dimensions
      svg.attr('viewBox', [0, 0, width, height])
      chartHeight.value = height / 5
      chartWidth.value = width
    })

    return {
      svgRef,
      resizeRef,
      chartWidth,
      chartHeight,
      datacount,
      accuracy,
      precision,
      recall,
      f1,
      margin,
      mouseEnterModelBar,
      mouseLeaveModelBar,
      selectedmodel
    }
  }
})
</script>

<style lang="less" scoped>
#statisticsview{
    position: relative;
    padding: 0;
    height: 100%;
}

</style>
