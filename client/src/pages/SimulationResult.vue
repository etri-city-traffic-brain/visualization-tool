<template>
  <div>
    <b-container fluid class="mt-2">
      <b-card
        header-text-variant="white"
        header-bg-variant="dark"
        :header="simulationId"
      >
        <b-badge variant="warning" class="p-2">
          {{ getRegionName(simulation.configuration.region) }}
        </b-badge>
        <b-badge variant="primary" class="p-2">
          {{ simulation.configuration.period / 60}}분 간격
        </b-badge>
        <b-badge variant="info" class="p-2">
          파티션 {{ simulation.configuration.partitions }}
        </b-badge>
        <b-badge variant="secondary" class="p-2">
          {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }}
        </b-badge> ~
        <b-badge variant="secondary" class="p-2">
          {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }}
        </b-badge>
      </b-card>
    </b-container>
    <b-container fluid class="mt-2">
      <b-card
        header="스텝별 평균속도 변화"
        header-text-variant="white"
        header-bg-variant="dark"
      >
        <bar-chart
          class="bar"
          :chartData="speedsPerStep"
          :height="100"
        />
      </b-card>
    </b-container>
    <b-container
      fluid
      class="mt-2"
    >
      <b-card>
        <b-input-group>
          <b-form-input
            type="range"
            min="0"
            :max="slideMax"
            :value="currentStep"
            @change="onChange"
            @input="onInput" />
          <b-button-group>
            <b-button size="sm" @click="stepBackward"> &lsaquo; </b-button>
            <b-button size="sm" @click="stepForward"> &rsaquo; </b-button>
          </b-button-group>
        </b-input-group>
          <b-form-checkbox
            @change="togglePlay"
            value="play"
            unchecked-value="stop">
            자동실행 ({{ currentStep }} / {{ slideMax }})
          </b-form-checkbox>

      </b-card>
    </b-container>


    <b-container fluid class="mt-2" v-if="ready">
      <b-card-group deck>
      <b-card
        header-text-variant="white"
        header-bg-variant="dark"
        header="속도 분포"
        class="mb-2"
        v-if="histogramData !==null"
      >
        <!-- <d3-histogram :chartData="histogramData"/> -->
        <histogram-chart class="bar" :chartData="histogramData" :height="100" />
      </b-card>
      <b-card
        header-text-variant="white"
        header-bg-variant="dark"
        header="스텝별 속도 분포"
        class="mb-2"
        v-if="histogramDataStep !==null"
      >
        <!-- <d3-histogram :chartData="historgramDataStep"/> -->
        <histogram-chart class="bar" :chartData="histogramDataStep" :height="100" />
      </b-card>
       </b-card-group>
      <b-card-group deck>
      <b-card
        header-text-variant="white"
        header-bg-variant="dark"
        header="혼잡도 분포"
        class="mb-2"
        v-if="pieData !== null"
      >
        <doughnut :chartData="pieData" style="height:160px" />
      </b-card>
      <b-card
        header-text-variant="white"
        header-bg-variant="dark"
        header="스텝별 혼잡도 분포"
        class="mb-2"
        v-if="pieDataStep !== null"
      >
        <doughnut :chartData="pieDataStep" style="height:160px" />
      </b-card>
      </b-card-group>
    </b-container>
  </div>
</template>

<script src="./simulation-result.js"> </script>

<style scoped>
.card-header {
  padding: 0.30rem 0.75rem;
}
.card-footer {
  padding: 0.25rem 0.75rem;
}
.card-body {
  padding: 0.5rem;
}
</style>
