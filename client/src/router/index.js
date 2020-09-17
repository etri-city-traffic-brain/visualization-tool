//    UNIQ
//    Vue Router
//    2020
import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/pages/Home';
import SignalEditor from '@/pages/SignalEditor';
import SimulationComparisonResult from '@/pages/SimulationComparisonResult';
import SimulationList from '@/pages/SimulationList';
import SimulationResultMap from '@/pages/SimulationResultMap';
import SimulationResult from '@/pages/SimulationResult';

Vue.use(Router);

const route = (path, component) => ({
  path,
  name: component.name,
  component
})

export default new Router({
  routes: [
    route('/', Home),
    route('/SimulationResult/:id', SimulationResult),
    route('/SimulationResultMap/:id', SimulationResultMap),
    route('/SimulationList', SimulationList),
    route('/SimulationComparisonResult', SimulationComparisonResult),
    route('/SignalEditor', SignalEditor),
  ],
});
