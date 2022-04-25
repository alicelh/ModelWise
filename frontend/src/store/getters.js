import { cloneDeep } from 'lodash'
export const featuredistribution = (state) => {
  const subsetdata = state.subsetfeatureinfo
  const data = cloneDeep(state.featureinfo)
  const result = []
  data.forEach((e, i) => {
    let tmp = []
    if (subsetdata.length) {
      tmp = cloneDeep(subsetdata.find((s) => s.feature === e.feature).data)
    }
    e.subset = tmp
    result.push(e)
  })
  return result
}

export const selecteddataid = (state) => {
  return state.selecteddata
}

export const featureusestate = (state) => {
  const featurenames = state.featurenames
  const featureuses = state.featureuse

  const featuredict = {}
  const modelnames = featureuses.map((model) => model.name)
  const modelamount = modelnames.length
  featurenames.forEach((featurename) => {
    featuredict[featurename] = new Array(modelamount).fill(0)
  })
  // iterate featureuse array and set featuredict according to feature use state in models
  featureuses.forEach((featureuse, i) => {
    featureuse.features.forEach((feature) => {
      featuredict[feature][i] = 1
    })
  })

  const featureusestate = []
  featurenames.forEach((featurename) => {
    const featureusetmp = {}
    featureusetmp.feature = featurename
    featureusetmp.modeluse = modelnames.map((m, i) => [m, featuredict[featurename][i]])
    featureusestate.push(featureusetmp)
  })

  return featureusestate
}
