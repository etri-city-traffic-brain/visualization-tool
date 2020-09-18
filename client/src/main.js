import Vue from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';

import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import Trend from 'vuetrend';
import VueScrollTo from 'vue-scrollto';

import App from './App';
import router from './router';

Vue.use(Trend);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons)
Vue.use(VueSweetalert2);
Vue.use(VueScrollTo);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
