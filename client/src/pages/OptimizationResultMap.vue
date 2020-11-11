<template>
  <div>
    <b-container fluid class="m-0 p-0">
      <div class="uniq-top-menu">
        <div>
          <b-button @click="sidebar = !sidebar" size="sm" variant="dark">
            <b-icon icon="align-end"/>
          </b-button>
          <uniq-congestion-color-bar/>
        </div>
      </div>

      <b-row>
        <b-col cols="8" class="p-0">
          <b-card
            bg-variant="dark"
            border-variant="dark"
            style="border-radius:0"
            no-body
          >
            <div :ref="mapId" :id="mapId" :style="{height: mapHeight + 'px'}" />
          </b-card>
        </b-col>
        <b-col cols="4" class="p-0">
          <b-card
            text-variant="light"
            bg-variant="dark"
            border-variant="dark"
            style="border-radius:0"
            no-body
          >
            <b-card-body>
              <strong>{{ simulationId }} </strong>
              <b-card
                text-variant="light"
                bg-variant="dark"
                border-variant="dark"
              >
              <line-chart :chartData="rewards" :options="defaultOption()" :height="250"/>
              </b-card>
              <b-card-text>
              학습 진행률:
              </b-card-text>
              <b-card-text>
                <b-progress height="2rem" v-if="progress === 100">
                  <b-progress-bar value="100" animated striped variant="success">
                    <span><strong> Epoch </strong></span>
                  </b-progress-bar>
                </b-progress>
                <b-progress height="2rem">
                  <b-progress-bar :value="progress" animated striped variant="primary">
                    <span> {{ progress }} %</span>
                  </b-progress-bar>
                </b-progress>
              </b-card-text>
              <b-card-text>
              평균속도:
              </b-card-text>
              <b-card-text>
                <b-progress height="2rem" max="70" class="w-100">
                  <b-progress-bar animated striped :value="avgSpeed" v-bind:style="{'background-color':congestionColor(avgSpeed)}">
                    <span> {{ (avgSpeed).toFixed(2) }} km </span>
                  </b-progress-bar>
                </b-progress>
              </b-card-text>
              <b-card
                text-variant="light"
                bg-variant="dark"
                border-variant="dark"
              >
                <doughnut :chartData="avgSpeedView" :height="110" />
              </b-card>
            </b-card-body>
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
    /* max-height: 1024px; */
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
