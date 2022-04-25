<template>
    <g ref="gRef" :transform="`translate(${margin.left},${margin.top})`">
        <Axis orient="bottom" :scale="xscale" :translateX="0" :translateY="chartHeight" type="category" :rotatestyle="true"/>
        <Axis orient="left" :scale="yscale" :translateX="0" :translateY="0" :format="yaxisformat"/>
        <rect v-for="d in bardata" :x="xscale(d.name)" :y="yscale(d.value)" :width="xscale.bandwidth()" :height="chartHeight-yscale(d.value)" fill="#ccced0" :key="d.name" :class="`info-${d.name}`" @mouseenter="(e)=>mouseEnterModelBar(d.name,e)" @mouseleave="mouseLeaveModelBar(d.name)"/>
        <line v-if="selectedmodel" x1="0" :y1="hovery" :x2="chartWidth" :y2="hovery" stroke="#333333" stroke-width="1" stroke-dasharray="5 2"/>
        <text v-if="selectedmodel" :x="xscale(selectedmodel)+xscale.bandwidth()/2" :y="hovery" dy="-2" font-size="10" text-anchor="middle">{{formatinfo(selectedbar)}}</text>
    </g>
</template>

<script>
import { max, min, scaleBand, scaleLinear, format } from 'd3'
import Axis from '../Common/Axis.vue'

export default {
  name: 'BarStatistics',
  props: ['bardata', 'width', 'height', 'margin', 'mouseEnterModelBar', 'mouseLeaveModelBar', 'selectedmodel'],
  components: { Axis },
  data () {
    return {
      yaxisformat: function (d) {
        return format('.1f')(d)
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
      return scaleBand().domain(this.bardata.map(d => d.name)).range([0, this.chartWidth]).padding(0.3)
    },
    yscale () {
      return scaleLinear().domain([0, 1]).range([this.chartHeight, 0])
    },
    selectedbar () {
      if (this.selectedmodel) {
        return this.bardata.find(d => d.name === this.selectedmodel).value
      } else {
        return 0
      }
    },
    hovery () {
      if (this.selectedmodel) {
        return this.yscale(this.selectedbar)
      } else {
        return 0
      }
    },
    formatinfo () {
      return format('.2f')
    }
  }

}
</script>

<style lang="less" scoped>
rect{
    cursor: pointer;
}
</style>
