<template>
    <div id="shapview">
        <div class="header">
            <span>
            Layout: <a-select
                v-model:value="layoutMethod"
                style="width: 100px"
                size="small"
            >
                <a-select-option value="FeatureName">Aligned</a-select-option>
                <a-select-option value="Contribution">Compact</a-select-option>
            </a-select>
            </span>
            <span>
            SortBy: <a-select
                v-model:value="sortMetric"
                style="width: 100px"
                size="small"
            >
                <a-select-opt-group label="Metric">
                    <a-select-option value="avgabs">Average</a-select-option>
                    <!-- <a-select-option value="avg">Average</a-select-option> -->
                    <a-select-option value="extreme">Extreme</a-select-option>
                    <a-select-option value="median">Median</a-select-option>
                    <a-select-option value="std">Std Dev</a-select-option>
                </a-select-opt-group>             
            </a-select>
            &nbsp;<PlusCircleFilled />&nbsp;
            <a-select
                v-model:value="classPrefer"
                style="width: 100px"
                size="small"
            >
                <a-select-opt-group label="Class Preference">
                    <a-select-option value="all">All</a-select-option>
                    <a-select-option v-for="classname in classes" :value="classname" :key="classname">{{classname}}</a-select-option>
                </a-select-opt-group>
            </a-select>
            </span>
            <span>
            Chart Type: <a-select
                v-model:value="charttype"
                style="width: 100px"
                size="small"
            >
                <a-select-option value="boxplot">BoxPlot</a-select-option>
                <a-select-option value="violinplot">ViolinPlot</a-select-option>
                <a-select-option value="barchart">BarChart</a-select-option>
            </a-select>
            </span>
            <span>
                Normalization: <a-switch v-model:checked="normalizechecked" size="small"/>
            </span>
        </div>
        <div id="modelheadersvg">
            <svg ref="headersvgRef">
                <g v-for="shapvalue in shapvalues" :transform="'translate('+xscale(shapvalue.model)+',0)'" :key="shapvalue.model">
                    <ShapBarName :shapvalue="shapvalue" :width="xscale.bandwidth()" :shapscale="shapscale" :titleheight="titleheight" :shapbarscale="shapbarscale" :normalizechecked="normalizechecked" :charttype="charttype" :layoutMethod = "layoutMethod"                     :selectedmodelname="selectedModelName" 
                    :sortMetric = "sortMetric"
                    :getShapMetrc="getShapMetrc"
                    @handleFeatureReorder="updatesortedfeaturenames"/>
                </g>
            </svg>
        </div>
        <div id="interpretationsvg" ref="resizeRef">
            <svg ref="svgRef">
                <g v-for="shapvalue in shapvalues" :transform="'translate('+xscale(shapvalue.model)+',0)'" :key="shapvalue.model">
                    <VerticalBars :shapvalue="shapvalue" :width="xscale.bandwidth()" 
                    :normalizechecked="normalizechecked"
                    :shapscale="shapscale"
                    :shapbarscale="shapbarscale"
                    :colorscale="colorscale" :barchartheight="barchartheight" :titleheight="titleheight" :layoutMethod = "layoutMethod"
                    :charttype = "charttype"
                    :sortMetric = "sortMetric"
                    :sortClass= "classPrefer"
                    :getShapMetrc="getShapMetrc"
                    @handleFeatureSelect="handlefeatureselect"
                    @handleFeatureReorder="updatesortedfeaturenames"
                    :sortedfeaturenames="sortedfeaturenames"
                    />
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watchEffect,ref, computed, watch } from 'vue';
import useResizeObserver from '@/utils/resizeObserver';
import {select,scaleBand,scaleLinear,max} from 'd3';
import VerticalBars from './VerticalBars.vue';
import ShapBarName from './ShapBarName.vue';
import { useStore } from 'vuex';
import { PlusCircleFilled } from '@ant-design/icons-vue';

export default defineComponent({
    name:'ShapBars',
    props:['shapvalues','colorscale','sortedmodelnames'],
    components:{VerticalBars,ShapBarName,PlusCircleFilled},
    setup(props) {
        const svgRef = ref(null);
        const headersvgRef = ref(null);
        const barchartheight =ref(80);
        const titleheight = ref(20);
        const { resizeRef, resizeState } = useResizeObserver();

        const margin = {top:0,left:50,right:3,bottom:20};
        const selectedfeaturename = ref();
        const layoutMethod = ref('Contribution');
        const selectedModelName = ref(props.shapvalues[0].model);

        const normalizechecked = ref<boolean>(false);

        const sortedfeaturenames = computed(()=>{
            return computedsortedfeatures(selectedModelName.value)
        })

        const sortMetric = ref('avgabs');
        const classPrefer = ref('all');

        const store = useStore();
        const classes = computed(()=>store.state.classes);

        const getShapMetrc = (value,metric)=>{
            if(metric==='avgabs') return max(value.sum);
            if(metric==='avg') return value.avg;
            else if(metric==='extreme') return max([value.max,-value.min]);
            else if(metric==='median') return value.median;
            else return value.std;
        }

        const sortFeatureFunction = (values,metric,classprefer)=>{
            let valuescopy = JSON.parse(JSON.stringify(values));
            if(classprefer==='all'){
                return valuescopy.sort((b,a)=>{return max(a.shap.map(d=>getShapMetrc(d,metric)))-max(b.shap.map(d=>getShapMetrc(d,metric)))}).map(d=>d.feature);
            }else{
                return valuescopy.sort((b,a)=>{
                    return getShapMetrc(a.shap.find(d=>d.class===classprefer),metric) - getShapMetrc(b.shap.find(d=>d.class===classprefer),metric)
                }).map(d=>d.feature);
            }
        }

        const computedsortedfeatures = (modelname)=>{
            let targetmodel = props.shapvalues.find(d=>d.model===modelname);
            let sortedfeatures = sortFeatureFunction(targetmodel.values,sortMetric.value,classPrefer.value)
            sortedfeatures.push(...allfeaturenames.value.filter(d=>!sortedfeatures.includes(d)))
            return sortedfeatures;
        }

        const allfeaturenames = computed(()=>{
            let featuredict={}
            props.shapvalues.forEach((shapvalue)=>{
                shapvalue.values.forEach(featureobj=>{
                    if(featureobj.feature in featuredict)
                        featuredict[featureobj.feature]++;
                    else{
                        featuredict[featureobj.feature]=1
                    }
                })
            })
            return Object.keys(featuredict);
        })

        const chartwidth = computed(()=>{
            const { width,height } = resizeState.dimensions;
            return width-margin.left-margin.right;
        })

        const svgheight = computed(()=>{
            let featureamount = max(props.shapvalues.map(d=>d.values.length));
            featureamount = max([0,featureamount]);
            if(layoutMethod.value==='FeatureName') featureamount = allfeaturenames.value.length;
            return titleheight.value+barchartheight.value*featureamount;
        })
                
        const xscale = computed(()=>{
            return scaleBand().domain(props.sortedmodelnames).range([margin.left,chartwidth.value?chartwidth.value:100]).padding(.1)
        });

        onMounted(()=>{
            const svg = select(svgRef.value);
            const headersvg = select(headersvgRef.value);
            watchEffect(()=>{
                svg.attr("viewBox", [0, 0, chartwidth.value, svgheight.value]);
                headersvg.attr("viewBox", [0, 0, chartwidth.value, 80]);
            })
        })
        
        const shapscale = computed(()=>{
            const extend = Math.abs(max(props.shapvalues.flatMap(t=>t.values).flatMap(d=>d.shap).flatMap(dd=>[Math.abs(dd.max),Math.abs(dd.min)])))
            return scaleLinear().domain([-extend,extend]).range([0,xscale.value.bandwidth()]);
        })

        const shapbarscale = computed(()=>{
            const extend = Math.abs(max(props.shapvalues.flatMap(t=>t.values).flatMap(d=>d.shap).flatMap(dd=>{return Math.abs(getShapMetrc(dd,sortMetric.value))})))
            return scaleLinear().domain([-extend,extend]).range([0,xscale.value.bandwidth()]);
        })

        const updatesortedfeaturenames = (modelname) => {
            selectedModelName.value = modelname;
        }

        watch(()=>resizeState.dimensions,(dimensions,old)=>{
            const svg = select(svgRef.value);
            const headersvg = select(headersvgRef.value);
            if(dimensions.width!==old.width||dimensions.height!==old.height){
                svg.attr("viewBox", [0, 0, chartwidth.value, svgheight.value]);
                headersvg.attr("viewBox", [0, 0, chartwidth.value, 80]);
            }
        })

        
        const handlefeatureselect = (featurename:string)=>{
            select(svgRef.value)
            .selectAll('.featureborder')
            .attr('visibility','hidden');

            if(selectedfeaturename.value!==featurename){
                select(svgRef.value)
                .selectAll(`.${featurename}`)
                .attr('visibility','visible');
                selectedfeaturename.value = featurename;
            }else{
                selectedfeaturename.value = ''
            }
        }

        return{
            svgRef,
            headersvgRef,
            resizeRef,
            xscale,
            barchartheight,
            titleheight,
            handlefeatureselect,
            layoutMethod,
            charttype: ref('violinplot'),
            shapscale,
            chartwidth,
            shapbarscale,
            updatesortedfeaturenames,
            sortedfeaturenames,
            selectedModelName,
            normalizechecked,
            sortMetric,
            classPrefer,
            classes,
            getShapMetrc};
    }
})
</script>

<style lang="less" scoped>
#shapview{
    padding-right:110px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header{
    width: 100%;
    background-color: white;
    height: 40px;
    padding: 4px;
    span{
        padding: 0 4px;;
    }
}

#interpretationsvg{
    position: relative;
    overflow-y: scroll;
    padding: 0;
    top:50px;
    height: 82%;
}

#modelheadersvg{
    position: relative;
    
}

svg {
    position: absolute;
}
</style>