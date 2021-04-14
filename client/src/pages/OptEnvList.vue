<template>
  <div>
     <b-card
      bg-variant="dark"
      border-variant="dark"
      text-variant="light"
      style="min-width:840px; border-radius:0"
      no-body
    >
      <b-card-body class="p-1 d-flex">
        <b-btn variant="outline-secondary" size="sm" v-b-modal.create-simulation-modal>
            <b-icon icon="plus-square"></b-icon> 등록
          </b-btn>
      </b-card-body>
     </b-card>
    <b-container fluid class="" style="background-color: black;">

      <div class="d-flex flex-wrap p-2">
        <b-card
          style="min-width:260px;max-width:260px"
          v-for="env of envs"
          :key="env.envName"
          class="p-0 m-1"
          no-body
          bg-variant="dark"
          text-variant="light"
        >
          <div class="text-right m-1" style="">
            <b-badge href="#" @click="" variant="info" v-b-tooltip.hover title="실험환경 다운로드">
              <b-icon icon="download"></b-icon>
            </b-badge>
            <b-badge href="#" @click="openModify(env)" variant="warning">M</b-badge>
            <b-badge href="#" @click="remove(env.id)" variant="danger">X</b-badge>
            <hr style="border-top: 1px dashed grey">
          </div>

          <b-card-body class="p-1">
          <b-card-text class="text-left">
            🚦 {{ env.envName }}
          </b-card-text>
            <b-card-text class="ml-1">
              대상 시간 : <b-badge>{{ env.configuration.fromTime }}</b-badge> ~ <b-badge>{{ env.configuration.toTime }}</b-badge>
            </b-card-text>
            <b-card-text style="height:60px;" class="ml-1">
              <!-- 대상 교차로: {{ env.configuration.junctionId || 'None' }} -->
              대상교차로:
              <b-badge
                v-for="(item, idx) of env.configuration.junctionId.split(',')"
                :key="idx"
                class="ml-1"
              >
                {{ item.slice(0,11) }}
              </b-badge>
            </b-card-text>
            <b-card-text class="text-right">
              <!-- <b-btn size="sm" variant="secondary" @click="openModify(env)">수정</b-btn> -->
              <!-- <b-btn size="sm" variant="secondary">복제</b-btn> -->
              <!-- <b-btn
                @click=""
                size="sm"
                variant="secondary"
                v-b-tooltip.hover title="실험환경 다운로드"
              >
                <b-icon icon="download"></b-icon>
              </b-btn>
               -->
               <!-- <hr style="border-top: 1px solid grey"> -->
              <b-btn
                block
                size="sm"
                href="#"
                variant="outline-secondary"
                squared
                v-b-tooltip.hover
                title="시뮬레이션을 등록합니다."
                @click="registerSimulation(env)"
              >
                신호 최적화 등록
              </b-btn>
            </b-card-text>
          </b-card-body>
        </b-card>
      </div>
    </b-container>

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
