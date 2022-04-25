<template>
    <div v-if = "loadingstatus" class="loadingcontainer">
        <a-spin tip="Loading..."/>
    </div>
    <div v-else>
        <Projection :data="data.data"/>
    </div>
</template>

<script lang="ts">
import Projection from '@/components/Projection.vue'
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'FeatureView',
  components: { Projection },
  setup () {
    const store = useStore()
    return {
      data: computed(() => store.state.projectionresults),
      loadingstatus: computed(() => store.state.projectionloading)
    }
  }
})
</script>

<style lang="less" scoped>
div{
    width: 100%;
    height: 100%;
    padding: 2px;
}
</style>
