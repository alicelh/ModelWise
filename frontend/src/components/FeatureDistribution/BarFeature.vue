<template>
    <g ref="svgRef">
        <Axis orient="bottom" :scale="x0" :translateX="0" :translateY="chartHeight" type="category"/>
        <Axis orient="left" :scale="y" :translateX="0" :translateY="0" :format="yaxisformat"/>
        <g class="chart"></g>
        <g class="subsetchart"></g>
    </g>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref,watchEffect,computed } from "vue";
import {select,scaleBand,scaleLinear,max,format} from 'd3';
import Axis from '../Common/Axis.vue';

export default defineComponent({
    name:"BarFeature",
    props:{
        data:{ 
            type: Array as () => Array<any>
        },
        colorScale:Function,
        colorScaleDark: Function,
        chartWidth: Number,
        chartHeight: Number,
        subset:{
            type:Array,
            default:[]
        },
        subsetchecked:Boolean,
        isDensityShow:Boolean,
        classes: Array,
        feautureinfoshow: Boolean
    },
    components:{Axis},
    setup(props) {
        const svgRef = ref(null);
        const chartWidth = props.chartWidth;
        const chartHeight = props.chartHeight;
        const y = ref();
        const yaxisformat = computed(()=>{
            if(props.isDensityShow){
                return d=>format('.1f')(d);
            }else{
                return d=>format('.2~s')(d);
            }
        })

         // The scale spacing the groups(categories):
        const x0 = computed(()=>scaleBand().rangeRound([0,chartWidth]).paddingInner(0.2).domain(props.data.map(d=>d.category)));
        // The scale spacing each group's bar(class in each group)
        const x1 = computed(()=>{
            return scaleBand().padding(0.1).rangeRound([0,x0.value.bandwidth()]).domain(props.classes)
        });

        y.value = scaleLinear().rangeRound([chartHeight,0]).domain([0,max(props.data,(d)=>max(d.values,t=>t.value))]);

        const resetScale = (data,property)=>{
            y.value = scaleLinear().rangeRound([chartHeight,0]).domain([0,max(data,(d)=>max(d.values,t=>t[property]))]);
        }

        const drawDiagram = (data,isdensity)=>{
            const g = select(svgRef.value).select('.chart');
            const rects = g.selectAll('.slice')
               .data(data,d=>d.category)
               .join('g')
               .attr('class','slice')
               .attr('transform',d=>"translate("+x0.value(d.category)+",0)")
               .selectAll('g')
               .data(d=>d.values,d=>d.class)
               .join('g')
            rects.selectAll('rect').data(d=>[d]).join('rect')
               .attr('x',d=>x1.value(d.class))
               .attr('y',d=>y.value(isdensity?d.density:d.value))
               .attr('width',x1.value.bandwidth())
               .attr('height',d=>chartHeight-y.value(isdensity?d.density:d.value))
               .attr('fill',d=>props.colorScale(d.class))
               .attr('fill-opacity',0.8);
            rects.selectAll('text').data(d=>[d]).join('text')
                     .attr('x',d=>x1.value(d.class)+x1.value.bandwidth()/2)
                     .attr('y',d=>y.value(isdensity?d.density:d.value))
                     .attr('text-anchor','middle')
                     .attr('font-size',10)
                     .attr('dy',-1)
                     .text(d=>isdensity?format('.2f')(d.density):d.value)
            if(props.feautureinfoshow){
                rects.selectAll('text').style('opacity',1)
            }else{
                rects.selectAll('text').style('opacity',0)
            }
        };

        const drawSubsetDiagram = (data,isdensity)=>{
            const g = select(svgRef.value).select('.subsetchart');
            const rects = g.selectAll('.subsetslice')
               .data(data,d=>d.category)
               .join('g')
               .attr('class','subsetslice')
               .attr('transform',d=>"translate("+x0.value(d.category)+",0)")
               .selectAll('g')
               .data(d=>d.values,d=>d.class)
               .join('g')

            rects.selectAll('rect').data(d=>[d]).join('rect')
               .attr('x',d=>x1.value(d.class)+x1.value.bandwidth()/4)
               .attr('y',d=>y.value(isdensity?d.density:d.value))
               .attr('width',x1.value.bandwidth()/2)
               .attr('height',d=>chartHeight-y.value(isdensity?d.density:d.value))
               .attr('fill',d=>props.colorScaleDark(d.class))
               .attr("stroke",'#ffffff')
               .attr('dy',-1)
               .attr('stroke-dasharray',d=>`${x1.value.bandwidth()/2+chartHeight-y.value(isdensity?d.density:d.value)} ${x1.value.bandwidth()/2}`);
            rects.selectAll('text').data(d=>[d]).join('text')
                     .attr('x',d=>x1.value(d.class)+x1.value.bandwidth()/2)
                     .attr('y',d=>y.value(isdensity?d.density:d.value))
                     .attr('text-anchor','middle')
                     .attr('font-size',10)
                     .text(d=>isdensity?format('.2f')(d.density):d.value)
            if(props.feautureinfoshow){
                rects.selectAll('text').style('opacity',1)
            }else{
                rects.selectAll('text').style('opacity',0)
            }
        }

        onMounted(()=>{
            watchEffect(()=>{
                if(props.subsetchecked){
                    if(props.isDensityShow){
                        resetScale(props.subset,'density');
                        drawDiagram([],true);
                        drawSubsetDiagram(props.subset,true);
                    }else{
                        resetScale(props.subset,'value');
                        drawDiagram([],false);
                        drawSubsetDiagram(props.subset,false);
                    }
                }else{
                    if(props.isDensityShow){
                        if(props.subset.length!==0){
                            if(max(props.data,(d)=>max(d.values,t=>t['density']))>max(props.subset,(d)=>max(d.values,t=>t['density']))){
                                resetScale(props.data,'density');
                            }else{
                                resetScale(props.subset,'density');
                            }
                        }else{
                            resetScale(props.data,'density');
                        }
                        drawDiagram(props.data,true);
                        drawSubsetDiagram(props.subset,true);
                    }else{
                        resetScale(props.data,'value');
                        drawDiagram(props.data,false);
                        drawSubsetDiagram(props.subset,false);
                    }
                }
            })
        });

        return{
            svgRef,
            chartHeight,
            x0,
            y,
            yaxisformat};
    },
})
</script>
