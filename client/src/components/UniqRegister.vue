<template>
  <div>
    <b-card class="p-0 m-0" >
      <b-form-group label-cols-sm="3" label="시뮬레이션 ID" label-class="text-sm-right" label-for="id">
        <b-form-input autofocus id="id" v-model="id" focus select></b-form-input>
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
          <b-btn class="ml-1" @click="openSignalMap">선택</b-btn>
          </b-input-group-append>
        </b-input-group>
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

      <b-form-group label-cols-sm="6" label-class="text-sm-right" label-for="Period" >
        <b-button class="mr-1" @click="register" variant="primary" >
          등록
        </b-button>
        <b-button class="mr-1" @click="hide" variant="dark" >
          닫기
        </b-button>
      </b-form-group>
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
      >
        <SignalEditor v-on:junction:select="selectJunction"/>
    </b-modal>
  </div>
</template>

<script>

import moment from 'moment';

import simulationService from '@/service/simulation-service';
import SignalMap from '@/components/SignalMap';
import SignalEditor from '@/pages/SignalEditor';

const random = () => `${Math.floor(Math.random() * 1000)}`
const generateRandomId = (prefix = 'DEFU') => `${prefix.substring(0,4).toUpperCase()}_${moment().year()}${moment().format('MM')}_${random().padStart(5, '0')}`;
const format = date => moment(date).format('YYYY-MM-DD');
const getToday = () => format(new Date())

const periodOptions = [
  { value: 10, text: '10분', },
  { value: 30, text: '30분', },
  { value: 60, text: '1시간', },
  { value: 120, text: '2시간', },
  { value: 240, text: '4시간', },
  { value: 360, text: '6시간', },
]

const areaOptions = [
  { value: "250", text: "대전" },
  { value: "11230", text: "대전(실증지역)" },
  { value: "25040", text: "세종" },
  { value: "11240", text: "세종(실증지역)" },
]

const scriptOptions =  [
  { value: 'default.py', text: 'default.py' },
  { value: 'RL_2phase_pressure.py', text: 'RL_2phase_pressure.py' },
]

const intervalOptions = [
  { text: '10 Step', value: 10 },
  { text: '20 Step', value: 20 },
  { text: '30 Step', value: 30 },
  { text: '40 Step', value: 40 },
  { text: '50 Step', value: 50 },
  { text: '60 Step', value: 60 },
  { text: '70 Step', value: 70 },
  { text: '80 Step', value: 80 },
  { text: '90 Step', value: 90 },
  { text: '100 Step', value: 100 },
]

const { log } = console

export default {
  name: 'uniq-registration',
  props: ['userId', 'modalName', 'intersectionField', 'epochField', 'role'],
  components: {
    SignalMap,
    SignalEditor
  },
  data() {
    return {
      id: generateRandomId(this.role),
      description: '...',
      fromDate: getToday(),
      toDate: getToday(),
      fromTime: '07:00',
      toTime: '08:59',
      periodSelected: periodOptions[0].value,
      periodOptions: [...periodOptions],
      areaSelected: areaOptions[0].value,
      areaOptions: [ ...areaOptions ],
      scriptOptions: [ ...scriptOptions ],
      scriptSelected: scriptOptions[0].value,
      intervalSelected: intervalOptions[0].value,
      intervalOptions: [ ...intervalOptions ],
      junctionId: '563103625', // Yuseong Middle School
      epoch: 10,
    };
  },
  methods: {
    openSignalMap() {
      this.$refs['signal-map'].show()
    },
    resetForm() {
      this.id = generateRandomId(this.role);
      this.description = '...';
    },
    async register() {
      log('등록')
      const from = moment(`${this.fromDate} ${this.fromTime}`);
      const to = moment(`${this.toDate} ${this.toTime}`)
      const begin =  moment.duration(this.fromTime).asSeconds()
      const end = (to.diff(from) / 1000 - 1) + begin;
      const days = to.diff(from, 'days') + 1
      const day = from.day()
      try {
        await simulationService.create(this.userId, {
          id: this.id,
          user: this.userId,
          description: this.description,
          role: this.role,
          type: this.role,
          configuration: {
            region: this.areaSelected,
            fromDate: this.fromDate,
            toDate: this.toDate,
            fromTime: `${this.fromTime}:00`,
            toTime: `${this.toTime}:00`,
            period: this.periodSelected * 60,
            begin,
            end,
            day,
            days,
            interval: this.intervalSelected,
            junctionId: this.junctionId,
            script: this.scriptSelected,
            epoch: this.epoch,
          },
        });
      } catch (err) {
        log(err)
      }
      this.resetForm();
      this.hide();
    },
    hide() {
      this.$emit('hide');
      this.$bvModal.hide(this.modalName)
      this.resetForm();
    },
    selectJunction(junction) {
      this.$refs['signal-map'].hide()
      // this.junctionId = junction.id
    }
  },
};
</script>

<style scoped>
 .no-border-radius {
   border-radius: 10px;
 }
</style>
