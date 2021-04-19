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
          class="p-1 m-1"
          no-body
          bg-variant="dark"
          text-variant="light"
        >
          <div class="text-right m-0" style="">
            <!--
            <b-badge href="#" @click="" variant="info" v-b-tooltip.hover title="실험환경 다운로드">
              <b-icon icon="download"></b-icon>
            </b-badge>
            -->
            <b-badge href="#" @click="openModify(env)" variant="warning">M</b-badge>
            <b-badge href="#" @click="remove(env.id)" variant="danger">X</b-badge>
            <!-- <hr style="border-top: 1px dashed grey"> -->
          </div>

          <div>
            <b-card-text class="m-1">
              <div>
              <p class="text-truncate" style="font-weight: bold">🚦 {{ env.envName }}</p>
              </div>
              <h5>
              <b-badge>
                <b-badge>대상시간</b-badge>
                <b-badge variant="primary">{{ env.configuration.fromTime }}</b-badge> ~
                <b-badge variant="primary">{{ env.configuration.toTime }}</b-badge>
              </b-badge>
              </h5>
              <h5>
                <b-badge>
                  <b-badge>주기</b-badge>
                  <b-badge variant="warning">{{ env.configuration.period }}</b-badge>
                </b-badge>
              </h5>

              <!-- <div style="height:100px; max-height:100px; overflow-y:auto;overflow-x:hidden"> -->
              <!-- <h5><b-badge variant="secondary">신호</b-badge></h5> -->
              <p class="text-truncate"  v-b-tooltip.hover :title="env.configuration.junctionId.split(',')">
                <b-badge
                v-for="(item, idx) of env.configuration.junctionId.split(',')"
                :key="idx"
                class="mr-1"
              >
                {{ item }}
              </b-badge>
              </p>
              <!-- </div> -->



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
              <h5>
              <b-badge
                size="sm"
                href="#"
                variant="link"
                @click="registerSimulation(env)"
              >
                신호 최적화 실험
              </b-badge>
              </h5>
            </b-card-text>
          </div>
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
