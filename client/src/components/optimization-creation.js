
import moment from 'moment';
import simulationService from '@/service/simulation-service';
// import areas from '../utils/areas';
import SignalMap from '@/components/SignalMap';

const year = moment().year();
const m = moment().format('MM');
const random = () => `${Math.floor(Math.random() * 1000)}`
const randomId = () => `OPTI_${year}${m}_${random().padStart(5, '0')}`;
const format = date => moment(date).format('YYYY-MM-DD');

const periodOptions = [
  { value: 10, text: '10분', },
  { value: 30, text: '30분', },
  { value: 60, text: '1시간', },
  { value: 120, text: '2시간', },
  { value: 240, text: '4시간', },
  { value: 360, text: '6시간', },
]
// const partitionOptions=  [
//   { value: 0, text: 'None' },
//   { value: 4, text: '4개' },
//   { value: 8, text: '8개' },
//   { value: 16, text: '16개' },
// ]

const areas = [
  { value: "250", text: "대전" },
  { value: "11230", text: "대전(실증지역)" },
  { value: "25040", text: "세종" },
  { value: "11240", text: "세종(실증지역)" },
]

const scripts =  [
  { value: 'test_network.py', text: 'script-01.py' },
  { value: 'RL_2phase_pressure.py', text: 'RL_2phase_pressure.py' },
]

export default {
  name: 'OptimizationCreationPanel',
  props: ['userId', 'modalName'],
  components: {
    SignalMap
  },
  data() {
    return {
      id: randomId(),
      description: '...',
      fromDate: format(new Date()),
      toDate: format(new Date()),
      fromTime: '00:00',
      toTime: '23:59',
      periodSelected: 30,
      periodOptions: [...periodOptions],
      // partitionSelected: 0,
      // partitionOptions: [...partitionOptions],
      areaSelected: 250,
      areaOptions: [ ...areas ],
      beginSelected: 0,
      endSelected: 23,
      msg: 'waiting',
      variant: 'info',
      timeout: null,
      status: 'ready',
      scripts: [ ...scripts ],
      scriptSelected: scripts[0].value,

      selected: [], // Must be an array reference!
      options: [
        { text: '날씨', value: 1 },
        { text: '신호', value: 1 },
        { text: '이벤트', value: 1 },
      ],
      visualizationStepSelected: 10, // Must be an array reference!
      visualizationStepOptions: [
        { text: '10 Step', value: 10 },
        { text: '20 Step', value: 20 },
        { text: '30 Step', value: 30 },
      ],
      junctionId: '563103625' // Yuseong Middle
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  mounted() {
  },
  methods: {
    openSignalMap() {
      this.$refs['signal-map'].show()
    },
    resetForm() {
      this.id = randomId();
      this.description = '...';
    },
    selectArea() {
    },
    async save() {

      const from = moment(`${this.fromDate} ${this.fromTime}`);
      const to = moment(`${this.toDate} ${this.toTime}`)
      const end = to.diff(from) / 1000 + 60 - 1;
      const days = to.diff(from, 'days') + 1
      const day = from.day()

      this.msg = '시뮬레이션을 준비하고 있습니다...'
      this.variant = 'info';
      try {
        this.status = 'running'
        this.timeout = setInterval(async () => {
          const { simulation } = await simulationService.getSimulationInfo(this.id)
          if(!simulation) return
          if(simulation.status === 'finished' || simulation.status === 'error') {
            clearInterval(this.timeout)
            this.running = false
          }
          this.msg = simulation.status
        }, 2000)
        await simulationService.create(this.userId, {
          id: this.id,
          user: this.userId,
          description: this.description,
          configuration: {
            region: this.areaSelected,
            fromDate: this.fromDate,
            toDate: this.toDate,
            fromTime: `${this.fromTime}:00`,
            toTime: `${this.toTime}:00`,
            period: this.periodSelected * 60,
            // partitions: this.partitionSelected,
            begin: 0,
            end,
            day,
            days,
            visualizationStepSelected: this.visualizationStepSelected,
            junctionId: this.junctionId,
            script: this.scriptSelected
          },
          type: 'optimization'
        });
        this.status = 'finished'
        this.variant = "primary"
        this.msg = "시뮬레이션이 준비되었습니다."
        setTimeout(() => {
          this.status = 'ready'
          this.hide()
          clearInterval(this.timeout)
        }, 1000)

      } catch (err) {
        this.msg = err.message;
        this.variant = 'danger'
        this.status = 'error'
      }
      this.resetForm();
    },
    hide() {
      this.$emit('hide');
      this.$bvModal.hide(this.modalName)
      this.resetForm();
    },
  },
};
