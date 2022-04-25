<template>
    <g ref="barRef" :id="`shapfeature-${modelname}-${featureshap.feature}`">
          <filter id='shadow' color-interpolation-filters="sRGB">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-opacity="0.5"/>
        </filter>
        <rect x="0" y="0" :width="width" :height="height" fill="#ffffff" stroke="#efefef" :class="featureshap.feature+' featureborder'" visibility="hidden" filter="url(#shadow)"/>
        <foreignObject x="0" y="0" :width="width" :height="titleheight">
        <div class="featurename"  @mouseover="hoveronfeature(featureshap.feature)" @mouseleave="hoveronfeature(featureshap.feature)" @click="clickonfeaturename(featureshap.feature)">
            {{featureshap.feature}}
        </div>
        </foreignObject>
        <g v-if="featureshap.shap" :transform="'translate(0,'+titleheight+')'" opacity="0.17">
        <rect x="0" y="0" :width="zerox" :height="height-titleheight" :fill="prefercolor[0]"  stroke="none" />
        <rect :x="zerox" y="0" :width="width-zerox" :height="height-titleheight" :fill="prefercolor[1]"  stroke="none" />
        </g>
        <g :transform="'translate(0,'+titleheight+')'" class="barchart">
        </g>
        <line :x1="zerox" :y1="titleheight" :x2="zerox" :y2="height" stroke="white" />
        <g :transform="'translate(0,'+titleheight+')'" class="boxplot">
        </g>
        <g :transform="'translate(0,'+titleheight+')'" class="violinplot">
        </g>
    </g>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import { select, area, curveBasis, scaleLinear, max } from 'd3'

export default defineComponent({
  name: 'VerticalBar',
  props: ['featureshap', 'width', 'height', 'titleheight', 'shapsale', 'shapscale', 'yscale', 'colorscale', 'charttype', 'shapbarscale', 'modelname', 'sortMetric', 'getShapMetrc'],
  computed: {
    zerox: function () {
      if (this.charttype === 'barchart') return this.shapbarscale(0)
      return this.shapscale(0)
    },
    prefercolor: function () {
      let maxvalue, minvalue, maxclass, minclass
      const metric = this.sortMetric
      const getShapMetrc = this.getShapMetrc
      let flagmin = 0; let flagmax = 0; let newminv; let newmaxv
      this.featureshap.shap.forEach((d, i) => {
        if (metric === 'avgabs') {
          newminv = -d.sum[1]
          newmaxv = d.sum[0]
        } else if (metric === 'extreme') {
          newminv = d.min
          newmaxv = d.max
        } else {
          newminv = newmaxv = getShapMetrc(d, metric)
        }
        if (i === 0) {
          minvalue = newminv
          maxvalue = newmaxv
          minclass = d.class
          maxclass = d.class
          flagmax = 1
          flagmin = 1
        } else {
          if (maxvalue < newmaxv) {
            maxvalue = newmaxv
            maxclass = d.class
            flagmax = 1
          }
          if (minvalue > newminv) {
            minvalue = newminv
            minclass = d.class
            flagmin = 1
          }
        }
      })
      if (metric === 'std' || metric === 'median') return ['#999999', '#999999']
      else return [flagmin ? this.colorscale(minclass) : '#999999', flagmax ? this.colorscale(maxclass) : '#999999']
    }
  },
  setup (props, context) {
    const barRef = ref(null)

    const hoveronfeature = (feature) => {
      context.emit('handleFeatureSelect', feature)
    }

    const clickonfeaturename = (feature) => {
      document.getElementById(`feature-${feature}`).scrollIntoView()
    }

    const drawBoxPlots = () => {
      select(barRef.value).select('g.barchart').attr('visibility', 'hidden')
      select(barRef.value).select('g.violinplot').attr('visibility', 'hidden')
      select(barRef.value).select('g.boxplot').attr('visibility', 'visible')
      const bandheight = props.yscale.bandwidth()
      const g = select(barRef.value).select('g.boxplot')

      const boxes = g.selectAll('g.box')
        .data(props.featureshap.shap, d => d.class)
        .join('g')
        .attr('class', 'box')
        .attr('transform', d => `translate(0,${props.yscale(d.class)})`)

      boxes.selectAll('.horizontalLine')
        .data(d => [[d.r0, d.r1]])
        .join('line')
        .attr('class', 'horizontalLine')
        .attr('stroke', '#808080')
        .attr('stroke-width', '1px')
        .attr('x1', d => props.shapscale(d[0]))
        .attr('x2', d => props.shapscale(d[1]))
        .attr('y1', bandheight / 2)
        .attr('y2', bandheight / 2)

      boxes.selectAll('rect')
        .data(d => [d])
        .join('rect')
        .attr('x', d => props.shapscale(d.q1))
        .attr('y', bandheight / 8)
        .attr('width', d => props.shapscale(d.q3) - props.shapscale(d.q1))
        .attr('height', bandheight / 4 * 3)
        .attr('fill', d => props.colorscale(d.class))
        .attr('fill-opacity', 1.0)
        .attr('stroke', d => props.colorscale(d.class))
        .attr('stroke-width', 0.4)

      boxes.selectAll('.verticalLine')
        .data(d => [d.r0, d.r1, d.median])
        .join('line')
        .attr('class', 'verticalLine')
        .attr('stroke', '#808080')
        .attr('stroke-width', '1px')
        .attr('x1', d => props.shapscale(d))
        .attr('x2', d => props.shapscale(d))
        .attr('y1', bandheight / 3)
        .attr('y2', bandheight / 3 * 2)

      boxes.selectAll('.verticalLine0')
        .data(d => [d.median])
        .join('line')
        .attr('class', 'verticalLine0')
        .attr('stroke', '#808080')
        .attr('stroke-width', '1px')
        .attr('x1', d => props.shapscale(d))
        .attr('x2', d => props.shapscale(d))
        .attr('y1', bandheight / 8)
        .attr('y2', bandheight / 8 * 7)
    }

    const drawviolinplot = () => {
      select(barRef.value).select('g.barchart').attr('visibility', 'hidden')
      select(barRef.value).select('g.boxplot').attr('visibility', 'hidden')
      select(barRef.value).select('g.violinplot').attr('visibility', 'visible')
      const bandheight = props.yscale.bandwidth()
      const g = select(barRef.value).select('g.violinplot')

      const boxes = g.selectAll('g.box')
        .data(props.featureshap.shap, d => d.class)
        .join('g')
        .attr('class', 'box')
        .attr('transform', d => `translate(0,${props.yscale(d.class)})`)

      const getareapoints = (d) => {
        const result = d.density_hist.map((t, i) => [(d.bin_edges[i] + d.bin_edges[i + 1]) / 2, t])
        result.unshift([d.bin_edges[0], 0])
        result.push([d.bin_edges[d.bin_edges.length - 1], 0])
        return result
      }
      boxes.selectAll('.violinline')
        .data(d => [d])
        .join('path')
        .attr('class', 'violinline')
        .attr('d', d => {
          const maxv = max(d.density_hist)
          const y = scaleLinear().range([0, bandheight]).domain([-maxv, maxv])
          return area().curve(curveBasis).x(t => props.shapscale(t[0])).y1(t => y(t[1])).y0(t => y(-t[1]))(getareapoints(d))
        })
        .attr('fill', d => props.colorscale(d.class))
        .attr('fill-opacity', 0.5)
        .attr('stroke', d => props.colorscale(d.class))
        .attr('stroke-opacity', 1.0)
        .attr('stroke-width', 1.0)
        .attr('stroke-linejoin', 'round')
    }

    const drawBars = () => {
      select(barRef.value).select('g.boxplot').attr('visibility', 'hidden')
      select(barRef.value).select('g.violinplot').attr('visibility', 'hidden')
      select(barRef.value).select('g.barchart').attr('visibility', 'visible')
      const g = select(barRef.value).select('g.barchart')
      const { shapbarscale, sortMetric, getShapMetrc } = props
      g.selectAll('rect')
        .data(props.featureshap.shap, d => d.class)
        .join('rect')
        .attr('x', d => {
          if (sortMetric === 'avgabs') {
            return shapbarscale(-d.sum[1])
          } else if (sortMetric === 'extreme') {
            if (d.min < 0) return shapbarscale(d.min)
            else return shapbarscale(0)
          } else {
            return shapbarscale(Math.min(getShapMetrc(d, sortMetric), 0))
          }
        })
        .attr('y', d => props.yscale(d.class) + props.yscale.bandwidth() / 8)
        .attr('width', d => {
          if (sortMetric === 'avgabs') {
            return shapbarscale(d.sum[0]) - shapbarscale(-d.sum[1])
          } else if (sortMetric === 'extreme') {
            if (d.min0 > 0) return shapbarscale(d.max) - shapbarscale(0)
            else if (d.max < 0) return shapbarscale(0) - shapbarscale(d.min)
            else return shapbarscale(d.max) - shapbarscale(d.min)
          } else {
            return Math.abs(shapbarscale(getShapMetrc(d, sortMetric)) - shapbarscale(0))
          }
        })
        .attr('height', props.yscale.bandwidth() / 4 * 3)
        .attr('fill', d => props.colorscale(d.class))
    }

    onMounted(() => {
      watchEffect(() => {
        // if shap is null we do not draw plot(in terms of featureName order)
        if (props.featureshap.shap) {
          if (props.charttype === 'boxplot') {
            drawBoxPlots()
          } else if (props.charttype === 'violinplot') {
            drawviolinplot()
          } else {
            drawBars()
          }
        }
      })
    })

    return {
      barRef,
      hoveronfeature,
      clickonfeaturename
    }
  }
})
</script>

<style lang="less" scoped>
.featurename{
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    cursor: pointer;
}
</style>
