<template>
    <g ref="gRef" :transform="`translate(${margin.left},${margin.top})`">
        <Axis orient="bottom" :scale="xscale" :translateX="0" :translateY="chartHeight" type="category" :rotatestyle="true"/>
        <Axis orient="left" :scale="yscale" :translateX="0" :translateY="0" :format="yaxisformat"/>
        <g v-for="bar in bardata" :transform="`translate(${xscale(bar.name)},0)`" :key="bar.name" :class="`info-${bar.name}`" @mouseenter="(e)=>mouseEnterModelBar(bar.name,e)" @mouseleave="mouseLeaveModelBar(bar.name)">
        <rect v-for="d in bar.value" :x="0" :y="yscale(d.yend)" :width="xscale.bandwidth()" :height="chartHeight-yscale(d.height)" :fill="colorscale(d.class)" :key="d.class"/>
        </g>
    </g>
</template>

<script>
import { max, scaleBand, scaleLinear, format } from 'd3'
import Axis from '../Common/Axis.vue'

export default {
  name: 'StackedBar',
  props: ['bardata', 'width', 'height', 'margin', 'colorscale', 'mouseEnterModelBar', 'mouseLeaveModelBar'],
  components: { Axis },
  data () {
    return {
      yaxisformat: function (d) {
        return format('.1s')(d)
      }
    }
  },
  computed: {
    chartWidth () {
      return this.width - this.margin.right - this.margin.left
    },
    chartHeight () {
      return this.height - this.margin.top - this.margin.bottom
    },
    xscale () {
      return scaleBand().domain(this.bardata.map(d => d.name)).range([0, this.chartWidth]).padding(0.25)
    },
    yscale () {
      const ymax = this.bardata.length > 0 ? max(this.bardata[0].value.map(d => d.yend)) : 0
      return scaleLinear().domain([0, ymax]).range([this.chartHeight, 0])
    }
  }

}
</script>
