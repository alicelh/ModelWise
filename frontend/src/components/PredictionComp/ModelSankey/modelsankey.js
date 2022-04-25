import { groupBy, intersection, sum } from 'lodash'
import { getSankeyLinks } from '@/utils/utils'

function defaultNodes (graph) {
  return graph.nodes
}

function defaultLinks (graph) {
  return graph.links
}

function defaultCompressed (graph) {
  return graph.compressed
}

function constant (x) {
  return function () {
    return x
  }
}

export default function ModelSankey () {
  let x0 = 0; let y0 = 0; let x1 = 1; let y1 = 1 // extent
  const dx = 28 // nodeWidth
  const dy = 5 // nodePadding
  let dw = 6 // border width
  const dh = 0
  const fixedh = 10 // fixed height of TPs
  let nodes = defaultNodes
  let links = defaultLinks
  const compressed = defaultCompressed
  let sortedmodelnames
  let interval = 1 // spacing between nodes and links

  function ModelSankey () {
    const graph = { nodes: nodes.apply(null, arguments), links: links.apply(null, arguments), nodeMap: new Map() }
    const compressedchecked = compressed.apply(null, arguments)
    if (compressedchecked) {
      computeNodePosCompress(graph)
      computeLinkPosCompress(graph)
    } else {
      computeNodePos(graph)
      computeLinkPos(graph)
    }
    return graph
  }

  ModelSankey.nodes = function (_) {
    return arguments.length ? (nodes = typeof _ === 'function' ? _ : constant(_), ModelSankey) : nodes
  }

  ModelSankey.links = function (_) {
    return arguments.length ? (links = typeof _ === 'function' ? _ : constant(_), ModelSankey) : callinks
  }

  ModelSankey.extent = function (_) {
    return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], ModelSankey) : [[x0, y0], [x1, y1]]
  }

  ModelSankey.interval = function (_) {
    return arguments.length ? (interval = +_, ModelSankey) : interval
  }

  ModelSankey.outnodewidth = function (_) {
    return arguments.length ? (dw = +_, ModelSankey) : dw
  }

  ModelSankey.getSelectedNodes = function (selectedNode, nodeMap, links) {
    return computeSeletedData(selectedNode, nodeMap, links)
  }

  ModelSankey.calProbLinks = function (probaxis, probs, links) {
    return calProbLinks(probaxis, probs, links)
  }

  ModelSankey.getsortedmodelnames = function (_) {
    return arguments.length ? (sortedmodelnames = _, ModelSankey) : sortedmodelnames
  }

  /**
     * @description: compute selected values according to selected nodes, call function to calculate position of proportion nodes and links
     * @param {*} selectedNode
     * @param {*} nodeMap
     * @param {*} links
     * @return {*} position of proportion nodes and links
     */
  function computeSeletedData (selvalues, nodeMap, data, compresschecked) {
    return { nodes: computeSelectedNodePos(selvalues, data, nodeMap), links: computeSelectedLinkPos(selvalues, data, nodeMap, compresschecked) }
  }

  function computeSelectedNodePos (selectedvalues, data, nodeMap) {
    const selectedNodePos = []

    if (selectedvalues.length > 0) {
      const labelvalues = data.find(d => d.name === 'label').value
      const selnodemap = {}
      data.forEach((axis) => {
        const values = axis.value
        const name = axis.name
        selectedvalues.forEach(i => {
          const nodename = '' + name + '-' + values[i] + '-' + labelvalues[i]
          if (selnodemap.hasOwnProperty(nodename)) {
            selnodemap[nodename]++
          } else {
            selnodemap[nodename] = 1
          }
        })
      })

      nodeMap.forEach((node, nodename) => {
        const len = selnodemap[nodename]
        if (len > 0) {
          const selnode = {}
          const y0 = node.y0
          selnode.name = nodename
          selnode.value = len
          selnode.x0 = node.x0
          selnode.y0 = y0 + len / node.value * (node.y1 - y0)
          selnode.x1 = node.x1
          selnode.y1 = node.y1
          selnode.isTP = node.isTP
          selectedNodePos.push(selnode)
        } else {
          selectedNodePos.push(node)
        }
      })
    }
    return selectedNodePos
  }

  function computeSelectedLinkPos (selectedvalues, data, nodeMap, compresschecked) {
    const sellinks = getSankeyLinks(data, selectedvalues, sortedmodelnames)
    const tmpgraph = { links: sellinks, nodeMap }
    if (compresschecked) {
      computeLinkPosCompress(tmpgraph)
    } else {
      computeLinkPos(tmpgraph)
    }
    return tmpgraph.links
  }

  function computeNodePosCompress ({ nodes, nodeMap }) {
    const classes = Object.keys(nodes[0].value).length
    const datacount = Math.max(...nodes.map(n => {
      return sum(Object.entries(n.value).map(d => {
        return sum(Object.entries(d[1].children).filter(dd => dd[0] !== d[0]).map(dd => dd[1].value))
      }))
    }))
    const layers = nodes.length
    const kx = (x1 - x0 - dx) / (layers - 1)
    let i = 0
    const ky = (y1 - y0 - (classes - 1) * dy - classes * fixedh) / datacount
    for (const axis of nodes) {
      let y = y0
      const name = axis.name
      const bnode = axis.value
      axis.x = x0 + i * kx + dx / 2
      for (const key1 in bnode) {
        const node = bnode[key1]
        node.layer = i
        node.x0 = x0 + i * kx
        node.x1 = node.x0 + dx
        node.y0 = y
        let yy = y
        const children = Object.keys(node.children).sort((x, y) => x == key1 ? -1 : y == key1 ? 1 : 0)
        for (const key2 of children) {
          const node2 = node.children[key2]
          node2.x0 = node.x0 + dw
          node2.x1 = node.x1 - dw
          if (key2 === key1) {
            node2.y0 = yy
            node2.y1 = node2.y0 + fixedh
            node2.isTP = true
          } else {
            node2.y0 = yy + dh
            node2.y1 = node2.y0 + node2.value * ky
            node2.isTP = false
          }
          node2.name = '' + name + '-' + key1 + '-' + key2
          yy = node2.y1
          nodeMap.set(node2.name, node2)
        }
        node.y1 = yy
        y = node.y1 + dy
      }
      i++
    }
  }

  function computeLinkPosCompress ({ links, nodeMap }) {
    const sourceLinks = groupBy(links, d => d.sourcename)
    const sourcenames = Object.keys(sourceLinks).sort((a, b) => b < a ? 1 : -1)
    sourcenames.forEach(sourcename => {
      const label = sourcename.split('-').pop()
      const sourcenode = nodeMap.get(sourcename)
      const x = sourcenode.x1 + dw + interval
      const links = sourceLinks[sourcename].sort((a, b) => b.targetname < a.targetname ? 1 : -1)
      if (sourcenode.isTP === true) {
        const y0 = (sourcenode.y1 + sourcenode.y0) / 2
        links.forEach(link => {
          link.sourcewidth = 2
          link.source = [x, y0]
          link.label = label
          link.isblur = 1
        })
      } else {
        const ky = (sourcenode.y1 - sourcenode.y0) / sourcenode.value
        let y0 = sourcenode.y0
        links.forEach(link => {
          link.sourcewidth = link.values * ky
          link.source = [x, y0 + link.sourcewidth / 2]
          link.label = label
          link.isblur = 0
          y0 += link.sourcewidth
        })
      }
    })
    const targetLinks = groupBy(links, d => d.targetname)
    const targetnames = Object.keys(targetLinks)
    targetnames.forEach(targetname => {
      const label = targetname.split('-').pop()
      const targetnode = nodeMap.get(targetname)
      const x = targetnode.x0 - dw - interval
      const links = targetLinks[targetname].sort((a, b) => b.sourcename < a.sourcename ? 1 : -1)
      if (targetnode.isTP === true) {
        const y0 = (targetnode.y1 + targetnode.y0) / 2
        links.forEach(link => {
          link.targetwidth = 2
          link.target = [x, y0]
          link.label = label
          link.isblur++
        })
      } else {
        const ky = (targetnode.y1 - targetnode.y0) / targetnode.value
        let y0 = targetnode.y0
        links.forEach(link => {
          link.targetwidth = link.values * ky
          link.target = [x, y0 + link.targetwidth / 2]
          link.label = label
          y0 += link.targetwidth
        })
      }
    })
  }

  function computeNodePos ({ nodes, nodeMap }) {
    const datacount = Math.max(...nodes.map(n => {
      return Object.values(n.value).map(d => d.value).reduce((a, b) => a + b)
    }))
    const layers = nodes.length
    const kx = (x1 - x0 - dx) / (layers - 1)
    let i = 0
    for (const axis of nodes) {
      const ky = (y1 - y0 - (Object.keys(axis).length - 1) * dy) / datacount
      let y = y0
      const name = axis.name
      const bnode = axis.value
      axis.x = x0 + i * kx + dx / 2
      for (const key1 in bnode) {
        const node = bnode[key1]
        node.layer = i
        node.x0 = x0 + i * kx
        node.x1 = node.x0 + dx
        node.y0 = y
        node.y1 = y + node.value * ky
        const ky2 = (node.value * ky - dh * (Object.keys(node.children).length + 1)) / node.value
        let yy = y
        y = node.y1 + dy
        for (const key2 in node.children) {
          const node2 = node.children[key2]
          node2.x0 = node.x0 + dw
          node2.x1 = node.x1 - dw
          node2.y0 = yy + dh
          node2.y1 = node2.y0 + node2.value * ky2
          node2.name = '' + name + '-' + key1 + '-' + key2
          yy = node2.y1 + dh
          nodeMap.set(node2.name, node2)
        }
      }
      i++
    }
  }

  function computeLinkPos ({ links, nodeMap }) {
    const sourceLinks = groupBy(links, d => d.sourcename)
    const sourcenames = Object.keys(sourceLinks).sort((a, b) => b < a ? 1 : -1)
    sourcenames.forEach(sourcename => {
      const label = sourcename.split('-').pop()
      const sourcenode = nodeMap.get(sourcename)
      const ky = (sourcenode.y1 - sourcenode.y0) / sourcenode.value
      let y0 = sourcenode.y0
      const x = sourcenode.x1 + dw + interval
      const links = sourceLinks[sourcename].sort((a, b) => b.targetname < a.targetname ? 1 : -1)
      links.forEach(link => {
        link.sourcewidth = link.values * ky
        link.source = [x, y0 + link.sourcewidth / 2]
        link.label = label
        y0 += link.sourcewidth
      })
    })
    const targetLinks = groupBy(links, d => d.targetname)
    const targetnames = Object.keys(targetLinks)
    targetnames.forEach(targetname => {
      const label = targetname.split('-').pop()
      const targetnode = nodeMap.get(targetname)
      const ky = (targetnode.y1 - targetnode.y0) / targetnode.value
      let y0 = targetnode.y0
      const x = targetnode.x0 - dw - interval
      const links = targetLinks[targetname].sort((a, b) => b.sourcename < a.sourcename ? 1 : -1)
      links.forEach(link => {
        link.targetwidth = link.values * ky
        link.target = [x, y0 + link.targetwidth / 2]
        link.label = label
        y0 += link.targetwidth
      })
    })
  }

  return ModelSankey
}
