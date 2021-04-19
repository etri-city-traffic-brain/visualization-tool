<template>
  <div>
    <uniq-card-title title="시뮬레이션 평균속도" class="info-card"/>
    <b-card
      bg-variant="dark"
      text-variant="light"
      border-variant="dark"
      :sub-title="simulationId"
      no-body
      class="p-1 info-card"
    >
      <line-chart :chartData="chart.linkSpeeds" :options="defaultOption()" :height="150"/>
    </b-card>
    <uniq-card-title title="속도분포" class="mt-1 info-card"/>
    <b-card
      bg-variant="dark"
      border-variant="dark"
      text-variant="light"
      no-body
      class="p-1 info-card"
      style="min-width: 15rem;"
    >
      <histogram-chart :chartData="chart.histogramData" :height="150" class="mt-1"/>
    </b-card>

      <uniq-card-title title="스텝별 속도분포"  class="info-card"/>

      <b-card
        bg-variant="dark"
        border-variant="dark"
        text-variant="light"
        no-body
        class="p-1  info-card"
        style="min-width: 15rem;"
      >
        <histogram-chart class="mt-1" :chartData="chart.histogramDataStep" :height="150"/>
      </b-card>
      <uniq-card-title title="혼잡도 분포" class=" info-card"/>
      <b-card
        bg-variant="dark"
        text-variant="light"
        border-variant="dark"
        sub-title="혼잡도 분포"
        no-body
        class="p-1  info-card"

    >
        <doughnut :chartData="chart.pieData" :height="110" />
      </b-card>

      <uniq-card-title
        title="스텝별 혼잡도 분포"
        class="info-card"
      />
      <b-card
        bg-variant="dark"
        text-variant="light"
        border-variant="dark"
        class="p-1 info-card"
        no-body
      >
        <doughnut :chartData="chart.pieDataStep" :height="110"/>
      </b-card>
  </div>
</template>


<script>
import Doughnut from '@/components/charts/Doughnut';
import congestionColor from '@/utils/colors';
import LineChart from '@/components/charts/LineChart';
import HistogramChart from '@/components/charts/HistogramChart';

import UniqCardTitle from '@/components/func/UniqCardTitle';


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
        fontColor: 'grey',
      },
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation:0,
        display: true,
        fontColor: 'grey',
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
    UniqCardTitle
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
    opacity: 0.7;
    border-radius: 0px;
  }
</style>
