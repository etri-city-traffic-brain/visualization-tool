<template>
  <div style="min-width:840px;">
    <b-container fluid>
      <b-alert
        :show="warning"
        dismissible
        variant="warning"
      >
        {{ warning }}
      </b-alert>
      <b-row>
        <b-col md="12" class="my-2">
          <b-button size="sm" variant="dark" v-b-modal.create-simulation-modal >
            <b-icon icon="file-earmark-plus"/> 시뮬레이션 등록
          </b-button>
          <b-btn size="sm" variant="dark" v-b-toggle.collapse1 v-b-tooltip.hover >
            <b-icon icon="files"/> 시뮬레이션 비교
          </b-btn>
          <b-btn size="sm" class="mr-1" variant="dark" @click.stop="updateTable" >
            <b-icon icon="arrow-clockwise"/> 새로고침
          </b-btn>
          <b-btn variant="warning" v-if="selected.length >= 2" size="sm" @click.stop="compare">분석 </b-btn>
          <!-- simulation drop area -->
          <b-collapse id="collapse1" class="mt-1">
            <b-card-group deck>
              <b-card
                class="mb-2"
                @drop="drop"
                @dragover="dragover"
              >
                <h5 v-if="selected.length === 0" >
                  시뮬레이션 이름을 선택 후 여기로 드래그&드랍 하세요.
                </h5>
                <b-badge class="mx-2 p-2"
                  @click="deleteSelected(item)"
                  href="#"
                  v-for="item in selected"
                  :key="item"
                  v-b-tooltip.hover
                  title="클릭하면 제거됩니다."
                >
                  {{ item }}
                </b-badge>
              </b-card>
            </b-card-group>
          </b-collapse> <!-- simulation drop area -->
        </b-col>
      </b-row>
      <!----------------------->
      <!-- Simulation List   -->
      <!----------------------->
      <b-table bordered outlined striped hover small
        ref="simulations-table"
        head-variant="light"
        foot-variant="light"
        :busy.sync="isBusy"
        :items="dataProvider"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
      >
        <template v-slot:cell(num)="row">
          <b-button
            variant="secondary"
            size="sm"
            @click="row.toggleDetails(); toggleDetails(row.item.id, row.item.status, row.detailsShowing);">
            {{ row.detailsShowing ? '-' : '+'}}
          </b-button>
        </template>

        <template v-slot:cell(id)="row" >
          <div draggable="true" @dragstart="drag" :data-id="row.item.id">
            <!-- <b class="text-info">{{ row.item.id.toUpperCase() }}</b> -->
             <h5 class="m-0"><b-badge class="p-2" :variant="statusColor(row.item.status)">{{ row.item.id.toUpperCase() }}</b-badge></h5>
          </div>
        </template>

        <template v-slot:cell(status)="row">
          <b-icon v-if="row.item.status === 'running'" icon="clock" :variant="statusColor(row.item.status)" animation="spin" font-scale="2"></b-icon>
          <b-icon v-else-if="row.item.status === 'error'" icon="exclamation-square-fill" :variant="statusColor(row.item.status)" font-scale="2"></b-icon>
          <b-icon v-else icon="check-square-fill" :variant="statusColor(row.item.status)" font-scale="2"></b-icon>
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
               <b-icon icon="play-fill"/> 시작
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
          <b-button
            size="sm"
            variant="secondary"
            :to="{ name: 'SimulationResultMap', params: {id: row.item.id}}"
            v-if="row.item.status !== 'error'"
            >
              상세보기
          </b-button>
          <b-button
            size="sm"
            variant="danger"
            class="mr-1"
            @click.stop="removeSimulation(row.item)">
              <b-icon icon="x" aria-hidden="true"/>
          </b-button>
        </template>
        <template v-slot:row-details="row">
          <b-alert class="mb-1 p-2" v-if="row.item.error && row.item.status === 'error'"  show variant="danger">{{row.item.error }}</b-alert>
          <b-card
            header-text-variant="white"
            header-tag="header"
            header-bg-variant="dark"
            header="시뮬레이션 결과 업로드"
            class="mt-2"
            style="max-width:400px"
          >
            <p>파일을 선택하거나 드래그해서 놓으세요.(.csv)</p>
            <b-form-file
              accept=".csv"
              v-model="resultFile"
              :state="Boolean(resultFile)"
              placeholder="파일 선택...">
            </b-form-file>
            <b-button
              class="mt-2"
              variant="dark"
              @click.prevent="uploadSimulatoinResultFile(row.item)">
                업로드
              </b-button>
          </b-card>

          <b-button size="sm" class="mt-1" @click="row.toggleDetails">닫기</b-button>
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
      <!-- MODAL: SIMULATION CREATION //-->
      <b-modal
        title="시뮬레이션 등록"
        id="create-simulation-modal"
        ref="create-simulation-modal"
        size="lg"
        hide-footer
      >
        <simulation-creation
          @cancel="cancelCreateSimulation"
          @hide="hideCreateSimulationDialog"
          :msg="msg"
          :userId="userState.userId"
          >
        </simulation-creation>
      </b-modal>
    </b-container>
  </div>
</template>

<script src="./simulation-list.js"> </script>

<style>

table tbody td {
  vertical-align:middle !important;
}

</style>
