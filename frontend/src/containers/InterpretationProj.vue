<template>
    <div style="width:100%;height:480px;position:relative">
        <div style="position:absolute; padding-left:5px">
            Model: <a-select
            v-model:value="selectedmodel"
            size="small"
            placeholder="Please select"
            @select="handleSelectModel"
            style="width:120px"
            >
            <a-select-option value="all">
            all
            </a-select-option>
            <a-select-option v-for="model in models" :key="model" :value="model">
            {{ model }}
            </a-select-option>
            </a-select>
        </div>
        <div style="width:100%;height:100%;position:relative;top:27px">
        <div v-if = "loadingstatus"  class="loadingcontainer projcontainer">
            <a-spin tip="Loading..."/>
        </div>
        <div v-else class="projcontainer" >
            <ShapProj v-if = "projdata.length>0" :data="projdata"/>
        </div>
        </div>
    </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import ShapProj from '@/components/Interpretation/ShapProj.vue'

export default {
  name: 'InterpretationProj',
  components: { ShapProj },
  setup (props) {
    const store = useStore()
    const selectedmodel = ref()
    const handleSelectModel = (modelname) => {
      store.dispatch('getShapProjectionResult', modelname)
    }
    const models = computed(() => store.state.models)
    const projdata = computed(() => store.state.shapprojection)
    const loadingstatus = computed(() => store.state.shapprojectionloading)

    watch(models, () => {
      selectedmodel.value = models.value[0]
      store.commit('changeTargetModel', models.value[0])
    })
    return {
      models,
      selectedmodel,
      handleSelectModel,
      loadingstatus,
      projdata
    }
  }

}
</script>

<style lang="less" scoped>
.projcontainer{
    width: 100%;
    height: 450px;
    margin:0px;
    border: 1px solid #cccccc;
}
</style>
