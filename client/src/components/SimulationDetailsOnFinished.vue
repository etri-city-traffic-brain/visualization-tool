<template>
  <div>
    <!-- <b-card
      bg-variant="dark"
      text-variant="light"
      border-variant="dark"
      :sub-title="simulationId"
      no-body
      class="p-1"
      style="border-radius: 0px;"
    >
      <h5>
        <b-badge variant="dark"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
        <b-badge variant="dark"> {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> ~
        <b-badge variant="dark"> {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
        <b-badge variant="dark"> {{ currentEdge ? currentEdge.id : 'NO LINK' }} </b-badge>
        <b-badge variant="light" :style="{'background-color': congestionColor(edgeSpeed())}" > {{ edgeSpeed().toFixed(2) }} km </b-badge>
      </h5>
      <b-card>
      </b-card>
    </b-card> -->

    <b-card
      bg-variant="dark"
      text-variant="light"
      border-variant="dark"
      :sub-title="simulationId"
      no-body
      class="p-1"
      style="border-radius: 0px;"
    >
        <line-chart :chartData="chart.linkSpeeds" :options="defaultOption()" :height="50"/>
    </b-card>

    <b-card-group class="m-0">
      <b-card
        bg-variant="dark"
        border-variant="dark"
        text-variant="light"
        no-body
        class="p-1 m-1"
          style="min-width: 15rem;"
      >

        <b-card no-body
          class="m-0 pt-0"
          text-variant="light"
          bg-variant="dark"
          border-variant="dark"
        >
          <h5 class="text-center"><b-badge variant="grey">속도분포</b-badge></h5>
          <histogram-chart :chartData="chart.histogramData" :height="150" class="mt-1"/>
        </b-card>
      </b-card>

      <b-card
        bg-variant="dark"
        border-variant="dark"
        text-variant="light"
        sub-title="스텝별 속도 분포"
        no-body
        class="p-1 m-1"
         style="min-width: 15rem;"
      >
        <b-card no-body
          class="m-0 pt-0"
          text-variant="light"
          bg-variant="dark"
          border-variant="dark">
          <h5 class="text-center"><b-badge variant="grey">스텝별 속도 분포</b-badge></h5>
          <histogram-chart class="mt-1" :chartData="chart.histogramDataStep" :height="150"/>
        </b-card>
      </b-card>
      <b-card
        bg-variant="dark"
        text-variant="light"
        border-variant="dark"
        sub-title="혼잡도 분포"
        no-body
        class="p-1 m-1"
    >
        <b-card
          no-body
          class="m-0 pt-0"
          text-variant="light"
          bg-variant="dark"
          border-variant="dark"
        >
          <doughnut :chartData="chart.pieData" :height="110" />
          <h5 class="mt-1 text-center"><b-badge variant="grey">혼잡도 분포</b-badge></h5>
        </b-card>
      </b-card>
      <b-card
        bg-variant="dark"
        text-variant="light"
        border-variant="dark"
        sub-title="스텝별 혼잡도 분포"
        no-body
        class="p-1 m-1"
      >
        <b-card
          no-body
          class="m-0 pt-0"
          text-variant="light"
          bg-variant="dark"
          border-variant="dark"
        >
          <doughnut :chartData="chart.pieDataStep" :height="110"/>
          <h5 class="mt-1 text-center"><b-badge variant="grey">스텝별 혼잡도 분포</b-badge></h5>
        </b-card>
      </b-card>
    </b-card-group>
  </div>
</template>


<script>
import Doughnut from '@/components/charts/Doughnut';
import congestionColor from '@/utils/colors';
import LineChart from '@/components/charts/LineChart';
import HistogramChart from '@/components/charts/HistogramChart';

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
    HistogramChart
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
