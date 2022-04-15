//  신호 최적화를 위한 환경 목록
//  신호 최적화 시뮬레이션을 하기 위해서는,
//  먼저 시뮬레이션을 위한 환경을 등록해야 한다.

import moment from 'moment'

import userState from '@/user-state'
import UniqRegister from '@/components/UniqRegister'
import optEnvService from '@/service/optenv-service'
import simulationService from '@/service/simulation-service'

const { log } = console

export default {
  name: 'OptEnvList',
  components: {
    UniqRegister
  },
  data () {
    return {
      userState,
      envs: [],
      currentEnv: null
    }
  },
  async mounted () {
    // this.envs = await optEnvService.get()
    await this.reload()
  },
  methods: {
    async reload () {
      this.envs = await optEnvService.get()
      console.log(this.envs)
    },
    hideCreateSimulationDialog () {},
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
      this.$bvToast.toast('시뮬레이션을 등록합니다.', {
        title: 'xxxx',
        variant: 'info',
        autoHideDelay: 3000,
        appendToast: true,
        toaster: 'b-toaster-top-right'
      })

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
    },
    async remove (id) {
      await optEnvService.remove(id)
      this.envs = await optEnvService.get()
    }
  }
}
