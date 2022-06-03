<template>
  <div class="min-w-max p-2 bg-gray-600">
    <div class="p-2 border-2 border-gray-400 rounded-xl space-y-2">
      <div class="text-white text-lg text-center font-bold bg-gray-700- w-32 py-1 rounded">최적화 환경</div>

      <div class="grid grid-cols-5 flex-wrap gap-2 max-w-full">
        <div class="bg-gray-700 grid rounded-xl">
          <button class="rounded p-2 text-4xl text-center font-bold text-white hover:bg-gray-800"
            v-b-modal.create-simulation-modal>
            +
          </button>
        </div>
        <div v-for="env of envs" :key="env.envName" class="text-white min-w-max">
          <div class="bg-gray-700 p-2 rounded-xl min-h-full">
            <div class="flex justify-between items-center font-bold text pt-1 mb-2">
              <div>⚙️ {{ env.envName }} </div>
              <div>
                <button class="bg-gray-600 px-2 py-1 rounded text-xs text-black font-bold hover:bg-red-300" @click="remove(env.id)">X</button>
              </div>
            </div>
            <div class="grid grid-cols-3 text-xs gap-1">
              <div class="bg-yellow-50 text-black p-1 rounded text-center">
                <div>통계주기</div>
                <div v-if="env.configuration.period >= 600" class="text-center text-lg font-bold">
                  {{ env.configuration.period / 60 }}분
                </div>
                <div v-else class="text-center text-lg font-bold">
                  {{ env.configuration.period }}초
                </div>
              </div>
              <div class="bg-yellow-50 text-black p-1 rounded text-center">
                <div> Epoch</div>
                <div class="text-center text-lg font-bold">{{ env.configuration.modelSavePeriod }}/{{ env.configuration.epoch }}</div>
              </div>
              <div class="bg-green-50 text-black p-1 rounded text-center">
                <div> Action</div>
                <div class="text-center text-lg font-bold">{{ env.configuration.action }}</div>
              </div>
              <div class="bg-yellow-50 text-black p-1 rounded text-center">
                <div> Method</div>
                <div class="text-center text-lg font-bold">{{ env.configuration.method }}</div>
              </div>
              <div class="bg-yellow-50 text-black p-1 rounded text-center">
                <div> 보상함수</div>
                <div class="text-center text-lg font-bold">{{ env.configuration.rewardFunc }}</div>
              </div>
              <div class="bg-yellow-50 text-black p-1 rounded">
                <div class="text-center">
                  Duration
                </div>
                <div class="text-center text-lg font-bold">{{ env.configuration.end - env.configuration.begin + 60 }}
                </div>
              </div>
            </div>

            <div class="bg-blue-50 mt-1 p-2 rounded text-sm font-bold">
              <div class="text-black mb-1">교차로</div>
              <div class="flex flex-wrap">
                <div v-for="j of env.configuration.junctionId.split(',')" :key="j"
                  class="bg-blue-300 rounded px-1 ml-1 text-black text-xs">
                  {{ j }}</div>
              </div>
            </div>
            <div class="flex justify-end space-x-2 pt-2">
              <!-- <b-btn size="sm" @click="openModify(env)" variant="info">수정</b-btn> -->
              <!-- <b-btn size="sm" @click="remove(env.id)" variant="danger">삭제</b-btn> -->
              <!-- <b-btn size="sm" @click="registerSimulation(env)" variant="primary">실험 </b-btn> -->
              <button class="bg-indigo-400 px-2 py-1 rounded text-sm font-bold hover:bg-indigo-700"
                @click="openModify(env)">수정</button>
              <!-- <button class="bg-yellow-400 px-2 py-1 rounded text-sm text-black font-bold hover:bg-yellow-700"
                @click="remove(env.id)">삭제</button> -->
              <button class="bg-blue-400 px-2 py-1 rounded text-sm font-bold hover:bg-blue-700"
                @click="registerSimulation(env)">실험</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="p-2 border-2 border-gray-400 rounded-xl space-y-2 mt-2 min-w-max" >
      <div class="text-white font-bold bg-gray-700- w-32 text-center py-1 rounded text-lg">최적화 실험</div>
      <div fluid class="mt-0 p-1">
        <div class="flex justify-end">
          <b-btn
            variant="dark"
            size="sm"
            @click.stop="updateTable"
            v-b-tooltip.hover title="테이블을 업데이트합니다."
          >
            <b-icon icon="arrow-clockwise"/> 새로고침
          </b-btn>
        </div>
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
            <b-btn
              variant="dark"
              size="sm"
              @click="row.toggleDetails(); toggleDetails(row.item.id, row.item.status, row.detailsShowing);">
              <b-icon icon="arrow-up" v-if="row.detailsShowing"></b-icon>
              <b-icon icon="arrow-down" v-else></b-icon>
            </b-btn>
          </template>

          <template v-slot:cell(id)="row" >
            <div draggable="true" @dragstart="drag" :data-id="row.item.id">
              <span
                variant="link"
                href="#"
                v-b-tooltip.hover
                :title="row.item.envName">{{ row.item.id.toUpperCase() }}
              </span>
            </div>
          </template>

          <template v-slot:cell(status)="row">
            <div :class="statusColor(row.item.status)" class="text-center font-bold p-1">
              {{ row.item.status.toUpperCase() }}
            </div>
          </template>

          <template v-slot:cell(configuration.period)="row">
            <div v-if="row.item.configuration.period >= 600" class="text-center font-bold p-1">
              {{ row.item.configuration.period / 60 }} 분
            </div>
            <div v-else class="text-center font-bold p-1">
              {{ row.item.configuration.period }} 초
            </div>
          </template>

          <template v-slot:cell(duration)="row">
            {{ row.item.configuration.fromTime.slice(0, 5) }} ~
            {{ row.item.configuration.toTime.slice(0, 5) }}
          </template>

          <template v-slot:cell(epoch)="row">
            <span>{{row.item.epoch || 0}}</span>
          </template>

          <template v-slot:cell(statusText)="row">
            <b-alert :variant="statusColor(row.item.status)" class="m-0 p-0" show size="sm">{{ row.item.status.toUpperCase() }}</b-alert>
          </template>

          <template v-slot:cell(actions)="row">
            {{ row.item.configuration.junctionId.split(',').length}}
          </template>

          <template v-slot:cell(configuration.begin)="row">
            {{ row.item.configuration.fromTime.substring(0, 5) }}
          </template>

          <template v-slot:cell(configuration.end)="row">
            {{ row.item.configuration.toTime.substring(0, 5) }}
          </template>

          <template v-slot:cell(stop)="row">
            <b-btn
              size="sm"
              variant="secondary"
              v-b-tooltip.hover

              @click.stop="stopSimulation(row.item.id, row.index, $event.target)"
              v-if="row.item.status === 'running'">
                <b-icon icon="stop-fill"/> 중지
            </b-btn>
            <b-btn
              size="sm"
              variant="danger"
              class="mr-1"
              @click.stop="removeSimulation(row.item)">
                <b-icon icon="trash-fill" aria-hidden="true"/>
            </b-btn>

          </template>
          <template v-slot:cell(analisys)="row">

          </template>
          <template v-slot:cell(details)="row">
            <b-button
              size="sm"
              variant="primary"
              :to="{
                name: 'OptimizationResultMap',
                params: {id: row.item.id}
              }"
            >
              <b-icon icon="journal-check"/> 학습
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

          </template>

          <template v-slot:row-details="row">
            <div class="grid bg-gray-500 rounded-xl text-black p-4">
              <div class="">
                <div class="font-bold bg-gray-700 text-white p-2 rounded w-40 text-center">신호 최적화 정보</div>
                <ul class="list-disc space-y-1 ml-3 p-2 text-white">
                  <li class="">
                    환경: {{ row.item.envName }}
                  </li>
                  <li class="">
                    상태: {{ row.item.status.toUpperCase() }}
                  </li>
                  <li class="">
                    지역: {{ row.item.configuration.region }}
                  </li>
                  <li class="">
                    최적화 대상 교차로: {{ row.item.configuration.junctionId }}
                  </li>
                  <li class="">
                    도커이미지: {{ row.item.configuration.dockerImage }}
                  </li>
                  <li class="">
                    등록일: {{ row.item.configuration.created }}
                  </li>
                </ul>
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


      <b-modal title="신호 최적화 환경"
      id="create-simulation-modal" ref="modal" size="lg" header-border-variant="dark"
      header-bg-variant="dark" header-text-variant="light" body-bg-variant="dark" body-text-variant="ligth"
      body-border-variant="dark" header-class="pt-2 pb-0 no-border-round" body-class="p-2" hide-footer
      style="border-radius:0" @hide="modalHide">
      <uniq-register @hide="hideCreateSimulationDialog" @optenvconfig:save="saveOptEnvConfig" :userId="userState.userId"
        modalName="create-simulation-modal" role="optimization" :intersectionField="true" :epochField="true"
        :env="currentEnv">
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
