
import simulationService from '@/service/simulation-service';
import axios from 'axios';

const mixin = {
  methods: {
    /**
     * upload simulation result(csv file)
     *
     * @param {*} simulationId
     */
    async uploadSimulatoinResultFile(simulationId) {
      if (!this.resultFile) {
        this.$swal({
          title: '파일이 선택되지 않았습니다.',
          animation: false,
          customClass: 'animated tada',
        });
        return;
      }

      // console.log(' simulation result')
      const formData = new FormData();
      formData.append('file', this.resultFile);

      this.$swal({
        title: 'Waiting!',
        html: 'uploading simulation result...',
        showCloseButton: true,
        onOpen: async () => {
          this.$swal.showLoading();
          try {
            await simulationService.uploadResult(simulationId, formData);
            this.updateTable();
            this.$swal.close();
          } catch (err) {
            this.$swal({
              type: 'error',
              title: err.message,
              text: err.response,
              // footer: err.response.statusText,
            });
          }
        },
      });
    },
    async submitDataFile(item) {
      if (!this.dataFile) {
        this.$swal({
          title: '파일이 선택되지 않았습니다.',
          animation: false,
          customClass: 'animated tada',
        });
        return;
      }

      const { id } = item;
      const formData = new FormData();
      formData.append('file', this.dataFile);

      this.$swal({
        title: 'Waiting!',
        html: 'uploading simulation data...',
        showCloseButton: true,
        onOpen: async () => {
          this.$swal.showLoading();
          await axios.post(`/simulations/upload/data?id=${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          // this.updateList();
          this.$swal.close();
        },
      });
    },
    async downloadDataFile(item) {
      const { id } = item;
      axios({
        url: `/simulations/download/data?id=${id}`,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data.zip');
        document.body.appendChild(link);
        link.click();
      });
    },
    async downloadResultFile(item) {
      const { id } = item;
      axios({
        url: `/simulations/download/result?id=${id}`,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'result.csv');
        document.body.appendChild(link);
        link.click();
      });
    },
    async downloadConfigFile(item) {
      const { id } = item;
      axios({
        url: `/simulations/download/config?id=${id}`,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'salt.scenario.json');
        document.body.appendChild(link);
        link.click();
      });
    },
    // async toggleDetails(simulation, status, hide) {
    //   const id = simulation.id;
    //   if (!hide) {
    //     if (status === 'finished') {
    //       this.data[id] = await statisticsService.getSummaryChart(id);
    //       this.$forceUpdate();
    //     }
    //   } else {
    //     this.data[id] = {};
    //   }
    // },
  },
};

export default mixin;
