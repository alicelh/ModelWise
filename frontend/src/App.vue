<template>
  <Interface/>
</template>

<script>
import Interface from './layout/Interface.vue'

export default {
  name: 'App',
  components: {
    Interface
  },
  mounted () {
    this.$store.dispatch('initdatasetlist')
    this.$store.dispatch('changeDataset', this.$store.state.dataset)
    /**
     * @description: fetch feature distribution and shap info of subset once selecteddata in vuex change
     * @param {*}
     * @return {*}
     */
    /
    this.$store.watch((state) => state.selecteddata, (newseleceddata) => {
      if (newseleceddata.length > 0) {
        console.log('subset update')
        this.$store.dispatch('getSubsetInfo', newseleceddata)
      } else {
        this.$store.commit('updateSubsetFeatureInfo', [])
        this.$store.commit('updateSubsetShap', this.$store.state.shapvalues)
      }
    })
  }
}
</script>
