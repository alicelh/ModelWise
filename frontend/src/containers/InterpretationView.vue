<template>
    <div v-if = "loadingstatus" class="loadingcontainer">
        <a-spin tip="Loading..."/>
    </div>
    <div v-else>
        <ShapBars :shapvalues="shapvalues" :colorscale="colorscale" :sortedmodelnames="sortedmodelnames"/>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import ShapBars from '@/components/Interpretation/ShapBars.vue'

export default defineComponent({
  name: 'InterpretationView',
  components: {
    ShapBars
  },
  setup () {
    const store = useStore()
    return {
      shapvalues: computed(() => store.state.subsetshap),
      colorscale: computed(() => store.state.colorscale),
      loadingstatus: computed(() => store.state.shapviewloading),
      sortedmodelnames: computed(() => store.state.sortedmodelnames.filter(d => d !== 'label'))
    }
  }
})
</script>

<style lang="less" scoped>
div{
    width: 100%;
    height: 100%;
    padding: 0;
}
</style>
