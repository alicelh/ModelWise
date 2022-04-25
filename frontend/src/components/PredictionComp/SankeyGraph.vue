<template>
    <filter id='boxshadow' color-interpolation-filters="sRGB">
        <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color='#aaaaaa' flood-opacity="0.4"/>
    </filter>
    <filter id="blurMe">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
    </filter>
    <g id="sankey">
        <g id="links"/>
    </g>
    <g id="selectedNodes"/>
    <g id="selectedLinks"/>
</template>

<script>

import * as d3 from 'd3'
import textures from 'textures'
import { onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
// import { svgPathProperties } from "svg-path-properties";

export default {
  name: 'SankeyGraph',
  props: {
    sankeyGraph: {
      type: Object,
      default: {
        nodes: [],
        links: []
      }
    },
    sankey: Function,
    compresschecked: Boolean,
    predictions: Array,
    sortedmodelnames: Array
  },
  data () {
    return {
      ctx: null,
      probScaleMap: new Map()
    }
  },
  setup (props) {
    const bnodewidth = 4
    const selectedTexture = textures.lines().size(5)
      .strokeWidth(2).stroke('white')

    const store = useStore()
    const colorScale = store.state.colorscale

    const accformat = d3.format('.1%')
    const selectedNodeSet = ref(new Set())

    let draged_g
    let start_x = 0
    let boundaryx1, boundaryx2

    function dragstarted (e, d) {
      draged_g = d3.select(this).clone(true).raise().attr('class', 'clone')
      const box = draged_g.node().getBBox()
      draged_g.append('rect')
        .attr('x', d.x - box.width / 2 - 5)
        .attr('width', box.width + 10)
        .attr('height', box.height)
        .attr('fill', '#ffffff')
        .attr('stroke', '#efefef')
        .attr('filter', 'url(#shadow)')
        .lower()
      start_x = e.x
      draged_g.attr('transform-origin', 'center')
        .attr('opacity', 0.8)
      boundaryx1 = box.width / 2
      boundaryx2 = d3.select('#sankey').node().getBBox().width - box.width / 2
    }
    function dragged (e, d) {
      const move_x = e.x >= boundaryx1 ? (e.x < boundaryx2 ? e.x : boundaryx2) : boundaryx1
      draged_g
        .attr('transform', function (d) { return 'scale(1.05) translate(' + (move_x - start_x) + ',0)' })
    }

    function dragended (e, d) {
      draged_g.remove()
      const { nodes } = props.sankeyGraph
      const newx = nodes.map(n => {
        if (n.name !== d.name) {
          return { name: n.name, x: n.x }
        } else {
          return { name: n.name, x: e.x }
        }
      })
      newx.sort((a, b) => a.x - b.x)
      console.log(newx.map(n => n.name))
      store.commit('updatesortedmodelnames', newx.map(n => n.name))
    }

    const renderNodes = (svg, nodes) => {
      const that = this

      const axises = svg.selectAll('g.axis')
        .data(nodes, d => d.name)
        .join(
          function (enter) {
            const g = enter.append('g')
              .attr('class', 'axis')

            g.append('text')
              .attr('class', 'modelnanme')
              .attr('x', d => d.x)
              .attr('y', 0)
              .attr('dy', '.35em')
              .attr('text-anchor', 'middle')
              .attr('font-size', 16)
              .attr('fill', 'black')
              .style('cursor', 'grab')
              .text(d => d.name)

            g.append('text')
              .attr('class', 'modelacc')
              .attr('x', d => d.x)
              .attr('y', 25)
              .attr('dy', '.35em')
              .attr('text-anchor', 'middle')
              .attr('font-size', 12)
              .attr('fill', 'black')
              .text(d => d.accuracy ? accformat(d.accuracy) : '')

            return g.selection()
          },
          function (update) {
            update.select('.modelnanme')
              .attr('x', d => d.x)
            update.select('.modelacc')
              .attr('x', d => d.x)
            return update.selection()
          }
        )

      axises.filter(d => d.name !== 'label').call(
        d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
          .filter((event) => { return event.shiftKey })
          .container(function () {
            return this
          })
      )

      axises.each(function (axis) {
        const bnodes = d3.select(this).selectAll('g.bg')
          .data(Object.entries(axis.value), d => d[0])
          .join(
            function (enter) {
              const g = enter.append('g')
                .attr('class', 'bg')

              g.append('rect')
                .attr('class', 'leftnode')
                .attr('x', d => d[1].x0)
                .attr('y', d => d[1].y0)
                .attr('height', d => d[1].y1 - d[1].y0)
                .attr('width', bnodewidth)
                .attr('fill', d => colorScale(d[0]))
              g.append('rect')
                .attr('class', 'rightnode')
                .attr('x', d => d[1].x1 - bnodewidth)
                .attr('y', d => d[1].y0)
                .attr('height', d => d[1].y1 - d[1].y0)
                .attr('width', bnodewidth)
                .attr('fill', d => colorScale(d[0]))

              return g.selection()
            },
            function (update) {
              update.select('.leftnode')
                .attr('x', d => d[1].x0)
                .attr('y', d => d[1].y0)
                .attr('height', d => d[1].y1 - d[1].y0)
                .attr('fill', d => colorScale(d[0]))
              update.select('.rightnode')
                .attr('x', d => d[1].x1 - bnodewidth)
                .attr('y', d => d[1].y0)
                .attr('height', d => d[1].y1 - d[1].y0)
                .attr('fill', d => colorScale(d[0]))

              return update.selection()
            }
          )

        // draw central rects in big node
        // use style not remove dom can guarantee nodes won't be rendered again which can cause the selected class to be invalid.
        const snodes = bnodes.selectAll('rect.snode')
          .data(d => Object.entries(d[1].children))
          .join(
            function (enter) {
              return enter.append('rect')
                .attr('class', 'snode')
                .attr('x', d => d[1].x0)
                .attr('y', d => d[1].y0)
                .attr('height', d => d[1].y1 - d[1].y0)
                .attr('width', d => d[1].x1 - d[1].x0)
                .attr('fill', d => colorScale(d[0]))
                .attr('filter', d => {
                  return d[1].isTP === true && props.compresschecked ? 'url(#blurMe)' : 'none'
                })
                .on('click', function (e, d) {
                  if (store.state.currentfocus !== 'models') {
                    store.commit('changeSelectionFocus', 'models')
                  }
                  store.commit('updateSelectedData', props.sankeyGraph.nodeMap.get(d[1].name).values)
                  // if(selectedNodeSet.value.has(d[1].name)){
                  //     selectedNodeSet.value.delete(d[1].name);
                  //     d3.select(this).classed("selected",false);
                  // }else{
                  //     selectedNodeSet.value.add(d[1].name);
                  //     d3.select(this).classed("selected",true);
                  // }
                })
                .on('mouseenter', function (e) {
                  if (!e.shiftKey) {
                    d3.select(this).style('stroke', 'black')
                    e.stopPropagation()
                  }
                })
                .on('mouseleave', function (e) {
                  // if(!d3.select(this).classed("selected")){
                  d3.select(this).style('stroke', 'none')
                  // }
                  e.stopPropagation()
                })
                .selection()
            },
            function (update) {
              update.attr('x', d => d[1].x0)
                .attr('y', d => d[1].y0)
                .attr('height', d => d[1].y1 - d[1].y0)
                .attr('width', d => d[1].x1 - d[1].x0)
                .attr('filter', d => {
                  return d[1].isTP === true && props.compresschecked ? 'url(#blurMe)' : 'none'
                })
                .attr('fill', d => colorScale(d[0]))

              return update.selection()
            }
          )
      })

      // guarantee selected nodes not be rendered when they are prob nodes
      // this.renderSelectedNodes(this.selectedNodes);
    }

    const renderLinks = (svg, links, probs = []) => {
      // links = links.filter(link=>(!probs.includes(link.sourcename.split('-')[0]))&&!(probs.includes(link.targetname.split('-')[0])));
      if (props.compresschecked) {
        svg.select('#links')
          .selectAll('.link')
        // .data(links.filter(link=>link.isblur!==2),d=>d.sourcename+d.targetname)
          .data(links, d => d.sourcename + d.targetname)
          .join('path')
          .attr('class', 'link')
          .attr('d', d => d3.area().curve(d3.curveBumpX).x(dd => dd.x).y0(dd => dd.y0).y1(dd => dd.y1)([{ x: d.source[0], y0: d.source[1] - d.sourcewidth / 2, y1: d.source[1] + d.sourcewidth / 2 }, { x: d.target[0], y0: d.target[1] - d.targetwidth / 2, y1: d.target[1] + d.targetwidth / 2 }]))
          .attr('fill', d => colorScale(d.label))
          .attr('fill-opacity', d => {
            return d.isblur === 2 ? 0.3 : 1
          })
          .attr('stroke', 'none')
        // .attr("stroke", d => colorScale(d.label))
        // .attr("stroke-width", 0.5)
          .style('mix-blend-mode', 'multiply')
        // .attr('filter',d=>{
        //     return d.isblur===2?"url(#blurMe)":"none"
        // })
      } else {
        svg.select('#links')
          .selectAll('.link')
          .data(links, d => d.sourcename + d.targetname)
          .join('path')
          .attr('class', 'link')
          .attr('d', d3.linkHorizontal())
          .attr('fill', 'none')
          .attr('stroke', d => colorScale(d.label))
          .attr('stroke-width', d => d.sourcewidth)
          .style('mix-blend-mode', 'multiply')
        // .attr('filter','none')
      }
    }

    const renderview = ({ nodes, links }) => {
      const svg = d3.select('#sankey')
      renderNodes(svg, nodes)
      renderLinks(svg, links)
    }

    /* ========================================================
        ============ selected data and sankey rendering ==========
        ========================================================= */
    const renderSelectedNodes = (nodes) => {
      const g = d3.select('#selectedNodes')
      g.selectAll('rect.selectednode')
        .data(props.compresschecked ? nodes.filter(d => d.isTP === false) : nodes)
        .join('rect')
        .attr('class', 'selectednode')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', selectedTexture.url())
    }

    /**
         * @description: don't need to filter links that links TP. this will cause
         * @param {*} links
         * @return {*}
         */
    const renderSelectedLinks = (links) => {
      console.log(links)
      const selectedlinkname = links.map(d => d.sourcename + d.targetname)
      if (links.length === 0 && selectedNodeSet.value.size === 0) {
        d3.select('#links')
          .selectAll('.link')
          .style('opacity', 1)
      } else {
        d3.select('#links')
          .selectAll('.link')
          .style('opacity', 0)
      }
      if (props.compresschecked) {
        d3.select('#selectedLinks')
          .selectAll('.link')
          .data(links, d => d.sourcename + d.targetname)
          .join('path')
          .attr('class', 'link')
          .attr('d', d => d3.area().curve(d3.curveBumpX).x(dd => dd.x).y0(dd => dd.y0).y1(dd => dd.y1)([{ x: d.source[0], y0: d.source[1] - d.sourcewidth / 2, y1: d.source[1] + d.sourcewidth / 2 }, { x: d.target[0], y0: d.target[1] - d.targetwidth / 2, y1: d.target[1] + d.targetwidth / 2 }]))
          .attr('fill', d => colorScale(d.label))
          .attr('stroke', d => colorScale(d.label))
          .attr('stroke-width', 0.5)
          .style('mix-blend-mode', 'multiply')
          .style('opacity', 1)
      } else {
        d3.select('#selectedLinks')
          .selectAll('.link')
          .data(links)
          .join('path')
          .attr('fill', 'none')
          .attr('class', 'link')
          .attr('d', d3.linkHorizontal())
          .attr('stroke', d => colorScale(d.label))
          .attr('stroke-width', d => d.sourcewidth)
          .style('mix-blend-mode', 'multiply')
          .style('opacity', 1)
      }
    }

    // const computeselecteddata = (val,nodeMap)=>{
    //     let groupednodes = groupBy([...val],d=>d.split('-')[0]);
    //     let selnodes,selvalues=[];
    //     Object.keys(groupednodes).forEach((axis,i)=>{
    //         selnodes = groupednodes[axis];
    //         if(i===0){
    //             selnodes.forEach(node=>{
    //                 selvalues = selvalues.concat(nodeMap.get(node).values)
    //             })
    //         }else{
    //             let nodearray=[];
    //             selnodes.forEach(node=>{
    //                 nodearray = nodearray.concat(nodeMap.get(node).values);
    //             })
    //             selvalues = intersection(selvalues,nodearray)
    //         }
    //     })
    //     return selvalues;
    // }

    // const handleSelectedNodesChange = (val) => {
    //     let selvalues = computeselecteddata(val,props.sankeyGraph.nodeMap);
    //     store.commit('updateSelectedData',selvalues);
    // }

    const renderSelectedSankey = (selecteddata) => {
      console.log(props.sortedmodelnames)
      if (props.sankey) {
        const start = new Date().getTime()
        const { nodes, links } = props.sankey.getSelectedNodes(selecteddata, props.sankeyGraph.nodeMap, props.predictions, props.compresschecked, props.sortedmodelnames)
        const end = new Date().getTime()
        const time = end - start
        console.log('Execution time: ' + time)
        renderSelectedNodes(nodes)
        renderSelectedLinks(links)
      }
    }

    onMounted(() => {
      d3.select('#sankey').call(selectedTexture)
      renderview(props.sankeyGraph)
    })

    // re-render when size changes
    watch(() => props.sankeyGraph, (sankeyGraph) => {
      renderview(sankeyGraph)
      console.log('here')
      renderSelectedSankey(store.state.selecteddata)
    })

    // render selected nodes and links when selecting subset on other views
    watch(() => store.state.selecteddata, (newdata) => {
      renderSelectedSankey(newdata)
    }, { deep: true })

    // clear selectedNodeSet when select subset in other views
    watch(() => store.state.selectionfocus, (currentfocus) => {
      if (currentfocus !== 'models') {
        selectedNodeSet.value.clear()
        d3.selectAll('.snode').style('stroke', 'none')
      }
    })

    return {
      colorScale
    }
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>

#selectedNodes{
    pointer-events:none;
}

.selected{
    stroke: black !important;
}
</style>
