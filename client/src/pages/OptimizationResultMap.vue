<template>
  <b-container fluid class="m-0 p-0">
    <div class="uniq-top-left">
      <div style="max-width: 230px">
        <uniq-congestion-color-bar/>

        <!-- 혼잡도 차트 -->
        <b-card
          text-variant="light"
          bg-variant="dark"
          border-variant="dark"
          class="mt-1 p-2"
          no-body
        >
          <doughnut :chartData="avgSpeedView" :height="110" class="mt-1"/>
        </b-card>
        <b-card
          class="mt-1"
          text-variant="dark"
          v-bind:style="{ 'background-color':congestionColor(avgSpeed) }"
        >
          <b-card-text class="text-center">
            <h2> {{ (avgSpeed).toFixed(2) }} km </h2>
          </b-card-text>
        </b-card>
        <!-- 최적화 진행률 -->
        <b-card class="mt-1" text-variant="light" bg-variant="dark">
          <div class="d-flex justify-content-between align-items-center">
            <span>학습진행률</span>
            <b-progress :max="100" class="w-50">
              <b-progress-bar :value="progressOfEpoch" animated striped variant="success" >
                <span>Epoch {{ rewards.labels.length }} / {{ simulation.configuration.epoch }}</span>
              </b-progress-bar>
            </b-progress>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <span>시뮬레이션</span>
            <b-progress class="w-50">
              <b-progress-bar :value="progress" animated striped variant="primary">
                <span> {{ progress }} %</span>
              </b-progress-bar>
            </b-progress>
          </div>
        </b-card>
        <!-- 보상 그래프 -->
        <b-card
          text-variant="light"
          bg-variant="dark"
          border-variant="dark"
          class="mt-1 p-2"
          no-body
        >
        <line-chart
          :chartData="rewards"
          :options="defaultOption({}, chartClicked)"
          :height="220"
        />
      </b-card>

      <!-- 제어버튼 -->
      <div class="mt-1">
        <b-btn variant="" @click="runTrain" title="신호 최적화 시작" size="sm" v-b-tooltip.hover>
          <b-icon icon="play-fill"/>
        </b-btn>
        <b-btn
          size="sm"
          variant=""
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
      </div>
    </div>

    <!-- TOP RIGHT -->
    <div class="uniq-top-right">
    </div>

    <!------------- -->
    <!--  배경지도  -->
    <!---------------->
    <b-card
      bg-variant="secondary"
      border-variant="secondary"
      style="border-radius:0"
      class="m-0"
      no-body
    >
      <div
        class="m-0 p-0"
        :ref="mapId"
        :id="mapId"
        :style="{height: mapHeight + 'px'}"
      />
    </b-card>
  </b-container>
</template>

<script src="./optimization-result-map.js"> </script>

<style>
  .uniq-box-panel {
    border-radius: 0px;
  }

  .map {
    max-height: calc(100%);
  }

  .uniq-top-left {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    left: 15px;
    border: 0px solid #73AD21;
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
