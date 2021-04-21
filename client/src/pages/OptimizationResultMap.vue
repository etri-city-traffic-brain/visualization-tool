<template>
  <b-container fluid class="m-0 p-0">
    <div class="uniq-top-left">
      <uniq-congestion-color-bar/>
      <b-card
        bg-variant="dark"
        text-variant="light"
        no-body
        class="p-1 mt-1"
      >
        <!-- 혼잡도 차트 -->
        <div class="d-flex justify-content-around align-items-center">
          <doughnut :chartData="avgSpeedView" :height="50" :width="100" class="mt-1"/>
          <span
            v-bind:style="{
              'color':congestionColor(avgSpeed),
              'font-size': '2rem'
            }"
            class="font-weight-bold"
          >
            {{ (avgSpeed).toFixed(2) }} km
          </span>
        </div>
        <!-- <b-card
          class="mt-1 p-1"
          text-variant="dark"
          v-bind:style="{ 'background-color':congestionColor(avgSpeed) }"
          no-body
        >
          <b-card-text class="text-center">
            <h2> {{ (avgSpeed).toFixed(2) }} km </h2>
          </b-card-text>
        </b-card> -->
       </b-card>

      <b-card
        bg-variant="dark"
        text-variant="light"
        no-body
        class="mt-1 p-1 info-card"
      >
      <!-- 보상 그래프 -->
        <line-chart
          :chartData="rewards"
          :options="defaultOption({}, chartClicked)"
          :height="220"
        />
      </b-card>
      <b-card
        bg-variant="dark"
        text-variant="light"
        no-body
        class="mt-1 p-2"
      >
      <!-- 최적화 진행률 -->
      <b-card-text class="text-center mb-1">
        Epoch
      </b-card-text>

      <b-progress :max="simulation.configuration.epoch" class="ml-2">
        <b-progress-bar :value="progressOpt" animated striped variant="success" >
          <span>Epoch {{ progressOpt }} / {{ simulation.configuration.epoch }}</span>
        </b-progress-bar>
      </b-progress>
    </b-card>
    <b-card
      bg-variant="dark"
      text-variant="light"
      no-body
      class="mt-1 p-2"
    >
      <b-card-text class="text-center mb-1">
        시뮬레이션 진행률
      </b-card-text>
      <b-progress class="ml-2">
        <b-progress-bar :value="progress" animated striped variant="primary">
          <span> {{ progress }} %</span>
        </b-progress-bar>
      </b-progress>
    </b-card>
    <b-card
      bg-variant="dark"
      text-variant="light"
      no-body
      class="mt-1 p-2"
    >
      <div>
        <b-btn variant="primary" @click="runTrain" title="신호 최적화 시작" size="sm" v-b-tooltip.hover>
          <b-icon icon="play-fill"/>
        </b-btn>
        <b-btn
          size="sm"
          variant="info"
          v-b-tooltip.hover
          title="신호비교"
          :to="{
            name: 'OptimizationResultComparisonMap',
            params: {id: simulationId}
          }"
        >
          <b-icon icon="front"/>
        </b-btn>
      </div>
    </b-card>
    </div>

    <div class="uniq-bottom-right">
      <!-- 제어버튼 -->

    </div>

    <!-- ----------- -->
    <!-- BOTTOM LEFT -->
    <!-- ----------- -->
    <div
    class="uniq-bottom-left"
    >

    </div>
    <!-- TOP RIGHT -->
    <div class="uniq-top-right">
    </div>

    <!------------- -->
    <!--  배경지도  -->
    <!---------------->
    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
      class="m-0 p-0"
    />
  </b-container>
</template>

<script src="./optimization-result-map.js"> </script>

<style>

  .info-card {
    opacity: 0.9;
    border-radius: 0px;
  }

  .uniq-box-panel {
    border-radius: 0px;
  }

  .map {
    max-height: calc(100%);
  }

  .uniq-top-left {
    max-width: 260px;
    height: 100%;
    position: fixed;
    z-index:100;
    top: 130px;
    padding: 0;
    left: 5px;
    border: 0px solid #73AD21;
  }

  .uniq-bottom-left {
    width: 260px;

    position: fixed;
    z-index:100;
    bottom: 10px;
    padding: 0;
    left: 5px;
    border: 0px solid #73AD21;
  }

  .uniq-bottom-right {
    /* width: 260px; */
    position: fixed;
    z-index:100;
    bottom: 10px;
    padding: 0;
    right: 5px;
  }

  .uniq-top-right {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    right: 15px;
    border: 0px solid #73AD21;
  }

  .loading-container {
    position: fixed;
    top:0;
    left:50%;
    height: 600px;
  }

  .loading-vertical-center {
    margin: 0;
    position: absolute;
    top: 50%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #f8f9fa #343a40;
  }
  *::-webkit-scrollbar {
    width: 12px;
  }
  *::-webkit-scrollbar-track {
    background: #343a40;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #f8f9fa;
    border-radius: 20px;
    border: 3px solid #343a40;
  }

  /* @import '@/assets/images/gb1.jpg'; */
  @import '@/assets/styles/style.css';
</style>
