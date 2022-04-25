import { getNewData, calProjectionResults, getSubsetData, getSelectedModelInfos, getencodingfeature, getShapProj, getDatasetList } from '../api'

export const setDatasetList = async ({commit}) => {
  const response = await getDatasetList()
  commit('setDatasetList',await response.data)
}

// call when change dataset in the systen interface
// return all data needed for the system rendering
export const changeDataset = async ({ commit, state }, name) => {
  commit('updateSubsetFeatureInfo', [])
  commit('changeDataset', name)
  commit('changeDistributionloading', true)
  commit('changePredictionloading', true)
  commit('changeShapviewloading', true)
  commit('changeProjectionloading1', true)
  commit('changeProjectionloading2', true)
  console.log(name)
  const response = await getNewData(name)
  commit('updateSelectedData', [])
  commit('updateFeatureInfo', await response[0].data)
  commit('updateModelInfos', await response[1].data)
  commit('changeidmap', await response[1].data.dataids)
  commit('updatemodelnames', await response[1].data.modelnames)
  commit('initialmodelnames', await response[1].data.selectedmodelnames)
  commit('updatemodelmetrics', await response[1].data.modelinfos)
  commit('updateSelectedFeatures', await response[0].data.featureinfo.filter(d => d.ftype !== 'class').map(d => d.feature))
  commit('changeDistributionloading', false)
  commit('changePredictionloading', false)
  commit('changeShapviewloading', false)
  const response2 = await getShapProj(state.dataset, response[1].data.modelnames[0])
  commit('updateShapProjection', await response2.data)
  commit('changeProjectionloading1', false)
  const response3 = await calProjectionResults(name, state.projectionmethod)
  commit('updateProjection', await response3.data)
  commit('changeProjectionloading2', false)
}

export const changeModels = async ({ commit, state }, models) => {
  commit('changePredictionloading', true)
  commit('changeShapviewloading', true)
  const response = await getSelectedModelInfos(state.dataset, models)
  commit('updateModelInfos', await response.data)
  commit('changePredictionloading', false)
  commit('changeShapviewloading', false)
}

export const getProjectionResult = async ({ commit, state }, projectionmethod) => {
  commit('changeProjectionloading2', true)
  const response = await calProjectionResults(state.dataset, projectionmethod)
  commit('updateProjection', await response.data)
  commit('changeProjectionloading2', false)
}

export const getShapProjectionResult = async ({ commit, state }, modelname) => {
  commit('changeTargetModel', modelname)
  commit('changeProjectionloading1', true)
  const response = await getShapProj(state.dataset, modelname)
  commit('updateShapProjection', await response.data)
  commit('changeProjectionloading1', false)
}

export const getSubsetInfo = async ({ commit, state, getters }) => {
  const response = await getSubsetData(state.dataset, state.selectedmodels, getters.selecteddataid)
  commit('updateSubsetFeatureInfo', await response[0].data)
  console.log('hi', response[1].data)
  commit('updateSubsetShap', await response[1].data)
  commit('updateSubsetStatistics', await response[2].data)
}

export const changeEncodeFeature = async ({ commit, state }, featurename) => {
  if (state.encodingfeature.name !== featurename) {
    const response = await getencodingfeature(state.dataset, featurename)
    commit('updateEncodingFeatureValue', response.data)
  }
}
