
// import BasicMap from '@/components/Map';
import moment from 'moment';
import * as maptalks from '../map/node_modules/maptalks';
// import axios from 'axios';

// import { HTTP } from '@/http-common';
import { makeMap, basicMapHandler } from '@/map/salt';
import scenarioService from '@/service/scenario-service';

import areas from '../components/areas';


const mapId = `map-${Math.floor(Math.random() * 100)}`;

// import * as R from 'ramda';
// import TimeOptions from '@/time-options';
// const fillZero = num => ((num < 10) ? `0${num}` : num);
// const dateTimeFormatter = date => moment(date).format('YYYY-MM-DD HH:mm:ss');
// const timeFormatter = date => moment(date).format('HH:mm:ss');
// const removeDelimeter = (value, delimiter) => value.replace(/delimiter/gi, '');

const dateFormatter = date => moment(date).format('YYYY-MM-DD');
const getRectConfig = ({ x, y, id }) => new maptalks.Rectangle({ x, y }, 3000, 2000, {
  id,
  visible: true,
  editable: true,
  cursor: 'pointer',
  shadowBlur: 0,
  arrowPlacement: 'vertex-last',
  shadowColor: 'black',
  draggable: false,
  dragShadow: false, // display a shadow during dragging
  drawOnAxis: null, // force dragging stick on a axis, can be: x, y
  symbol: {
    lineColor: '#34495e',
    lineWidth: 1,
    polygonFill: 'rgb(135,196,240)',
    polygonOpacity: 0.1,
  },

});

export default {
  name: 'SchenarioWizard',
  data() {
    return {
      menu: true,
      mapId,
      useAreaSelection: 'false',
      fromDate: dateFormatter(new Date()),
      toDate: dateFormatter(new Date()),
      fromTime: '00:00:00',
      toTime: '23:59:59',
      areaOptions: areas,
      areaSelected: 0,
      height: 1200, // map view height
    };
  },
  watch: {
    useAreaSelection(v) {
      if (v === true) {
        this.rectangle1.startEdit();
        this.rectangle1.show();
      } else {
        this.rectangle1.endEdit();
        this.rectangle1.hide();
      }
    },
  },
  components: {
    // BasicMap,
  },
  destroyed() {
    /* eslint no-unused-expressions:0 */
    this.map && this.map.remove();
  },
  computed: {
  },
  mounted() {
    this.map = makeMap({ zoom: 14, id: this.mapId });
    this.height = window.innerHeight; // update map height to current height
    this.mapHandler = basicMapHandler(this.map);
    this.rectangle1 = getRectConfig({
      id: 'rect1',
      x: 127.1219,
      y: 37.5553,
    });
    new maptalks.VectorLayer('area-selection')
      .addGeometry([this.rectangle1])
      .addTo(this.map);

    this.map.getLayer('area-selection').hide();
  },
  methods: {
    bounds() {
      const shell = this.rectangle1.getShell();
      return {
        min: shell[0],
        max: shell[2],
      };
    },
    async generate() {
      const { min, max } = this.bounds();
      await this.$swal({
        title: 'Waiting!',
        html: '시나리오 파일 생성중...',
        showCloseButton: true,
        onOpen: async () => {
          this.$swal.showLoading();
          try {
            let reqParam = null;
            if (this.useAreaSelection === true) {
              reqParam = {
                fromDate: this.fromDate.replace(/-/gi, ''),
                toDate: this.toDate.replace(/-/gi, ''),
                fromTime: this.fromTime.replace(/:/gi, ''),
                toTime: this.toTime.replace(/:/gi, ''),
                minX: min.x,
                minY: min.y,
                maxX: max.x,
                maxY: max.y,
              };

              console.log(JSON.stringify(reqParam, false, 2));
              const data = await scenarioService.downloadScenarioByCoordinate(reqParam);
              this.makeItDownload(data);
            } else {
              reqParam = {
                fromDate: this.fromDate.replace(/-/gi, ''),
                toDate: this.toDate.replace(/-/gi, ''),
                fromTime: this.fromTime.replace(/:/gi, ''),
                toTime: this.toTime.replace(/:/gi, ''),
                region: this.areaSelected,
                subregion: 0,
              };
              console.log(JSON.stringify(reqParam, false, 2));
              const data = await scenarioService.downloadScenarioByRegion(reqParam);
              this.makeItDownload(data);
            }

            this.$swal.close();
          } catch (err) {
            console.log(err);
            this.$swal({
              type: 'error',
              title: 'Oops...',
              text: '문제가 발생했습니다.',
              footer: err.message,
            });
          }
        },
      });
    },
    makeItDownload(data) {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.zip');
      document.body.appendChild(link);
      link.click();
    },
  },
};
