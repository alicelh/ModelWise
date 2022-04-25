<template>
  <div class="content">
    <a-space direction="vertical" :size="5">
    <a-row type="flex" justify="space-between" align="bottom">
      <a-col flex="auto" class="titles">
        Datasets:
      </a-col>
      <a-col flex="170px">
        <a-select
          v-model:value="dataset"
          style="width:170px"
          size="small"
          @change="handleChangeDataset"
        >
          <a-select-option v-for="datasetname in datasetlist" :key="datasetname" :value="datasetname">{{datasetname}}</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between">
      <a-col :flex="1" class="titles">
        Feature Amount :
      </a-col>
      <a-col flex="100px">
        {{datainfo.featureamount}}
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between">
      <a-col :flex="1" class="titles">
        Category :
      </a-col>
      <a-col flex="100px">
        {{datainfo.category}}
        <a-button size="small" @click="encodeProjection(datainfo.category)">
          <template #icon><BgColorsOutlined /></template>
        </a-button>
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between">
      <a-col :flex="1" class="titles">
      Data Amount :
      </a-col>
      <a-col flex="100px">
        {{datainfo.dataamount}}
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between">
      <a-col :flex="1" class="titles">
      Selected Instances :
      </a-col>
      <a-col flex="100px">
        <div class="activetext">
        {{selecteddata}}
        </div>
      </a-col>
    </a-row>
    <div>
      <ClassBar :width="230" :height="90" :classfeature="classfeature" :subsetclassfeature="subsetclassfeature" :colorscale="colorscale"
      :colorScaleDark="colorScaleDark"/>
    </div>
    <hr style="height:1px"/>
    <a-row type="flex" justify="space-between" align="middle">
      <a-col flex="auto" class="titles">
      Models:
      </a-col>
      <a-col flex="170px">
        <a-select
        mode="multiple"
        v-model:value="selectedmodels"
        size="small"
        style="width:170px; height:45px"
        placeholder="Please select"
        >
        <a-select-option v-for="model in models" :key="model">
          {{ model }}
        </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between" align="bottom">
      <a-col :flex="1" class="titles">
      Selected models :
      </a-col>
      <a-col flex="60px">
        <div class="activetext">
        {{selectedmodels.length}}
        </div>
      </a-col>
      <a-col flex="50px">
        <a-button size="small" @click="loadNewModels">Load</a-button>
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between" align="bottom">
      <a-col :flex="1" class="titles">
      All {{models.length}} models sort by:
      </a-col>
      <a-col flex="90px">
        <a-select
        v-model:value="selectedmodelmetric"
        size="small"
        style="width:90px"
        placeholder="Please select"
        >
        <a-select-option value="accuracy">accuracy</a-select-option>
        <a-select-option value="precision">precision</a-select-option>
        <a-select-option value="f1">f1</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <div class="svgcontainer">
    <VerticalBarPlot :mydata="modelmetrics" :width="220" :height="200" :selectedmetric="selectedmodelmetric"/>
    </div>
    <hr style="height:1px"/>
    <a-row type="flex" justify="space-between" align="middle">
      <a-col flex="auto" class="titles">
        Selection Mode:
      </a-col>
      <a-col flex="120px">
      <a-radio-group v-model:value="selectionmode" button-style="solid" size="small" @change="changeselectionmode">
        <a-radio-button value="new"><span class="icon-new" style="font-size: 15px; line-height: 18px; vertical-align: bottom; display: inline-block;"></span></a-radio-button>
        <a-radio-button value="union"><span class="icon-union" style="font-size: 22px; line-height: 0; vertical-align: bottom; display: inline-block;"></span></a-radio-button>
        <a-radio-button value="intersection"><span class="icon-intersect" style="font-size: 22px; line-height: 0; vertical-align: bottom; display: inline-block;"></span> </a-radio-button>
      </a-radio-group>
      </a-col>
    </a-row>
    </a-space>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import { useStore } from 'vuex';

import VerticalBarPlot from '@/components/Overview/VerticalBarPlot.vue';
import ClassBar from '@/components/Overview/ClassBar.vue';
import { BgColorsOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: "Overview",
  components:{VerticalBarPlot,ClassBar,BgColorsOutlined},
  setup(){
    const selectionmode = ref<string>('new');
    const store = useStore();

    const handleChangeDataset = (value:string)=>{
      let currentdataset = store.state.dataset;
      if(value!== currentdataset){
        store.dispatch('changeDataset',value);
      }
    }

    const selectedmodels = computed({
      get(){
        return store.state.selectedmodels;
      },
      set(value:string[]){
        store.commit('updateselectedmodelnames',value);
      }
    })

    const loadNewModels = ()=>{
      store.dispatch('changeModels',selectedmodels.value);
    }

    const encodeProjection = (classfeature)=>{
      store.dispatch('changeEncodeFeature',classfeature)
    }

    const changeselectionmode = ()=>{
      store.commit('changeselectionmode',selectionmode.value);
    }

    return {
        datasetlist: computed(()=>store.state.datasetlist),
        dataset:computed(()=>store.state.dataset),
        models:computed(()=>store.state.models),
        datainfo:computed(()=>store.state.datainfo),
        modelmetrics:computed(()=>store.state.modelinfos),
        selectedmodels,
        selecteddata: computed(()=>store.state.selecteddata.length),
        classfeature: computed(()=>store.state.classfeatureinfo),
        subsetclassfeature: computed(()=>store.state.subsetclassfeature),
        colorscale: computed(()=>store.state.colorscale),
        colorScaleDark: computed(()=>store.state.colorscaledark),
        selectionmode,
        changeselectionmode,
        handleChangeDataset,
        loadNewModels,
        encodeProjection,
        selectedmodelmetric:ref('accuracy')
    }
  }
})
</script>

<style lang="less" scoped>
.content{
  margin: 4px 2px;
  text-align: center;
  width: 100%;
}

.svgcontainer{
  width: 99%;
  max-height: 200px;
  position: relative;
  overflow-y: scroll;
}

.titles{
  text-align: start;
  font-size: 14px;
  font-weight: 500;
  color: #1e2225;
}

.activetext{
  background-color: rgba(108,117,125,0.2);
  margin: 0 3px;
  border-radius:5px;
}

hr{
    margin: 2px 0px;
    height: 1px; // changed by antv-design to 0
    background-color: #aaaaaa;
    border: none;
}

:deep(.ant-select-selector){
    height:45px;
    align-items: start;
    align-content: flex-start;
}

:deep(.ant-select-selection-placeholder){
  transform: translateY(0) !important;
  top:0 !important;
}
</style>