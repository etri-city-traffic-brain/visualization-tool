<template>
  <div>
    <!-- <b-card
      bg-variant="dark"
      border-variant="dark"
      text-variant="light"
      style="min-width:840px; border-radius:0"
      no-body
    > -->
      <!-- <div class="p-1 d-flex bg-gray-600">
        <b-btn variant="secondary" size="sm" v-b-modal.create-simulation-modal>
            <b-icon icon="plus"></b-icon>
          </b-btn>
      </div> -->
    <!-- </b-card> -->

    <div class="p-0 bg-gray-600 max-w-full min-h-screen">
      <div class="d-flex flex-wrap pb-1">

        <div class="text-white max-w-sm w-full md:max-w-sm bg-gray-700 hover:bg-gray-500 ml-1 mt-1 p-2 rounded-2xl " v-for="env of envs" :key="env.envName">
          <div class="px-2 py-1">
            <div class="font-bold text-lg">{{ env.envName }} </div>
            <p class="text-gray-400 text-base text-sm mt-1">
              {{ env.description }}
            </p>
            <p>주기: <span class="bg-purple-200 rounded px-2 text-black font-bold">{{ env.configuration.period }}</span></p>
            <div>
              대상시간: {{ env.configuration.fromTime }} ~ {{ env.configuration.toTime }}
            </div>
          </div>
          <div class="p-2">
             <b-btn size="sm" @click="openModify(env)" variant="info">수정</b-btn>
              <b-btn size="sm" @click="remove(env.id)" variant="danger">삭제</b-btn>
              <b-btn size="sm" @click="registerSimulation(env)" variant="primary">실험 </b-btn>
          </div>
        </div>
        <div class="text-white max-w-sm w-full md:max-w-sm bg-gray-700 hover:bg-gray-500 ml-1 mt-1 p-2 rounded-2xl ">
          <div class="w-full min-h-full flex flex-col justify-center items-center" v-b-modal.create-simulation-modal>
          <!-- <b-btn variant="secondary" size="sm" v-b-modal.create-simulation-modal> -->
            <div class="text-lg font-bold leading-10">추가</div>
            <!-- <b-icon icon="plus"></b-icon> -->
          <!-- </b-btn> -->
        </div>
        </div>

        <!-- <b-card
          style="min-width:300px;max-width:300px"
          v-for="env of envs"
          :key="env.envName"
          class="m-1"
          bg-variant="dark"
          border-variant="dark"
          text-variant="light"
        >
          <b-card-text>
            🚦 {{ env.envName }}
          </b-card-text>
          <b-card-text class="m-1">
            <h5>
              <b-badge>
                <b-badge>주기</b-badge>
                <b-badge variant="warning">{{ env.configuration.period }}</b-badge>
              </b-badge>
            </h5>
            <h5>
              <b-badge>
                <b-badge>대상시간</b-badge>
                <b-badge variant="primary">{{ env.configuration.fromTime }}</b-badge> ~
                <b-badge variant="primary">{{ env.configuration.toTime }}</b-badge>
              </b-badge>
            </h5>
            <p class="text-truncate"  v-b-tooltip.hover :title="env.configuration.junctionId.split(',')">
              <b-badge>신호목록</b-badge>
              <b-badge
                v-for="(item, idx) of env.configuration.junctionId.split(',')"
                :key="idx"
                class="mr-1"
              >
                {{ item }}
              </b-badge>
            </p>
          </b-card-text>
            <b-card-text class="text-right">
              <b-btn size="sm" @click="openModify(env)" variant="info">수정</b-btn>
              <b-btn size="sm" @click="remove(env.id)" variant="danger">삭제</b-btn>
              <b-btn size="sm" @click="registerSimulation(env)" variant="primary">실험 </b-btn>
            </b-card-text>
        </b-card> -->
      </div>
    </div>

    <b-modal
      title="최적화 등록"
      id="create-simulation-modal"
      ref="modal"
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
      style="border-radius:0"
      @hide="modalHide"
    >
      <uniq-register
        @hide="hideCreateSimulationDialog"
        @optenvconfig:save="saveOptEnvConfig"
        :userId="userState.userId"
        modalName="create-simulation-modal"
        role="optimization"
        :intersectionField="true"
        :epochField="true"
        :env="currentEnv"
      >
      </uniq-register>
  </b-modal>

  </div>
</template>

<script src="./opt-env-list"></script>
