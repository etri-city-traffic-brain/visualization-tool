<template>
  <div style="min-width:840px;">
    <!--
    <b-navbar  type="light" variant="secondary" class="p-0">
      <b-navbar-nav align="end">
        <b-nav-item href="#" v-b-modal.create-simulation-modal>
          <b-btn size="sm"><b-icon icon="file-earmark-plus"/> <strong>최적화 등록</strong></b-btn>
        </b-nav-item>
        <b-nav-item href="#" v-b-toggle.collapse1 v-b-tooltip.hover><b-icon icon="files"/> 강화학습 모델 비교</b-nav-item>
        <b-nav-item href="#" v-if="!autoRefresh" @click.stop="updateTable">
          <b-btn size="sm"><b-icon icon="arrow-clockwise"/> 새로고침</b-btn>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    -->
    <!-- <b-card bg-variant="secondary" text-variant="white" style="border-radius:0" no-body>
      <b-collapse id="collapse1" class="mt-1">
        <b-card-group deck>
          <b-card
            class="mb-2"
            @drop="drop"
            @dragover="dragover"
            bg-variant="secondary"
            border-variant="secondary"
          >
            <span v-if="selected.length === 0" >
              시뮬레이션 이름을 선택 후 여기로 드래그&드랍 하세요.
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
          </b-card>
        </b-card-group>
      </b-collapse>
      <b-btn variant="warning" v-if="selected.length >= 2" size="sm" @click.stop="compare"> <b-icon icon="bar-chart-fill"></b-icon> 비교 </b-btn>
      <b-btn v-if="selected.length>0" href="#" class="m-0" v-b-toggle.collapse1 v-b-tooltip.hover variant="dark" size="sm">
        <b-icon icon="x"/> 닫기
      </b-btn>
    </b-card> -->
    <b-container fluid class="mt-1">
      <b-alert :show="warning" dismissible variant="warning" > {{ warning }} </b-alert>
      <b-row>
        <b-col md="12">
          <!-- <b-button size="sm" variant="dark" v-b-modal.create-simulation-modal > <b-icon icon="file-earmark-plus"/> 시뮬레이션 등록 </b-button> -->
          <!-- <b-btn size="sm" variant="dark" v-b-toggle.collapse1 v-b-tooltip.hover > <b-icon icon="files"/> 시뮬레이션 비교 </b-btn> -->
          <!-- <b-btn size="sm" class="mr-1" variant="dark" @click.stop="updateTable" > <b-icon icon="arrow-clockwise"/> 새로고침 </b-btn> -->
        </b-col>
      </b-row>
      <b-row>
        <b-col class="">
          <b-form inline>
          <b-btn size="sm" v-b-modal.create-simulation-modal><b-icon icon="file-earmark-plus"/> <strong>최적화 등록</strong></b-btn>
          <b-btn size="sm"  v-if="!autoRefresh" @click.stop="updateTable" class="ml-1"><b-icon icon="arrow-clockwise"/> 새로고침</b-btn>
          <b-form-checkbox class="ml-1" v-model="autoRefresh" name="check-button" size="md" switch> 자동 새로고침 </b-form-checkbox>
          <!-- <b-btn v-if="!autoRefresh" size="sm" variant="link" href="#" @click.stop="updateTable"><b-icon icon="arrow-clockwise"/></b-btn> -->
           </b-form>
        </b-col>
      </b-row>
      <!----------------------->
      <!-- Simulation List   -->
      <!----------------------->
        <!-- :busy.sync="isBusy" -->
      <b-table bordered outlined striped hover small
        ref="simulations-table"
        head-variant="light"
        foot-variant="light"
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
          <b-button
            size="sm"
            variant="info"
            v-b-tooltip.hover
            title="시뮬레이션을 시작합니다."
            @click.stop="startSimulation(row.item.id, row.index, $event.target)"
            v-if="row.item.status === 'ready' || row.item.status === 'error' || row.item.status === 'stopped'"
            >
              <b-icon icon="play-fill"/> 최적화
          </b-button>
          <b-button
            size="sm"
            variant="warning"
            v-b-tooltip.hover
            title="시뮬레이션을 중지합니다."
            @click.stop="stopSimulation(row.item.id, row.index, $event.target)"
            v-if="row.item.status === 'running'">
              <b-icon icon="stop-fill"/> 중지
          </b-button>

          <!--
          <b-button
            size="sm"
            variant="dark"
            :to="{ name: 'SimulationResult', params: {id: row.item.id}}"
            v-if="row.item.status === 'finished'"
            >
              통계
          </b-button>
          -->
        </template>

         <template v-slot:cell(details)="row">
            <!-- v-if="row.item.status === 'finished' || row.item.status === 'running'" -->
          <b-button
            size="sm"
            variant="secondary"
            :to="{ name: 'OptimizationResultMap', params: {id: row.item.id}}"
            >
              <b-icon icon="zoom-in"></b-icon> 신호최적화
          </b-button>

          <b-button
            size="sm"
            variant="warning"
            v-b-tooltip.hover
            title="신호비교"
            :to="{ name: 'OptimizationResultComparisonMap', params: {id: row.item.id}}"
          >
            신호비교
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
          <div>
            <pre>{{JSON.stringify(row.item, false, 2).trim() }}</pre>
          </div>
        </template>
      </b-table>
       <b-alert
        :show="msg.length > 0"
        :variant="variant"
      >
        <b-spinner small type="grow"/> {{ msg }} <b-spinner small type="grow"/>
      </b-alert>
      <!-- PAGINATION //-->
      <b-pagination
        :total-rows="totalRows"
        :per-page="perPage"
        v-model="currentPage"
        first-text="First"
        prev-text="Prev"
        next-text="Next"
        last-text="Last"
        align="center"
        size="sm"
      />

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
        header-class="pt-1 pb-0 no-border-round"
        body-class="p-2"
        hide-footer
        centered_
      >
        <simulation-creation-panel
          @hide="hideCreateSimulationDialog"
          :userId="userState.userId"
          modalName="create-simulation-modal"
          >
        </simulation-creation-panel>
      </b-modal>
    </b-container>
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
