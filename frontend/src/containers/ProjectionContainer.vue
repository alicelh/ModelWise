<template>
    <a-tabs v-model:activeKey="activeKey" size="small">
        <a-tab-pane key="1" tab="Explanation" force-render>
            <div class="panelcontent">
            <InterpretationProj/>
            </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="Feature">
            <FeatureSelection/>
            <div class="panelcontent projectionview">
                <FeatureView/>
            </div>
        </a-tab-pane>
    </a-tabs>
</template>

<script>
import FeatureSelection from '@/containers/FeatureSelection.vue'
import FeatureView from '@/containers/FeatureView.vue'
import InterpretationProj from '@/containers/InterpretationProj.vue'

import { ref } from 'vue'

export default {
  name: 'ProjectionContainer',
  components: {
    FeatureSelection,
    FeatureView,
    InterpretationProj
  },
  setup () {
    return {
      activeKey: ref('1')
    }
  }
}
</script>

<style lang="less" scoped>
:deep(.ant-tabs-bar){
    margin: 0 0 2px 0;
}
</style>
