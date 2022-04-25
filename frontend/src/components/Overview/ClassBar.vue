<template>
    <svg :width="width" :height="height">
        <g :transform="`translate(${margin.left},${margin.top})`">
            <text x="0" y="0" dy="-8" text-anchor="middle" font-size="smaller"> All </text>
            <text :x="this.chartWidth" y="0" dy="-8" text-anchor="middle" font-size="smaller"> Subset </text>
            <Axis orient="bottom" :scale="xscale" :translateX="0" :translateY="chartHeight" type="category"/>
            <Axis orient="left" :scale="yscale" :translateX="0" :translateY="0" :format="yaxisformat"/>
            <Axis orient="right" :scale="yscale2" :translateX="this.chartWidth" :translateY="0" :format="yaxisformat"/>
            <g v-for="d in classfeature" :key="'class'+d.category" :transform="`translate(${xscale(d.category)},0)`">
            <rect :x="0" :y="yscale(d.value)" :width="xscale.bandwidth()/2 - 1" :height="chartHeight-yscale(d.value)" :fill="this.colorscale(d.category)"/>
            <text :x="xscale.bandwidth()/4-1" :y="yscale(d.value)" dy="-2" text-anchor="middle" font-size="10">{{d.value}}</text>
            </g>
            <g v-for="d in subsetclassfeature" :key="'subsetclass'+d.category" :transform="`translate(${xscale(d.category)+xscale.bandwidth()/2 + 1},0)`">
            <rect :x="0" :y="yscale2(d.value)" :width="xscale.bandwidth()/2" :height="chartHeight-yscale2(d.value)" :fill="this.colorScaleDark(d.category)" />
            <text :x="xscale.bandwidth()/4+1" :y="yscale2(d.value)" dy="-2" text-anchor="middle" font-size="10">{{d.value}}</text>
            </g>
        </g>
    </svg>
</template>

<script>
import Axis from '../Common/Axis.vue'
import { scaleBand, scaleLinear, max, format } from 'd3'

export default {
  name: 'ClassBar',
  components: { Axis },
  data () {
    return {
      margin: {
        top: 18,
        left: 23,
        bottom: 18,
        right: 23
      },
      yaxisformat: function (d) {
        return format('.2~s')(d)
      }
    }
  },
  props: ['width', 'height', 'classfeature', 'subsetclassfeature', 'colorscale', 'colorScaleDark'],
  computed: {
    chartWidth () {
      return this.width - this.margin.left - this.margin.right
    },
    chartHeight () {
      return this.height - this.margin.top - this.margin.bottom
    },
    xscale () {
      return scaleBand().domain(this.classfeature.map(d => d.category)).range([0, this.chartWidth]).padding(0.4)
    },
    yscale () {
      return scaleLinear().domain([0, max(this.classfeature, d => d.value)]).rangeRound([this.chartHeight, 0])
    },
    // for subset
    yscale2 () {
      return scaleLinear().domain([0, max(this.subsetclassfeature, d => d.value)]).rangeRound([this.chartHeight, 0])
    }
  }
}
</script>
