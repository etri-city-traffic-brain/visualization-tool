<template>
  <div>

    <!-- <uniq-card-title title="시뮬레이션 평균속도" class="info-card"/> -->


    <div class="bg-gray-700 p-2 space-y-1 uniq-top-right rounded-xl" >
      <div v-if="currentEdge">
      <div class="text-white">{{ currentEdge.LINK_ID }}</div>
        <line-chart :chartData="chart.linkSpeeds" :options="defaultOption()" :height="150"/>
        <line-chart :chartData="chart.linkVehPassed" :options="defaultOption()" :height="150"/>
        <line-chart :chartData="chart.linkWaitingTime" :options="defaultOption()" :height="150"/>
        <div class="mt-1">
        <d3-speed-bar :value="chart.linkSpeeds"></d3-speed-bar>
        <div><d3-heatmap :value="chart.linkSpeeds"></d3-heatmap></div>
        </div>
        <!-- <d3-speed-bar :value="[1,2,3,4,5]"></d3-speed-bar> -->
      </div>
      <div v-else>
        <div class="text-white">링크를 선택하세요.</div>
      </div>
    </div>
    <div class="bg-gray-700 p-2 space-y-1 rounded-xl mt-1" >
      <div class="text-white text-center text-sm">평균속도</div>
      <line-chart :chartData="chart.linkMeanSpeeds" :options="defaultOption()" :height="150"/>
    </div>
    <div class="bg-gray-700 p-2 space-y-1 rounded-xl mt-1" >
      <div class="text-white text-center text-sm">속도분포</div>
      <histogram-chart :chartData="chart.histogramData" :height="150" class="mt-1"/>
    </div>
    <div class="bg-gray-700 p-2 space-y-1 rounded-xl mt-1" >
      <div class="text-white text-center text-sm">스텝별 속도분포</div>
      <histogram-chart class="mt-1" :chartData="chart.histogramDataStep" :height="150"/>
    </div>
    <div class="bg-gray-700 p-2 space-y-1 rounded-xl mt-1" >
      <div class="text-white text-center text-sm">혼잡도 분포</div>
       <doughnut :chartData="chart.pieData" :height="80" />
    </div>
    <div class="bg-gray-700 p-2 space-y-1 rounded-xl mt-1" >
      <div class="text-white text-center text-sm">스텝별 혼잡도 분포</div>
      <doughnut :chartData="chart.pieDataStep" :height="80"/>
    </div>

  </div>
</template>

<script>
import Doughnut from '@/components/charts/Doughnut'
import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'
import HistogramChart from '@/components/charts/HistogramChart'
import UniqCardTitle from '@/components/func/UniqCardTitle'
import D3SpeedBar from '@/charts/d3/D3SpeedBar'
import D3Heatmap from '@/charts/d3/D3Heatmap'
const defaultOption  = () => ({
  responsive: true,
  title: {
    display: false,
    text: 'Line Chart'
  },
  tooltips: {
    mode: 'index',
    intersect: false,
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
  scales: {
    xAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 50,
        maxRotation:0,
        display: true,
        fontColor: 'white',
      },
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation:0,
        display: true,
        fontColor: 'white',
      },
    }]
  },
  legend: {
    display: true,
    labels: {
      fontColor: "white",
      fontSize: 12
    }
  },
})

export default {
  name: 'SimulationDetailsOnFinished',
  components: {
    Doughnut,
    LineChart,
    HistogramChart,
    UniqCardTitle,
    D3SpeedBar,
    D3Heatmap,
  },
  props: {
    simulation: Object,
    progress: Number,
    wsStatus: String,
    focusData: Object,
    simulationId: String,
    avgSpeed: Number,
    chart: Object,
    currentEdge: Object,
    edgeSpeed: Function,
  },
  methods: {
    congestionColor,
    defaultOption,
  },
}
</script>

<style scoped>
  .info-card {
    opacity: 0.8;
    border-radius: 0px;
  }

  .uniq-top-right {
    width: 260px;
    /* height: 100%; */
    height: 520px;
    position: fixed;
    padding: 0;
    top: 180px;
    right: 5px;
    z-index:100;
  }
  .gridLines  {
    display: false;
    color: "#FFFFFF";
  }
</style>
