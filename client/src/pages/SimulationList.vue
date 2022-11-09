<template>
<div class="container- p-3 bg-gray-600">
  <div class="bg-gray-500- border-2 border-gray-500 mt-2 rounded-xl py-2 px-2 min-w-max">
    <!-- <div class="text-white font-bold bg-gray-700 w-40 text-center px-2 py-1 rounded"> 🚙 교통 시뮬레이션 </div> -->
    <!-- <div class="text-white text-lg text-center font-bold bg-gray-700- w-32 py-1 rounded">교통시뮬레이션</div> -->
    <div class="p-1 flex justify-end space-x-1" >
      <!-- <div> -->
        <button
          v-b-modal.create-simulation-modal
          class="px-2 bg-indigo-400 py-1 hover:bg-indigo-600 hover:text-white rounded font-bold"
        >
          <b-icon icon="plus-square"/> 시뮬레이션 등록
        </button>
        <button
          class="px-2 bg-indigo-400 py-1 hover:bg-indigo-600 hover:text-white rounded font-bold"
          v-b-toggle.collapse1
          title="시뮬레이션 비교"
        >
          <b-icon icon="files"/> 시뮬레이션 비교
        </button>
        <button
          class="px-2 bg-indigo-400 py-1 hover:bg-indigo-600 hover:text-white rounded font-bold"
          @click.stop="updateTable"
        >
          <b-icon icon="arrow-clockwise"/> 새로고침
        </button>
      <!-- </div> -->
      <!--
      <b-btn
        :pressed.sync="autoRefresh"
        :variant="autoRefresh ? 'info' : 'outline-secondary'"
        size="sm"
        variant="dark"
        v-b-tooltip.hover
        title="테이블 자동 업데이트"
      >
        자동 새로고침
        <b-icon v-if="!autoRefresh" icon="arrow-clockwise"/>
        <b-iconstack v-if="autoRefresh" font-scale="1" animation="spin">
          <b-icon stacked icon="slack" variant="info" scale="0.75" shift-v="-0.25"></b-icon>
          <b-icon stacked icon="slash-circle" variant="light"></b-icon>
        </b-iconstack>
      </b-btn>
      -->
    </div>

    <div class="">
      <b-alert :show="warning" dismissible variant="warning" > {{ warning }} </b-alert>
      <b-collapse id="collapse1" class="mt-0">
        <div
          @drop="drop"
          @dragover="dragover"
          class="bg-indigo-100 p-3 text-center"
        >
          <span v-if="selected.length === 0" >
            시뮬레이션을 여기로 드래그&드랍 하세요.
          </span>
          <b-badge class="mx-2 p-2"
            href="#"
            v-for="item in selected"
            :key="item"
            v-b-tooltip.hover
            title="클릭하면 제거됩니다."
          >
            {{ item }}
            <b-icon @click="deleteSelected(item)" icon="x"/>
          </b-badge>
        </div>
      </b-collapse> <!-- simulation drop area -->
      <b-btn
        variant="warning"
        v-if="selected.length >= 2"
        size="sm"
        @click.stop="compare"
      >
        <b-icon icon="bar-chart-fill"></b-icon> 비교
      </b-btn>
    </div>
      <!-- TABLE -->
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
          <b>{{ row.item.id.toUpperCase() }}</b>
        </div>
      </template>

      <template v-slot:cell(region)="row" >

          <b>{{ getRegionName(row.item.configuration.region) }}</b>

      </template>

      <template v-slot:cell(duration)="row">
        <div>{{ row.item.configuration.fromTime + ' ~ ' + row.item.configuration.toTime}} </div>
      </template>
      <template v-slot:cell(status)="row">
        <div :class="sColor(row.item.status)" class="rounded py-1">
          <b-icon v-if="row.item.status === 'running'" icon="gear-fill" variant="light" animation="spin" font-scale="1"></b-icon>
          <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" variant="light" font-scale="1"></b-icon>
          <b-icon v-else icon="shield-fill-check" variant="light" font-scale="1"></b-icon>
          <span>{{ row.item.status.toUpperCase() }}</span>
        </div>
      </template>

      <template v-slot:cell(configuration.period)="row">
        <div v-if="row.item.configuration.period >= 300" class="text-center font-bold p-1">
          {{ row.item.configuration.period / 60 }} 분
        </div>
        <div v-else class="text-center font-bold p-1">
          {{ row.item.configuration.period }} 초
        </div>
      </template>

      <template v-slot:cell(actions)="row">
        <!-- <button @click.stop="startSimulation(row.item.id, row.index, $event.target)" class="px-2 bg-indigo-400 text-sm py-1 hover:bg-indigo-500 rounded" > 시작 <b-icon icon="play-fill"/> </button>
        <button @click.stop="stopSimulation(row.item.id, row.index, $event.target)" class="px-2 py-1 text-sm bg-yellow-500 hover:bg-yellow-500 rounded text-black" > 중지 <b-icon icon="stop-fill"/> </button> -->
        <router-link :to="{ name: 'SimulationResultMap', params: {id: row.item.id}}" >
          <button
            class="px-2 py-1 text-sm bg-blue-500 hover:bg-blue-300 rounded text-white"
            >상세보기 <b-icon icon="zoom-in"></b-icon>
          </button>
        </router-link>
        <button class="px-2 text-black bg-yellow-400 hover:bg-yellow-500 rounded text-sm py-1" @click.stop="removeSimulation(row.item)">
          <b-icon icon="x" aria-hidden="true"/>
        </button>
      </template>
      <template v-slot:cell(details)="row">
      </template>
      <template v-slot:cell(del)="row">
      </template>
      <template v-slot:row-details="row">
        <div class="p-3 bg-gray-500">
          <div style="overflow-wrap: break-word; max-width:1024px">
            {{row.item.error }}
          </div>
          <div>
            <div class="space-y-1">
              <div class="flex items-center space-x-1">
                <div class="font-bold bg-gray-600 p-1 rounded">
                  아이디
                </div>
                <div>
                  {{ row.item.id }}
                </div>
                </div>
                <div class="flex items-center space-x-1">
                <div class="font-bold bg-gray-600 p-1 rounded">
                  걸린 시간
                </div>
                <div>
                  {{ row.item.started }} ~ {{ row.item.ended }} ({{ calcDuration(row.item) }}) 초
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <div class="font-bold bg-gray-600 p-1 rounded">
                  시뮬레이션 결과파일 분석
                </div>
                <div>
                  <div class="flex space-x-1 items-center">
                    <b-form-file accept=".csv" v-model="resultFile" placeholder="시뮬레이션 결과파일(.CSV)을 선택" size="sm"> </b-form-file>
                      <b-btn variant="primary" @click.prevent="uploadSimulatoinResultFile(row.item)" size="sm">
                        <b-icon icon="upload" size="sm"/>
                      </b-btn>
                  </div>
                </div>
              </div>
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
    <b-modal
      title="시뮬레이션 생성"
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
      <sim-register
        @hide="hideCreateSimulationDialog"
        @config:save="saveSim"
        :userId="userState.userId"
        modalName="create-simulation-modal"
        :intersectionField="false"
        :epochField="false"
        role="simulation"
        >
      </sim-register>
    </b-modal>
  </div>
 </div>
</template>

<script src="./simulation-list.js"> </script>

<style>

table tbody td {
  vertical-align:middle !important;
}

.no-border-round {
  border-radius: 0;
}
</style>
