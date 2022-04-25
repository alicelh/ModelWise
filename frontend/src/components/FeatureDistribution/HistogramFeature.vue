<template>
    <g ref="svgRef">
    <Axis orient="bottom" :scale="x0" :translateX="0" :translateY="chartHeight" :ticks="ticks"/>
    <Axis orient="left" :scale="y" :translateX="0" :translateY="0" :format="yaxisformat"/>
    <g class="chart"></g>
    <g class="subsetchart"></g>
    </g>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect, computed} from "vue";
import {select,scaleBand,scaleLinear,max,extent,line,curveBasis,area,format} from 'd3';
import Axis from '../Common/Axis.vue';

export default defineComponent({
    name:"HistogramFeature",
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
        subsetchecked: Boolean,
        isDensityShow: Boolean
    },
    components:{Axis},
    // computed:{
    //     x0(){
    //         return scaleLinear().rangeRound([0,this.chartWidth]).domain(extent(this.featuredata[0].bin_edges)).nice();
    //     },
    //     space(){
    //         return this.chartWidth/this.featuredata[0].bin_edges.length;
    //     },
    //     x1(){
    //         return scaleBand().padding(0).rangeRound([0,this.space]).domain(this.featuredata.map(d=>d.class));
    //     },
    //     y(){
    //         let property = 'hist';
    //         if(this.isDensityShow) property = 'density_hist';
    //         let maxv = max(this.featuredata,(d)=>max(d[property]))
    //         if(this.subset.length>0){
    //             let tmp = max(this.subset,(d)=>max(d[property]))
    //             if(tmp>maxv) maxv=tmp;
    //         }
    //         return scaleLinear().rangeRound([this.chartHeight,0]).domain([0,maxv]);
    //     }
    // },
    // methods:{
    //     drawDiagram : function(){
    //         let data=this.featuredata;
    //         if(this.subsetchecked) data = [];
    //         const svg = select(this.$refs.svgRef);
    //         const g = svg.selectAll('.slice')
    //            .data(data)
    //            .join('g')
    //            .attr('class','slice')
    //         if(this.isDensityShow){
    //             g.selectAll("*").remove();
    //             g.append('path')
    //              .attr('d',d=>area().curve(curveBasis).x(t=>this.x0(t[0])).y1(t=>this.y(t[1])).y0(this.y(0))(d.density_hist.map((t,i)=>[(d.bin_edges[i]+d.bin_edges[i+1])/2,t])))
    //              .attr("fill", d=>this.colorScale(d.class))
    //              .attr("fill-opacity", .3)
    //              .attr("stroke", d=>this.colorScale(d.class))
    //              .attr('stroke-opacity',.5)
    //              .attr("stroke-width", 1.0)
    //              .attr("stroke-linejoin", "round")

    //         }else{
    //             g.selectAll("*").remove();
    //             g.selectAll('rect')
    //             .data(d=>d.hist.map((t,i)=>[d.class,d.bin_edges[i],t]))
    //             .join('rect')
    //             .attr('transform',d=>"translate("+this.x0(d[1])+",0)")
    //             .attr('x',d=>this.x1(d[0]))
    //             .attr('y',d=>this.y(d[2]))
    //             .attr('width',this.x1.bandwidth())
    //             .attr('height',d=>this.chartHeight-this.y(d[2]))
    //             .attr('fill',d=>this.colorScale(d[0]))
    //             .attr('fill-opacity',0.8);
    //         }
    //     },
    //     drawSubsetDiagram : function(){
    //         console.log('subset')
    //         let subset = this.subset;
    //         const svg = select(this.$refs.svgRef);
    //         const g = svg.selectAll('.subsetslice')
    //            .data(subset)
    //            .join('g')
    //            .attr('class','subsetslice')
    //         if(this.isDensityShow){
    //             g.selectAll("*").remove();
    //             g.append('path')
    //              .attr('d',d=>line().curve(curveBasis).x(t=>this.x0(t[0])).y(t=>this.y(t[1]))(d.density_hist.map((t,i)=>[(d.bin_edges[i]+d.bin_edges[i+1])/2,t])))
    //              .attr("fill", "none")
    //              .attr("stroke", d=>this.colorScaleDark(d.class))
    //              .attr("stroke-width", 1.5)
    //              .attr("stroke-linejoin", "round")

    //         }else{
    //             g.selectAll("*").remove();
    //            g.selectAll('rect')
    //            .data(d=>d.hist.map((t,i)=>[d.class,d.bin_edges[i],t]))
    //            .join('rect')
    //            .attr('transform',d=>"translate("+this.x0(d[1])+",0)")
    //            .attr('x',d=>this.x1(d[0]))
    //            .attr('y',d=>this.y(d[2]))
    //            .attr('width',this.x1.bandwidth())
    //            .attr('height',d=>this.chartHeight-this.y(d[2]))
    //            .attr('fill',d=>this.colorScaleDark(d[0]))
    //            .attr("stroke",'#ffffff')
    //            .attr('stroke-dasharray',`${this.x1.bandwidth()} ${this.chartHeight*3}`);
    //         }  
    //     }
    // },
    // watch:{
    //     subsetchecked(oldv,newv){
    //         this.drawDiagram();
    //         this.drawSubsetDiagram();
    //     },
    //     isDensityShow(oldv,newv){
    //         this.drawDiagram();
    //         this.drawSubsetDiagram();
    //     },
    //     subset(){
    //         this.drawDiagram();
    //         this.drawSubsetDiagram();
    //     }
    // },
    // mounted(){
    //     this.drawDiagram();
    //     this.drawSubsetDiagram();
    // }
    setup(props) {
        const svgRef = ref(null);
        const chartWidth = props.chartWidth;
        const chartHeight = props.chartHeight;
        const y = ref();
        const yaxisformat = computed(()=>{
            if(props.isDensityShow){
                return d=>format('.2f')(d);
            }else{
                return d=>format('.2~s')(d);
            }
        })

        const x0 = scaleLinear().rangeRound([0,chartWidth]).domain(extent(props.data[0].bin_edges));
        // The scale spacing the groups(categories):
        const space = chartWidth/props.data[0].bin_edges.length;
        // The scale spacing each group's bar(class in each group)
        const x1 = scaleBand().padding(0).rangeRound([0,space]).domain(props.data.map(d=>d.class));
        y.value = scaleLinear().rangeRound([chartHeight,0]).domain([0,max(props.data,(d)=>max(d.hist))]);

        const resetScale = (data,property)=>{
            y.value = scaleLinear().rangeRound([chartHeight,0]).domain([0,max(data,(d)=>max(d[property]))]);
        }

        const getareapoints = (d)=>{
            let result = d.density_hist.map((t,i)=>[d.bin_edges[i],t]);
            // result.unshift([d.bin_edges[0],0]);
            result.push([d.bin_edges[d.bin_edges.length-1],0]);
            return result;
        }

        const drawDiagram = (data,isLine)=>{
            const svg = select(svgRef.value).select('.chart');
            const g = svg.selectAll('.slice')
               .data(data)
               .join('g')
               .attr('class','slice')
            if(isLine){
                g.selectAll("*").remove();
                g.append('path')
                 .attr('d',d=>area().curve(curveBasis).x(t=>x0(t[0])).y1(t=>y.value(t[1])).y0(y.value(0))(getareapoints(d)))
                 .attr("fill", d=>props.colorScale(d.class))
                 .attr("fill-opacity", .3)
                 .attr("stroke", d=>props.colorScale(d.class))
                 .attr('stroke-opacity',.5)
                 .attr("stroke-width", 1.0)
                 .attr("stroke-linejoin", "round")

            }else{
                g.selectAll("*").remove();
                g.selectAll('rect')
                .data(d=>d.hist.map((t,i)=>[d.class,d.bin_edges[i],t]))
                .join('rect')
                .attr('transform',d=>"translate("+x0(d[1])+",0)")
                .attr('x',d=>x1(d[0]))
                .attr('y',d=>y.value(d[2]))
                .attr('width',x1.bandwidth())
                .attr('height',d=>chartHeight-y.value(d[2]))
                .attr('fill',d=>props.colorScale(d[0]))
                .attr('fill-opacity',0.8);
            }
        };

        const drawSubsetDiagram = (subset,isLine)=>{
            const svg = select(svgRef.value).select('.subsetchart');
            const g = svg.selectAll('.subsetslice')
               .data(subset)
               .join('g')
               .attr('class','subsetslice')
            if(isLine){
                g.selectAll("*").remove();
                g.append('path')
                 .attr('d',d=>line().curve(curveBasis).x(t=>x0(t[0])).y(t=>y.value(t[1]))(getareapoints(d)))
                 .attr("fill", "none")
                 .attr("stroke", d=>props.colorScaleDark(d.class))
                 .attr("stroke-width", 1.5)
                 .attr("stroke-linejoin", "round")

            }else{
                g.selectAll("*").remove();
               g.selectAll('rect')
               .data(d=>d.hist.map((t,i)=>[d.class,d.bin_edges[i],t]))
               .join('rect')
               .attr('transform',d=>"translate("+x0(d[1])+",0)")
               .attr('x',d=>x1(d[0]))
               .attr('y',d=>y.value(d[2]))
               .attr('width',x1.bandwidth())
               .attr('height',d=>chartHeight-y.value(d[2]))
               .attr('fill',d=>props.colorScaleDark(d[0]))
               .attr("stroke",'#ffffff')
               .attr('stroke-dasharray',`${x1.bandwidth()} ${chartHeight*3}`);
            }
            
        };

        onMounted(()=>{
            watchEffect(()=>{
                if(props.subsetchecked){
                    if(props.isDensityShow){
                        resetScale(props.subset,'density_hist');
                        drawDiagram([],true);
                        drawSubsetDiagram(props.subset,true);
                    }else{
                        resetScale(props.subset,'hist');
                        drawDiagram([],false);
                        drawSubsetDiagram(props.subset,false);
                    }
                }else{
                    if(props.isDensityShow){
                        if(props.subset.length!==0){
                            if(max(props.data,(d)=>max(d['density_hist']))>max(props.subset,(d)=>max(d['density_hist']))){
                                resetScale(props.data,'density_hist');
                            }else{
                                resetScale(props.subset,'density_hist');
                            }
                        }else{
                            resetScale(props.data,'density_hist');
                        }
                        drawDiagram(props.data,true);
                        drawSubsetDiagram(props.subset,true);
                    }else{
                        resetScale(props.data,'hist');
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
            ticks:7,
            yaxisformat};
    },
})
</script>
