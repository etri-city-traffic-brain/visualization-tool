
import moment from 'moment';
import simulationService from '@/service/simulation-service';
import areas from '../utils/areas';

const year = moment().year();
const m = moment().format('MM');
const random = () => `${Math.floor(Math.random() * 1000)}`
const randomId = () => `SALT_${year}${m}_${random().padStart(5, '0')}`;
const format = date => moment(date).format('YYYY-MM-DD');

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

const periodOptions = [
  { value: 10, text: '10분', },
  { value: 30, text: '30분', },
  { value: 60, text: '1시간', },
  { value: 120, text: '2시간', },
  { value: 240, text: '4시간', },
  { value: 360, text: '6시간', },
]
const partitionOptions=  [
  { value: 0, text: 'None' },
  { value: 4, text: '4개' },
  { value: 8, text: '8개' },
  { value: 16, text: '16개' },
]


export default {
  name: 'SimulationCreationDialog',
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
      periodOptions: [...periodOptions],
      partitionSelected: 0,
      partitionOptions: [...partitionOptions],
      areaSelected: 11250,
      areaOptions: [ ...areas ],
      beginSelected: 0,
      endSelected: 23,
      msg: 'waiting',
      variant: 'info',
      timeout: null,
      status: 'ready'
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  methods: {
    resetForm() {
      this.id = randomId();
      this.description = '...';
    },
    selectArea() {
    },
    async save() {

      const from = moment(`${this.fromDate} ${this.fromTime}`);
      const to = moment(`${this.toDate} ${this.toTime}`)
      const end = to.diff(from) / 1000;

      const days = to.diff(from, 'days') + 1
      const day = from.day()
      let routes = [`${regionMap[this.areaSelected]}_${dayMap[from.day()]}.xml`]

      if (days > 1 && days <8) {
        routes = new Array(days).fill('').map((v, i) => `${regionMap[this.areaSelected]}_${dayMap[(i+day)%7]}.xml`)
      }

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
            day: from.day(),
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
      this.$bvModal.hide('create-simulation-modal')
      this.resetForm();
    },
  },
};
