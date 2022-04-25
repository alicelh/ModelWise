<template>
    <svg :width="width" :height="svgheight">
        <g v-for="(item,i) in bardata" :key="item.name">
            <text :x="textWidth-5" :y="barwidth*i" :dy="barwidth-7" text-anchor="end">{{item.name}}</text>
            <rect :x="textWidth" :y="barwidth*i+barwidth/4" :width="xscale(item.value)" :height="barwidth-10" fill="#a0a0a0"/>
            <text :x="textWidth+xscale(item.value)-2" :y="barwidth*i" :dy="barwidth-7" text-anchor="end" fill="white">{{dataformat(item.value)}}</text>
        </g>
    </svg>
</template>

<script>
import { scaleLinear, extent, format } from 'd3'
export default {
  name: 'VerticalBarPlot',
  props: ['mydata', 'width', 'height', 'selectedmetric'],
  data () {
    return {
      textWidth: 70,
      barwidth: 25,
      dataformat: format('.2f')
    }
  },
  computed: {
    svgheight () {
      return this.barwidth * this.mydata.length;
    },
    bardata () {
      return this.mydata.map(d => {
        return { name: d.name, value: d[this.selectedmetric] }
      }).sort((a, b) => b.value - a.value)
    },
    xscale () {
      const domain = extent(this.bardata.map(d => d.value));
      if (domain[0] > 0.1) domain[0] -= 0.1;
      else domain[0] = 0;
      return scaleLinear().domain(domain).range([0, this.width - this.textWidth]);
    }
  }
}
</script>
