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
        <b-button @click="centerTo(1)" class="ml-1" size="sm" variant="dark"> 대전(도안) </b-button>
        <b-button @click="centerTo(2)" class="ml-1" size="sm" variant="dark"> 세종(시청) </b-button>
        <uniq-map-changer :map="map" />
      </div>
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
        <b-button size="sm">
          {{ linkHover }}
        </b-button>
        <h3> 시뮬레이션 상태: {{ simulation.status }} </h3>
      </b-card>
    </b-sidebar>

    <!--
      CONTAINER MAP
    -->
    <b-card
      bg-variant="dark"
      border-variant="dark"
      class="mt-0 p-1 uniq-box-panel map"
      no-body
      >
      <div
        :ref="mapId"
        :id="mapId"
        :style="{height: mapHeight + 'px'}"
      />
      <!-- CONTROL PANEL -->
      <div class="uniq-step-player">
        <b-card bg-variant="secondary" text-variant="light" no-body v-if="simulation.status === 'finished'" >
          <b-input-group size="sm">
            <b-button-group>
              <b-button size="sm" variant="dark" @click="togglePlay" :pressed.sync="playBtnToggle"> {{ toggleState() }} </b-button>
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
      </div>
      <div class="loading-container" v-if="showLoading">
        <div class="loading-vertical-center">
          <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
        </div>
      </div>
    </b-card>

    <b-card
      text-variant="light"
      bg-variant="dark"
      border-variant="dark"
      class="p-1 pb-0 mt-0 bottom-panel"
      style=""
      no-body
    >

    <b-card
      bg-variant="dark"
      text-variant="light"
      border-variant="dark"
      :sub-title-="simulationId"
      no-body
      class="p-1"
      style="border-radius: 0px;"

    >
      <h5>
        <b-badge variant="dark"> {{ simulationId }} </b-badge>
        <b-badge variant="dark"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
        <b-badge variant="dark"> {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> ~
        <b-badge variant="dark"> {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
        <!-- <b-badge variant="dark"> {{ currentEdge ? currentEdge.id : 'NO LINK' }} </b-badge> -->
        <!-- <b-badge variant="light" :style="{'background-color': congestionColor(edgeSpeed())}" > {{ edgeSpeed().toFixed(2) }} km </b-badge> -->
      </h5>
      <!-- <b-card>
        <line-chart :chartData="chart.linkSpeeds" :height="50"/>
      </b-card> -->
    </b-card>

    <!--
      CONTAINER BOTTOM (FINISHED)
    -->
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

    <!--
      CONTAINER BOTTOM (RUNNING)
    -->
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
    max-height: 1024px;
  }

  .bottom-panel {
    height:400px;
    border-radius: 0px;
    overflow-y:auto;
    overflow-x:hidden;
    position: fixed;
    bottom: 0;
    width: 100%;
  }

  .uniq-step-player {
    z-index: 999;
    position: absolute;
    width: 300px;
    /* top: 65px; */
    bottom: 100px;
    right: 10px;
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
