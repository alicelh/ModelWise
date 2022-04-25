
<template>
    <g >
        <rect v-for="(d,i) in featureusestate['modeluse']" :key="d.feature" :x="gridWidth*i" y="2" :width="gridWidth" :height="chartHeight - 4" stroke="#ffffff" :fill="d[1]?'#999999':'white'" @click="handlemodelclick(d[0])">
            <title>{{d[0]}}</title>
        </rect>
    </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FeatureUse',
  props: ['featureusestate', 'chartWidth', 'chartHeight'],
  computed: {
    gridWidth () {
      return this.chartWidth / this.featureusestate.modeluse.length
    },
    featureuse () {
      return this.$store.state.featureuse
    },
    selectedfeatures () {
      return this.$store.state.selectedfeatures
    }
  },
  methods: {
    handlemodelclick (d) {
      // let featureused = this.featureuse.find(model=>model.name===d[0])
      // let intersection = featureused['features'].filter(x => !this.selectedfeatures.includes(x));
      // if(intersection.length){
      //     this.$store.commit('updateSelectedFeatures',this.selectedfeatures.concat(intersection));
      // }else{
      //     return;
      // }
      const ele = document.getElementById(`shapfeature-${d}-${this.featureusestate.feature}`)
      if (ele == null) {

      } else {
        ele.scrollIntoView()
      }
    }
  }
})
</script>

<style lang="less" scoped>
g{
    cursor: pointer;
}
</style>
