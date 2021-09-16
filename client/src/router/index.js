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

import OptEnvList from '@/pages/OptEnvList'

import Dashboard from '@/pages/Dashboard.vue'

Vue.use(Router)

const route = (path, component) => ({
  path,
  mode: 'history',
  name: component.name,
  component
})

export default new Router({
  routes: [
    route('/', Home),
    route('/SimulationResult/:id', SimulationResult),
    route('/SimulationResultMap/:id', SimulationResultMap),
    route('/SimulationList', SimulationList),
    route('/OptimizationList', OptimizationList),
    route('/OptimizationResultMap/:id', OptimizationResultMap),
    route('/OptimizationResultComparisonMap/:id', OptimizationResultComparisonMap),
    route('/SimulationComparisonResult', SimulationComparisonResult),
    route('/SignalEditor', SignalEditor),
    route('/OptEnvList', OptEnvList),
    route('/Dashboard', Dashboard)
  ]
})
