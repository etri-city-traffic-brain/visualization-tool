<template>
  <div>
    <div class="uniq-top-menu">

    </div>

    <!-- ----------- -->
    <!-- STEP PLAYER -->
    <!-- ----------- -->
    <div
      class="mt-1"
      v-bind:style="playerStyle"
      no-body v-if="simulation.status === 'finished'"
      style="max-width:200px"
    >
      <b-button-group class="mt-1">
        <b-button size="sm" variant="dark" @click="togglePlay" > {{ toggleState() }} </b-button>
        <b-button size="sm" variant="dark" @click="stepBackward" class="ml-1"> <b-icon icon="caret-left-fill"/> </b-button>
        <b-button size="sm" variant="dark" @click="stepForward" > <b-icon icon="caret-right-fill"/> </b-button>
      </b-button-group>
      <b-input-group size="sm" class="mt-1">
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
    </div>

    <!-- TOP LEFT PANEL -->
    <!-- -------------- -->
    <div class="uniq-top-left">
      <div class="bg-gray-500 bg-opacity-50 py-1 mt-1 font-bold text-center">
      {{ simulationId }}
      </div>
      <uniq-congestion-color-bar/>

      <SimulationDetailsOnFinished
        v-if="simulation.status === 'finished'"
        :simulation="simulation"
        :simulationId="simulationId"
        :avgSpeed="avgSpeed"
        :chart="chart"
        :currentEdge="currentEdge"
        :edgeSpeed="edgeSpeed"
      >
      </SimulationDetailsOnFinished>
      <SimulationDetailsOnRunning
        v-if="simulation.status === 'running'"
        :simulation="simulation"
        :progress="progress"
        :wsStatus="wsStatus"
        :focusData="focusData"
        :simulationId="simulationId"
        :avgSpeed="avgSpeed"
        :avgSpeedView="avgSpeedView"
        :avgSpeedFocus="avgSpeedFocus"
        @connect-web-socket="connectWebSocket"
        @toggle-focus-tool="toggleFocusTool"
        :logs="logs"
      >
      </SimulationDetailsOnRunning>
      <div
        class="py-1"
      >
        <div>
          <b-button @click.stop="startSimulation()" size="sm" variant="primary"> 시작 <b-icon icon="caret-right-fill"/> </b-button>
          <b-button @click="stop" size="sm" variant="warning" class="ml-1"> 중지 <b-icon icon="stop-fill"/> </b-button>
        </div>
      </div>
      <b-card
        bg-variant="dark"
        border-variant="dark"
        no-body
        class="p-1 mt-1"
      >
        <div>
          <uniq-map-changer :map="map"/>
          <b-button @click="centerTo(1)" class="ml-1" size="sm" variant="secondary">
            <b-icon icon="dice1"></b-icon>
          </b-button>



          <!-- <b-button @click="stop" class="ml-1" size="sm" variant="secondary"> 중지 </b-button>
          <b-button
            size="sm"
            variant="info"
            v-b-tooltip.hover
            title="시뮬레이션을 시작합니다."
            @click.stop="startSimulation()"
            >
              <b-icon icon="play-fill"/>
          </b-button> -->
          <b-button @click="sidebar = !sidebar" size="sm" variant="secondary">
            <b-icon icon="align-end"/>
          </b-button>
        </div>
      </b-card>
    </div>

    <!-- MAP CONTAINER -->
    <div
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
    />
    <b-sidebar
      title="UNIQ-VIS"
      v-model="sidebar"
      bg-variant="dark"
      text-variant="white"
      right
    >
      <uniq-simulation-result-ext :simulation="simulation" />
    </b-sidebar>
  </div>
</template>

<script src="./simulation-result-map.js"> </script>

<style>
  .uniq-box-panel {
    min-height:220px;
    max-height: 500px;
    min-width: 860px;
    border-radius: 0px;
  }

  .map {
    /* max-height: 1024px; */
    max-height: calc(100%);
  }

  .uniq-top-menu {
    position: fixed;
    z-index:100;
    top: 50px;
    padding: 0;
    left: 5px;
    border: 0px solid #73AD21;
  }

  .uniq-top-left {
    max-width: 260px;
    height: 100%;
    /* height: 500px; */
    overflow: auto;
    /* max-height: 500px; */
    position: fixed;
    z-index:100;
    top: 80px;
    padding: 0;
    left: 5px;
    /* border: 0px solid #73AD21; */
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



  /* @import '@/assets/images/gb1.jpg'; */
  /* @import '@/assets/styles/style.css'; */
</style>
