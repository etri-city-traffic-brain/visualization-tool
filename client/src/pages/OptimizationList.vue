<template>
  <div class="min-w-max p-2 bg-gray-600">
    <div class="p-2 border-2 border-gray-400 rounded-xl space-y-2">
      <div class="text-white text-lg text-center font-bold bg-gray-700- w-40 py-1 rounded">신호최적화 환경</div>

      <div class="grid grid-cols-5 flex-wrap gap-2 max-w-full" v-if="false">
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
                @click="registerSimulation(env)">실험생성</button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div class="flex justify-between">
          <button class="items-center bg-blue-300 rounded p-1 px-2 text-sm text-center font-bold hover:bg-blue-700 hover:text-white" v-b-modal.create-simulation-modal>
            <svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>환경등록
          </button>
          <button class="bg-gray-700 rounded p-1 px-2 text-sm text-center font-bold text-white hover:bg-gray-800" @click.stop="reload" v-b-tooltip.hover> <b-icon icon="arrow-clockwise"/> 새로고침 </button>
        </div>

        <b-table hover small striped responsive ref="envs-table" table-variant="dark" head-variant="dark" foot-variant="dark" class="mt-1"
          :items="envItems"
          :fields="envFields"
          :current-page="envCurrentPage"
          :per-page="envPerPage"
        >
          <template v-slot:cell(envName)="row">
            {{ row.item.envName }}
          </template>
          <template v-slot:cell(epoch)="row">
            {{ row.item.configuration.epoch }}
          </template>
          <template v-slot:cell(duration)="row">
            {{ row.item.configuration.fromTime.slice(0, 5) }} ~
            {{ row.item.configuration.toTime.slice(0, 5) }}
          </template>
          <template v-slot:cell(junctions)="row">
            {{ numberOfJunctions(row.item.configuration.junctionId) }}
          </template>
          <template v-slot:cell(configuration.method)="row">
            {{ row.item.configuration.method.toUpperCase() }}
          </template>
          <template v-slot:cell(configuration.action)="row">
            {{ getActionName(row.item.configuration.action) }}
          </template>
          <template v-slot:cell(configuration.rewardFunc)="row">
            {{ getRewardFunctionName(row.item.configuration.rewardFunc) }}
          </template>
          <template v-slot:cell(configuration.period)="row">
            <div v-if="row.item.configuration.period >= 600" class="text-center font-bold p-1">
              {{ row.item.configuration.period / 60 }} 분
            </div>
            <div v-else class="text-center font-bold p-1">
              {{ row.item.configuration.period }} 초
            </div>
          </template>
          <template v-slot:cell(func)="row">
            <button class="bg-indigo-400 px-2 py-1 rounded text-sm font-bold hover:bg-indigo-700" @click="openModify(row.item)">수정</button>
            <button class="bg-blue-400 px-2 py-1 rounded text-sm font-bold hover:bg-blue-700" @click="registerSimulation(row.item)">실험생성</button>
            <button class="bg-gray-600 px-2 py-1 rounded text-sm text-black font-bold hover:bg-red-300" @click="remove(row.item.id)">X</button>
          </template>
         </b-table>
      </div>
    </div>
    <div class="p-2 border-2 border-gray-400 rounded-xl space-y-2 mt-2 min-w-max" >
      <div class="text-white font-bold bg-gray-700- w-40 text-center py-1 rounded text-lg">신호최적화 실험</div>
      <div fluid class="mt-0 p-1">
        <div class="flex justify-end">
          <!-- <b-btn
            variant="dark"
            size="sm"
            @click.stop="updateTable"
            v-b-tooltip.hover title="테이블을 업데이트합니다."
          >
            <b-icon icon="arrow-clockwise"/> 새로고침
          </b-btn> -->
          <button class="bg-gray-700 rounded p-1 px-2 text-sm text-center font-bold text-white hover:bg-gray-800" @click.stop="updateTable" v-b-tooltip.hover title="테이블을 업데이트합니다." > <b-icon icon="arrow-clockwise"/> 새로고침 </button>
        </div>

        <b-table hover small striped responsive ref="simulations-table" table-variant="dark" head-variant="dark" foot-variant="dark" class="mt-1"
          :items="items"
          :fields="fields"
          :current-page="currentPage"
          :per-page="perPage"
        >
          <template v-slot:cell(num)="row">
            <b-btn variant="dark" size="sm"
              @click="row.toggleDetails(); toggleDetails(row.item.id, row.item.status, row.detailsShowing);"
            >
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
             {{ numberOfJunctions(row.item.configuration.junctionId) }}
          </template>

          <template v-slot:cell(configuration.begin)="row">
            {{ row.item.configuration.fromTime.substring(0, 5) }}
          </template>

          <template v-slot:cell(configuration.end)="row">
            {{ row.item.configuration.toTime.substring(0, 5) }}
          </template>

          <template v-slot:cell(configuration.method)="row">
            {{ row.item.configuration.method.toUpperCase() }}
          </template>
          <template v-slot:cell(configuration.action)="row">
            {{ getActionName(row.item.configuration.action) }}
          </template>
          <template v-slot:cell(configuration.rewardFunc)="row">
            {{ getRewardFunctionName(row.item.configuration.rewardFunc) }}
          </template>

          <template v-slot:cell(details)="row">
            <button
              class="bg-indigo-400 px-2 py-1 rounded text-sm font-bold hover:bg-indigo-700"
              :to="{
                name: 'OptimizationResultMap',
                params: {id: row.item.id}
              }"
            >
              <b-icon icon="journal-check"/> 신호학습
            </button>
            <button
            class="bg-blue-400 px-2 py-1 rounded text-sm font-bold hover:bg-blue-700"
              :to="{ name: 'OptimizationResultComparisonMap', params: {id: row.item.id}}"
            >
              <!-- <b-icon icon="circle-square"></b-icon> -->
              🚥 신호적용
            </button>

            <button class="bg-gray-600 px-2 py-1 rounded text-sm text-black font-bold hover:bg-red-300" v-b-tooltip.hover
              @click.stop="stopSimulation(row.item.id, row.index, $event.target)"
              v-if="row.item.status === 'running'"
            >
              <b-icon icon="stop-fill"/> 중지
            </button>
            <button class="bg-gray-600 px-2 py-1 rounded text-sm text-black font-bold hover:bg-red-300" @click="removeSimulation(row.item)">X</button>


            <!-- <button class="bg-indigo-400 px-2 py-1 rounded text-sm font-bold hover:bg-indigo-700" @click="openModify(row.item)">수정</button>
            <button class="bg-blue-400 px-2 py-1 rounded text-sm font-bold hover:bg-blue-700" @click="registerSimulation(row.item)">실험생성</button>
            <button class="bg-gray-600 px-2 py-1 rounded text-sm text-black font-bold hover:bg-red-300" @click="remove(row.item.id)">X</button> -->

            <!-- <b-btn
              size="sm"
              variant="danger"
              class="mr-1"
              @click.stop="removeSimulation(row.item)">
                <b-icon icon="trash-fill" aria-hidden="true"/>
            </b-btn> -->
          </template>

          <template v-slot:row-details="row">
            <div class="grid grid-cols-2 gap-1">
              <div class="bg-gray-500 rounded-xl text-black p-4">
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
                </ul>
              </div>
              <div class="bg-gray-500 rounded-xl p-4 space-y-1" size="sm">
                <b-form-file accept=".zip" v-model="resultFile" placeholder="모델파일(.zip)을 선택하세요.">
                </b-form-file>
                <b-btn variant="primary" @click.prevent="uploadModel(row.item)">
                  업로드
                </b-btn>
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

    <b-modal title="신호 최적화 환경" id="create-simulation-modal" ref="modal" size="lg" header-border-variant="dark" header-bg-variant="dark" header-text-variant="light" body-bg-variant="dark" body-text-variant="ligth" body-border-variant="dark" header-class="pt-2 pb-0 no-border-round" body-class="p-2" hide-footer style="border-radius:0" @hide="modalHide" >
      <uniq-register @hide="hideCreateSimulationDialog" @optenvconfig:save="saveOptEnvConfig" :userId="userState.userId" modalName="create-simulation-modal" role="optimization" :intersectionField="true" :epochField="true" :env="currentEnv"> </uniq-register>
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
