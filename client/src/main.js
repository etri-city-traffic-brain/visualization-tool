// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';

import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import Trend from 'vuetrend';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';

import VueScrollTo from 'vue-scrollto';

import App from './App';
import router from './router';

Vue.use(Trend);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons)
Vue.use(VueSweetalert2);
Vue.use(VueScrollTo);
// Vue.use(VueScrollTo, {
//   container: 'body',
//   duration: 500,
//   easing: 'ease',
//   offset: 0,
//   force: true,
//   cancelable: true,
//   onStart: false,
//   onDone: false,
//   onCancel: false,
//   x: false,
//   y: true,
// });

// Vue.component('icon', Icon);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
