import { createStore } from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import * as mutations from './mutations'
import { scaleOrdinal } from 'd3'

const state = {
  predictions: [],

  // new system
  datasetlist: [],
  dataset: 'penguin',
  datainfo: {},
  classes: [],
  models: [],
  modelinfos: [],
  selectedmodels: [],
  sortedmodelnames: [],
  selecteddata: [],
  featurenames: [],
  featureinfo: [], // data for feature distribution view
  classfeatureinfo: [],
  subsetfeatureinfo: [], // data of subset for feature distribution view
  subsetclassfeature: [],
  distributionloading: false,
  selectionmode: 'new',

  selectedfeatures: [],
  // colorscale : scaleOrdinal().range(['#f4a582','#92c5de']),
  // colorscaledark: scaleOrdinal().range(['#ca0020','#0571b0']),
  colorscale: scaleOrdinal().range(['#fb8072', '#80b1d3', '#fdb462', '#8dd3c7', '#ffffb3', '#bebada', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f']),
  colorscaledark: scaleOrdinal().range(['#FB4626', '#2A8DD3', '#FD9019', '#35D3B3', '#FFFF4D', '#624CDA', '#8EDE16', '#FC58A5', '#D98282', '#BD39BD', '#5DEB52', '#FFE926']),
  projectionresults: {}, // data for feature projection view
  shapprojection: {},
  projectionloading: false,
  shapprojectionloading: false,

  selectionfocus: 'models',

  predictionloading: false,
  idmap: [],

  shapviewloading: true,
  featureuse: [], // featureuse state in models
  shapvalues: [],
  subsetshap: [],
  statistics: [],
  subsetstatistics: [],
  projectionmethod: 'tsne_all',
  encodingfeature: {}, // use this feature endcoding color in projection view,
  targetmodel: '' // this target model save the model name used for interpretation projection and used by locating feature position when clicking on feature name in feature distribution view
}

export default new createStore({
  state,
  getters,
  mutations,
  actions
})
