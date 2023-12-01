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

const regionOptions = [
  { text: '세종', value: 'sejong' },
  { text: '도안', value: 'yuseong' },
  { text: '유성', value: 'yuseong' },
]

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
      region: 'yuseong',
      extent: null, // current map extent
      loading: false,
      regionOptions: [...regionOptions],
      env: {
        "region_target": "DJ",
        "day_target": "20220630",
        "hour_target": "00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23",
        "taz_target": "code/taz_target.csv",
        "vds_target": "code/vds_target.csv",
        "zone2taz": "code/zone2taz.csv",
        "vds2stdlink": "code/vds2stdlink.csv",

        "od_raw": "raw/2019_OD_MOD_DJ_SJ.csv",
        "vds_raw": "raw/MRT_TF_INFO_2022M06_TARGET.csv",
        "vds_raw_dir": "",
        "od_raw_target": "raw/TAZ_TARGET_2019_OD_MOD_DJ_SJ.csv",
        "vds_raw_target": "raw/VDS_TARGET_1H_MRT_TF_INFO_2022M06.csv",

        "log_file": "product/log_file.txt",
        "od_matrix": "product/OD_MATRIX.csv",
        "t_od_matrix": "product/T_OD_MATRIX.csv",
        "trip_data": "product/TRIP.csv",

        "vds_table": "product/VDS_TARGET_VW_1H.csv",
        "vds_renewal": "false",

        "rt_dist": "product/RT_DIST.csv",
        "rt_next": "product/RT_NEXT.csv",
        "rt_renewal": "false",

        "weightType": "0"
      }
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
          region: this.region,
          begin,
          end,
          day,
          days,
        },
        status: 'ready',
        env: this.env
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
