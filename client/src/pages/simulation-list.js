
import moment from "moment";

import SimulationCreation from '@/components/SimulationCreation';
import BarChart from '@/components/charts/BarChart';

import { simulationService, statisticsService } from '@/service'

import userState from '@/user-state';
import calcInterval from '@/utils/calc-time-interval';

import dragDropMixin from './drag-drop-mixin';
import fileMgmtMixin from './file-mgmt-mixin';

import map from '@/region-code';

const variant = {
  finished: 'primary',
  running: 'success',
  error: 'danger',
  ready: 'secondary',
};

const { log } = console;

export default {
  name: 'SimulationList',
  components: {
    BarChart,
    SimulationCreation,
  },
  mixins: [dragDropMixin, fileMgmtMixin],
  data() {
    return {
      fields: [
        { class: "text-center", key: "num", label: "#" },
        { class: "text-center", key: "id", label: "시뮬레이션 아이디", },
        { class: "text-center", key: "status", label: "상태" },
        { class: "text-center", key: "configuration.period", label: "주기" },
        { class: "text-center", key: "started", label: "시작" },
        { class: "text-center", key: "ended", label: "종료" },
        { class: "text-center", key: "actions", label: "도구" }
      ],
      items: [],
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      isBusy: false,
      msg: '',
      variant: 'info',
      barChartDataTable: {},
      resultFile: null, // upload file
      dataFile: null,
      warning: null,
      userState,
    };
  },
  methods: {
    calcDuration(configuration) {
      if(configuration.status === 'finished') {
        return calcInterval(configuration.started, configuration.ended)
      } else if(configuration.status === 'running') {
        return calcInterval(
          configuration.started,
          moment().format("YYYY-MM-DD HH:mm:ss")
        );
      }
      else {
        return ''
      }
    },
    statusColor(status) {
      const colors = {
        running: 'primary',
        error: 'danger',
        ready: 'secondary',
        finished: 'success',
      }
      return colors[status] || 'secondary'
    },
    getRegionName(code) {
      return map[code] || map[0]
    },
    async toggleDetails(id, status, hide) {
      if (!hide) {
        if (status === 'finished') {
          this.barChartDataTable[id] = await statisticsService.getSummaryChart(id);
          this.$forceUpdate();
        }
      } else {
        this.barChartDataTable[id] = {};
      }
    },
    showHideStart(value) {
      return value === 'ready' || value === 'stopped';
    },
    showHideResult(value) {
      return value === 'finished';
    },
    updateTable() {
      this.$refs['simulations-table'].refresh()
    },
    hideAlert() {
      setTimeout(() => {
        this.msg = ''
      }, 2000);
    },
    showInfo(item){
      if(item.error) {
        this.$swal( 'Problem', item.error, 'warning' )
      }
    },
    async startSimulation(id) {
      const { value: yes } = await this.$swal({
        title: '시뮬레이션을 시작합니다.',
        text: id,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '시작',
        cancelButtonText: '취소',
      });

      if (!yes) {
        return;
      }
      let seconds = 0;
      const interval = setInterval(() => {
        this.msg = `시뮬레이션을 시작하고 있습니다... ${seconds++}초`;
      }, 1000);
      try {
        await simulationService.startSimulation(id, this.userState.userId);
        this.msg = 'Started successfully...';
        this.hideAlert();
        this.updateTable();

      } catch (err) {
        log(err);
        if (err.response) {
          this.msg = err.response.data.error;
        } else {
          this.msg = err.message;
        }
        this.variant = 'danger'
        // this.updateTable();
      } finally {
        this.updateTable();
        clearInterval(interval);
      }
    },
    async stopSimulation(id) {
      await simulationService.stopSimulation(id);
      this.updateTable();
    },
    async dataProvider({ currentPage }) {
      const { data, total } = (await simulationService.getSimulations(this.userState.userId, currentPage)).data;
      this.totalRows = total;
      return data;
    },
    status(text) {
      return variant[text];
    },
    async removeSimulation(param) {
      const result = await this.$swal({
        title: `${param.id} 시뮬레이션을 삭제합니다.`,
        text: 'Please note that you can not cancel it',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      });

      if (!result.value) {
        return;
      }
      this.msg = `${param.id}를 삭제하고 있습니다.`
      try {
        await simulationService.remove(param.id);
        this.updateTable();
        this.msg = `${param.id} is deleted successfully...`
        this.hideAlert();
      } catch (err) {
        log(err.response);
        this.msg = err.response.data.error;
        this.variant = "danger"
        this.$swal.fire({
          type: 'error',
          title: err.message,
          text: err.response.data.error,
        })
      }
    },
    hideCreateSimulationDialog() {
      this.$root.$emit('bv::hide::modal', 'create-simulation-modal');
      this.updateTable();
    },
    cancelCreateSimulation() {
      this.$root.$emit('bv::hide::modal', 'create-simulation-modal');
    },
  },
};