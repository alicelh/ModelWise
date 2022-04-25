import _, { uniq } from 'lodash'
import * as d3 from 'd3'

export const getUnique = (data) => {
  return uniq(data)
}

/**
 * @description: summarize predictions data to get nodes data for generating nodes in sankey
 * @param {*} getAxisData
 * @return {*}
 * [{name:'model',value:{
 * class1:{
 * value:k, // determine the size of the outmost border
 * children:{class1:ki,class2:kj...} //dertermine the size of inside rects
 * },
 * class2:{value:t,children:{class1:ti,class2:tj...}},...}]
 */
export const getAxisData = (data) => {
  const results = []
  const labels = data.find(e => e.name === 'label').value
  data.forEach(e => {
    const obj = { name: e.name }
    const hist = {}
    e.value.forEach((a, i) => {
      if (a in hist) {
        hist[a].value++
      } else hist[a] = { value: 1, children: {} }
      const truelabel = labels[i]
      if (truelabel in hist[a].children) {
        hist[a].children[truelabel].value++
        hist[a].children[truelabel].values.push(i)
      } else {
        hist[a].children[truelabel] = { value: 1 }
        hist[a].children[truelabel].values = [i]
      }
    })

    if (e.hasOwnProperty('prob')) {
      obj.hasProb = 1
      const TP = {}; const FP = {}
      e.prob.forEach((probs, index) => {
        const classname = e.value[index]
        const label = labels[index]
        if (index === 1) console.log(probs[classname - 1], classname)
        if (label === classname) {
          if (TP.hasOwnProperty(classname)) {
            TP[classname].push({ index, prob: probs[classname - 1] })
          } else {
            TP[classname] = [{ index, prob: probs[classname - 1] }]
          }
        } else {
          if (FP.hasOwnProperty(classname)) {
            FP[classname].push({ index, prob: probs[classname - 1] })
          } else {
            FP[classname] = [{ index, prob: probs[classname - 1] }]
          }
        }
      })

      // 这里可能需要改一下，先这么弄吧
      Object.keys(TP).forEach((classname) => {
        hist[classname].prob = { TP: TP[classname], FP: FP[classname] }
      })
    } else obj.hasProb = 0
    obj.value = hist
    results.push(obj)
  })
  return results
}

/**
 * @description: calculate link data from every two adjacent axises
 * @param {*} getLinksData
 * @return {*}
 */
export const getLinksData = (data) => {
  const len = data.length
  const labels = data.find(e => e.name === 'label').value
  let cur, next, sourcename, targetname
  const results = []
  for (let i = 0; i < len - 1; i++) {
    cur = data[i].value
    next = data[i + 1].value
    sourcename = data[i].name
    targetname = data[i + 1].name
    const hist = {}
    let label, source, target
    cur.forEach((a, i) => {
      label = labels[i]
      target = next[i]
      source = '' + sourcename + '-' + a + '-' + label
      target = '' + targetname + '-' + target + '-' + label
      if (source in hist) {
        if (target in hist[source]) {
          hist[source][target].push(i)
        } else {
          hist[source][target] = [i]
        }
      } else {
        const tmp = {}
        tmp[target] = [i]
        hist[source] = tmp
      }
    })
    Object.keys(hist).forEach(s => {
      const n = hist[s]
      Object.keys(n).forEach(t => {
        results.push({ sourcename: s, targetname: t, values: n[t] })
      })
    })
  }
  return results
}

/**
 * @description: calculate nodes data for sankey drawing
 * @param {*} data {'key':{0:id1,1:id2...},'label':{0:label1,...},'model1':{0:pred1,...},'model2'....}
 * @return {*}
 * [{name:'model',value:{
 * class1:{
 * value:k, // determine the size of the outmost border
 * children:{class1:ki,class2:kj...} //dertermine the size of inside rects
 * },
 * class2:{value:t,children:{class1:ti,class2:tj...}},...}]
 */
export const getSankeyNodes = (data, axisnames) => {
  const result = []
  const labelvalues = data.find(d => d.name === 'label').value
  let truelabel
  data.forEach((axis) => {
    const values = {}
    axis.value.forEach((v, i) => {
      if (v in values) {
        values[v].value++
      } else {
        values[v] = { value: 1, children: {} }
      }
      truelabel = labelvalues[i]
      if (truelabel in values[v].children) {
        values[v].children[truelabel].value++
        values[v].children[truelabel].values.push(i)
      } else {
        values[v].children[truelabel] = { value: 1 }
        values[v].children[truelabel].values = [i]
      }
    })
    result.push({ name: axis.name, accuracy: axis.accuracy, value: values })
  })
  result.sort((a, b) => {
    return axisnames.indexOf(a.name) - axisnames.indexOf(b.name)
  })
  return result
}

export const getSankeyLinks = (data, selvals = null, axisnames) => {
  if (!axisnames) {
    axisnames = data.map(d => d.name)
  }
  const len = axisnames.length
  let cur, next, sourcename, targetname
  const results = []
  const labelvalues = data.find(d => d.name === 'label').value
  for (let i = 0; i < len - 1; i++) {
    sourcename = axisnames[i]
    targetname = axisnames[i + 1]
    cur = data.find(d => d.name === sourcename).value
    next = data.find(d => d.name === targetname).value
    const hist = {}
    let label, nv, source, target
    if (selvals === null) {
      cur.forEach((v, i) => {
        label = labelvalues[i]
        nv = next[i]
        source = '' + sourcename + '-' + v + '-' + label
        target = '' + targetname + '-' + nv + '-' + label
        if (!(source in hist)) {
          const tmp = {}
          hist[source] = tmp
        }
        if (source in hist) {
          if (target in hist[source]) {
            hist[source][target]++
          } else {
            hist[source][target] = 1
          }
        }
      })
    } else {
      selvals.forEach(i => {
        label = labelvalues[i]
        const v = cur[i]
        nv = next[i]
        source = '' + sourcename + '-' + v + '-' + label
        target = '' + targetname + '-' + nv + '-' + label
        if (!(source in hist)) {
          const tmp = {}
          hist[source] = tmp
        }
        if (source in hist) {
          if (target in hist[source]) {
            hist[source][target]++
          } else {
            hist[source][target] = 1
          }
        }
      })
    }

    Object.keys(hist).forEach(s => {
      const n = hist[s]
      Object.keys(n).forEach(t => {
        results.push({ sourcename: s, targetname: t, values: n[t] })
      })
    })
  }
  return results
}

// rederQueue function is copied form http://bl.ocks.org/syntagmatic/raw/3341641/
// Copyright (C) 2012 Kai Chang
export const renderQueue = function (func) {
  let _queue = [] // data to be rendered
  let _rate = 10000 // number of calls per frame
  let _invalidate = function () {} // invalidate last render queue
  let _clear = function () {} // clearing function

  var rq = function (data) {
    if (data) rq.data(data)
    _invalidate()
    _clear()
    rq.render()
  }

  rq.render = function () {
    let valid = true
    _invalidate = rq.invalidate = function () {
      valid = false
    }

    function doFrame () {
      if (!valid) return true
      const chunk = _queue.splice(0, _rate)
      chunk.map(func)
      timer_frame(doFrame)
    }

    doFrame()
  }

  rq.data = function (data) {
    _invalidate()
    _queue = data.slice(0) // creates a copy of the data
    return rq
  }

  rq.add = function (data) {
    _queue = _queue.concat(data)
  }

  rq.rate = function (value) {
    if (!arguments.length) return _rate
    _rate = value
    return rq
  }

  rq.remaining = function () {
    return _queue.length
  }

  // clear the canvas
  rq.clear = function (func) {
    if (!arguments.length) {
      _clear()
      return rq
    }
    _clear = func
    return rq
  }

  rq.invalidate = _invalidate

  var timer_frame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) { setTimeout(callback, 17) }

  return rq
}

//= =================== color legend =============================//
export const legend = function ({
  svg,
  color,
  title,
  tickSize = 6,
  width = 120,
  height = 44 + tickSize,
  marginTop = 16,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 5,
  ticks = width / 40,
  tickFormat,
  tickValues
} = {}) {
  svg.selectAll('*').remove()

  let tickAdjust = g => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height)
  let x

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length)

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n))

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL())
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)), {
      range () {
        return [marginLeft, width - marginRight]
      }
    })

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(color.interpolator()).toDataURL())

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1)
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)))
      }
      if (typeof tickFormat !== 'function') {
        tickFormat = d3.format(tickFormat === undefined ? ',f' : tickFormat)
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds = color.thresholds ? color.thresholds() // scaleQuantize
      : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain() // scaleThreshold

    const thresholdFormat = tickFormat === undefined
      ? d => d
      : typeof tickFormat === 'string'
        ? d3.format(tickFormat)
        : tickFormat

    x = d3.scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([marginLeft, width - marginRight])

    svg.append('g')
      .selectAll('rect')
      .data(color.range())
      .join('rect')
      .attr('x', (d, i) => x(i - 1))
      .attr('y', marginTop)
      .attr('width', (d, i) => x(i) - x(i - 1))
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', d => d)

    tickValues = d3.range(thresholds.length)
    tickFormat = i => thresholdFormat(thresholds[i], i)
  }

  // Ordinal
  else {
    x = d3.scaleBand()
      .domain(color.domain())
      .rangeRound([marginLeft, width - marginRight])

    svg.append('g')
      .selectAll('rect')
      .data(color.domain())
      .join('rect')
      .attr('x', x)
      .attr('y', marginTop)
      .attr('width', Math.max(0, x.bandwidth() - 1))
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', color)

    tickAdjust = () => {}
  }

  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x)
      .ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
      .tickFormat(typeof tickFormat === 'function' ? tickFormat : undefined)
      .tickSize(tickSize)
      .tickValues(tickValues))
    .call(tickAdjust)
    .call(g => g.select('.domain').remove())
    .call(g => g.append('text')
      .attr('x', marginLeft)
      .attr('y', marginTop + marginBottom - height - 6)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .attr('font-size', '1.3em')
      .text(title))

  return svg.node()
}

function ramp (color, n = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = n
  canvas.height = 1
  const context = canvas.getContext('2d')
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1))
    context.fillRect(i, 0, 1, 1)
  }
  return canvas
}
