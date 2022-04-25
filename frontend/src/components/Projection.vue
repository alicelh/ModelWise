<template>
    <div id="projectioncanvas" ref="resizeRef">
        <canvas ref="canvasRef"/>
        <canvas ref="upperCanvasRef"/>
        <svg ref="svgRef">
            <g class="brush"/>
            <g class="legend"/>
        </svg>
    </div>
</template>

<script lang="ts">
import useResizeObserver from '@/utils/resizeObserver'
import { renderQueue, legend } from '@/utils/utils'
import { select, extent, scaleLinear, brush, scaleSequential, interpolateYlGnBu, scaleOrdinal, schemeTableau10 } from 'd3'
import { useStore } from 'vuex'
import { watch, ref, computed } from 'vue'

export default {
  name: 'Projection',
  props: ['data'],
  setup (props) {
    const canvasRef = ref(null)
    const upperCanvasRef = ref(null)
    const svgRef = ref(null)

    const store = useStore()
    const colorScale = store.state.colorscale
    const encodingfeature = computed(() => store.state.encodingfeature)
    const { resizeRef, resizeState } = useResizeObserver()
    const r = 3.5 // radius of point
    const margin = 5
    const xScale = scaleLinear()
    const yScale = scaleLinear()
    let ctx, upperctx, render

    const brushed = ({ sourceEvent, selection }) => {
      if (!sourceEvent) return
      let selecteddata = []
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection
        selecteddata = props.data.filter(d => {
          return xScale(d.pos[0]) > x0 && xScale(d.pos[0]) < x1 && yScale(d.pos[1]) > y0 && yScale(d.pos[1]) < y1
        }).map(d => d.id)
      }
      store.commit('changeSelectionFocus', 'projection')
      store.commit('updateSelectedData', selecteddata)
    }
    const canvasbrush = brush().on('end', brushed)

    const changecolor = () => {
      ctx.fillStyle = 'black'
    }

    /**
         * @description: create a map for correspond id to index(order of data is sorted according to class for rendering rare class on the top). For fast access data
         * @param {*}
         * @return {*}
         */
    const indexmap = computed(() => {
      return new Map(props.data.map((d, i) => [d.id, i]))
    })

    //= ==================for canvas==========================//
    const drawCanvas = (canvas, uppercanvas, width, height) => {
      canvas.attr('width', width)
        .attr('height', height)
      ctx = canvas.node().getContext('2d')
      ctx.globalCompositeOperation = 'color'
      ctx.globalAlpha = 0.6
      ctx.lineWidth = 1
      uppercanvas.attr('width', width)
        .attr('height', height)
      upperctx = uppercanvas.node().getContext('2d')
      // ctx.globalCompositeOperation = 'color';
      upperctx.globalAlpha = 0.6
      upperctx.lineWidth = 1
    }

    const renderPoints = (data, encodingfeature, width, height) => {
      let mycolorscale = colorScale
      const svglengend = select(svgRef.value).select('.legend')
      svglengend.selectAll('*').remove()
      if (encodingfeature.type === 'numerical') {
        const e = extent(encodingfeature.value)
        mycolorscale = scaleSequential().domain(e).interpolator(interpolateYlGnBu)
        legend({
          svg: svglengend,
          color: scaleSequential(e, interpolateYlGnBu),
          title: encodingfeature.name
        })
      } else if (encodingfeature.type === 'categorical') {
        const e = [...new Set(encodingfeature.value)]
        mycolorscale = scaleOrdinal().domain(e).range(schemeTableau10)
        legend({
          svg: svglengend,
          color: scaleOrdinal(e, schemeTableau10),
          title: encodingfeature.name
        })
      }

      const drawPoint = (d) => {
        ctx.fillStyle = mycolorscale(encodingfeature.value[d.id])
        ctx.beginPath()
        // paint an arc based on information from the DOM node
        ctx.arc(xScale(d.pos[0]), yScale(d.pos[1]), r, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      ctx.clearRect(0, 0, width, height)
      render = renderQueue(drawPoint)
      render(data)
    }

    //= ==================for SVG==========================//
    const drawSVG = (svg, width, height) => {
      svg.attr('viewBox', [0, 0, width, height])
      svg.select('.brush').remove()
      svg.append('g').attr('class', 'brush').call(canvasbrush)
    }

    const renderselecteddata = (selecteddata) => {
      select(svgRef.value).select('.brush').call(canvasbrush.move, null)
      const { width, height } = resizeState.dimensions
      const data = selecteddata.map((index) => props.data[indexmap.value.get(index)])
      upperctx.clearRect(0, 0, width, height)
      upperctx.strokeStyle = 'black'
      data.forEach((d) => {
        upperctx.beginPath()
        // paint an arc based on information from the DOM node
        upperctx.arc(xScale(d.pos[0]), yScale(d.pos[1]), r, 0, 2 * Math.PI)
        upperctx.stroke()
      })
    }

    const RenderView = (dimensions) => {
      const { width, height } = dimensions
      const svg = select(svgRef.value)
      const canvas = select(canvasRef.value)
      const uppercanvas = select(upperCanvasRef.value)
      canvasbrush.extent([[0, 0], [width, height]])
      drawCanvas(canvas, uppercanvas, width, height)
      xScale.domain(extent(props.data.map(d => d.pos[0])))
        .range([margin, width - margin])
      yScale.domain(extent(props.data.map(d => d.pos[1])))
        .range([height - margin, margin])
      drawSVG(svg, width, height)
      renderPoints(props.data, encodingfeature.value, width, height)
      renderselecteddata(store.state.selecteddata)
    }

    watch(() => store.state.selecteddata, (newdata) => {
      renderselecteddata(newdata)
    }, { deep: true })

    // 每次初始化，dimensions都有mounted时从{}到有值的这个过程，所以RenderView总会初始渲染一次，那onmount也不需要调渲染函数了
    watch(() => resizeState.dimensions, (dimensions) => {
      RenderView(dimensions)
    })

    watch(encodingfeature, (newv, oldv) => {
      const canvas = select(canvasRef.value)
      renderPoints(props.data, newv, canvas.node().width, canvas.node().height)
      renderselecteddata(store.state.selecteddata)
    })

    /*
        // 原来把renderselecteddata放在watcheffect外面，那size更新selected data没办法重新渲染，放在里面每次更新selected data又会整个重新渲染，所以还是把watch dimension和selected data的逻辑分开
        onMounted(()=>{
            // 每次初始化，dimension都有mounted时从{}到有值的这个过程，所以RenderView总会初始渲染一次，那onmount也不需要调渲染函数了
            // RenderView(resizeState.dimensions);
        })
        */

    return { resizeRef, canvasRef, upperCanvasRef, svgRef, changecolor, legend, scaleSequential, interpolateYlGnBu }
  }
}
</script>

<style lang="less" scoped>
#projectioncanvas{
    width: 100%;
    height: 100%;
    padding:0; //设定padding value不等于0会导致dimension的width和height初始化后又变化
}

canvas{
    position: absolute; //absolute可以在初始化时少渲染一次
}

svg {
  /* important for responsiveness */
  position: relative;
  display: block;
  fill: none;
  stroke: none;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
