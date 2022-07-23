import moment from 'moment'

import OptimizationCreationPanel from '@/components/OptimizationCreation'
import UniqRegister from '@/components/UniqRegister'
import BarChart from '@/components/charts/BarChart'

import { simulationService } from '@/service'
import { HTTP } from '@/http-common'
import userState from '@/user-state'

import dragDropMixin from './drag-drop-mixin'
import fileMgmtMixin from './file-mgmt-mixin'

import optEnvService from '@/service/optenv-service'

const variant = {
  finished: 'primary',
  running: 'success',
  error: 'danger',
  ready: 'secondary'
}

const { log } = console

export default {
  name: 'OptimizationList',
  components: {
    BarChart,
    SimulationCreationPanel: OptimizationCreationPanel,
    UniqRegister
  },
  mixins: [dragDropMixin, fileMgmtMixin],
  data () {
    return {
      fields: [
        { class: 'text-center', key: 'num', label: '#' },
        { class: 'text-center', key: 'id', label: '시뮬레이션 아이디' },
        { class: 'text-center', key: 'status', label: '상태' },
        { class: 'text-center', key: 'configuration.period', label: '주기' },
        { class: 'text-center', key: 'duration', label: '대상시간' },
        { class: 'text-center', key: 'actions', label: '교차로수' },
        { class: 'text-center', key: 'configuration.epoch', label: '에포크' },
        { class: 'text-center', key: 'configuration.method', label: '모델' },
        { class: 'text-center', key: 'configuration.action', label: '액션' },
        {
          class: 'text-center',
          key: 'configuration.rewardFunc',
          label: '보상함수'
        },
        {
          class: 'text-center',
          key: 'configuration.modelSavePeriod',
          label: '모델저장주기'
        },
        { class: 'text-center', key: 'details', label: '기능' }
      ],
      items: [],
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      envFields: [
        { class: 'text-center', key: 'envName', label: '최적화환경 아이디' },
        { class: 'text-center', key: 'configuration.period', label: '주기' },
        {
          class: 'text-center',
          key: 'duration',
          label: '대상시간'
        },
        { class: 'text-center', key: 'junctions', label: '교차로수' },
        { class: 'text-center', key: 'epoch', label: '에포크' },
        { class: 'text-center', key: 'configuration.method', label: '모델' },
        { class: 'text-center', key: 'configuration.action', label: '액션' },
        {
          class: 'text-center',
          key: 'configuration.rewardFunc',
          label: '보상함수'
        },
        {
          class: 'text-center',
          key: 'configuration.modelSavePeriod',
          label: '모델저장주기'
        },
        { class: 'text-center', key: 'func', label: '기능' }
      ],
      envItems: [],
      envCurrentPage: 0,
      envPerPage: 10,
      envTotalRows: 0,

      isBusy: false,
      msg: '',
      variant: 'info',
      barChartDataTable: {},
      warning: null,
      userState,
      modalShow: false,
      autoRefresh: false,
      expanded: false,

      envs: [],
      currentEnv: null,
      resultFile: null // upload file for model files (.zip)
    }
  },
  mounted () {
    this.dataProvider({ currentPage: this.currentPage })
    this.reload().then(r => {})
  },
  computed: {},
  destroyed () {},
  methods: {
    uploadModel (obj) {
      const formData = new window.FormData()
      formData.append('file', this.resultFile)
      this.$swal.showLoading('업로딩')
      HTTP.post(`/salt/v1/optimization/upload/model?id=${obj.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(res => console.log(res))
        .catch(err => {
          this.$swal({
            type: 'error',
            title: err.message,
            text: err.response
          })
        })
        .finally(() => {
          setTimeout(() => this.$swal.close(), 1000)
        })
    },
    numberOfJunctions (jId) {
      const SA = {
        'SA 101': 10,
        'SA 107': 4,
        'SA 111': 2,
        'SA 104': 5
      }
      const jIds = jId.split(',').map(v => v.trim())
      let sum = 0
      jIds.forEach(id => {
        sum += SA[id] || 0
      })
      return sum
    },
    statusColor (status) {
      const colors = {
        running: 'bg-blue-400',
        error: 'bg-red-400',
        ready: 'bg-gray-400',
        finished: 'bg-green-400'
      }
      return colors[status] || 'bg-gray-400'
    },
    async toggleDetails (id, status, hide) {
      if (!hide) {
        if (status === 'finished') {
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
    async stopSimulation (id) {
      try {
        await simulationService.stopSimulation(id)
        this.updateTable()
      } catch (err) {
        log(err)
      }
    },

    async reload () {
      this.envs = await optEnvService.get()
      this.envItems = this.envs
      this.envTotalRows = this.envs.length
    },
    async dataProvider ({ currentPage }) {
      this.isBusy = true
      try {
        const { data, total, perPage } = (
          await simulationService.getOptimizations(
            this.userState.userId,
            currentPage
          )
        ).data

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
    async removeSimulation (param) {
      const result = await this.$swal({
        title: `${param.id} 시뮬레이션을 삭제합니다.`,
        text: 'Please note that you can not cancel it',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      })

      if (!result.value) {
        return
      }
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
    },

    async saveOptEnvConfig (config) {
      const obj = this.envs.find(env => env.envName === config.envName)
      if (obj) {
        try {
          await optEnvService.update(config)
        } catch (err) {
          this.$bvToast.toast('Fail to update configuration')
        }
      } else {
        try {
          await optEnvService.add(config)
        } catch (err) {
          this.$bvToast.toast('Fail to save configuration')
        }
      }
      this.$refs.modal.hide()
      await this.reload()
    },
    openModify (env) {
      this.currentEnv = env
      this.$refs.modal.show()
    },
    modalHide () {
      this.currentEnv = null
    },
    async registerSimulation (env) {
      const random = () => `${Math.floor(Math.random() * 1000)}`
      const generateRandomId = (prefix = 'DEFU') =>
        `${prefix
          .substring(0, 4)
          .toUpperCase()}_${moment().year()}${moment().format(
          'MM'
        )}_${random().padStart(5, '0')}`
      env.id = generateRandomId(env.role)
      try {
        await simulationService.createSimulation(this.userId, env)
      } catch (err) {
        log(err)
      }
      this.updateTable()
    },
    async remove (id) {
      await optEnvService.remove(id)
      this.envs = await optEnvService.get()
    }
  }
}
