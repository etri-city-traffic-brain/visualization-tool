<template>
  <div>
    <div class="p-1 bg-gray-400 max-w-full min-h-screen">
      <div class="ml-1">
        <button class="rounded p-2 bg-gray-700 text-center mx-auto font-bold text-white hover:bg-gray-800"
          v-b-modal.create-simulation-modal>
          <svg xmlns="http://www.w3.org/2000/svg" class="inline h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          등록
        </button>
      </div>
      <div class="grid grid-cols-5 min-w-max max-w-screen-lg">
        <div v-for="env of envs" :key="env.envName" class="text-white min-w-max">
          <div class="bg-gray-600 m-1 p-2 rounded-md min-h-full">
            <div class="font-bold text-md px-1 pt-1 mb-2">{{ env.envName }} </div>
            <div class="grid grid-cols-3 text-xs gap-1">
              <div class="bg-yellow-50 text-black p-1 rounded text-center">
                <div>저장주기</div>
                <div class="text-center text-xl font-bold">{{ env.configuration.modelSavePeriod }}</div>
              </div>
              <div class="bg-yellow-50 text-black p-1 rounded text-center">
                <div> Epoch</div>
                <div class="text-center text-xl font-bold">{{ env.configuration.epoch }}</div>
              </div>
              <div class="bg-yellow-50 text-black p-1 rounded">
                <div class="text-center">
                  Duration
                </div>
                <div class="text-center text-xl font-bold">{{ env.configuration.end - env.configuration.begin + 60 }}
                </div>
              </div>
            </div>

            <div class="bg-blue-50 mt-2 p-2 rounded text-sm font-bold">
              <div class="text-black mb-1">교차로</div>
              <div class="flex flex-wrap">
                <div v-for="j of env.configuration.junctionId.split(',')" :key="j"
                  class="bg-blue-300 rounded px-1 ml-1 text-black text-xs">
                  {{ j }}</div>
              </div>
            </div>
            <div class="pt-2 text-right">
              <!-- <b-btn size="sm" @click="openModify(env)" variant="info">수정</b-btn> -->
              <!-- <b-btn size="sm" @click="remove(env.id)" variant="danger">삭제</b-btn> -->
              <!-- <b-btn size="sm" @click="registerSimulation(env)" variant="primary">실험 </b-btn> -->
              <button class="bg-indigo-400 px-2 py-1 rounded text-sm font-bold hover:bg-indigo-700"
                @click="openModify(env)">수정</button>
              <button class="bg-yellow-400 px-2 py-1 rounded text-sm text-black font-bold hover:bg-yellow-700"
                @click="remove(env.id)">삭제</button>
              <button class="bg-blue-400 px-2 py-1 rounded text-sm font-bold hover:bg-blue-700"
                @click="registerSimulation(env)">실험</button>
            </div>
          </div>

        </div>
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

<script src="./opt-env-list"></script>
