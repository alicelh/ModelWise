<template>
    <div v-if = "loadingstatus" class="loadingcontainer">
        <a-spin tip="Loading..."/>
    </div>
    <div v-else class="container">
        <!-- <ParallelCoord :predictions="predictions" :dataLabel="dataLabel" :width="width" :height="height" :margin="margin"/> -->
        <div id="parallelsetcontainer">
            <ParallelSet :predictions="predictions" :selectionfocus="selectionfocus" :sortedmodelnames="sortedmodelnames"/>
        </div>
        <div id="summarybarscontainer">
            <SummaryBars :predictions="predictions" :statistics="selecteddata.length===0?statistics:subsetstatistics" :width="150" :selecteddata="selecteddata" :colorscale="colorscale"/>
        </div>
    </div>
</template>

<script>
import ParallelSet from '@/components/PredictionComp/ParallelSet.vue'
import SummaryBars from '@/components/PredictionComp/SummaryBars.vue'

import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'PredictionCompView',
  components: {
    ParallelSet,
    SummaryBars
  },
  data () {
    return {
      width: 1200,
      height: 800,
      margin: { top: 30, bottom: 20, left: 20, right: 20 }
    }
  },
  setup () {
    const store = useStore()

    return {
      loadingstatus: computed(() => store.state.predictionloading),
      predictions: computed(() => store.state.predictions),
      selectionfocus: computed(() => store.state.selectionfocus),
      statistics: computed(() => store.state.statistics),
      subsetstatistics: computed(() => store.state.subsetstatistics),
      selecteddata: computed(() => store.state.selecteddata),
      colorscale: computed(() => store.state.colorscale),
      sortedmodelnames: computed(() => store.state.sortedmodelnames)
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.container{
    width: 100%;
    height: 100%;
    padding: 2px;
    display: flex;
}
#parallelsetcontainer{
    flex: 1 1 auto;
}
#summarybarscontainer{
    width: 200px;
}
</style>
