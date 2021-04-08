<template>
  <div>
    <b-card bg-variant="secondary" text-variant="light" no-body class="pr-2 pt-2">
      <b-form-group label-cols-sm="3" label="시뮬레이션 ID" label-class="text-sm-right" label-for="id">
        <b-form-input autofocus id="id" v-model="id" focus select></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="설명" label-class="text-sm-right" label-for="description">
        <b-form-input id="description" v-model="description"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="시뮬레이션 지역" label-class="text-sm-right">
        <b-input-group>
        <b-form-select v-model="areaSelected" :options="areaOptions" />
        </b-input-group>
      </b-form-group>
      <b-form-group
        label-cols-sm="3"
        label="교차로 ID"
        label-class="text-sm-right"
        label-for="id"
        v-if="intersectionField"
      >
        <b-input-group>
          <b-form-input id="junctionId" v-model="junctionId"></b-form-input>
          <b-input-group-append>
          <b-btn variant="dark" class="ml-1" @click="openSignalMap">선택</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </b-card>
     <b-card bg-variant="dark" border-variant="dark" text-variant="light" no-body class="pr-2 pt-3 mt-1">
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

    </b-card>

    <b-card bg-variant="secondary" text-variant="light" no-body class="pr-2 pt-2 mt-1">
      <b-form-group label-cols-sm="3" label="스크립트" label-class="text-sm-right">
        <b-form-select v-model="scriptSelected" :options="scriptOptions" />
      </b-form-group>
       <b-form-group label-cols-sm="3" label="통계 주기" label-class="text-sm-right" label-for="Period">
        <b-form-select v-model="periodSelected" :options="periodOptions" class="" />
      </b-form-group>

      <b-form-group label-cols-sm="3" label="가시화 주기" label-class="text-sm-right">
        <b-form-select v-model="intervalSelected" :options="intervalOptions" class="" />
      </b-form-group>

      <b-form-group
        label-cols-sm="3"
        label="Epoch"
        label-class="text-sm-right"
        label-for="id"
        v-if="epochField"
      >
        <b-form-input v-model="epoch"></b-form-input>
      </b-form-group>
    </b-card>

    <b-card bg-variant="dark" text-variant="light" border-variant="dark" class="mt-1">
      <b-card-text class="text-right" >
        <b-button class="mr-1" @click="register" variant="secondary" >
          등록  <b-spinner small label="Spinning" v-if="loading"></b-spinner>
        </b-button>
        <b-button class="mr-1" @click="hide" variant="secondary" >
          닫기
        </b-button>
      </b-card-text>
      </b-card-body>
    </b-card>

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
      style="border-radius:0"
    >
      <signal-map v-on:junction:select="selectJunction" @ok="junctionSelected"> </signal-map>
      <!-- <SignalEditor v-on:junction:select="selectJunction"/> -->
    </b-modal>
  </div>
</template>

<script src="./uniq-register">

</script>

<style scoped>
 .no-border-radius {
   border-radius: 10px;
 }
</style>
