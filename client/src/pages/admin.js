export default {
  name: 'Admin',
  components: {},

  data () {
    return {
      isLoggedIn: true,
      auth: {
        id: '',
        passwd: ''
      },

      simulation: {
        images: [
          'images4uniq/salt:v2.1a.20210915.test_BUS',
          'images4uniq/salt:v2.1a.221019'
        ],
        scenario: [
          {
            region: 'Doan',
            startTime: '07:00:00',
            endTime: '09:00:00'
          },
          {
            region: 'Daejeon',
            startTime: '07:00:00',
            endTime: '09:00:00'
          }
        ]
      },
      optimization: {
        images: [
          'images4uniq/optimizer:v1.1a.20220629.d',
          'images4uniq/optimizer:v1.2a.20220720PM'
        ],
        scenario: [
          {
            region: 'doan',
            startTime: '07:00:00',
            endTime: '09:00:00'
          }
        ]
      },
      routes: [
        {
          name: '유성구 오후 5~7시',
          day: 'Mon',
          file: 'youseong_mon_5to7.rou.xml',
          startTime: '05:00:00',
          endTime: '07:00:00'
        },
        {
          name: '도안동 오후 5~7시',
          day: 'Mon',
          file: 'doan_mon_5to7.rou.xml',
          startTime: '05:00:00',
          endTime: '07:00:00'
        }
      ],
      cRoute: {
        name: '',
        day: '',
        startTime: '05:00:00',
        endTime: '07:00:00'
      }
    }
  },
  methods: {
    login () {
      // if (this.auth.id === 'admin') {
      this.isLoggedIn = true
      // }
    },
    showRoutesDialog () {
      this.$refs['reg-routes'].show()
    },
    hideDialog (name) {
      this.$refs[name].hide()
    },
    addRoutes () {}
  }
}
