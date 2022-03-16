<template>
  <div>
    <!-- TOP MENU -->
    <b-card
      bg-variant="dark"
      border-variant="dark"
      text-variant="light"
      style="min-width:840px; border-radius:0"
      no-body
    >
      <b-card-body class="p-1 d-flex justify-content-between">
        <span v-if="junction.id">{{junction.crossName}} ({{junction.id.substring(0, 20)}}) {{junction.policeStation}}</span>
        <span v-else class="ml-2">
          교차로를 선택하세요.
        </span>
        <div>
        <b-btn variant="outline-secondary" size="sm"> </b-btn>
        <b-btn size="sm" class="ml-1" @click="downloadConnectionInfo" > <b-icon icon="download"></b-icon> </b-btn>
        <b-btn size="sm" class="ml-1" @click="editMode" > 편집 </b-btn>
        <b-btn size="sm" class="ml-1" @click="moveMode" > <b-icon icon="arrows-move"></b-icon> </b-btn>
        <b-btn size="sm" class="ml-1" v-if="junction.id" @click="showModal('modal-export-json')">Export(JSON)</b-btn>
        <b-btn size="sm" class="ml-1" v-if="junction.id" @click="showModal('modal-export-xml')">Export(XML)</b-btn>
        </div>
      </b-card-body>
    </b-card>

    <b-container fluid class="mt-0 p-0">
      <b-row class="m-0">
        <b-col cols="6" class="p-0">
          <b-card
            border-variant="secondary"
            bg-variant="secondary"
            no-body
            class="p-1"
            style="border-radius:0"
          >
          <div
            :ref="mapId"
            :id="mapId"
            class="map"
            :style="{
              height: '500px',
              'border-radius': '30px'
            }"
          />
          </b-card>
        </b-col>
        <b-col cols="6" class="p-0">
          <b-card bg-variant="secondary" no-body class="pl-0 pt-1 pb-1 pr-1" style="border-radius:0"
          border-variant="secondary"
          >
          <div ref="connectionEditor" class="junction" />
          </b-card>

          <div style="max-height:250px;overflow:auto;">
          <b-card
            v-for="(item, idx) in signalPhases"
            :key="item.index"
            class="mt-1 ml-1"
            no-body
            :bg-variant="(selectedPhase === idx) && 'dark' || 'white'"


          >
            <b-card-body class="p-2">
              <div class="ml-2 d-flex justify-content-between">
                <b-btn
                  href="#"
                  :variant="(selectedPhase === idx) && 'warning' || 'secondary'"
                  @click="changePhase(idx)"
                  size="sm"
                >
                  PHASE {{ item.index }}
                </b-btn>

                <transition-group name="list" class="ml-1">
                  <b-badge
                    v-for="(item) in item.state"
                    :key="item.id"
                    variant="light"
                    v-bind:style="{color: colored(item.value), fontWeight: 'bold', fontSize: '14px'}"
                    class="list-item p-1"

                  >
                    {{ item.value.toUpperCase() }}
                  </b-badge>
                </transition-group>
              </div>
            </b-card-body>
          </b-card>
          </div>

          <div style="background-color:black;">

          </div>
        </b-col>
      </b-row>
    </b-container>

    <!-- <b-container
      fluid
      class="p-0"
      style="height:600px"
      v-if="signalPhaseDefault.length === 0"
    >
      <b-alert
        show
        :variant="variant"
        class="m-0"
      >
        {{ text }}
      </b-alert>
    </b-container> -->
    <b-container fluid class="mt-1 p-0">
      <b-row class="m-0">
        <!-- CONNECTION -->
        <b-col cols="6" class="p-1">

          <b-card
                header-text-variant="white"
                header-bg-variant="dark"
                header="부가정보"
                no-body
                 v-if="junction.id"
              >
                <b-card-body class="wizard-menu p-0">
                  <div
                    v-for="(phase, idx) in signalPhaseDefault"
                    :key="idx"
                    style="display:inline-block"
                    class="m-1"
                  >
                    <div class="text-center">
                      <input disabled class="salt-tl-phase2" :value="phaseCodeValue(phase.type)"/>
                      <input style="display:block" v-model="phase.tm" class="salt-tl-phase2" />
                      <!-- <input style="display:block" v-model="signalPhaseDefault[1].phaseDefault[idx].tm" class="salt-tl-phase2" /> -->
                    </div>
                  </div>
                </b-card-body>
              </b-card>
        </b-col>
        <!-- PHASE -->
        <b-col cols="6">
          <b-row v-if="signalPhaseDefault.length > 0">
            <b-col cols="12" class="p-1">
              <b-card
                header-text-variant="white"
                header-bg-variant="dark"
                header="패턴(시간계획)"
                no-body
              >
                <div class="d-flex flex-wrap">
                <b-card
                    no-body
                    v-for="(scenario, index) in signalScenario"
                    :key="scenario.id"
                    class="text-left hover-effect m-1"
                    style="cursor:pointer; display:inline-block; min-width: 220px"
                    :ref="scenario.id"
                    :bg-variant="scenario.variant"
                  >
                    <b-card-body
                      draggable="true"
                      @dragstart="drag(scenario.id)"
                      :data-id="scenario.id"
                      class="p-1"
                    >
                      <!-- <b-badge>{{(index+'').padStart(2,0)}}</b-badge> -->
                      <b-badge>{{(scenario.id+'').padStart(2,0)}}</b-badge>
                      <input
                        v-model="scenario.phase"
                        class="salt-tl-phase input-compact"
                        @keyup="keyUp(scenario.id)"
                        @keydown="keyUp(scenario.id)"
                      >
                      <b-badge variant="info">{{scenario.duration}}</b-badge>
                      <b-badge>{{scenario.offset}}</b-badge>
                    </b-card-body>
                  </b-card>
                </div>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>

    <!-- <transition name="fade"> -->



      <b-card
        bg-variant="dark"
        border-variant="dark"
        class="p-0"
        v-if="junction.id"
        no-body
      >
        <!-- <b-container fluid class="mt-2" >
          <b-row >
            <b-col cols="12" class="p-1">
              <b-card
                header-text-variant="white"
                header-bg-variant="dark"
                header="패턴(시간계획)"
                no-body
              >
                <b-card-body class="p-0">

                </b-card-body>
              </b-card>
            </b-col>
          </b-row>
        </b-container> -->
        <!--- TOD PLAN //-->
        <!-- <b-container fluid class="p-1"> -->
          <b-card
            header-text-variant="white"
            header-bg-variant="dark"
            header-border-variant="dark"
            header-tag="header"
            no-body
          >
            <div slot="header" class="mb-0">
              <span>TOD 계획</span>
              <b-badge @click="addPlan" variant="info" href="#"> + </b-badge>
            </div>
            <b-card-body class="p-0">
              <b-card
                v-for="(tod, planIdx) in todPlan"
                :key="planIdx"
                :sub-title="todName(tod.id)"
                style="display:inline-block"
                class="m-1"
              >
                <b-list-group flush>
                  <b-list-group-item class="p-1 text-right">
                    <!-- <b-button @click="addPlanItem(planIdx)" size="sm" variant="secondary"><icon name="plus"/></b-button>
                    <b-button @click="deletePlan(planIdx)" size="sm" variant="danger"><icon name="remove"/></b-button> -->
                    <b-badge @click="addPlanItem(planIdx)" href="#" variant="secondary">
                      <!-- <icon name="plus"/> -->
                      +
                    </b-badge>
                    <b-badge @click="deletePlan(planIdx)" href="#" variant="danger">
                      <!-- <icon name="remove"/> -->
                      -
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
                <b-card-body class="p-0">
                  <b-input-group>
                    <!-- <input disabled value="#" class="salt-tl-v1">
                    <input disabled value="시작" class="salt-tl-time">
                    <input disabled value="종료" class="salt-tl-time">
                    <input disabled value="주기" class="salt-tl-v3">
                    <input disabled value="패턴" class="salt-tl-v3"> -->
                    <!-- <input disabled value="기능" class="salt-tl-v3"> -->
                  </b-input-group>
                  <transition-group name="list-complete" tag="div">
                    <b-card
                      v-for="(plan, itemIdx) in tod.tods"
                      :key="plan.todSeq"
                      @drop="drop(tod.id, plan.todSeq)"
                      @dragover="dragover($event, tod)"
                      droppable="true"
                      class="list-complete-item hover-effect"
                      style="display:block; border: 0"
                      no-body
                      :bg-variant="plan.variant"
                    >
                    <b-card-body class="p-0">

                      <!-- <input disabled :value="itemIdx" class="salt-tl-v3"> -->
                      <b-badge>{{ itemIdx }}</b-badge>

                      <input v-model="plan.fromTime" class="salt-tl-time input-compact">~
                      <input v-model="plan.toTime" class="salt-tl-time input-compact">
                      <!-- <input v-model="plan.duration" class="salt-tl-v3" disabled>
                      <input v-model="plan.patternId" class="salt-tl-v3" disabled> -->
                      <b-badge variant="info">{{ plan.duration }}</b-badge>
                      <!-- <b-badge>{{ plan.patternId }}</b-badge> -->
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="1"
                        v-model="plan.patternId"
                        class="salt-tl-v3 input-compact">
                      <!-- <b-button @click="deletePlanItem(planIdx, itemIdx)" size="sm" variant="link" >X</b-button> -->
                      <b-badge @click="deletePlanItem(planIdx, itemIdx)" href="#" variant="danger">X</b-badge>
                    </b-card-body>
                    </b-card>


                  </transition-group>
                  <!-- <input v-for="(plan, index) in tod.plans" :key=index v-model="plan.value" maxlength="2" class="mr-1"> -->
                </b-card-body>
              </b-card>

            </b-card-body>
          </b-card>

        <!-- </b-container> -->
      </b-card>
    <!-- </transition> -->

    <!-- BOTTOM MENU -->
    <!-- <b-container fluid class="mt-2">
      <span v-if="junction.id">
        <b-button size="sm" @click="showModal('modal-export-json')">Export(JSON)</b-button>
        <b-button size="sm" @click="showModal('modal-export-xml')">Export(XML)</b-button>
      </span>
    </b-container> -->

    <!--- SIGNAL PATTERN //-->

    <!-- EXPORT JSON -->
    <b-modal
      id="modal-export-json"
      ref="modal-export-json"
      title="Export as JSON"
      size="lg"
      @ok="downloadJson"

    >
      <b-container fluid class="p-0">
        <b-row>
          <b-col sm="12">
            <b-form-textarea
              id="textarea"
              v-model="textJson"
              placeholder="{}"
              rows="20"
              max-rows="6"
            />
          </b-col>
        </b-row>
      </b-container>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <b-button size="sm" variant="primary" @click="updateSignal()">
          Update Database
        </b-button>
        <b-button size="sm" variant="primary" @click="ok()">
          Download As File
        </b-button>
        <b-button size="sm" variant="secondary" @click="cancel()">
          Cancel
        </b-button>
      </template>
    </b-modal> <!-- END OF EXPORT JSON //-->

    <!-- EXPORT XML -->
    <b-modal
      id="modal-export-xml"
      ref="modal-export-xml"
      title="XML 내보내기"
      size="xl"
      @ok="downloadXml"
    >
      <b-container fluid class="p-0">
        <b-row>
          <b-col>
            <b-input-group class="mb-2">
              <b-form-input disabled value="시작시간"></b-form-input>
              <b-form-input v-model="fromDate" type="date"></b-form-input>
              <b-form-input v-model="fromTime" type="time"></b-form-input>
            </b-input-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-input-group class="mb-2">
            <b-form-input disabled value="종료시간"></b-form-input>
            <b-form-input v-model="toDate" type="date"></b-form-input>
            <b-form-input v-model="toTime" type="time"></b-form-input>
           </b-input-group>
          </b-col>
        </b-row>
        <!-- <b-row>
          <b-col sm="12" class="text-center m-2">
            <strong>{{ fromDate }} {{ fromTime }} ~ {{ toDate }} {{ toTime }}</strong>
          </b-col>
        </b-row> -->
        <b-row>
          <b-col sm="12">
            <b-form-textarea
              id="textarea"
              v-model="text"
              placeholder="Generate SALT Traffic Signal..."
              :rows="rows"
              max-rows="6"
            />
          </b-col>
        </b-row>
      </b-container>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <b-button size="sm" variant="primary" @click="convertToXml">
          Generate SALT Traffic Signal(XML)
        </b-button>
        <b-button size="sm" variant="primary" @click="ok()">
          Download
        </b-button>
        <b-button size="sm" variant="secondary" @click="cancel()">
          Cancel
        </b-button>
      </template>
    </b-modal> <!-- END OF EXPORT XML //-->
  </div>
</template>

<script src="./signal-editor.js">

</script>

<style scoped>

  .map {
    width: 100%;
  }

  .junction {
    height:250px;
    background-color: black;
  }
  .salt-tm {
    width: 2.8ch;

  }
  .salt-tl-time {
    width: 5.4ch;
  }
  .salt-tl-v1 {
    width: 2.8ch;
    margin: 0;
    padding: 0;
  }
  .salt-tl-v2 {
    width: 3ch;
    margin: 0;
    padding: 0;
  }
  .salt-tl-v3 {
    width: 4ch;
    margin: 1px;
    padding: 0;
  }
  .salt-tl-phase {
    width: 12ch;
    margin: 1;
    padding: 0;
  }
  .salt-tl-phase2 {
    width: 14ch;
    margin: 1;
    padding: 0;
    text-align: center;
  }

  .input-compact {
    text-align: center;
    border: 1px;
    outline: 0;
    padding: 1px;
    margin: 1px;
    border-bottom: 1px solid black;
    background: transparent;
  }
  .input-compact:disabled {
    border: none;
    background: LightSteelBlue ;
    padding: 0;
    margin: 1px;
    border-bottom: 1px solid black;
  }

  .hover-effect:hover {
    background-color: skyblue;
  }

  .list-complete-item {
    transition: all 1s;
    display: inline-block;
    margin-right: 10px;
  }
  .list-complete-enter, .list-complete-leave-to,
  .list-complete-leave-active {
    opacity: 0;
    transform: translateX(60px);
  }
  .list-complete-leave-active {
    /* position: absolute; */
    transition: all 1s;
  }
  .list-item {
    display: inline-block;
    margin-right: 2px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px) scale(4.0);
  }
  .card-header {
    padding: 0.25rem 0.75rem;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }


  #wizard-menu {
    height: 300px;
    border: 2px solid gray;
    overflow-y: auto;
    overflow-x: hidden;
  }


html {
  background: lightgrey;
  overflow: auto;
}

</style>
