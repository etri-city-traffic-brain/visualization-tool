import moment from 'moment'

import makeMap from '@/map2/make-map'

const random = () => `${Math.floor(Math.random() * 1000)}`
const generateRandomId = (prefix = 'DEFU') =>
  `${prefix.substring(0, 4).toUpperCase()}_${moment().year()}${moment().format(
    'MM'
  )}_${random().padStart(5, '0')}`

const format = date => moment(date).format('YYYY-MM-DD')
const getToday = () => format(new Date())

const { log } = console

export default {
  name: 'sim-registration',
  props: [
    'modalName',
  ],
  components: {
  },
  data() {
    return {
      id: generateRandomId('ROUTE'),
      description: '...',
      fromDate: getToday(),
      toDate: getToday(),
      fromTime: '07:00',
      toTime: '08:59',
      regionSelected: 'doan',
      extent: null, // current map extent
      loading: false,
    }
  },
  destroyed() {
    if (this.map) {
      this.map.remove()
    }
  },
  async mounted() {
    setTimeout(() => {
      this.map = makeMap({ mapId: this.mapId, zoom: 13 })
    }, 1)
  },
  watch: {

  },
  methods: {
    resetForm() {
      this.id = generateRandomId(this.role)
      this.description = '...'
    },
    getCurrentConfig() {
      const from = moment(`${this.fromDate} ${this.fromTime}`)
      const to = moment(`${this.toDate} ${this.toTime}`)
      const begin = moment.duration(this.fromTime).asSeconds()
      const end = to.diff(from) / 1000 - 60 + begin
      const days = to.diff(from, 'days') + 1
      const day = from.day()

      return {
        id: this.id,
        user: this.userId,
        description: this.description,
        configuration: {
          fromDate: this.fromDate,
          toDate: this.toDate,
          fromTime: `${this.fromTime}:00`,
          toTime: `${this.toTime}:00`,
          begin,
          end,
          day,
          days,
        }
      }
    },
    save() {
      this.loading = true
      this.$emit('save', this.getCurrentConfig())
      this.hide()
      this.loading = false
    },
    hide() {
      this.$emit('hide')
      this.$bvModal.hide(this.modalName)
      this.resetForm()
    },
  }
}
