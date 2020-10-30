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


    <!--
      CONTAINER BOTTOM (FINISHED)
    -->
    <b-card
      class="uniq-box-panel mt-0"
      bg-variant="dark"
      border-variant="dark"
      no-body
      style="height:400px;overflow-y:auto;overflow-x:hidden"
      v-if="simulation.status === 'finished'"
    >
      <!-- <div class="px-1 py-0" > -->
      <b-card
        bg-variant="dark"
        text-variant="light"
        border-variant="dark"
        v-if="simulation.status === 'finished'"
        :sub-title="simulationId"
        no-body
        class="p-1"
        style="border-radius: 0px;"
      >
        <h5>
          <b-badge variant="dark"> {{ simulation.configuration.period / 60}}분 주기 </b-badge>
          <b-badge variant="dark"> {{ simulation.configuration.fromDate }} {{ simulation.configuration.fromTime }} </b-badge> ~
          <b-badge variant="dark"> {{ simulation.configuration.toDate }} {{ simulation.configuration.toTime }} </b-badge>
          <b-badge variant="dark"> {{ currentEdge ? currentEdge.id : 'NO LINK' }} </b-badge>
          <b-badge variant="light" :style="{'background-color': congestionColor(edgeSpeed())}" > {{ edgeSpeed().toFixed(2) }} km </b-badge>
        </h5>
        <b-card>
          <line-chart :chartData="chart.linkSpeeds" :height="50"/>
        </b-card>
      </b-card>

      <b-card-group deck class="m-0">
        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          no-body
          class="p-1 m-1"
        >
          <h5><b-badge variant="grey">속도분포</b-badge></h5>
          <b-card no-body class="m-0 pt-3">
            <histogram-chart :chartData="chart.histogramData" :height="135" class="mt-1"/>
          </b-card>
        </b-card>

        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          sub-title="스텝별 속도 분포"
          no-body
          class="p-1 m-1"
        >
          <h5><b-badge variant="grey">스텝별 속도 분포</b-badge></h5>
          <b-card no-body class="m-0 pt-3">
            <histogram-chart class="mt-1" :chartData="chart.histogramDataStep" :height="135"/>
          </b-card>
        </b-card>
        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          sub-title="혼잡도 분포"
          no-body
          class="p-1 m-1"
        >
          <h5><b-badge variant="grey">혼잡도 분포</b-badge></h5>
          <b-card no-body class="m-0 pt-2">
            <doughnut :chartData="chart.pieData" :height="130" />
          </b-card>
        </b-card>
        <b-card
          bg-variant="secondary"
          text-variant="light"
          border-variant="secondary"
          sub-title="스텝별 혼잡도 분포"
          no-body
          class="p-1 m-1"
        >
          <h5><b-badge variant="grey">스텝별 혼잡도 분포</b-badge></h5>
          <b-card no-body class="m-0 pt-2">
            <doughnut :chartData="chart.pieDataStep" :height="130"/>
          </b-card>
        </b-card>
      </b-card-group>
     </b-card>

    <!--
      CONTAINER BOTTOM (RUNNING)
    -->
    <b-card
      text-variant="light"
      bg-variant="dark"
      border-variant="dark"
      v-if="simulation.status === 'running'"
      class="p-1 mt-0"
      style="height:400px; border-radius: 0px; overflow-y:auto;overflow-x:hidden"
      no-body
    >
      <!-- <uniq-simulation-result-ext :simulation="simulation" /> -->

      <b-card-group deck>
        <b-card
          text-variant="light"
          bg-variant="secondary"
          border-variant="dark"
          no-body
          class="m-0"
        >

          <b-card-body>
            <b-card-text>
              시뮬레이션: <strong>{{ simulationId }} </strong>

            </b-card-text>
            <b-card-text>
              서버 연결상태: {{ wsStatus.toUpperCase() }}
              <div>
                시뮬레이션 상태: {{ simulation.status.toUpperCase() }}
              </div>
              <div>평균속도:</div>
              <b-form inline>
              <b-progress  max="70" class="w-50">
                <b-progress-bar :value="avgSpeed" v-bind:style="{'background-color':congestionColor(avgSpeed)}"></b-progress-bar>
              </b-progress> &nbsp;
              <span :style="{'color': congestionColor(avgSpeed)}"> {{ (avgSpeed).toFixed(2) }} km </span>
              </b-form>
              <b-form inline>
                <b-button v-if="wsStatus !=='open'" @click="connectWebSocket" size="sm">
                  연결 <b-icon icon="plug"> </b-icon>
                </b-button>
              </b-form>


            속도분포(뷰포트)
            <doughnut :chartData="pieData" :height="110" />


            </b-card-text>
          </b-card-body>
        </b-card>
          <b-card
          text-variant="light"
          bg-variant="secondary"
          border-variant="dark"
          no-body
          class="m-0"
        >
          <b-card-body>
            <b-card-text>
              <h5>선택지역 통행차량: {{ focusData.vehicles }} 대, </h5>
              <h5>선택지역 평균속도: </h5>
              <b-form inline>
                <b-progress  max="70" class="w-50">
                  <b-progress-bar :value="focusData.speed" v-bind:style="{'background-color':congestionColor(focusData.speed)}"></b-progress-bar>
                </b-progress> &nbsp;
                <span>{{ focusData.speed }} km </span>
              </b-form>
            </b-card-text>
            <b-card-text>
            속도분포(선택영역)
            <doughnut :chartData="pieData2" :height="110"/>
            </b-card-text>
          </b-card-body>
        </b-card>
        <b-card
          text-variant="light"
          bg-variant="secondary"
          border-variant="dark"
          no-body
          class="m-0"
        >
          <b-card-body>
            <b-card-text>
              <h5>시뮬레이션 진행률:</h5>
              <b-progress
                striped
                :animated="progress !== 100"
                height="1rem"
                show-progress class="w-100 mb-2 mt-2">
                <b-progress-bar :value="progress" animated striped>
                  <span><b-icon icon="truck"></b-icon> {{ progress }} %</span>
                </b-progress-bar>
              </b-progress>
            </b-card-text>
            <b-form inline>
              <b-button v-if="simulation.status!=='running'" size="sm"> 시뮬레이션 시작 <b-icon icon="caret-right-fill"/> </b-button>
              <b-button size="sm" variant="dark"> 시뮬레이션 중지 <b-icon icon="stop-fill"/> </b-button>
              <b-button class="ml-2" @click="toggleFocusTool" size="sm" variant="dark"> 포커스 도구 </b-button>
            </b-form>
          </b-card-body>
        </b-card>
      </b-card-group>

      <b-card bg-variant="dark" border-variant="dark" no-body>
        <b-progress height="2rem" v-if="progress === 100">
          <b-progress-bar value="100" animated striped variant="success">
            <span><strong> 통계정보 생성중... </strong></span>
          </b-progress-bar>
        </b-progress>
      </b-card>

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
    max-height: 800px;
  }

  .uniq-step-player {
    z-index: 999;
    position: absolute;
    width: 300px;
    /* top: 65px; */
    bottom: 10px;
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
