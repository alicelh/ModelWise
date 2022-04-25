import axios from 'axios'

const API = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`
})

export const getDatasetList = () => API.get('/datasetlist')

export const getFeatureDistribution = (dataset) => API.get(`/${dataset}/featureinfos`)

export const getSubsetFeatureDistribution = (dataset, subset) => API.post(`/${dataset}/featureinfo/subset`, { subset })

export const getSubsetShap = (dataset, models, subset) => API.post(`/${dataset}/shap/subset`, { models, subset }).catch(err => console.log(err))

export const getSubsetStatistics = (dataset, models, subset) => API.post(`/${dataset}/statistics/subset`, { models, subset })

export const getSubsetData = (dataset, models, subset) => {
  return axios.all([getSubsetFeatureDistribution(dataset, subset), getSubsetShap(dataset, models, subset), getSubsetStatistics(dataset, models, subset)])
}

export const getNewData = (dataset) => {
  return axios.all([getFeatureDistribution(dataset), getModelInfos(dataset)])
}

export const calProjectionResults = (dataset, projectionmethod) => API.get(`/${dataset}/calFeatureProjection/${projectionmethod}`)

export const getModelInfos = (dataset) => API.get(`/${dataset}/modelinfos`)

export const getSelectedModelInfos = (dataset, models) => API.post(`/${dataset}/selectedmodelinfos`, { models })

export const getencodingfeature = (dataset, featurename) => API.get(`/${dataset}/featurevalue/${featurename}`)

export const getShapProj = (dataset, modelname) => API.get(`/${dataset}/shapproj/${modelname}`)
