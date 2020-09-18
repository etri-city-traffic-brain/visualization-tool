<template>
  <b-container fluid class="m-0 p-0">
    <div class="top">
      <div >
        <b-button v-b-toggle.sidebar-1 size="sm" variant="dark">
          <b-icon icon="align-end"/>
        </b-button>
      <b-button-group v-if="simulation.status === 'finished'">
        <b-button v-b-modal.modal-xl variant="secondary" size="sm" class="ml-1">
          <b-icon icon="bar-chart"/>
        </b-button>
        <b-button @click="center(1)" class="ml-1" size="sm">
          도안동
        </b-button>
        <b-button @click="makeToast()">Toast</b-button>
        <!-- <b-toast id="example-toast" title="BootstrapVue" static no-auto-hide>
      Hello, world! This is a toast message.
    </b-toast> -->

        <!-- <v-switch v-model="running" class="ma-2" label="Disabled"></v-switch> -->
        <!-- <b-button size="sm" variant="danger" class="ml-1">막힘(~15km)</b-button> -->
        <!-- <b-button size="sm" variant="warning">정체(16~30km)</b-button> -->
        <!-- <b-button size="sm" variant="success">워활(31km~)</b-button> -->
        <!-- <b-form-checkbox v-model="running" name="check-button" switch size="lg"> simulator: {{ running }} </b-form-checkbox> -->
      </b-button-group>

      </div>
    </div>

    <b-sidebar
      id="sidebar-1"
      v-model="sidebar"
      bg-variant="dark"
      text-variant="white"
      title="Properties"
      shadow
    >
        <b-card
        bg-variant="secondary"
        text-variant="light"
        class="p-2 ml-1 mr-1"
        no-body
      >
        <h5>
          <b-badge variant="dark"> {{ simulationId }} </b-badge>
          <b-badge variant="dark"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
        </h5>
        <h5>
          <b-badge>시작:</b-badge><b-badge>{{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge>
        </h5>
        <h5>
          <b-badge>종료:</b-badge><b-badge>{{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
        </h5>
      </b-card>

      <template v-slot:footer="{ hide }">
       <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
        <strong class="mr-auto">UNIQ</strong>
        <b-button size="sm" @click="hide">Close</b-button>
      </div>
      </template>

    </b-sidebar>

    <!------------------->
    <!-- CONTROL PANEL -->
    <!------------------->
    <div class="control-panel" v-if="simulation.status === 'finished'" >
      <b-card bg-variant="secondary" text-variant="light" no-body >
        <div class="m-0 p-1" >
          <b-input-group>
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
        </div>
      </b-card>
    </div>

    <!------------------->
    <!-- CONTROL PANEL -->
    <!------------------->
    <div class="control-panel-2">
      <b-button-group>
        <b-button
          v-for="(value, id) in congestionColor.domain()"
          v-bind:key="id"
          :style="{'background-color': congestionColor(value), 'border': 0}"
          size="sm"
        >
          {{ value }}
        </b-button>
      </b-button-group>
    </div>



    <!-- MAP CONTAINER //-->
    <!-- <div class="map"
      :ref="mapId"
      :id="mapId"
      :style="{height: mapHeight + 'px'}"
    /> -->

    <!------------------->
    <!-- MAP CONTAINER -->
    <!------------------->
    <div
      class="map-2" :ref="mapId" :id="mapId"
      :style="{height: mapHeight + 'px'}"
    />

    <div class="loading-container" v-if="showLoading">
      <div class="loading-vertical-center">
        <b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
      </div>
    </div>

    <!---------------------->
    <!-- BOTTOM CONTAINER -->
    <!---------------------->
    <b-card class="m-0" no-body >
      <div class="px-1 py-0" v-if="simulation.status === 'finished'">
      <b-card
        bg-variant="secondary"
        text-variant="light"

        style="min-height:250px; max-height: 250px; min-width: 860px"
        v-if="simulation.status === 'finished'"
        :sub-title="simulationId"
        no-body
        class="mt-1 p-1"
      >
      <div class="mt-1 ml-1">
        <h5>
          <b-badge variant="dark"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
          <b-badge variant="dark"> {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> ~
          <b-badge variant="dark"> {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
          <b-badge variant="dark"> {{ currentEdge.id || 'NO LINK' }} </b-badge>
          <b-badge variant="light" :style="{'background-color': congestionColor(edgeSpeed())}" > {{ edgeSpeed().toFixed(2) }} km </b-badge>
        </h5>
      </div>
        <b-card>
          <line-chart :chartData="chart.linkSpeeds" :height="50"/>
        </b-card>
      </b-card>

        <b-card-group deck class="m-0 mt-1"
          style="min-height:150px; max-height: 300px; min-width: 860px;"
        >
        <b-card
          bg-variant="secondary"
          text-variant="light"
          sub-title="속도 분포"
          no-body
          class="p-1 ml-0 mr-1"
        >
          속도분포
          <b-card no-body class="m-0 pt-2">
            <histogram-chart :chartData="chart.histogramData" :height="135" class="mt-1"/>
          </b-card>
        </b-card>

        <b-card
          bg-variant="secondary"
          text-variant="light"
          sub-title="스텝별 속도 분포"
          no-body
          class="p-1 ml-0 mr-1"

        >
          스텝별 속도 분포
          <b-card no-body class="m-0 pt-2">
            <histogram-chart class="bar" :chartData="chart.histogramDataStep" :height="135"/>
          </b-card>
        </b-card>
        <b-card
          bg-variant="secondary"
          text-variant="light"
          sub-title="혼잡도 분포"
          no-body
          class="p-1 ml-0 mr-1"
          style="height:170px"
        >
        혼잡도 분포
          <b-card no-body class="m-0 pt-2">
            <doughnut :chartData="chart.pieData" style="height:110px;width:100%" />
          </b-card>
        </b-card>
        <b-card
        bg-variant="secondary"
          text-variant="light"
          sub-title="스텝별 혼잡도 분포"
          no-body
          class="p-1 ml-0 mr-0"
          style="height:170px"
        >
        스텝별 혼잡도 분포
          <b-card no-body class="m-0 pt-2">
            <doughnut :chartData="chart.pieDataStep" style="height:110px;width:100%" />
          </b-card>
        </b-card>
         </b-card-group>
      </div>
    </b-card>

    <b-card
      bg-variant="secondary"
      text-variant="light"
      v-if="simulation.status === 'running'"
      class="p-0 m-1"
      style="min-height:200px"
      :title="simulationId"
    >
      <!-- <b-card-text>실시간 시뮬레이션 상태 혹은 통계를 보여줌</b-card-text> -->
      <!-- {{ currentZoom }} -->
      <!-- <b-card-text>{{ currentExtent[0] }} {{ currentExtent[1] }} </b-card-text> -->
      <b-button  size="sm" variant="dark" class="ml-1">
        start simulation <b-icon icon="caret-right-fill"/>
      </b-button>
      <b-button  size="sm" variant="dark" class="ml-1">
        <b-icon icon="stop-fill"/>
      </b-button>
      <b-button  @click="connectWebSocket" size="sm" variant="dark" class="ml-1">
        connect ws <b-icon icon="plug"> </b-icon>
      </b-button>
      <b-button  size="sm" variant="dark" class="ml-1">
        simulation status:
        <b-icon v-if="simulation.status==='running'" icon="circle-fill" variant="success" animation="throb" font-scale="1"></b-icon>
        <b-icon v-else icon="circle-fill" variant="danger" animation="throb" font-scale="1"></b-icon>
      </b-button>
      <b-button  size="sm" variant="dark" class="ml-1">
        ws status:
        <b-icon v-if="wsStatus==='open'" icon="circle-fill" variant="success" animation="throb" font-scale="1"></b-icon>
        <b-icon v-if="wsStatus==='error'" icon="circle-fill" variant="danger" animation="throb" font-scale="1"></b-icon>
        <b-icon v-if="wsStatus==='close'" icon="slash-circle" variant="danger" font-scale="1"></b-icon>
      </b-button>
      <b-button  size="sm" variant="dark" class="ml-1"
      :style="{'background-color': congestionColor(avgSpeed), 'border': 0}"
      >
        average speed: {{avgSpeed}}km
      </b-button>
    </b-card>

    <b-modal id="modal-xl" size="xl" ok-only :title="simulationId">
      <simulation-result :simulationId="simulationId"/>
    </b-modal>

  </b-container>
</template>

<script src="./simulation-result-map.js"> </script>

<style>
  .map {
    width: 100%;
  }

  .map-2 {
    height: 800px
  }

  .control-panel {
    z-index: 999;
    position: fixed;
    width: 300px;
    top: 90px;
    right: 50px;
  }

  .control-panel-2 {
    z-index: 999;
    position: fixed;
    width: 300px;
    top: 55px;
    right: 50px;
  }

  .control-panel > div {
    border-radius: 5px;
  }

  .top {
    position: fixed;
    z-index:100;
    top: 55px;
    padding: 0;
    left: 8px;
    width: 90%;
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

</style>
