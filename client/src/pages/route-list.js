import axios from 'axios'
import RouteRegister from '@/components/RouteRegister'

const { log } = console
export default {
  name: 'RouteList',
  components: {
    RouteRegister
  },
  data() {
    return {
      fields: [
        { class: 'text-center', key: 'num', label: '#' },
        { class: 'text-center', key: 'id', label: '아이디' },
        { class: 'text-center', key: 'description', label: '설명' },
        { class: 'text-center', key: 'tools', label: '도구' },
      ],
      currentPage: 1,
      perPage: 10,
      items: [],
      totalRows: 0,
      isBusy: false,
    }
  },

  mounted() {
    this.dataProvider({ currentPage: this.currentPage })
  },

  methods: {
    async save(data) {
      try {
        const result = await axios({
          url: '/salt/v1/route/',
          method: 'post',
          data
        }).then(res => res.data)

        log(result)
        this.updateTable()
      } catch (err) {
        log(err.message)
      }
    },
    async remove(id) {
      const result = await axios({
        url: `/salt/v1/route/${id}`,
        method: 'delete',
      }).then(res => res.data)
      log(result)
      this.updateTable()
    },
    async dataProvider({ currentPage }) {
      this.isBusy = true
      try {

        const { data, total, perPage } = await axios({
          url: '/salt/v1/route/?currentPage=' + currentPage,
          method: 'get',
        }).then(res => res.data)

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
    async updateTable() {
      this.dataProvider({ currentPage: this.currentPage })
    },
  }
}
