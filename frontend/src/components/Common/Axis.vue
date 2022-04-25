<template>
    <g ref="axisRef" :transform="transform" class="axis">
    </g>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import { select, axisTop, axisRight, axisBottom, axisLeft, format } from 'd3'

export default defineComponent({
  name: 'Axis',
  props: {
    orient: String,
    scale: Function,
    translateX: Number,
    translateY: Number,
    ticks: {
      type: Number,
      default: 4
    },
    type: {
      type: String,
      default: 'number'
    },
    rotatestyle: {
      type: Boolean,
      default: false
    },
    format: {
      type: Function
    }
  },
  computed: {
    transform () {
      return 'translate(' + this.translateX + ',' + this.translateY + ')'
    }
  },
  setup (props) {
    const axisRef = ref(null)

    const axisGenerator = {
      top: axisTop(),
      right: axisRight(),
      bottom: axisBottom(),
      left: axisLeft()
    }

    const drawAxis = () => {
      if (props.type === 'category') {
        const texts = select(axisRef.value).call(axisGenerator[props.orient].scale(props.scale))
          .selectAll('text')
        if (props.rotatestyle) {
          texts.style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', function (d) {
              return 'rotate(-35)'
            })
        }
      } else {
        select(axisRef.value)
          .call(axisGenerator[props.orient].scale(props.scale).ticks(props.ticks).tickFormat(props.format).tickSize(2))
      }
    }

    onMounted(() => {
      watchEffect(() => {
        drawAxis()
      })
    })

    return {
      axisRef
    }
  }
})
</script>

<style lang="less" scoped>
.axis text{
    font-size: 8px;
}
</style>
