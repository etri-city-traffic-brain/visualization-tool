<template>
  <div id="simulation-comparison-result" class="m-1 space-y-1">
     <div class="top">
      <div class="center">
      </div>
    </div>
    <div class="">
      <div class="grid grid-cols-2">
        <div>
          <div class="p-1 bg-gray-700 text-white" >
            <div class="text-center p-1 font-bold"> {{ selected[0] }} </div>
            <div :ref="mapId1" :id="mapId1" v-bind:style="{height: mapHeight + 'px'}"/>
          </div>
        </div>
        <div>
          <div class="p-1 bg-yellow-300">
            <div class="text-center p-1 font-bold"> {{ selected[1] }} </div>
            <div :ref="mapId2" :id="mapId2" v-bind:style="{height: mapHeight + 'px'}" />
          </div>
        </div>
      </div>

      <div class="bg-gray-800 p-2 my-1">
        <b-input-group size="small">
          <b-button-group size="small">
            <b-button variant="light">{{ currentStepTime }}</b-button>
            <b-button variant="light" @click="stepBackward"> &lsaquo; </b-button>
            <b-button variant="light" @click="stepForward"> &rsaquo; </b-button>
          </b-button-group>
          <b-input-group-prepend is-text class="ml-1">
            <b-form-checkbox
              @change="togglePlay"
              value="play"
              unchecked-value="stop"
            />
            자동재생
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

      <div class="bg-gray-700 rounded-xl">
        <line-chart :chartData="summary" :height="50" :options="defaultOption()" style="max-height: 250px;"/>
      </div>

      <div class="grid grid-cols-2 gap-1 mt-1 rounded-xl bg-gray-700 ">
        <div
          v-for="item in histograms"
          :key="item.name"
        >
          <div
            class="text-white"
            v-if="item"
          >
            <div class="p-1 text-center"> 속도별 차량분포 ({{ item.name }}) </div>
            <div >
              <histogram-chart :chartData="item" :height="115"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="top" v-if="!isReady">
      <div class="center">
        <h1><b-badge class="mb-2" variant="dark"> {{ msg }} </b-badge></h1>
      </div>
    </div>

  </div>
</template>
<script src="./simulation-comparison-result.js"></script>

<style scoped>

  .top {
    position: absolute;
    z-index:999;
    top: 200px;
    padding: 20px;
    width: 100%;
    opacity: 0.9;
  }
  .center {
    margin: 0 auto;
    text-align: center;
    /* border: 2px solid #73AD21; */
    width: 60%;
  }

</style>
