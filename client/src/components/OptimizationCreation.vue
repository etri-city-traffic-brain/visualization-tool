<template>
  <!-- <b-modal
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
    hide-footer
    header-class="pt-2 pb-0"
  > -->
  <div>
    <b-card class="p-0 m-0" >
      <!-- <b-form-group label-cols-sm="3" label="User ID" label-class="text-sm-right" label-for="userId">
        <b-form-input autofocus id="userId" v-model="userId" disabled></b-form-input>
      </b-form-group> -->
      <b-form-group label-cols-sm="3" label="시뮬레이션 ID" label-class="text-sm-right" label-for="id">
        <b-form-input autofocus id="id" v-model="id" focus select></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="교차로 ID" label-class="text-sm-right" label-for="id">
        <!-- <b-form inline> -->
        <b-input-group>
          <b-form-input id="junctionId" v-model="junctionId"></b-form-input>
          <b-input-group-append>
          <b-btn class="ml-1" @click="openSignalMap">선택</b-btn>
          </b-input-group-append>
        </b-input-group>
        <!-- </b-form> -->
      </b-form-group>
      <b-form-group label-cols-sm="3" label="설명" label-class="text-sm-right" label-for="description">
        <b-form-input id="description" v-model="description"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="시뮬레이션 지역" label-class="text-sm-right">
        <b-input-group>
        <b-form-select v-model="areaSelected" :options="areaOptions" />
        <!-- <b-form-select v-model="partitionSelected" :options="partitionOptions" class="ml-2"></b-form-select> -->
        </b-input-group>
      </b-form-group>
      <b-form-group  label-cols-sm="3" label="" label-class="text-sm-right" label-for="">
        <b-form-checkbox-group
          id="checkbox-group-1"
          v-model="selected"
          :options="options"
          name="flavour-1"
        ></b-form-checkbox-group>
      </b-form-group>


      <b-form-group
        label="시뮬레이션 시작"
        label-cols-sm="3"
        label-class="text-sm-right"
        label-for="date"
      >
        <b-input-group>
          <b-form-input v-model="fromDate" type="date"/>
          <b-form-input v-model="fromTime" type="time" class="ml-2"/>
        </b-input-group>
      </b-form-group>
      <b-form-group
        label="시뮬레이션 종료"
        label-cols-sm="3"
        label-class="text-sm-right"
        label-for="begineHour"
      >
        <b-input-group>
          <b-form-input v-model="toDate" type="date"/>
          <b-form-input v-model="toTime" type="time" class="ml-2"/>
        </b-input-group>
      </b-form-group>

      <b-form-group label-cols-sm="3" label="최적화 스크립트" label-class="text-sm-right">
        <b-form-select v-model="scriptSelected" :options="scripts" />
      </b-form-group>

      <b-form-group label-cols-sm="3" label="통계 주기" label-class="text-sm-right" label-for="Period">
        <b-form-select v-model="periodSelected" :options="periodOptions" class="" />
      </b-form-group>

      <b-form-group label-cols-sm="3" label="가시화 주기" label-class="text-sm-right">
        <b-form-select v-model="visualizationStepSelected" :options="visualizationStepOptions" class="" />
      </b-form-group>

      <b-form-group label-cols-sm="6" label-class="text-sm-right" label-for="Period" >
        <b-button class="mr-1" @click="save" variant="primary" >
          신호최적화 등록
        </b-button>
        <b-button class="mr-1" @click="hide" variant="dark" >
          닫기
        </b-button>
      </b-form-group>
      </b-card>
    <!-- </b-card> -->
    <b-alert
      :variant="variant"
      class="mt-1 text-center"
      :show="status === 'running' || status === 'error'"
    >
      <b-spinner small />
      {{ msg.toUpperCase() }}
    </b-alert>



    <b-modal
        title="최적화 등록"
        id="create-simulation-modal"
        ref="signal-map"
        size="xl"
        header-border-variant="dark"
        header-bg-variant="dark"
        header-text-variant="light"
        body-bg-variant="dark"
        body-text-variant="ligth"
        body-border-variant="dark"
        header-class="pt-2 pb-0"
        hide-footer
      >
        <!-- <signal-map > </signal-map> -->
        <SignalEditor v-on:junction:select="selectJunction"/>
    </b-modal>

  </div>
  <!-- </b-modal> -->
</template>

<script src="./optimization-creation">

</script>

<style scoped>
 .no-border-radius {
   border-radius: 10px;
 }
</style>
