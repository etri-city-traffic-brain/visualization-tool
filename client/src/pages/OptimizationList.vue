<template>
<div>
  <div class="bg-gray-500 min-w-max" >
    <div fluid class="mt-0 p-1">
      <div>
        <b-btn
          variant="dark"
          size="sm"
          @click.stop="updateTable"
           v-b-tooltip.hover title="테이블을 업데이트합니다."
        >
          <b-icon icon="arrow-clockwise"/> 새로고침
        </b-btn>
          <b-btn
            :pressed.sync="autoRefresh"
            variant="dark"
            size="sm"
            class="ml-1"
            v-b-tooltip.hover title="테이블을 주기적으로 업데이트합니다."
          >
          <!-- {{ autoRefresh ? 'A' : 'M' }}  -->
            <b-icon icon="arrow-clockwise"/>
            <b-iconstack v-if="autoRefresh" font-scale="1" animation="spin">
              <b-icon stacked icon="slack" variant="info" scale="0.75" shift-v="-0.25"></b-icon>
              <b-icon stacked icon="slash-circle" variant="dark"></b-icon>
            </b-iconstack>
            자동새로고침
          </b-btn>
      </div>
      <b-alert
        :show="warning"
        dismissible variant="warning"
      >
        {{ warning }}
      </b-alert>
      <b-row class="m-0 p-0">
        <b-col class="p-0">

        </b-col>
      </b-row>
      <b-table
        hover
        small
        striped
        responsive
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
            <b-icon icon="arrow-up" v-if="row.detailsShowing"></b-icon>
            <b-icon icon="arrow-down" v-else></b-icon>
          </b-button>
        </template>

        <template v-slot:cell(id)="row" >
          <div draggable="true" @dragstart="drag" :data-id="row.item.id">
            <!-- <b class="text-success">{{ row.item.id.toUpperCase() }}</b> -->
            <!-- <b>{{ row.item.id.toUpperCase() }}</b> -->
            <span
              variant="link"
              href="#"
              v-b-tooltip.hover
              :title="row.item.envName">{{ row.item.id.toUpperCase() }}
            </span>
            <!-- <small>{{ row.item.id.toUpperCase() }}</small>
            <small class="m-0 p-0 text-muted">({{ row.item.description }})</small> -->

              <!-- <h5 class="m-0"><b-badge class="p-2" :variant="statusColor(row.item.status)">{{ row.item.id.toUpperCase() }}</b-badge></h5> -->
          </div>
        </template>

        <template v-slot:cell(status)="row">
          <!-- <b-icon v-if="row.item.status === 'running'" icon="gear-fill" :variant="statusColor(row.item.status)" animation="spin" font-scale="2"></b-icon>
          <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" :variant="statusColor(row.item.status)" font-scale="2"></b-icon>
          <b-icon v-else icon="shield-fill-check" :variant="statusColor(row.item.status)" font-scale="2"></b-icon> -->
          <h5>
            <b-icon v-if="row.item.status === 'running'" icon="gear-fill" variant="light" animation="spin" font-scale="1"></b-icon>
            <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" variant="light" font-scale="1"></b-icon>
            <b-icon v-else icon="shield-fill-check" variant="light" font-scale="1"></b-icon>
            <b-badge :variant="statusColor(row.item.status)" style="min-width:110px" class="text-center">
              <span>{{ row.item.status.toUpperCase() }}</span>
            </b-badge>
          </h5>
        </template>

         <template v-slot:cell(duration)="row">
          <h5><b-badge>{{ row.item.configuration.fromTime.slice(0, 5) }}</b-badge> ~
          <b-badge>{{ row.item.configuration.toTime.slice(0, 5) }}</b-badge></h5>
        </template>

        <template v-slot:cell(description)="row">
          <!-- <b-badge
            variant="link"
            href="#"
            v-b-tooltip.hover
            :title="row.item.description">{{ row.item.description }}
          </b-badge> -->
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
          <b-button
            size="sm"
            variant="secondary"
            :to="{ name: 'OptimizationResultComparisonMap', params: {id: row.item.id}}"
          >
            <!-- <b-icon icon="circle-square"></b-icon> -->
            🚥 분석
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
          <div class="flex bg-indigo-100 rounded-xl text-black p-4">
            <div class="flex-1">
              <p class="px-2 py-1 rounded max-w-sm font-bold text-lg">{{ row.item.envName }} </p>
              <p>{{ row.item.description }}</p>

              <ul class="list-disc space-y-1 ml-4">
                <li class="">
                  <div>
                  시뮬레이션 상태:
                  <span class="relative inline-flex rounded-md shadow-sm">
                  <span type="button"
                    class="inline-flex items-center px-2 py-1 border border-purple-400 text-base leading-6 font-medium rounded-md text-purple-800 bg-white hover:text-purple-700 focus:border-purple-300 transition ease-in-out duration-150 cc_pointer">
                    {{ row.item.status.toUpperCase() }}
                  </span>
                  <span v-if=" row.item.status === 'running'"  class="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                </span>
                  </div>
                </li>
                <li class="">
                  시뮬레이션 시간: {{ row.item.started || '' }} ~ {{ row.item.ended || '' }}
                </li>
                <li class="">
                  스크립트: {{ row.item.configuration.script }}
                </li>
                <li class="">
                  Epoch: {{ row.item.configuration.epoch }}
                </li>
              </ul>


              <!-- <h5>교차로 아이디: <b-badge> {{ row.item.configuration.junctionId }} </b-badge></h5> -->



              <div class="">
                <button class="bg-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 font-bold text-white" @click="downloadScenario(row.item.id)">다운로드 시나리오</button>
                <button class="bg-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-bold text-white" @click="downloadScenarioConfig(row.item.id)">다운로드 설정파일</button>
              </div>
            </div>
            <div class="mb-2 flex-1">
              <div class="font-bold">최적화 대상 교차로:</div>
              <div class="flex flex-column max-w-xs max-h-60 overflow-y-auto">
                <span
                  v-for="junction of row.item.configuration.junctionId.split(',')"
                  :key="junction"
                  variant="dark"
                  class="m-1 px-2 py-1 bg-indigo-500 rounded max-w-xs rounded text-white"
                >
                {{ junction.slice(0, 20) }}
                  <!-- <b-badge href="#" class="m-1" variant="dark" size="sm" ></b-badge> -->
                </span>
              </div>
            </div>
          </div>
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
        align="center"
      />
    </div>
  </div>
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
