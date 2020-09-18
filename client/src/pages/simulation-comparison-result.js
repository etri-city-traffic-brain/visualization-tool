/**
 * compare simulations
 */
import * as d3 from 'd3';

import Doughnut from '@/components/charts/Doughnut';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import HistogramChart from '@/components/charts/HistogramChart';
import stepPlayer from '@/stepper/step-runner';
import num2timestr from '@/utils/num2timestr';
import statisticsService from '@/service/statistics-service';

import LinkManager from '@/map2/map-manager';
import simulationService from '@/service/simulation-service';
import stepperMixin from '@/stepper/mixin';
import makeMap from '@/map2/make-map';

const color = d3.schemeCategory10; // d3 has built-in Colors

const mapId1 = `map-${Math.floor(Math.random() * 100)}`;
const mapId2 = `map-${Math.floor(Math.random() * 100)}`;

export default {
  name: 'SimulationComparisonResult',
  components: {
    Doughnut,
    LineChart,
    HistogramChart,
    BarChart,
  },
  data() {
    return {
      // mapId,
      mapId1,
      mapId2,
      map1: null,
      map2: null,
      currentStep: 1,
      slideMax: 0,
      simulation: { configuration: {} },
      mapHeight: 600, // map view height
      msg: '',
      pies: [],
      histograms: [],
      height: 100,
      selected: [],
      isReady: false,
      summary: {},
    };
  },
  destroyed() {
    const { map1, map2, player } = this;
    map1 && map1.remove();
    map2 && map2.remove();
    // player && player.stop();

    // window.removeEventListener("resize", this.getWindowHeight);
  },
  async mounted() {
    if (this.$route.params.length === undefined) {
      this.msg = '시뮬레이션이 선택되지 않았습니다.';
      return;
    }
    this.selected = this.$route.params || [];

    this.map1 = makeMap({ mapId: mapId1 });
    this.map1.zoomControl.hide();
    this.linkManager1 = LinkManager(this.map1, this.selected[0]);
    this.linkManager1.loadMapData();

    this.map2 = makeMap({ mapId: mapId2 });
    this.map2.zoomControl.hide();
    this.linkManager2 = LinkManager(this.map2, this.selected[1]);
    this.linkManager2.loadMapData();

    this.map1.on('moveend', (param) => {
      const center = this.map1.getCenter();
      if(param.domEvent) {
        this.map2.setCenter(center);
      }
    });

    this.map2.on('moveend', (param) => {
      const center = this.map2.getCenter();
      if(param.domEvent) {
        this.map1.setCenter(center);
      }
    });

    this.map1.on('zoomend', () => this.map2.setZoom(this.map1.getZoom()));

    this.map2.on('zoomend', () => this.map1.setZoom(this.map2.getZoom()));

    const { simulation, slideMax } = await simulationService.getSimulationInfo(this.selected[0]);
    this.simulation = simulation;
    this.slideMax = slideMax;
    this.player = stepPlayer(this.slideMax, this.stepForward.bind(this));

    const tmp = {
      datasets: [],
      labels: [],
    };
    try {
      /* eslint no-await-in-loop:0 */
      for (let idx = 0; idx < this.selected.length; idx += 1) {
        const item = this.selected[idx];
        const data = await statisticsService.getSummaryChart(item);

        this.pies[idx] = await statisticsService.getPieChart(item);
        this.pies[idx].name = item;
        this.pies[idx].isReady = true;
        this.histograms[idx] = await statisticsService.getHistogramChart(item);
        this.histograms[idx].name = item;
        this.histograms[idx].isReady = true;

        // just for test
        const dataset = data.datasets.map(value => ({
          fill: false,
          label: item,
          borderColor: color[idx],
          data: value.data.map(v => v),
        }));
        tmp.datasets.push(dataset[0]);
        tmp.labels = data.labels;
        tmp.labels = tmp.labels.map((v, i)=> i)

      }
      this.isReady = true;
      this.summary = tmp;
    } catch (error) {
      this.msg = error.toString();
    }
  },

  computed: {
    currentStepTime() {
      const { configuration: { period } } = this.simulation;
      // return num2timestr(this.currentStep);
      return num2timestr(this.currentStep * period / 60);
    },
    maxTime() {
      const { configuration: { period } } = this.simulation;
      // return num2timestr(this.slideMax * period);
      return num2timestr(this.slideMax * period / 60);
    },
  },

  methods: {
    ...stepperMixin,
    getWindowHeight() {
      this.height = window.innerHeight; // update map height to current height
    },
    togglePlay(value) {
      const action = (value === 'play') ? this.player.start : this.player.stop;
      action.bind(this)();
    },
    stepChanged(step) {
      this.linkManager1.changeStep(step);
      this.linkManager2.changeStep(step);
    },
  },
};
