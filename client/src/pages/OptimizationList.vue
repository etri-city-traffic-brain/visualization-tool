<template>
<div>
  <b-card
    no-body
    bg-variant="secondary"
    text-variant="light"
    style="min-width:840px; border-radius:0"
  >
    <b-container fluid class="mt-1 p-1">
      <b-alert
        :show="warning"
        dismissible variant="warning"
      >
        {{ warning }}
      </b-alert>
      <b-row class="m-0 p-0">
        <b-col class="p-0">
          <b-form inline>
            <!-- // do not support
            <b-btn
              variant="dark"
              size="sm"
              v-b-modal.create-simulation-modal
            >
              <b-icon icon="file-earmark-plus"/>
              <strong>최적화 등록</strong>
            </b-btn>
            -->

            <b-btn variant="dark" size="sm" @click.stop="updateTable" class="ml-1">
              <b-icon icon="arrow-clockwise"/> 새로고침
            </b-btn>
            <b-form-checkbox
              class="ml-1"
              v-model="autoRefresh"
              name="check-button"
              size="md"
              switch
            >
              자동 새로고침
            </b-form-checkbox>
          </b-form>
        </b-col>
      </b-row>
      <b-table
        hover
        small
        striped
        ref="simulations-table"
        table-variant="dark"
        head-variant="dark"
        foot-variant="dark"
        :items="items"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        class="mt-1"
      >
        <template v-slot:cell(num)="row">
          <b-button
            variant="dark"
            size="sm"
            @click="row.toggleDetails(); toggleDetails(row.item.id, row.item.status, row.detailsShowing);">
            <!-- {{ row.detailsShowing ? '-' : '+'}} -->
            <b-icon icon="arrow-bar-up" v-if="row.detailsShowing"></b-icon>
            <b-icon icon="arrow-bar-down" v-else></b-icon>
          </b-button>
        </template>

        <template v-slot:cell(id)="row" >
          <div draggable="true" @dragstart="drag" :data-id="row.item.id">
            <!-- <b class="text-success">{{ row.item.id.toUpperCase() }}</b> -->
            <b>{{ row.item.id.toUpperCase() }}</b>
              <!-- <h5 class="m-0"><b-badge class="p-2" :variant="statusColor(row.item.status)">{{ row.item.id.toUpperCase() }}</b-badge></h5> -->
          </div>
        </template>

        <template v-slot:cell(status)="row">
          <b-icon v-if="row.item.status === 'running'" icon="gear-fill" :variant="statusColor(row.item.status)" animation="spin" font-scale="2"></b-icon>
          <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" :variant="statusColor(row.item.status)" font-scale="2"></b-icon>
          <b-icon v-else icon="shield-fill-check" :variant="statusColor(row.item.status)" font-scale="2"></b-icon>
        </template>

        <template v-slot:cell(epoch)="row">
          <span>{{row.item.epoch || 0}}</span>
        </template>

        <template v-slot:cell(statusText)="row">
          <b-alert :variant="statusColor(row.item.status)" class="m-0 p-0" show size="sm">{{ row.item.status.toUpperCase() }}</b-alert>
        </template>

        <template v-slot:cell(actions)="row">
          {{ row.item.configuration.junctionId.split(',').length}}
          <!--
          <b-button
            size="sm"
            variant="secondary"
            v-b-tooltip.hover
            title="시뮬레이션을 시작합니다."
            @click.stop="startSimulation(row.item.id, row.index, $event.target)"
            v-if="row.item.status !== 'ready' || row.item.status === 'error' || row.item.status === 'stopped'"
            >
              <b-icon icon="play-fill"/> 최적화 시작
          </b-button>
          -->

        </template>

        <template v-slot:cell(configuration.begin)="row">
          {{ row.item.configuration.fromTime.substring(0, 5) }}
        </template>

        <template v-slot:cell(configuration.end)="row">
          {{ row.item.configuration.toTime.substring(0, 5) }}
        </template>

        <template v-slot:cell(stop)="row">
    <b-button
            size="sm"
            variant="secondary"
            v-b-tooltip.hover
            title="시뮬레이션을 중지합니다."
            @click.stop="stopSimulation(row.item.id, row.index, $event.target)"
            v-if="row.item.status === 'running'">
              <b-icon icon="stop-fill"/>
          </b-button>
        </template>
        <template v-slot:cell(analisys)="row">
          <b-button
            size="sm"
            variant="secondary"
            v-b-tooltip.hover
            title="신호비교"
            :to="{ name: 'OptimizationResultComparisonMap', params: {id: row.item.id}}"
          >
            <!-- <b-icon icon="circle-square"></b-icon> -->
            🚥 분석
          </b-button>
        </template>
        <template v-slot:cell(details)="row">

          <b-button
            size="sm"
            variant="secondary"
            :to="{
              name: 'OptimizationResultMap',
              params: {id: row.item.id}
            }"
          >
            🚦 최적화
          </b-button>



        </template>

        <template v-slot:cell(del)="row">
          <b-button
            size="sm"
            variant="danger"
            class="mr-1"
            @click.stop="removeSimulation(row.item)">
              <b-icon icon="trash-fill" aria-hidden="true"/>
          </b-button>
        </template>

        <template v-slot:row-details="row">
          <b-card bg-variant="secondary" text-variant="light">
            <h5>설명: <b-badge> {{ row.item.description }} </b-badge></h5>
            <h5>시뮬레이션 시작: <b-badge> {{ row.item.started || '_' }} </b-badge></h5>
            <h5>시뮬레이션 종료: <b-badge>{{ row.item.ended || '_' }} </b-badge></h5>
            <h5>실행 스크립트: <b-badge> {{ row.item.configuration.script }} </b-badge></h5>
            <!-- <h5>교차로 아이디: <b-badge> {{ row.item.configuration.junctionId }} </b-badge></h5> -->
            <h5>Epoch: <b-badge> {{ row.item.configuration.epoch }} </b-badge></h5>
            <h5>최적화 교차로</h5>
            <b-badge
              v-for="junction of row.item.configuration.junctionId.split(',')"
              :key="junction"
              class="m-1"
            >
              <b-badge href="#" class="m-1" variant="dark" size="sm" >{{ junction }}</b-badge>
            </b-badge>
            <b-card bg-variant="dark">
            <b-btn variant="secondary" @click="downloadScenario(row.item.id)">다운로드 시나리오</b-btn>
            <b-btn variant="secondary" @click="downloadScenarioConfig(row.item.id)">다운로드 설정파일</b-btn>
            </b-card>
          </b-card>
        </template>
      </b-table>
      <b-alert
        :show="msg.length > 0"
        :variant="variant"
      >
        <b-spinner small type="grow"/> {{ msg }} <b-spinner small type="grow"/>
      </b-alert>

      <b-pagination
        class="mt-1"
        :total-rows="totalRows"
        :per-page="perPage"
        v-model="currentPage"
        first-text="|◀"
        prev-text="◀"
        next-text="▶"
        last-text="▶|"
        align="center"
        size="sm"
      />
    </b-container>
  </b-card>
  <b-modal
    title="최적화 등록"
    id="create-simulation-modal"
    ref="create-simulation-modal"
    size="lg"
    header-border-variant="dark"
    header-bg-variant="dark"
    header-text-variant="light"
    body-bg-variant="dark"
    body-text-variant="ligth"
    body-border-variant="dark"
    header-class="pt-2 pb-0 no-border-round"
    body-class="p-2"
    hide-footer
  >
    <uniq-register
      @hide="hideCreateSimulationDialog"
      :userId="userState.userId"
      modalName="create-simulation-modal"
      role="optimization"
      :intersectionField="true"
      :epochField="true"
      >
    </uniq-register>
  </b-modal>
</div>
</template>

<script src="./optimization-list.js"> </script>

<style>

table tbody td {
  vertical-align:middle !important;
}

.no-border-round {
  border-radius: 0;
}
</style>
