//    UNIQ
//    Vue Router
//    2020
import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/pages/Home'
import SignalEditor from '@/pages/SignalEditor'
import SimulationComparisonResult from '@/pages/SimulationComparisonResult'
import SimulationList from '@/pages/SimulationList'
import SimulationResultMap from '@/pages/SimulationResultMap'
import SimulationResult from '@/pages/SimulationResult'

import OptimizationList from '@/pages/OptimizationList'
import OptimizationResultMap from '@/pages/OptimizationResultMap'
import OptimizationResultComparisonMap from '@/pages/OptimizationResultComparisonMap'

// import Admin from '@/pages/Admin'

import OptEnvList from '@/pages/OptEnvList'

import Dashboard from '@/pages/Dashboard.vue'

import Junction from '@/pages/JunctionView.vue'

import RouteList from '@/pages/RouteList.vue'
import RouteVis from '@/pages/RouteVis.vue'

Vue.use(Router)

const route = (path, component, keepAlive = false) => ({
  path,
  mode: 'history',
  name: component.name,
  component,
  meta: {
    keepAlive
  }
})

export default new Router({
  routes: [
    route('/', Home),
    route('/SimulationResult/:id', SimulationResult),
    route('/SimulationResultMap/:id', SimulationResultMap),
    route('/SimulationList', SimulationList),
    route('/OptimizationList', OptimizationList),
    route('/OptimizationResultMap/:id', OptimizationResultMap),
    route(
      '/OptimizationResultComparisonMap/:id',
      OptimizationResultComparisonMap
    ),
    route('/SimulationComparisonResult', SimulationComparisonResult),
    route('/SignalEditor', SignalEditor),
    route('/OptEnvList', OptEnvList),
    route('/Dashboard', Dashboard, true),
    route('/Junction', Junction),
    // route('/Admin', Admin),
    route('/RouteList', RouteList),
    route('/RouteVis/:id', RouteVis),
  ]
})
