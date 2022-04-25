<template>
    <div class="main">
        <div class="firstcol col">
            <div class="overviewpanel panel">
                <div class="headline">
                    Overview
                </div>
                <div class="panelcontent">
                    <Overview/>
                </div>
            </div>
            <div class="subsetspanel panel">
                <div class="headline">
                    Subsets
                </div>
                <div class="panelcontent">
                    <SubsetContainer/>
                </div>
            </div>
        </div>
        <div class="secondcol col">
            <div class="featureviewpanel panel">
                <div class="headline">
                    Projection View
                </div>
                <div class="panelcontent">
                    <ProjectionContainer/>
                </div>
            </div>
            <div class="featureselpanel panel">
                <div class="headline">
                    Feature View
                </div>
                 <div class="panelcontent distributionview">
                    <FeatureDistribution/>
                </div>
            </div>
        </div>
        <div class="thirdcol col">
            <div class="modelresultspanel panel">
                <div class="headline">
                    Classification View
                </div>
                <div class="panelcontent predictionview">
                    <PredictionCompView/>
                </div>
            </div>
            <div class="featureinterprepanel panel">
                <div class="headline">
                    Explanation View
                </div>
                <div class="panelcontent">
                    <InterpretationView/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './interface.less'
import Overview from '@/containers/Overview.vue'
import FeatureDistribution from '@/containers/FeatureDistribution.vue'
import PredictionCompView from '@/containers/PredictionCompView.vue'
import InterpretationView from '@/containers/InterpretationView.vue'
import SubsetContainer from '@/containers/SubsetContainer.vue'
import ProjectionContainer from '@/containers/ProjectionContainer.vue'

export default {
  name: 'Interface',
  components: {
    Overview,
    FeatureDistribution,
    PredictionCompView,
    InterpretationView,
    SubsetContainer,
    ProjectionContainer
  }
}
</script>
