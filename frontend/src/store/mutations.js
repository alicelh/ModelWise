export const setFeatures = (state, features) => {
  state.features = features
}

export const setDatasetList = (state,names)=>{
  state.datasetlist = names
}

export const changeDataset = (state, name) => {
  state.dataset = name
}

export const updateFeatureInfo = (state, featureinfo) => {
  state.datainfo = featureinfo.datainfo
  state.encodingfeature = featureinfo.datainfo.classfeature
  state.classes = featureinfo.classes
  state.featureinfo = featureinfo.featureinfo.filter(d => d.ftype !== 'class')
  state.classfeatureinfo = featureinfo.featureinfo.find(d => d.ftype === 'class').data
  state.featurenames = featureinfo.featureinfo.map(d => d.feature)
  state.colorscale.domain(featureinfo.classes)
  state.colorscaledark.domain(featureinfo.classes)
}

export const updateSelectedFeatures = (state, selectedfeatures) => {
  state.selectedfeatures = selectedfeatures
}

export const updateProjection = (state, projectionresults) => {
  state.projectionresults = projectionresults
}

export const changeProjectionloading1 = (state, loadingstatus) => {
  state.shapprojectionloading = loadingstatus
}
export const changeProjectionloading2 = (state, loadingstatus) => {
  state.projectionloading = loadingstatus
}

export const changeDistributionloading = (state, loadingstatus) => {
  state.distributionloading = loadingstatus
}

export const changeShapviewloading = (state, loadingstatus) => {
  state.shapviewloading = loadingstatus
}

export const updateSelectedData = (state, selecteddata) => {
  console.log(state.selectionmode)
  if (state.selectionmode === 'new') {
    state.selecteddata = selecteddata
  } else if (state.selectionmode === 'union') {
    state.selecteddata = [...new Set([...state.selecteddata, ...selecteddata])]
  } else if (state.selectionmode === 'intersection') {
    state.selecteddata = state.selecteddata.filter(x => selecteddata.includes(x))
  } else {
    console.log('error')
  }
}

export const updateSubsetFeatureInfo = (state, subsetfeatureinfo) => {
  state.subsetfeatureinfo = subsetfeatureinfo.filter(d => d.ftype !== 'class')
  if (subsetfeatureinfo.length === 0) state.subsetclassfeature = []
  else state.subsetclassfeature = subsetfeatureinfo.find(d => d.ftype === 'class').data
}

export const changePredictionloading = (state, loadingstatus) => {
  state.predictionloading = loadingstatus
}

export const changeidmap = (state, idmap) => {
  state.idmap = idmap
}

export const updatemodelnames = (state, modelnames) => {
  state.models = modelnames
}

export const initialmodelnames = (state, selectedmodelnames) => {
  state.selectedmodels = selectedmodelnames
  state.sortedmodelnames = ['label'].concat(selectedmodelnames)
}

export const updateselectedmodelnames = (state, selectedmodelnames) => {
  state.selectedmodels = selectedmodelnames
}

export const updatesortedmodelnames = (state, sortedmodelnames) => {
  state.sortedmodelnames = sortedmodelnames
}

export const updateModelInfos = (state, modelinfo) => {
  state.selectedmodels.sort((a, b) => state.models.indexOf(a) - state.models.indexOf(b))
  state.sortedmodelnames = ['label'].concat(state.selectedmodels)
  state.predictions = modelinfo.predictions
  state.featureuse = modelinfo.featureuse
  state.shapvalues = modelinfo.shapvalues
  state.subsetshap = modelinfo.shapvalues
  state.statistics = modelinfo.statistics
}

export const updateSubsetShap = (state, subsetshap) => {
  state.subsetshap = subsetshap
}

export const updateSubsetStatistics = (state, subsetstatistics) => {
  state.subsetstatistics = subsetstatistics.statistics
}

export const changeSelectionFocus = (state, focus) => {
  state.selectionfocus = focus
}

export const updatemodelmetrics = (state, modelinfos) => {
  state.modelinfos = modelinfos
}

export const changeProjectionMethod = (state, projectionmethod) => {
  state.projectionmethod = projectionmethod
}

export const updateEncodingFeatureValue = (state, featurevalue) => {
  state.encodingfeature = featurevalue
}

export const changeselectionmode = (state, selectionmode) => {
  state.selectionmode = selectionmode
}

export const updateShapProjection = (state, projectiondata) => {
  state.shapprojection = projectiondata
}

export const changeTargetModel = (state, modelname) => {
  state.targetmodel = modelname
}
