<template>
<div>
  <div v-if="false">
    <div v-bind:style="{
      height: '400px',
      backgroundImage: 'url(' + introImg + ')',
      'object-fit': 'cover',
      backgroundPosition: 'center'}"
    >
      <b-card class="mb-2 text-center" bg-variant="transparent" text-variant="white">
        <div class="container">
          <h1 style="font-style:italic"><strong>SALT Simulator</strong></h1>
        </div>
        <div class="container">
          <div>
            <h3>도시 교통 문제 개선을 위한 클라우드 기반 트래픽 예측 시뮬레이션 SW</h3>
            <h5>도심 교통 문제 해결을 위하여, 가능한 데이터를 광범위하게 통합⋅활용하여 트래픽 혼잡도를 예측하고 검증하는 SW적인 접근으로 도심교통문제 해결.</h5>
          </div>
        </div>
        <b-badge
          class="mt-5 ml-2 p-2" v-for="item in features"
          :key="item">
          {{ item }}
        </b-badge>
      </b-card>
    </div>
    <b-container fluid class="mt-2 mb-2 p-2 text-center">
      <h3> 개요</h3>
      <p class="p-1 main-text">대도시의 교통소통 최적화를 위해,</p>
      <p><strong>클라우드-엣</strong>지 기반 실시간 교통상황 분석 및 대규모 교통 시뮬레이션 분산처리를 통해 교통제어 지능을 제공하는 <strong>도시교통 브레인 시스템 개발</strong> </p>
      <hr class="my-4">
      <p class="text-muted">클라우드 엣지: 중앙 데이터센터 중심의 기존 클라우드 시스템에 엣지컴퓨팅 기술을 적용‧보완하여 고도화한 데이터 활용 플랫폼</p>
      <p class="text-muted">도시교통브레인: 교통 데이터 분석을 통하여 도시 교통흐름 최적화를 수행하는 인공지능 핵심기술</p>
    </b-container>
  </div>
  <div>
    <!--
      디자인참고: http://lezir.vuejs.themesbrand.com/index-1
    //-->
    <b-jumbotron bg-variant="white">
      <div class="d-flex bd-highlight mt-1">
        <div class="p-2 pt-5 flex-fill bd-highlight ">
          <h1>&nbsp; </h1>
          <h1>&nbsp; </h1>
          <h1>UNIQ Visualization</h1>
          <h1>Subsystem</h1>
          <h3>UNIQ: Urban Network Inteligence for sloving traffic Queues</h3>
          <p class="mt-4">실시간 교통상황 시각적 분석 도구 서브 시스템은 실시간 교통상황 분석도구, 교통 시뮬레이션 결과 시각화 기능 그리고 추천 신호에 대한 시각적 분석 기능 제공 </p>
          <p><strong>클라우드-엣</strong>지 기반 실시간 교통상황 분석 및 대규모 교통 시뮬레이션 분산처리를 통해 교통제어 지능을 제공하는 <strong>도시교통 브레인 시스템 </strong></p>
        </div>
        <!-- <div class="p-2 flex-fill bd-highlight">Flex item</div> -->
        <div class="p-2 flex-fill bd-highlight">
          <!-- <img :src="introImg" width="400rem"> -->
          <img src="http://lezir.vuejs.themesbrand.com/img/hero-1-img.1fe8c4ed.png" width="500rem">
        </div>
      </div>

      <hr class="my-4">

      <h3 class="text-center mb-4">Awesome Features</h3>
      <p class="text-center">대도시의 교통소통 최적화를 위해, </p>
      <p class="text-center"><strong>클라우드-엣지</strong> 기반 실시간 교통상황 분석 및 대규모 교통 시뮬레이션 분산처리를 통해 교통제어 지능을 제공하는 <strong>도시교통 브레인 시스템 개발</strong> </p>

      <div class="d-flex bd-highlight mt-5">
        <div class="p-2 flex-fill bd-highlight">
          <img src="http://lezir.vuejs.themesbrand.com/img/features-img.2ccb8936.png" width="600rem">
        </div>

        <div class="p-2 flex-fill bd-highlight">
          <h3> Visualize Traffic Simulation Result in Realtime </h3>
          <p> 도시 교통 문제 개선을 위한 클라우드 기반 트래픽 예측 시뮬레이션 SW</p>
          <p> 도심 교통 문제 해결을 위하여, 가능한 데이터를 광범위하게 통합⋅활용하여 트래픽 혼잡도를 예측하고 검증하는 SW적인 접근으로 도심교통문제 해결.</p>
          <p class="text-muted">클라우드 엣지: 중앙 데이터센터 중심의 기존 클라우드 시스템에 엣지컴퓨팅 기술을 적용‧보완하여 고도화한 데이터 활용 플랫폼</p>
          <p class="text-muted">도시교통브레인: 교통 데이터 분석을 통하여 도시 교통흐름 최적화를 수행하는 인공지능 핵심기술</p>
          <h3> SALT</h3>
          <h5> Simulation for Analyzing Loads in Traffic</h5>
          <p> 솔트(SALT)란 Simulation for Analyzing Loads in Traffic의 약어로, 도심의 교통 혼잡 문제를 완화하기 위해 지방자치단체가 보유하고 있는 공공데이터와 내비게이션 서비스 업체의 민간 데이터를 통합해 정제하고 활용하여 교통 혼잡도를 예측하는 기술입니다. </p>
          <p>이를 통해 교통정책과 교통 신호체계 변경 시 이에 따른 효과를 사전 검증하는 교통 시뮬레이션 소프트웨어입니다. </p>
          <b-button variant="primary" href="#">트래픽 시뮬레이션</b-button>
          <b-button variant="success" href="#">실시간 교통상황 대시보드</b-button>
        </div>
      </div>
    </b-jumbotron>
  </div>
  </div>
</template>

<script>
import introImg from '../assets/images/bg1.jpg'

export default {
  name: 'Intro',
  data() {
    return {
      features: ['UNIQ', 'SALT', '2020', '트래픽 시뮬레이션', '클라우드 엣지'],
      introImg,
    };
  },
};
</script>

<style scoped>
.main-text {
  font-size: 18px;
  line-height: 1.2;
  line-break: loose;
}

p {
   line-height: 1.6;
}

h1, h2 {
  /* font-style:italic; */
  text-shadow: 3px 0px grey;
  font-weight: 700!important;
}

h3 {
  font-weight: 700!important;
}
</style>
