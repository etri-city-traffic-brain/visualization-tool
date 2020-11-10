<template>
  <div>
  <b-container fluid class="m-0 p-0">
    <div class="uniq-top-menu">
      <div>
        <b-button @click="sidebar = !sidebar" size="sm" variant="dark">
          <b-icon icon="align-end"/>
        </b-button>
        <b-button-group v-if="simulation.status === 'finished'">
          <b-button v-b-modal.modal-xl variant="secondary" size="sm">
            <b-icon icon="bar-chart"/>
          </b-button>
        </b-button-group>
        <uniq-congestion-color-bar/>
        <b-button @click="centerTo(1)" class="ml-1" size="sm" variant="dark"> 실증지역 </b-button>
        <!-- <b-button @click="centerTo(2)" class="ml-1" size="sm" variant="dark"> 세종(시청) </b-button> -->
        <uniq-map-changer :map="map" />
      </div>

      <!-- <b-card bg-variant="secondary" class="mt-1" v-bind:style="playerStyle" text-variant="light" no-body v-if="simulation.status === 'finished'" >
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
      </b-card> -->
    </div>

    <b-sidebar
      title="UNIQ-VIS"
      v-model="sidebar"
      bg-variant="dark"
      text-variant="white"
      shadow
    >
      <uniq-simulation-result-ext :simulation="simulation" />
      <b-card
        bg-variant="secondary"
        text-variant="light"
        class="p-2 ml-1 mr-1 mt-1"
        no-body
      >
      </b-card>
    </b-sidebar>

    <!--
      CONTAINER MAP
    -->

    <!-- <b-card-group deck> -->

    <b-row>
      <b-col cols="4" class="p-0">
    <b-card
      bg-variant="dark"
      border-variant="dark"
      class="m-0 p-0 uniq-box-panel map"
      no-body
      text-variant="white"
      >
        <span class="card-top">{{ simulationId2 }}</span>
        <!-- <h5><b-badge class="card-top"> 기존신호 </b-badge></h5> -->

      <div
        :ref="mapId2"
        :id="mapId2"
        :style="{height: mapHeight + 'px'}"
      />
      <div class="loading-container" v-if="showLoading">
        <div class="loading-vertical-center">
          <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
        </div>
      </div>
    </b-card>
      </b-col>
      <b-col cols="4" class="p-0">
    <b-card
      bg-variant="secondary"
      border-variant="dark"

      class="m-0 p-0 uniq-box-panel map"
      no-body

      >
      <span class="card-top">{{ simulationId }}</span>
      <!-- <h5><b-badge variant="secondary" class="card-top"> {{ simulationId }} </b-badge></h5> -->
      <div
        :ref="mapId"
        :id="mapId"
        :style="{height: mapHeight + 'px'}"
      />

      <!-- <div class="loading-container" v-if="showLoading">
        <div class="loading-vertical-center">
          <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
        </div>
      </div> -->
    </b-card>
      </b-col>
      <b-col cols="4" class="p-0">
        <b-card
          bg-variant="dark"
          border-variant="dark"
          text-variant="dark"
          style="border-radius:0"
        >
          <b-card
            text-variant="light"
            bg-variant="dark"
            border-variant="dark"
            no-body
          >
            <line-chart :chartData="rewards" :options="defaultOption()" :height="200"/>
          </b-card>
        </b-card>
      </b-col>
    </b-row>
    <b-card
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



        <!-- <SimulationDetailsOnFinished
          v-if="simulation.status === 'finished'"
          :simulation="simulation"
          :simulationId="simulationId"
          :avgSpeed="avgSpeed"
          :chart="chart"
          :currentEdge="currentEdge"
          :edgeSpeed="edgeSpeed"
        >
        </SimulationDetailsOnFinished> -->

        <!-- <SimulationDetailsOnRunning
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
        </SimulationDetailsOnRunning> -->
      </b-card-body>
    </b-card>
    <!--
    <b-modal
      id="modal-xl"
      size="xl"
      ok-only
      :title="simulationId"
      centered
    >
      <simulation-result :simulationId="simulationId"/>
    </b-modal>
    -->
  </b-container>
  </div>
</template>

<script src="./optimization-result-comparison-map.js"> </script>

<style>
  .uniq-box-panel {
    /* min-height:220px;
    max-height: 500px; */
    /* min-width: 860px; */
    /* max-width: 600px; */
    border-radius: 0px;
  }

  .map {
    /* max-height: 1024px; */
    /* max-height: calc(100%); */
  }

  .card-top {
    position: absolute;
    top: 55px;
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
