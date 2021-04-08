
/*!
 * THE SIGNAL EDITOR COMPONENT
 */
import Vue from 'vue'
import moment from 'moment'

import makeMap from '@/map2/make-map'
import TrafficLightManager from '@/map2/map-traffic-lights'
import junctionService from '@/service/junction-service'
import signalService from '@/service/signal-service'
import browserDownload from '@/utils/browser-download'

import makeConnectionManager from '../junction/connection-manager'
import signalColors from '../junction/signal-colors'

const {
  signalColorToCode,
  signalCodeToColor
} = signalColors
const { log } = console
const mapId = `map-${Math.floor(Math.random() * 100)}`
const eventBus = new Vue({})

const TOD_PLAN_TYPE = {
  1: '평일',
  2: '토요일',
  3: '공휴일',
  4: '특수일',
  5: '금요일'
}

const PHASE_CODE = {
  0: '주현시',
  1: '최소녹색(MIN)',
  2: '맵최대녹색(MAP MAX)',
  3: '중앙최대녹색(HOST MAX)',
  4: '보행녹색',
  5: '보행점멸',
  6: '황색신호',
  7: '전적색신호',
  8: '보행전시간',
  9: 'MDS'
}

const findScenario = signalScenario => id => signalScenario.find(scenario => String(scenario.id) === String(id))

export default {
  name: 'SignalEditor',
  data () {
    return {
      menu: true,
      ready: false,
      junction: {},
      map: null,
      mapId,
      height: 400, // map view height
      editorHeight: 400,
      programId: 0,
      signalPhase: [],
      signalPhases: [],
      signalPhaseDefault: [],
      todPlan: [],
      signalScenario: [],
      selectedSignalPatternId: -1,
      connectionManager: null,
      selectedPhase: -1, // not selected

      fromDate: moment().format('YYYY-MM-DD'),
      fromTime: moment().format('HH:mm:ss'),
      toDate: moment().format('YYYY-MM-DD'),
      toTime: moment().format('HH:mm:ss'),

      textJson: '',
      text: '신호를 선택하세요. (신호아이콘 선택 + 마우스 오른쪽 버튼)',
      variant: 'info',
      rows: 3
    }
  },
  created () {
    eventBus.$on('junction:selected', this.handleJunctionSelect)
    // eventBus.$on('junction:selecte', (v) => {
    //   this.$emit('junction:select', v)
    // })
    eventBus.$on('junction:delete', this.handleJunctionDelete)
    eventBus.$on('states:changed', this.handleStateChanged)
    eventBus.$on('edge:removed', this.handleEdgeRemoved)
    eventBus.$on('edge:added', this.handleEdgeAdded)
  },
  mounted () {
    setTimeout(() => {
      this.map = makeMap({ mapId, zoom: 15 })
      // this.map.config('scrollWheelZoom', false)
      this.tl = TrafficLightManager(this.map, this.$refs.connectionEditor, eventBus)
      this.tl.load()
    }, 200)
  },
  destroyed () {
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    editMode () {
      this.connectionManager.editMode()
    },
    moveMode () {
      this.connectionManager.moveMode()
    },
    async updateSignal () {
      this.$swal.showLoading()
      try {
        await junctionService.updateSignal(this.getCurrentSignal())
        this.$swal('업데이트 되었습니다.')
      } catch (err) {
        this.$swal.fire({
          type: 'error',
          title: '신호정보 업데이트에 실패하였습니다.',
          text: err.message
        })
      } finally {
        this.$swal.hideLoading()
      }
    },
    async prepairEditorData (junction, connectedLinks) {
      const connectionManager = makeConnectionManager({
        junction,
        connectedLinks,
        element: this.$refs.connectionEditor
      })
      connectionManager.setEventBus(eventBus)

      try {
        this.text = '연결정보를 로드합니다.'
        const connections = await junctionService.getConnections(junction.id)
        this.text = '연결정보 로드완료'
        connectionManager.loadConnection(connections)
      } catch (err) {
        this.text = err.message
        this.variant = 'danger'
        this.$swal.fire({
          type: 'error',
          title: 'Oops...',
          text: '신호정보를 볼러오는데 실패하였습니다.'
        })
        return
      }
      this.connectionManager = connectionManager

      const find = findScenario(this.junction.signalScenario)

      // update tod duration from scenario
      junction.todPlan.forEach((tod) => {
        tod.tods.forEach((t) => {
          const s = find(t.patternId)
          if (s) {
            t.duration = s.duration
          }
        })
      })

      const {
        signalPhaseDefault = [],
        todPlan = [],
        signalScenario = [],
        signalPhase = []
      } = junction

      this.signalPhaseDefault = signalPhaseDefault
      this.signalScenario = signalScenario

      if (todPlan) {
        todPlan.forEach((plan) => {
          plan.tods.forEach((tod) => {
            tod.fromTime = tod.fromTime.slice(0, tod.fromTime.lastIndexOf(':'))
            tod.toTime = tod.toTime.slice(0, tod.toTime.lastIndexOf(':'))
            const pattern = this.signalScenario.find(ptn => String(ptn.id) === String(tod.patternId))
            if (pattern) {
              tod.duration = pattern.duration
            }
          })
        })
        this.todPlan = todPlan
      }
      // for reactivity
      this.signalPhases = signalPhase.map(phase => ({
        index: phase.index,
        state: phase.state.split('').map((value, id) => ({ id, value }))
      }))

      this.ready = true
      // this.$scrollTo('#nav-bar');
    },
    async handleJunctionDelete ({ id }) {
      const { data: arr } = await junctionService.getSignalInfo(id)
      // this.text = '신호삭제, 버전을 선택하세요.'
      const inputOptions = arr.signal.reduce((acc, cur) => {
        acc[cur.version] = cur.version
        return acc
      }, {})

      this.text = '삭제하려는 신호의 버전을 선택하세요.'
      const { value: version } = await this.$swal.fire({
        title: '신호 버전 선택 ',
        input: 'select',
        inputOptions,
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
        // showLoaderOnConfirm: true,
        // preConfirm: async version => junctionService.getSignal(junction.id, version),
      })

      if (!version) {
        this.text = ''
        log('canceled')
        return
      }

      try {
        await junctionService.deleteSignal(id, version)
      } catch (err) {
        log(err)
        this.text = err.message
        return
      }

      this.text = `신호: ${id}, 버전: ${version} 이 삭제 되었습니다.`
    },
    async handleJunctionSelect (param) {
      this.junction = {}
      this.signalPhase = []
      this.signalPhases = []
      this.signalPhaseDefault = []
      this.todPlan = []
      this.signalScenario = []

      param.linkIds.forEach(link => {
        link.geometry.forEach(g => g.sort())
      })
      const { junction, linkIds } = param
      try {
        this.text = '신호정보 로드중...'
        const { data: arr } = await junctionService.getSignalInfo(junction.id)
        this.text = '신호정보 로드완료'
        const inputOptions = arr.signal.reduce((acc, cur) => {
          acc[cur.version] = cur.version
          return acc
        }, {})

        this.text = '로드하려는 신호의 버전을 선택하세요.'
        const { value: version } = await this.$swal.fire({
          title: '신호 버전 선택 ',
          input: 'select',
          inputOptions,
          showCancelButton: true,
          confirmButtonText: '불러오기',
          cancelButtonText: '취소'
          // showLoaderOnConfirm: true,
          // preConfirm: async version => junctionService.getSignal(junction.id, version),
        })

        if (!version) {
          this.text = ''
          log('canceled')
          return
        }
        this.text = '신호 상세정보 로드중...'
        const { data } = await junctionService.getSignal(junction.id, version)
        this.text = '신호 상세정보 로드완료'
        this.junction = data
      } catch (err) {
        this.text = err.message
        this.variant = 'danger'
        this.$swal.fire({
          type: 'error',
          title: 'Oops...',
          text: '신호정보를 볼러오는데 실패하였습니다.'
        })
        return
      }
      await this.prepairEditorData(this.junction, linkIds)
    },
    handleStateChanged ({ id, color }) {
      const signalPhase = this.signalPhases
      const phase1 = signalPhase[this.selectedPhase]
      if (phase1) {
        Vue.set(phase1.state, id, {
          id: phase1.state[id].id,
          value: signalColorToCode(color)
        })
      }
    },
    handleEdgeRemoved ({ idx }) {
      this.signalPhases.forEach((phase) => {
        phase.state.splice(idx, 1)
      })
    },
    handleEdgeAdded ({ idx }) {
      this.signalPhases.forEach((phase) => {
        if (phase.state.length > idx) {
          phase.state.forEach((p) => {
            if (p.id >= idx) {
              p.id += 1
            }
          })
        }
        phase.state.splice(idx, 0, { id: idx, value: 'g' })
      })
    },
    keyUp (id) {
      const scenario = this.signalScenario.find(s => s.id === id)
      if (scenario) {
        scenario.variant = 'warning'
      }
    },
    todName (id) {
      return TOD_PLAN_TYPE[id] || 'Plan'
    },
    phaseCodeValue (type) {
      return PHASE_CODE[type] || ''
    },
    async addPlan () {
      const length = this.todPlan.length
      const { value: id } = await this.$swal.fire({
        title: 'TOD plan type',
        input: 'select',
        inputOptions: TOD_PLAN_TYPE,
        inputPlaceholder: 'Select a TOD plan type',
        showCancelButton: true
      })
      if (!id) {
        return
      }
      // const todSeq = this.todPlan.length + 1;
      this.todPlan.splice(length + 1, 0, {
        id,
        tods: [
          { todSeq: 1, patternId: 2, fromTime: '00:00', toTime: '09:00', duration: 140 },
          { todSeq: 2, patternId: 14, fromTime: '09:00', toTime: '11:00', duration: 140 },
          { todSeq: 3, patternId: 9, fromTime: '11:00', toTime: '14:00', duration: 140 },
          { todSeq: 4, patternId: 15, fromTime: '14:00', toTime: '21:00', duration: 140 },
          { todSeq: 5, patternId: 10, fromTime: '21:00', toTime: '00:00', duration: 140 }
        ]
      })
    },
    deletePlan (idx) {
      this.todPlan.splice(idx, 1)
    },
    addPlanItem (id) {
      const l = this.todPlan[id].tods.length + 1
      this.todPlan[id].tods.splice(l, 0, {
        todSeq: l, patternId: 0, fromTime: '00:00', toTime: '00:00', duration: 140
      })
    },
    deletePlanItem (planId, itemId) {
      this.todPlan[planId].tods.splice(itemId, 1)
    },
    colored (s) {
      return signalCodeToColor(s)
    },
    changePhase (idx) {
      this.selectedPhase = idx
      const state = this.signalPhases[idx].state
      const str = state.map(s => s.value).join('')
      if (this.connectionManager) {
        this.connectionManager.updateState(str)
      }
    },
    drag (patternId) {
      this.selectedSignalPatternId = patternId
    },
    drop (planId, todSeq) {
      const sourcePattern = this.signalScenario.find(item => item.id === this.selectedSignalPatternId)

      if (!sourcePattern) {
        return
      }
      const plan = this.todPlan.find(item => item.id === planId) || []
      const targetPattern = plan.tods.find(tod => tod.todSeq === todSeq)
      targetPattern.variant = 'warning'
      targetPattern.patternId = sourcePattern.id
      targetPattern.duration = sourcePattern.duration
    },
    dragover (event, tod) {
      event.preventDefault()
    },
    showModal (id) {
      this.textJson = JSON.stringify(this.getCurrentSignal(), false, 2)
      if (id) {
        this.$refs[id].show()
        this.text = ''
      }
    },
    hideModal (ref) {
      this.$refs[ref].hide()
    },
    downloadJson () {
      const text = JSON.stringify(this.getCurrentSignal(), false, 2)
      browserDownload(text, 'trafficSignal.json')
    },
    downloadXml () {
      browserDownload(this.text, 'trafficSignal.xml')
    },
    getCurrentSignal () {
      const convertPhase = signalPhase => signalPhase.map(phase => ({
        index: phase.index,
        state: phase.state.map(s => s.value).join('')
      }))

      return {
        id: this.junction.id,
        version: this.junction.version,
        crossNo: this.junction.crossNo,
        crossName: this.junction.crossName,
        date: this.junction.date,
        editDate: this.junction.editDate,
        signalGroup: this.junction.signalGroup,
        policeStation: this.junction.policeStation,
        description: this.junction.description,
        signalPhase: convertPhase(this.signalPhases),
        signalPhaseDefault: this.signalPhaseDefault,
        phaseSignalTime: this.phaseSignalTime,
        todPlan: this.todPlan,
        signalScenario: this.signalScenario
      }
    },
    async convertToXml () {
      const json = this.getCurrentSignal()
      try {
        const data = await signalService.toXml({
          json,
          from: `${this.fromDate} ${this.fromTime}`,
          to: `${this.toDate} ${this.toTime}`
        })
        this.text = data.data
        this.rows = 20
      } catch (err) {
        this.$bvToast.toast(err.response.data, {
          title: err.response.statusText,
          variant: 'warning',
          solid: true
        })
      }
    },
    downloadConnectionInfo () {
      const conns = this.connectionManager.getConnections()
      browserDownload(JSON.stringify(conns, false, 2), 'connections.json')
    }
  },
  watch: {
    signalScenario: {
      handler (newValue) {
        newValue.forEach((v, idx) => {
          const phase = newValue[idx].phase
          // if (phase.match(/[0-9]+:[0-9]+:[0-9]+:[0-9]+/g)) {
          // if (phase.match(/[0-9]+:[0-9]+:[0-9]+:[0-9]+/g)) {
          const duration = phase.split(':').map(Number).reduce((acc, cur) => {
            // eslint-disable-next-line use-isnan
            acc += cur
            return acc
          }, 0)
          newValue[idx].duration = duration
          // } else {
          //   newValue[idx].duration = NaN;
          // }
        })
      },
      deep: true
    }
  }
}
