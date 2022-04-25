<template>
    <div v-if = "loadingstatus" class="loadingcontainer">
        <a-spin tip="Loading..."/>
    </div>
    <div v-else class="distributions">
        <div class="header">
            Sort By:
        <a-select
          v-model:value="sortmethod"
          style="width:120px;"
          size="small"
        >
          <a-select-option value="modeluse">Use Frequency</a-select-option>
          <a-select-option value="classdiff">Global Difference</a-select-option>
          <a-select-option value="subsetdiff">Subset Difference</a-select-option>
        </a-select>
        Subset: <a-switch size="small" v-model:checked="onlyShowSubset" />
        Prob: <a-switch size="small" v-model:checked="isDensityShow" />
        </div>
        <div class="content">
            <div class="svgcontent">
                <FeatureInfo v-for="featureinfo in sortedfeatureinfos" :key="featureinfo.feature" :feature="featureinfo" :subsetchecked="onlyShowSubset" :isDensityShow="isDensityShow" :featureusestate="featureusestate.find(e=>e.feature === featureinfo.feature)" :classes="classes"/>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { sum, max } from 'd3'
import FeatureInfo from '@/components/FeatureDistribution/FeatureInfo.vue'

export default {
  name: 'FeatureDistribution',
  components: { FeatureInfo },
  setup () {
    const store = useStore()
    const onlyShowSubset = ref(false)
    const isDensityShow = ref(false)
    const sortmethod = ref('modeluse')

    const getsortedfeatures = (featureinfos, scope) => {
      const modemap = new Map()
      featureinfos.forEach((feature) => {
        if (feature.type === 'numerical') {
          let tmpfeatures
          if (scope === 'mix') {
            tmpfeatures = feature.subset
            const subsetclass = tmpfeatures[0].class
            tmpfeatures = tmpfeatures.concat(feature.data.filter(d => d.class !== subsetclass))
          } else {
            tmpfeatures = feature[scope]
          }
          const density_hists = tmpfeatures.map(d => d.density_hist)
          const xinterval = tmpfeatures[0].bin_edges[1] - tmpfeatures[0].bin_edges[0]
          const classes = density_hists.length
          const bins = density_hists[0].length
          const maxproarray = []
          for (let i = 0; i < bins; i++) {
            let maxtmp
            for (let j = 0; j < classes; j++) {
              if (j === 0) maxtmp = density_hists[j][i]
              else {
                if (density_hists[j][i] > maxtmp) maxtmp = density_hists[j][i]
              }
            }
            maxproarray.push(maxtmp)
          }
          modemap.set(feature.feature, sum(maxproarray) * xinterval)
        } else { // categorical feature with different structure compared to numerical feature
          const maxproarray = []
          let tmpfeatures
          if (scope === 'mix') {
            const subsetclass = feature.subset[0].values[0].class
            tmpfeatures = JSON.parse(JSON.stringify(feature.data))
            tmpfeatures.forEach(tmpfeature => {
              tmpfeature.values = tmpfeature.values.filter(d => d.class !== subsetclass)
              const featuredata = feature.subset.find(d => d.category === tmpfeature.category)
              if (featuredata !== undefined) {
                tmpfeature.values = tmpfeature.values.concat(featuredata.values)
              }
            })
          } else {
            tmpfeatures = feature[scope]
          }
          tmpfeatures.forEach(categories => {
            maxproarray.push(max(categories.values.map(d => d.density)))
          })
          modemap.set(feature.feature, sum(maxproarray))
        }
      })
      return featureinfos.sort((b, a) => {
        const avalue = modemap.get(a.feature)
        const bvalue = modemap.get(b.feature)
        if (avalue === bvalue) {
          return (a.type === 'categorical') - (b.type === 'categorical')
        } else {
          return avalue - bvalue
        }
      })
    }

    const featureinfos = computed(() => store.getters.featuredistribution)
    const featureusestate = computed(() => store.getters.featureusestate)

    const isSingleSubset = (feature) => {
      if (feature.type === 'numerical') {
        if (feature.subset.length === 1) return true
        else return false
      } else { // categorical
        const classes = feature.subset.flatMap((d) => d.values.flatMap(dd => dd.class))
        return new Set(classes).size == 1
      }
    }

    const sortedfeatureinfos = computed(() => {
      if (sortmethod.value === 'modeluse') {
        const modemap = new Map()
        featureusestate.value.forEach((d) => {
          modemap.set(d.feature, sum(d.modeluse.map(dd => dd[1])))
        })
        return featureinfos.value.sort((b, a) => {
          return modemap.get(a.feature) - modemap.get(b.feature)
        })
      } else if (sortmethod.value === 'classdiff') {
        return getsortedfeatures(featureinfos.value, 'data')
      } else {
        if (featureinfos.value[0].subset.length > 0) {
          // subset selected contains
          if (isSingleSubset(featureinfos.value[0])) {
            return getsortedfeatures(featureinfos.value, 'mix')
          }
          return getsortedfeatures(featureinfos.value, 'subset')
        } else {
          return getsortedfeatures(featureinfos.value, 'data')
        }
      }
    })

    return {
      onlyShowSubset,
      isDensityShow,
      sortmethod,
      featureusestate,
      sortedfeatureinfos,
      loadingstatus: computed(() => store.state.distributionloading),
      classes: computed(() => store.state.classes)
    }
  }
}
</script>

<style lang="less" scoped>
.distributions{
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 2px;
}
.header{
    width: 100%;
    background-color: white;
}
.content{
    overflow-y: auto;
    position: relative;
    height: 100%;
}

.svgcontent{
    position: absolute;
    margin: 0 3px;
}

:deep(.ant-select-selector){
    height:20px;
    align-items: start;
    align-content: flex-start;
    font-size: 12px;
}

</style>
