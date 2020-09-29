<template>
  <div id="app">
    <b-navbar
      type="dark"
      sticky
      :variant="variant"
      ref="main-nav"
      id="main-nav"
      class="pl-3 pt-1 pb-0 m-0"
    >
      <b-navbar-brand href="#" to="/">SALT</b-navbar-brand>
      <b-collapse is-nav id="nav_dropdown_collapse" >
         <b-navbar-nav>
          <b-nav-item to="/SimulationList" >
            <strong>트래픽시뮬레이션</strong>
          </b-nav-item>
        </b-navbar-nav>
         <b-navbar-nav class="ml-auto">
          <b-nav-item size="sm" to="/SignalEditor" >
            <b-button size="sm">신호편집</b-button>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <transition name="fade">
      <router-view/>
    </transition>
    <!-- <b-container fluid class="mt-2 mb-2 p-2 text-center"> -->
      <!-- 도시 교통 문제 개선을 위한 클라우드 기반 트래픽 예측 시뮬레이션 소프트웨어 -->
      <!-- <hr class="my-4"> -->
      <!-- <small class="text-muted">Copyright 2019. ETRI all rights reserved.</small> -->
      <!-- <small class="text-muted">COPYRIGHT ⓒ 2020. <em>MODUTECH</em> Inc. ALL RIGHT RESERVED.</small> -->
    <!-- </b-container> -->
  </div>
</template>

<script>
import userState from '@/user-state';

export default {
  name: 'App',
  mounted() {
    this.prevScrollpos = window.pageYOffset;
    const navBar = this.$refs['main-nav'];
    window.onscroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (this.prevScrollpos > currentScrollPos) {
        navBar.$el.style.top = '0';
      } else {
        navBar.$el.style.top = '-50px';
      }
      this.prevScrollpos = currentScrollPos;
    };
  },
  data() {
    return {
      prevScrollpos: window.pageYOffset,
      variant: 'dark',
      userState,
    };
  },
};
</script>

<style scoped>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 0px;
}

.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .25s;
}

.fade-enter-active {
  transition-delay: .25s;
}

.fade-enter, .fade-leave-active {
  opacity: 0;
}

.btn .fa-icon {
  vertical-align: middle;
  margin-right: 0.5rem;
}
.btn .fa-icon:last-child {
  margin-right: 0;
}

#main-nav {
  transition: top 0.3s;
}

html {
  background: lightgrey;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

</style>
