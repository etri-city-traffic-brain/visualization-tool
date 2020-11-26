<template>
  <div>
  <b-container fluid class="m-0 p-0">
    <div class="uniq-top-menu">
      <div>
        <b-button @click="sidebar = !sidebar" size="sm" variant="primary">
          <b-icon icon="align-end"/>
        </b-button>
        <b-button-group v-if="simulation.status === 'finished'">
          <b-button v-b-modal.modal-xl variant="secondary" size="sm">
            <b-icon icon="bar-chart"/>
          </b-button>
        </b-button-group>
        <uniq-congestion-color-bar/>
        <!-- <b-button @click="centerTo(1)" class="ml-1" size="sm" variant="dark"> 실증지역 </b-button> -->
        <!-- <b-button @click="centerTo(2)" class="ml-1" size="sm" variant="dark"> 세종(시청) </b-button> -->
        <uniq-map-changer :map="map" />
      </div>
    </div>
    <div class="uniq-top-menu-right">
      <div>
        <b-button @click="sidebar = !sidebar" size="sm" variant="primary">
          <b-icon icon="align-start"/>
        </b-button>
      </div>
    </div>

    <b-sidebar
      title="UNIQ-VIS"
      v-model="sidebar"
      bg-variant="dark"
      text-variant="white"
      shadow
      right
    >
      <uniq-simulation-result-ext :simulation="simulation" />
      <uniq-card-title title="속도분포(기존 신호)"/>
      <b-card
        class="p-2"
        bg-variant="dark"
        no-body
      >
        <histogram-chart :chartData="chart.histogramData" :height="150" class="mt-1"/>
        <histogram-chart :chartData="chart.histogramDataStep" :height="150" class="mt-1"/>
      </b-card>
      <uniq-card-title title="속도분포(최적화 신호)"/>
      <b-card
        class="p-2"
        bg-variant="dark"
        no-body
      >
        <histogram-chart :chartData="chart2.histogramData" :height="150" class="mt-1"/>
        <histogram-chart :chartData="chart2.histogramDataStep" :height="150" class="mt-1"/>
      </b-card>

      <b-card bg-variant="secondary" class="mt-1" v-bind:style="playerStyle" text-variant="light" no-body
      >
        <b-input-group size="sm">
          <b-button-group>
            <b-button size="sm" variant="dark" @click="togglePlay" > {{ toggleState() }} </b-button>
            <b-button size="sm" variant="dark" @click="stepBackward" class="ml-1"> <b-icon icon="caret-left-fill"/> </b-button>
            <b-button size="sm" variant="dark" @click="stepForward" > <b-icon icon="caret-right-fill"/> </b-button>
          </b-button-group>
          <b-form-input
            variant="dark"
            type="range"
            min="0"
            :max="slideMax"
            :value="currentStep"
            @change="onChange"
            @input="onInput"
          />
          <b-input-group-append>
            <b-button size="sm" variant="dark">{{ currentStep }} </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-card>

    </b-sidebar>

    <!--
      CONTAINER MAP
    -->

    <!-- <b-card-group deck> -->

    <b-row class="p-0 m-0">
      <b-col cols="4" class="p-0">
        <b-card
          bg-variant="secondary"
          border-variant="secondary"
          class="no-border-radius p-1 m-0"
          no-body
          text-variant="white"
          >
            <span class="card-bottom">
              <h3><b-badge>기존신호</b-badge></h3> {{ fixedSlave }}
            </span>
            <div
            class="m-0 p-0"
              :ref="mapId"
              :id="mapId"
              :style="{height: mapHeight + 'px'}"
            />
        </b-card>
      </b-col>
      <b-col cols="4" class="p-0">
        <b-card
          bg-variant="primary"
          border-variant="primary"
          class="no-border-radius p-1 m-0"
          no-body
          >
          <span class="card-bottom">
            <h3><b-badge variant="primary">최적화 신호</b-badge></h3>
            {{ testSlave }}
          </span>
          <div
          class="m-0 p-0"
            :ref="mapId2"
            :id="mapId2"
            :style="{height: mapHeight + 'px'}"
          />
        </b-card>

      </b-col>
      <b-col cols="4" class="p-0" >
        <b-card
          bg-variant="secondary"
          border-variant="secondary"
          text-variant="light"
          style="border-radius:0"
          class="m-0 p-0"
          no-body
          >
          <b-card-text class="text-center p-2 m-0">
          신호 비교 ({{ simulationId }})
          </b-card-text>
        <b-card
          bg-variant="dark"
          border-variant="dark"
          text-variant="dark"
          no-body
            v-bind:style="{
            height: mapHeight - 32 + 'px',
            borderRadius: 0,
            overflow: 'auto'
          }"
        >
        <b-card-body class="p-1">
          <uniq-card-title title="Reward"/>
          <b-card class="">
            <!-- <b-card-text class="text-center"> Reward </b-card-text> -->
            <line-chart class="" :chartData="rewards" :options="lineChartOption()" :height="180"/>
          </b-card>
          <!-- <uniq-card-title title="기존 신호"/> -->
          <b-card text-variant="light" bg-variant="secondary" class="mt-1" no-body>
            <b-card-text class="m-0 p-2 text-center">
              기존 신호
            </b-card-text>
            <b-card class="m-1">
              <!-- <b-card-text class="text-center"> 기존 신호 </b-card-text> -->
              <bar-chart class="" :chartData="phaseFixed" :options="barChartOption()" :height="180"></bar-chart>
            </b-card>
          </b-card>
          <!-- <uniq-card-title title="최적화 신호"/> -->
          <b-card text-variant="light" bg-variant="dark" class="mt-1" no-body>
            <b-card-text class="m-0 p-2 text-center">
              최적화 신호
            </b-card-text>
            <b-card class="m-1">
              <!-- <b-card-text class="text-center"> 최적화 신호 </b-card-text> -->
              <bar-chart class="" :chartData="phaseTest" :options="barChartOption()" :height="180"></bar-chart>
            </b-card>
          </b-card>

          <uniq-card-title title="평균속도 비교"/>
           <b-card class="mt-1" >
              <line-chart :chartData="chart.linkSpeeds" :options="lineChartOption()" :height="150"/>
              <!-- <bar-chart :chartData="chart.linkSpeeds" :options="barChartOption()" :height="150"/> -->
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
              <b-progress height="3rem">
                <b-progress-bar :value="progress" animated striped variant="primary">
                  <span> {{ progress }} %</span>
                </b-progress-bar>
              </b-progress>
            </b-card>

            <b-card text-variant="light" bg-variant="secondary" class="mt-1" no-body>
            <b-card-text class="m-0 p-2 text-center">
              모델 선택
            </b-card-text>
              <b-card class="m-1" bg-variant="dark" text-variant="light">
                <b-btn
                  size="sm"
                  v-for="reward of rewards.labels"
                  :key="reward"
                  class="ml-1 mt-1"
                  @click="selectedEpoch = reward"
                >
                  {{ reward }}
                </b-btn>

              </b-card>
            </b-card>
          <b-card class="mt-1" bg-variant="dark" text-variant="light">
            <b-btn variant="primary" @click.prevent="runTest">
              신호최적화 비교 {{ selectedEpoch }}
              <b-icon icon="play-fill"/>
            </b-btn>
            <b-btn variant="primary" @click="updatePhaseChart">
              <b-icon icon="bar-chart-fill"/>
            </b-btn>
          </b-card>
        </b-card-body>
        </b-card>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="p-0 m-0">
      <b-col class="p-0">
        <b-card style="height:180px; border-radius:0" bg-variant="light" border-variant="light">
          <b-card-title>평균속도 비교</b-card-title>
          <line-chart :chartData="chart.currentSpeedChart" :options="lineChartOption()" :height="30"/>
        </b-card>
      </b-col>
    </b-row>
    <!-- <b-card
      text-variant="light"
      bg-variant="dark"
      border-variant="dark"
      no-body
      v-bind:style="bottomStyle"
    >
      <b-card-body class="p-2">
        <b-card-text class="m-1">
          <strong>{{ simulationId }} </strong>
          <b-btn variant="dark" size="sm" @click="toggleBottom">
            <b-icon v-if="bottomStyle.height !== '220px'" icon="arrows-angle-contract"></b-icon>
            <b-icon v-else icon="arrows-angle-expand"></b-icon>
          </b-btn>
        </b-card-text>

      </b-card-body>
    </b-card> -->
  </b-container>
  </div>
</template>

<script src="./optimization-result-comparison-map.js"> </script>

<style>

  .no-border-radius {
    border-radius: 0;
  }
  .card-top {
    position: absolute;
    top: 55px;
    left: 20px;
    font-weight: bold;
    z-index:100;
    color: black;
  }
  .card-bottom {
    position: absolute;
    bottom: 55px;
    left: 20px;
    font-weight: bold;
    z-index:100;
    color: black;
  }

  .uniq-top-menu {
    position: fixed;
    z-index:100;
    top: 60px;
    padding: 0;
    left: 15px;
    border: 0px solid #73AD21;
  }
  .uniq-top-menu-right {
    position: fixed;
    z-index: 100;
    top: 53px;
    padding: 0;
    right: 15px;
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
