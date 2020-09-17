<template>
  <div>
    <b-card>
      <b-form-group label-cols-sm="3" label="사용자" label-class="text-sm-right" label-for="userId">
        <b-form-input autofocus id="userId" v-model="userId" disabled></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="시뮬레이션 ID" label-class="text-sm-right" label-for="id">
        <b-form-input autofocus id="id" v-model="id"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="설명" label-class="text-sm-right" label-for="description">
        <b-form-input id="description" v-model="description"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="3" label="지역" label-class="text-sm-right">
        <b-input-group>
        <b-form-select v-model="areaSelected" :options="areaOptions" @change="selectArea" />
      <!-- </b-form-group>
      <b-form-group label-cols-sm="3" label="파티션" label-class="text-sm-right"> -->
        <b-form-select v-model="partitionSelected" :options="partitionOptions" class="ml-2"></b-form-select>
        </b-input-group>
      </b-form-group>
      <b-form-group
        label="From"
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
        label="To"
        label-cols-sm="3"
        label-class="text-sm-right"
        label-for="begineHour"
      >
        <b-input-group>
          <b-form-input v-model="toDate" type="date"/>
          <b-form-input v-model="toTime" type="time" class="ml-2"/>
        </b-input-group>
      </b-form-group>

      <b-form-group label-cols-sm="3" label="주기" label-class="text-sm-right" label-for="Period">
          <b-form-select v-model="periodSelected" :options="periodOptions" class="mb-3" />
      </b-form-group>
      <b-form-group label-cols-sm="3">
        <b-button class="mr-1" @click="save" variant="dark"> 시뮬레이션 등록 </b-button>
        <b-button class="mr-1" @click="cancel"> 취소 </b-button>
      </b-form-group>
    </b-card>
    <b-alert
      :show="msg.length > 0"
      :variant="variant"
      class="m-0"
    >
      <b-spinner small type="grow"/> {{ msg }} <b-spinner small type="grow"/>
    </b-alert>
  </div>
</template>

<script>

// import { HTTP } from '@/http-common';
import moment from 'moment';
// import * as R from 'ramda';

import simulationService from '@/service/simulation-service';

import areas from '../utils/areas';

const year = moment().year();
const m = moment().format('MM');
const random = () => `${Math.floor(Math.random() * 1000)}`
const randomId = () => `SALT_${year}${m}_${random().padStart(5, '0')}`;
const format = date => moment(date).format('YYYY-MM-DD');

export default {
  name: 'SimulationCreation',
  props: ['userId'],
  data() {
    return {
      id: randomId(),
      description: '...',
      fromDate: format(new Date()),
      toDate: format(new Date()),
      fromTime: '00:00',
      toTime: '23:59',
      periodSelected: 30,
      periodOptions: [
        { value: 10, text: '10분', },
        { value: 30, text: '30분', },
        { value: 60, text: '1시간', },
        { value: 120, text: '2시간', },
        { value: 240, text: '4시간', },
        { value: 360, text: '6시간', },
      ], // minutes
      partitionSelected: 0,
      partitionOptions2: [
        { value: 0, text: 'None' },
        { value: 2, text: '2개' },
        { value: 4, text: '4개' },
      ],
      partitionOptions: [
        { value: 0, text: 'None' },
        // { value: 2, text: '2개' },
        { value: 4, text: '4개' },
        { value: 8, text: '8개' },
        { value: 16, text: '16개' },
      ],
      areaSelected: 0,
      areaOptions: [ ...areas ],
      beginSelected: 0,
      endSelected: 23,
      msg: '',
      variant: 'info',
    };
  },
  methods: {
    resetForm() {
      this.id = randomId();
      this.description = '...';
    },
    selectArea(x) {
      if (x === 0) {
        this.partitionOptions = [ { value: 0, text: 'None' },
        // { value: 2, text: '2개' },
          { value: 4, text: '4개' },
          { value: 8, text: '8개' },
          { value: 16, text: '16개' },]
        return
      }
      this.partitionOptions = [
        { value: 0, text: 'None' },
        { value: 2, text: '2개' },
        { value: 4, text: '4개' },
      ]
    },
    async save(data) {
      const a = moment(`${this.fromDate} ${this.fromTime}`);
      const b = moment(`${this.toDate} ${this.toTime}`)
      const end = b.diff(a) / 1000;

      const days = b.diff(a, 'days') + 1
      const day = a.day()

      const dayMap = {
        1: 'mon',
        2: 'tue',
        3: 'wed',
        4: 'thu',
        5: 'fri',
        6: 'sat',
        0: 'sun'
      }

      const regionMap = {
        0: '4gu',
        11230: 'gn',
        11250: 'gd',
        11220: 'sc',
        11240: 'sp',
      }

      let routes = [`${regionMap[this.areaSelected]}_${dayMap[a.day()]}.xml`]

      if (days > 1 && days <8) {
        routes = new Array(days).fill('').map((v, i) => `${regionMap[this.areaSelected]}_${dayMap[(i+day)%7]}.xml`)
      }

      const obj = {
        id: this.id,
        user: this.userId,
        description: this.description,
        configuration: {
          region: this.areaSelected,
          day: a.day(),
          fromDate: this.fromDate,
          toDate: this.toDate,
          fromTime: `${this.fromTime}:00`,
          toTime: `${this.toTime}:00`,
          period: this.periodSelected * 60,
          partitions: this.partitionSelected,
          begin: 0,
          end,
          routes,
        },
      };
      // this.msg = this.periodSelected * 60 + ' ';
      this.msg = '시뮬레이션을 준비하고 있습니다...'
      this.variant = 'info';
      try {
        await simulationService.create(this.userId, obj);
        this.$emit('hide');
        this.resetForm();
        // console.log(obj);
      } catch (err) {
        console.log(err);
        this.msg = err.message;
        this.variant = 'danger'
      }

    },
    cancel() {
      this.$emit('cancel');
      this.resetForm();
    },
  },
};
</script>
