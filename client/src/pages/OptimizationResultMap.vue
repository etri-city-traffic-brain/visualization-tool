<template>
  <div>
    <b-container fluid class="m-0 p-0">
      <div class="uniq-top-menu">
        <div>
          <uniq-congestion-color-bar/>
        </div>
      </div>

      <b-row class="p-0 m-0">
        <b-col cols="8" class="p-0">
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
        </b-col>
        <b-col cols="4" class="p-0 m-0">
          <b-card
            bg-variant="secondary"
            border-variant="secondary"
            style="border-radius:0"
            class="m-0"
            no-body
          >
            <b-card
              text-variant="light"
              bg-variant="dark"
              border-variant="dark"
              style="border-radius:0px"
              class="m-0 p-0"
              no-body
              :style="{height: mapHeight + 'px'}"
            >

              <b-card-body class="p-0">
                <uniq-card-title :title="'신호최적화 ' + simulationId"/>
                <b-card
                  text-variant="light"
                  bg-variant="dark"
                  border-variant=""
                  class="mt-1"
                >
                  <line-chart
                    :chartData="rewards"
                    :options="defaultOption()"
                    :height="220"
                  />
                </b-card>
                <b-card
                  text-variant="light"
                  bg-variant="dark"
                  border-variant="dark"
                  class="mt-1"
                  no-body
                >
                  <b-card-text class="text-center p-2 m-0">
                    학습 진행률
                  </b-card-text>
                  <b-progress height="3rem" class="m-1">
                    <b-progress-bar :value="rewards.labels.length * 10" animated striped variant="success" >
                      <span><strong> Epoch {{ rewards.labels.length }} </strong></span>
                    </b-progress-bar>
                  </b-progress>
                </b-card>
                <b-card
                  text-variant="light"
                  bg-variant="dark"
                  border-variant="dark"
                  class="mt-1"
                  no-body
                >
                  <b-card-text class="text-center p-2 m-0">
                    시뮬레이션 진행률
                  </b-card-text>
                  <b-card-text>
                    <b-progress height="3rem" class="m-1">
                      <b-progress-bar :value="progress" animated striped variant="primary">
                        <span> {{ progress }} %</span>
                      </b-progress-bar>
                    </b-progress>
                  </b-card-text>
                </b-card>
                <uniq-card-title title="평균속도"/>
                <b-card
                  class="mt-1 pt-2"
                  text-variant="dark"
                  v-bind:style="{
                    'background-color':congestionColor(avgSpeed)
                  }"
                  no-body
                >
                  <b-card-text class="text-center">
                    <h3> {{ (avgSpeed).toFixed(2) }} km </h3>
                  </b-card-text>
                </b-card>
                <b-card
                  text-variant="light"
                  bg-variant="dark"
                  border-variant="dark"
                  class="mt-1"
                  no-body
                >
                <b-card-body>
                  <b-card-text class="text-center">
                    혼잡분포
                  </b-card-text>
                  <doughnut :chartData="avgSpeedView" :height="110" />
                </b-card-body>
                </b-card>
                <b-card class="mt-1" text-variant="dark" bg-variant="dark">
                  <b-btn
                    variant="primary"
                    @click="runTrain"
                    title="신호 최적화 시작"
                  >
                    최적화 시작
                    <b-icon icon="play-fill"/>
                  </b-btn>
                  <b-btn
                    variant="warning"
                    v-b-tooltip.hover
                    title="신호비교"
                    :to="{
                      name: 'OptimizationResultComparisonMap',
                      params: {id: simulationId}
                    }"
                  >
                    신호비교 <b-icon icon="front"/>
                  </b-btn>
                </b-card>
              </b-card-body>
            </b-card>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script src="./optimization-result-map.js"> </script>

<style>
  .uniq-box-panel {
    border-radius: 0px;
  }

  .map {
    max-height: calc(100%);
  }

  .uniq-top-menu {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    left: 15px;
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
