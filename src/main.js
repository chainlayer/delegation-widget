import Vue from 'vue'
import App from './App.vue'
import VModal from 'vue-js-modal'
import browserDetect from "vue-browser-detect-plugin";
import VeeValidate from 'vee-validate';

Vue.use(VeeValidate);
Vue.use(browserDetect);
Vue.use(VModal);
Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
}).$mount('#app');
