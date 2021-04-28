
import moment from 'moment'

import SimulationCreationPanel from '@/components/SimulationCreation'
import UniqRegister from '@/components/UniqRegister'

import BarChart from '@/components/charts/BarChart'

import { simulationService, statisticsService } from '@/service'

import userState from '@/user-state'
import calcInterval from '@/utils/calc-time-interval'

import dragDropMixin from './drag-drop-mixin'
import fileMgmtMixin from './file-mgmt-mixin'

import map from '@/region-code'

const variant = {
  finished: 'primary',
  running: 'success',
  error: 'danger',
  ready: 'secondary'
}

const { log } = console

export default {
  name: 'SimulationList',
  components: {
    BarChart,
    SimulationCreationPanel,
    UniqRegister
  },
  mixins: [dragDropMixin, fileMgmtMixin],
  data () {
    return {
      fields: [
        { class: 'text-center', key: 'num', label: '#' },
        { class: 'text-center', key: 'id', label: '시뮬레이션 아이디' },
        { class: 'text-center', key: 'status', label: '진행상태' },
        // { class: 'text-center', key: 'statusText', label: '상태' },
        { class: 'text-center', key: 'configuration.period', label: '주기' },
        { class: 'text-center', key: 'duration', label: '대상시간' },
        // { class: 'text-center', key: 'ended', label: '종료' },
        { class: 'text-center', key: 'actions', label: '제어' },
        // { class: 'text-center', key: 'details', label: '상세' },
        // { class: 'text-center', key: 'del', label: '삭제' }
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
      modalShow: false,
      autoRefresh: false,
      expanded: false
    }
  },
  mounted () {
    this.dataProvider({ currentPage: this.currentPage })
    this.interval = setInterval(async () => {
      if (this.autoRefresh) {
        this.dataProvider({ currentPage: this.currentPage })
      }
    }, 3000)
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    calcDuration (configuration) {
      if (configuration.status === 'finished') {
        return calcInterval(configuration.started, configuration.ended)
      } else if (configuration.status === 'running') {
        return calcInterval(
          configuration.started,
          moment().format('YYYY-MM-DD HH:mm:ss')
        )
      }
    },
    statusColor (status) {
      const colors = {
        running: 'primary',
        error: 'danger',
        ready: 'secondary',
        finished: 'success'
      }
      return colors[status] || 'secondary'
    },
    getRegionName (code) {
      return map[code] || map[0]
    },
    async toggleDetails (id, status, hide) {
      if (!hide) {
        if (status === 'finished') {
          this.barChartDataTable[id] = await statisticsService.getSummaryChart(id)
          this.$forceUpdate()
        }
      } else {
        this.barChartDataTable[id] = {}
      }
    },
    showHideStart (value) {
      return value === 'ready' || value === 'stopped'
    },
    showHideResult (value) {
      return value === 'finished'
    },
    async updateTable () {
      // this.$refs['simulations-table'].refresh()
      this.dataProvider({ currentPage: this.currentPage })
    },
    hideAlert () {
      setTimeout(() => {
        this.msg = ''
      }, 2000)
    },
    showInfo (item) {
      if (item.error) {
        this.$swal('Problem', item.error, 'warning')
      }
    },
    async startSimulation (id) {
      const { value: yes } = await this.$swal({
        title: '시뮬레이션을 시작합니다.',
        text: id,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '시작',
        cancelButtonText: '취소'
      })

      if (!yes) {
        return
      }
      let seconds = 0
      const interval = setInterval(() => {
        this.msg = `시뮬레이션을 시작하고 있습니다... ${seconds++}초`
      }, 1000)
      try {
        await simulationService.startSimulation(id, this.userState.userId)
        this.msg = 'Started successfully...'
        this.hideAlert()
        this.updateTable()
      } catch (err) {
        log(err)
        if (err.response) {
          this.msg = err.response.data.error
        } else {
          this.msg = err.message
        }
        this.variant = 'danger'
        // this.updateTable();
      } finally {
        this.updateTable()
        clearInterval(interval)
      }
    },
    async stopSimulation (id) {
      await simulationService.stopSimulation(id)
      this.updateTable()
    },
    async dataProvider ({ currentPage }) {
      this.isBusy = true
      try {
        const { data, total, perPage } = (await simulationService.getSimulations(this.userState.userId, currentPage)).data
        this.totalRows = total
        this.isBusy = false
        this.perPage = perPage
        this.items = data
        return data
      } catch (err) {
        this.isBusy = false
        return []
      }
    },
    status (text) {
      return variant[text]
    },
    async saveOptEnvConfig (env) {
      try {
        await simulationService.createSimulation(this.userId, env)
      } catch (err) {
        log(err)
      }
    },
    async removeSimulation (param) {
      // const result = await this.$swal({
      //   title: `${param.id} 시뮬레이션을 삭제합니다.`,
      //   text: 'Please note that you can not cancel it',
      //   type: 'warning',
      //   showCancelButton: true,
      //   confirmButtonColor: '#3085d6',
      //   cancelButtonColor: '#d33',
      //   confirmButtonText: 'Delete',
      //   cancelButtonText: 'Cancel',
      // });

      // if (!result.value) {
      //   return;
      // }
      // this.msg = `${param.id}를 삭제하고 있습니다.`
      try {
        await simulationService.remove(param.id)
        this.updateTable()
        this.makeToast(`${param.id} is deleted successfully...`)
      } catch (err) {
        this.makeToast(`fail to delete ${err.message}`, 'warning')
      }
    },
    hideCreateSimulationDialog () {
      this.updateTable()
    },
    makeToast (msg, variant = 'info') {
      this.$bvToast.toast(msg, {
        title: variant,
        variant,
        autoHideDelay: 3000,
        appendToast: true,
        toaster: 'b-toaster-bottom-right'
      })
    }
  }
}
