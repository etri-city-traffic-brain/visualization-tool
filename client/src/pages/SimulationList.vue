<template>
<div>
  <div class="bg-gray-500 py-2 min-w-max">
    <div class="p-1 flex justify-between" >
      <div>
        <b-btn
          size="sm"
          variant="dark"
          v-b-modal.create-simulation-modal
          v-b-tooltip.hover
          title="시뮬레이션 등록"
        >
          <b-icon icon="file-earmark-plus"/>
        </b-btn>
        <b-btn
          size="sm"
          variant="dark"
          v-b-toggle.collapse1
          v-b-tooltip.hover
          title="시뮬레이션 비교"
        >
          <b-icon icon="files"/>
        </b-btn>
      </div>
      <div>
        <b-btn
          size="sm"
          variant="dark"
          @click.stop="updateTable"
          title="새로고침"
          v-b-tooltip.hover
        >
            <b-icon icon="arrow-clockwise"/>
        </b-btn>
        <b-btn
          :pressed.sync="autoRefresh"
          :variant="autoRefresh ? 'info' : 'outline-secondary'"
          size="sm"
          variant="info"
          v-b-tooltip.hover
          title="테이블을 주기적으로 업데이트합니다."
        >
          <b-icon v-if="!autoRefresh" icon="arrow-clockwise"/>
          <b-iconstack v-if="autoRefresh" font-scale="1" animation="spin">
            <b-icon stacked icon="slack" variant="info" scale="0.75" shift-v="-0.25"></b-icon>
            <b-icon stacked icon="slash-circle" variant="light"></b-icon>
          </b-iconstack>
        </b-btn>
      </div>
    </div>

    <div class="">
      <b-alert
        :show="warning"
        dismissible variant="warning"
      >
        {{ warning }}
      </b-alert>
      <!-- <b-row class="m-0 p-0"> -->
        <!-- <b-col md="12" class="m-0 p-0"> -->


          <!-- simulation drop area -->
            <b-collapse id="collapse1" class="mt-0">
              <!-- <b-card-group deck> -->
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
              <!-- </b-card-group> -->
            </b-collapse> <!-- simulation drop area -->
            <b-btn
              variant="warning"
              v-if="selected.length >= 2"
              size="sm"
              @click.stop="compare"
            >
              <b-icon icon="bar-chart-fill"></b-icon> 비교
            </b-btn>

        <!-- </b-col> -->
      <!-- </b-row> -->
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

        <template v-slot:cell(duration)="row">

            <div>{{ row.item.configuration.fromTime + ' ~ ' + row.item.configuration.toTime}} </div>

        </template>
        <template v-slot:cell(status)="row">
          <h5><b-badge :variant="statusColor(row.item.status)" class="">
            <b-icon v-if="row.item.status === 'running'" icon="gear-fill" variant="light" animation="spin" font-scale="1"></b-icon>
            <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" variant="light" font-scale="1"></b-icon>
            <b-icon v-else icon="shield-fill-check" variant="light" font-scale="1"></b-icon>
            <span>{{ row.item.status.toUpperCase() }}</span>
          </b-badge>
          </h5>
        </template>
        <!-- <template v-slot:cell(statusText)="row"> -->

        <!-- </template> -->

        <template v-slot:cell(actions)="row">
          <button
            @click.stop="startSimulation(row.item.id, row.index, $event.target)"
            v-b-tooltip.hover
            title="시뮬레이션을 시작합니다."
            class="px-1 bg-indigo-400 hover:bg-indigo-500 rounded"
          >
              <b-icon icon="play-fill"/>
          </button>
            <!-- :disabled="row.item.status !== 'running'" -->
          <button
            @click.stop="stopSimulation(row.item.id, row.index, $event.target)"
            v-b-tooltip.hover
            title="시뮬레이션을 중지합니다."
            class="px-1 bg-yellow-400 hover:bg-yellow-500 rounded"
          >
              <b-icon icon="stop-fill"/>
          </button>
          <router-link
            :to="{ name: 'SimulationResultMap', params: {id: row.item.id}}"

            class="px-1 py-1 bg-blue-200 hover:bg-blue-500 rounded"
            >
              <b-icon icon="zoom-in"></b-icon>
          </router-link>
          <button
            class="px-1 bg-red-400 hover:bg-red-500 rounded"
            @click.stop="removeSimulation(row.item)">
              <b-icon icon="trash-fill" aria-hidden="true"/>
          </button>
        </template>

        <template v-slot:cell(details)="row">

         </template>
         <template v-slot:cell(del)="row">
        </template>
        <template v-slot:row-details="row">
          <b-card bg-variant="secondary" text-variant="light">
            <div style="overflow-wrap: break-word; max-width:1024px">
                {{row.item.error }}
            </div>
            <!-- <b-alert
              v-if="row.item.error && row.item.status === 'error'"
              class="mb-1 p-2"
              variant="danger"
              show
              style="overflow-wrap: break-word;"
            >
              {{row.item.error }}
            </b-alert> -->
            <div>
              <h5> <b-badge variant="dark">
                {{ row.item.envName }}
                </b-badge>
              </h5>
              <h5> <b-badge variant="dark">
                <b-badge variant="dark">시뮬레이션 걸린시간: </b-badge>
                <b-badge>{{ calcDuration(row.item) }} </b-badge>
              </b-badge>
              </h5>
              <h5><b-badge variant="dark"> {{ row.item.started }}</b-badge> ~ <b-badge variant="dark">{{ row.item.ended }}</b-badge></h5>
            </div>
             <b-card bg-variant="dark" border-variant="dark" text-variant="light">
                <small>시뮬레이션 결과파일 분석</small>
                <b-input-group class="mt-1">
                  <b-form-file
                    accept=".csv"
                    v-model="resultFile"
                    placeholder="시뮬레이션 결과파일(.CSV)을 선택하세요.">
                  </b-form-file>
                  <b-input-group-append>
                    <b-button
                      variant="primary"
                      @click.prevent="uploadSimulatoinResultFile(row.item)">
                        <b-icon icon="upload"/>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
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
        title="시뮬레이션 등록"
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
          @simulationconfig:save="saveOptEnvConfig"
          :userId="userState.userId"
          modalName="create-simulation-modal"
          :intersectionField="false"
          :epochField="false"
          role="simulation"
          >
        </uniq-register>
      </b-modal>
    </div>
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
