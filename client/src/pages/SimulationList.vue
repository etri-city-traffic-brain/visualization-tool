<template>
  <div class="p-3 bg-gray-600">
    <div class="border-2 border-gray-500 mt-2 rounded-xl py-2 px-2 min-w-max">
      <!-- <div class="text-white font-bold bg-gray-700 w-40 text-center px-2 py-1 rounded"> 🚙 교통 시뮬레이션 </div> -->
      <!-- <div class="text-white text-lg text-center font-bold bg-gray-700- w-32 py-1 rounded">교통시뮬레이션</div> -->
      <!-- <div class="text-white font-bold py-1 rounded text-lg">
        교통 시뮬레이션
      </div> -->
      <div class="p-1 flex justify-between space-x-1">
        <!-- <div> -->
        <button v-b-modal.create-simulation-modal
          class="px-2 py-1 bg-gray-700 hover:text-indigo-200 rounded font-bold text-gray-100 flex space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
          </svg>

          <div>
            시뮬레이션 생성
          </div>
        </button>
        <div>
          <button class="px-2 py-1 hover:text-white rounded font-bold text-gray-100" v-b-toggle.collapse1
            title="시뮬레이션 비교">
            시뮬레이션 비교
          </button>
          <button class="px-2 py-1 bg-gray-700 hover:text-white rounded font-bold text-gray-100"
            @click.stop="updateTable">
            새로고침
          </button>
        </div>
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
        <b-alert :show="warning" dismissible variant="warning">
          {{ warning }}
        </b-alert>
        <b-collapse id="collapse1" class="mt-0">
          <div @drop="drop" @dragover="dragover" class="bg-indigo-100 p-3 text-center">
            <span v-if="selected.length === 0">
              시뮬레이션을 여기로 드래그&드랍 하세요.
            </span>
            <b-badge class="mx-2 p-2" href="#" v-for="item in selected" :key="item" v-b-tooltip.hover title="클릭하면 제거됩니다.">
              {{ item }}
              <b-icon @click="deleteSelected(item)" icon="x" />
            </b-badge>
          </div>
        </b-collapse>
        <!-- simulation drop area -->
        <b-btn variant="warning" v-if="selected.length >= 2" size="sm" @click.stop="compare">
          <b-icon icon="bar-chart-fill"></b-icon> 비교
        </b-btn>
      </div>
      <!-- TABLE -->
      <b-table hover small striped ref="simulations-table" table-variant="dark" head-variant="dark" foot-variant="dark"
        :items="items" :fields="fields" :current-page="currentPage" :per-page="perPage" class="mt-1">
        <template v-slot:cell(num)="row">
          <b-button variant="dark" size="sm" @click="
            row.toggleDetails();
          toggleDetails(row.item.id, row.item.status, row.detailsShowing);
          ">
            <!-- {{ row.detailsShowing ? '-' : '+'}} -->
            <b-icon icon="arrow-bar-up" v-if="row.detailsShowing"></b-icon>
            <b-icon icon="arrow-bar-down" v-else></b-icon>
          </b-button>
        </template>

        <template v-slot:cell(id)="row">
          <div draggable="true" @dragstart="drag" :data-id="row.item.id">
            <b>{{ row.item.id.toUpperCase() }}</b>
          </div>
        </template>

        <template v-slot:cell(configuration.simulationType)="row">
          <div class="text-black uppercase rounded font-bold"
            :class="getClassByType(row.item.configuration.simulationType)">
            {{ row.item.configuration.simulationType || "Meso" }}
          </div>
        </template>

        <template v-slot:cell(region)="row">
          <div v-if="row.item.configuration.areaType === 'area'">
            영역
          </div>
          <b v-else>{{ getRegionName(row.item.configuration.region) }}</b>
        </template>

        <!-- <template v-slot:cell(duration)="row">
        <div>{{ row.item.configuration.fromTime + ' ~ ' + row.item.configuration.toTime}} </div>
      </template> -->

        <template v-slot:cell(status)="row">
          <div :class="sColor(row.item.status)" class="rounded py-1">
            <b-icon v-if="row.item.status === 'running'" icon="gear-fill" variant="light" animation="spin"
              font-scale="1"></b-icon>
            <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" variant="light"
              font-scale="1"></b-icon>
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
          <router-link :to="{ name: 'SimulationResultMap', params: { id: row.item.id } }">
            <button class="bg-gray-500 text-white rounded px-2 hover:bg-gray-700">
              시뮬레이션
            </button>
          </router-link>
          <button class="bg-gray-500 rounded hover:bg-gray-700 px-1" @click.stop="removeSimulation(row.item)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-4 h-4 inline">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </template>
        <template v-slot:cell(details)="row"> </template>
        <template v-slot:cell(del)="row"> </template>
        <template v-slot:row-details="row">
          <div class="p-3 bg-gray-500 space-y-2">
            <div class="flex items-center space-x-1" v-if="row.item.error">
              <div class="max-w-5xl break-normal bg-red-200 rounded text-black p-2">
                {{ row.item.error }}
              </div>
            </div>
            <div class="">
              <div class="space-y-1">
                <div class="flex items-center space-x-1">
                  <div class="w-40 text-right font-bold bg-gray-600 p-1 rounded">
                    시뮬레이션 아이디
                  </div>
                  <div>{{ row.item.id }}</div>
                </div>
                <div class="flex items-center space-x-1" v-if="row.item.started">
                  <div class="w-40 text-right font-bold bg-gray-600 p-1 rounded">
                    걸린 시간
                  </div>
                  <div>
                    {{ row.item.started }} ~ {{ row.item.ended }} ({{
                      calcDuration(row.item)
                    }}) 초
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-40 text-right font-bold bg-gray-600 p-1 rounded">
                    실행 이미지
                  </div>
                  <div>{{ row.item.configuration.dockerImage }}</div>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-40 text-right font-bold bg-gray-600 p-1 rounded">
                    결과파일 분석
                  </div>
                  <div class="">
                    <div class="flex space-x-1 items-center w-max">
                      <b-form-file accept=".csv" v-model="resultFile" placeholder="결과파일(.CSV) 선택" size="sm">
                      </b-form-file>
                      <b-btn variant="dark" @click.prevent="uploadSimulatoinResultFile(row.item)" size="sm">
                        <b-icon icon="upload" size="sm" />
                      </b-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </b-table>

      <b-alert :show="msg.length > 0" :variant="variant">
        <b-spinner small type="grow" /> {{ msg }}
        <b-spinner small type="grow" />
      </b-alert>
      <div class="flex justify-center">
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" first-text="|◀" prev-text="◀"
          next-text="▶" last-text="▶|" size="sm" />
      </div>
      <b-modal title="시뮬레이션 생성" id="create-simulation-modal" ref="create-simulation-modal" size="xl"
        header-border-variant="dark" header-bg-variant="dark" header-text-variant="light" body-bg-variant="dark"
        body-text-variant="ligth" body-border-variant="dark" header-class="pt-2 pb-0 no-border-round" body-class="p-2"
        hide-footer>
        <sim-register @hide="hideCreateSimulationDialog" @config:save="saveSim" :userId="userState.userId"
          modalName="create-simulation-modal" :intersectionField="false" :epochField="false" role="simulation">
        </sim-register>
      </b-modal>
    </div>
  </div>
</template>

<script src="./simulation-list.js"></script>

<style>
table tbody td {
  vertical-align: middle !important;
}

.no-border-round {
  border-radius: 0;
}
</style>
