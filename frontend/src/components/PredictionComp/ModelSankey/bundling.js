// copy from https://github.com/syntagmatic/parallel-coordinates/blob/master/src/bundling.js
function compute_cluster_centroids (d) {
  const clusterCentroids = d3.map()
  const clusterCounts = d3.map()
  // determine clusterCounts
  __.data.forEach(function (row) {
    const scaled = __.dimensions[d].yscale(row[d])
    if (!clusterCounts.has(scaled)) {
      clusterCounts.set(scaled, 0)
    }
    const count = clusterCounts.get(scaled)
    clusterCounts.set(scaled, count + 1)
  })

  __.data.forEach(function (row) {
    d3.keys(__.dimensions).map(function (p, i) {
      const scaled = __.dimensions[d].yscale(row[d])
      if (!clusterCentroids.has(scaled)) {
        const map = d3.map()
        clusterCentroids.set(scaled, map)
      }
      if (!clusterCentroids.get(scaled).has(p)) {
        clusterCentroids.get(scaled).set(p, 0)
      }
      let value = clusterCentroids.get(scaled).get(p)
      value += __.dimensions[p].yscale(row[p]) / clusterCounts.get(scaled)
      clusterCentroids.get(scaled).set(p, value)
    })
  })

  return clusterCentroids
}

function compute_centroids (row) {
  const centroids = []

  const p = d3.keys(__.dimensions)
  const cols = p.length
  const a = 0.5			// center between axes
  for (let i = 0; i < cols; ++i) {
    // centroids on 'real' axes
    const x = position(p[i])
    const y = __.dimensions[p[i]].yscale(row[p[i]])
    centroids.push($V([x, y]))

    // centroids on 'virtual' axes
    if (i < cols - 1) {
      const cx = x + a * (position(p[i + 1]) - x)
      let cy = y + a * (__.dimensions[p[i + 1]].yscale(row[p[i + 1]]) - y)
      if (__.bundleDimension !== null) {
        const leftCentroid = __.clusterCentroids.get(__.dimensions[__.bundleDimension].yscale(row[__.bundleDimension])).get(p[i])
        const rightCentroid = __.clusterCentroids.get(__.dimensions[__.bundleDimension].yscale(row[__.bundleDimension])).get(p[i + 1])
        const centroid = 0.5 * (leftCentroid + rightCentroid)
        cy = centroid + (1 - __.bundlingStrength) * (cy - centroid)
      }
      centroids.push($V([cx, cy]))
    }
  }

  return centroids
}

pc.compute_real_centroids = function (row) {
  const realCentroids = []

  const p = d3.keys(__.dimensions)
  const cols = p.length
  const a = 0.5

  for (let i = 0; i < cols; ++i) {
    const x = position(p[i])
    const y = __.dimensions[p[i]].yscale(row[p[i]])
    realCentroids.push([x, y])
  }

  return realCentroids
}

function compute_control_points (centroids) {
  const cols = centroids.length
  const a = __.smoothness
  const cps = []

  cps.push(centroids[0])
  cps.push($V([centroids[0].e(1) + a * 2 * (centroids[1].e(1) - centroids[0].e(1)), centroids[0].e(2)]))
  for (let col = 1; col < cols - 1; ++col) {
    const mid = centroids[col]
    const left = centroids[col - 1]
    const right = centroids[col + 1]

    const diff = left.subtract(right)
    cps.push(mid.add(diff.x(a)))
    cps.push(mid)
    cps.push(mid.subtract(diff.x(a)))
  }
  cps.push($V([centroids[cols - 1].e(1) + a * 2 * (centroids[cols - 2].e(1) - centroids[cols - 1].e(1)), centroids[cols - 1].e(2)]))
  cps.push(centroids[cols - 1])

  return cps
};
