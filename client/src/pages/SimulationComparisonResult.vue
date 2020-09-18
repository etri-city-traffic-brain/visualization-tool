<template>
  <div id="simulation-comparison-result">
     <div class="top">
      <div class="center">
        <!-- <h1> <b-badge>{{ simulationId }}</b-badge> </h1> -->
        <b-button-group size="small">
          <b-button variant="dark" @click="stepBackward"> &lsaquo; </b-button>
          <b-button>{{ currentStepTime }}</b-button>
          <b-button variant="dark" @click="stepForward"> &rsaquo; </b-button>
        </b-button-group>
        <b-input-group size="sm" class="mt-1">
          <b-input-group-prepend is-text>
            <b-form-checkbox
              @change="togglePlay"
              value="play"
              unchecked-value="stop"
            />
          </b-input-group-prepend>
          <b-form-input
            type="range"
            min="1"
            :max="slideMax"
            :value="currentStep"
            class="slider"
            @change="onChange"
            @input="onInput"
          />
        </b-input-group>
      </div>
    </div>
    <b-container fluid class="p-1">
       <b-row class="m-0">
        <!-- CONNECTION -->
        <b-col cols="6" class="p-0">
          <div style="text-align:center" class="top2">
            <h4><b-badge variant="primary">{{ selected[0] }}</b-badge></h4>
          </div>
          <div
            :ref="mapId1"
            :id="mapId1"
            class="map map1"
            v-bind:style="{height: mapHeight + 'px'}"
          >
          </div>
        </b-col>
        <b-col cols="6" class="p-0">
          <div style="text-align:center" class="top2">
            <h4><b-badge variant="warning">{{ selected[1] }}</b-badge></h4>
          </div>
          <div
            :ref="mapId2"
            :id="mapId2"
            class="map map2"
            v-bind:style="{height: mapHeight + 'px'}"
          />
        </b-col>
      </b-row>

      <b-card
        bg-variant="secondary"
        text-variant="light"
        no-body
        class="mt-1 p-1"
        style="max-height: 250px; min-width: 860px"
      >
        <b-card
          header="스텝별 평균속도"
          class="m-0"
          header-text-variant="white"
          header-bg-variant="dark"

        >
          <!-- <bar-chart :chartData="summary" :height="height"/> -->
          <line-chart :chartData="summary" :height="50" style="max-height: 250px;"/>
        </b-card>
      </b-card>
      <b-card-group columns style="min-height:150px; max-height: 300px; min-width: 860px;">
        <b-card
          bg-variant="secondary"
          text-variant="light"
          no-body
          v-for="item in histograms"
          :header="'속도별 차량 분포 (' + item.name + ')'"
          :key="item.name"
          class="mt-1 p-1 ml-0 mr-0"
        >
          <b-card class="p-1 ml-0 mr-1" >
            <histogram-chart :chartData="item" :height="135" class="mt-2" v-if="item.isReady"/>
          </b-card>
        </b-card>
      </b-card-group>
    </b-container>

    <!-- congestion pie -->
    <!--
    <b-container fluid class="mt-2" v-if="isReady">
      <b-card-group columns>
        <b-card
          header-text-variant="white"
          header-bg-variant="dark"
          v-for="item in pies"
          :header="'속도별 차량 분포 (' + item.name + ')'"
          :key="item.name"
          >
          <doughnut :chartData="item" v-if="item.isReady"/>
        </b-card>
      </b-card-group>
    </b-container>
    -->
    <div class="top" v-if="!isReady">
      <div class="center">
        <h1><b-badge class="mb-2" variant="warning"> {{ msg }} </b-badge></h1>
      </div>
    </div>

  </div>
</template>
<script src="./simulation-comparison-result.js"></script>

<style scoped>
  .map1 {
    border: 5px solid #1E90FF;
  }
  .map2 {
    border: 5px solid #FFA500;
  }
  .card-header {
    padding: 0.30rem 0.75rem;
  }
  .card-footer {
    padding: 0.25rem 0.75rem;
  }
  .card-body {
    padding: 0.5rem;
  }

  .top {
    position: absolute;
    z-index:999;
    top: 50px;
    padding: 0;
    /* left: 1%; */

    width: 100%;
    opacity: 0.9;
    /* border: 2px solid red; */
  }
  .top2 {
    position: absolute;
    z-index:100;
    top: 20px;
    padding: 0;
    /* left: 1%; */

    width: 100%;
    opacity: 0.9;
    /* border: 2px solid red; */
  }

  .center {
    margin: 0 auto;
    text-align: center;
    /* border: 2px solid #73AD21; */
    width: 60%;
  }

</style>
