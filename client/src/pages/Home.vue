    <!--
      디자인참고: http://lezir.vuejs.themesbrand.com/index-1
    //-->
<template>
<div>
  <b-jumbotron
    header="UNIQ"
    class="mb-0"
    text-variant="white"
    lead="Urban Network Inteligence for sloving traffic Queues"
    v-bind:style="styleTop">
      <h3 class="font-italic">UNIQ Visualization</h3>
      <h3 class="font-italic">Subsystem</h3>
  </b-jumbotron>
  <!--
    SECTION #1
  -->
  <b-card bg-variant="secondary" text-variant="white" class="no-round-corner">
    <div class="d-flex bd-highlight mt-1">
      <div class="p-5 flex-fill bd-highlight ">
        <h3 class="font-italic"> Integrated Dashboard </h3>
        <p>도시 교통 문제 개선을 위한 클라우드 기반 트래픽 예측 시뮬레이션 SW</p>
        <p>도심 교통 문제 해결을 위하여, 가능한 데이터를 광범위하게 통합⋅활용하여 트래픽 혼잡도를 예측하고 검증하는 SW적인 접근으로 도심교통문제 해결.</p>
        <p class="p-1 main-text">대도시의 교통소통 최적화를 위해,</p>
        <p><strong>클라우드-엣</strong>지 기반 실시간 교통상황 분석 및 대규모 교통 시뮬레이션 분산처리를 통해 교통제어 지능을 제공하는 <strong>도시교통 브레인 시스템 개발</strong> </p>
        <b-button variant="dark" href="#">대시보드</b-button>
      </div>
      <div class="p-2 flex-fill bd-highlight">
        <img :src="img03">
      </div>
    </div>
  </b-card>

  <!--
    SECTION #2
  -->
  <b-card bg-variant="dark" text-variant="white" class="no-round-corner">
    <div class="d-flex bd-highlight">
      <div class="p-5 flex-fill bd-highlight">
        <img :src="img02">
      </div>
      <div class="p-5 flex-fill bd-highlight">
        <h3 class="font-italic"> Visualize Traffic Simulation Result in Realtime </h3>
        <p> 도시 교통 문제 개선을 위한 클라우드 기반 트래픽 예측 시뮬레이션 SW</p>
        <p> 도심 교통 문제 해결을 위하여, 가능한 데이터를 광범위하게 통합⋅활용하여 트래픽 혼잡도를 예측하고 검증하는 SW적인 접근으로 도심교통문제 해결.</p>
        <p class="text-muted">클라우드 엣지: 중앙 데이터센터 중심의 기존 클라우드 시스템에 엣지컴퓨팅 기술을 적용‧보완하여 고도화한 데이터 활용 플랫폼</p>
        <p class="text-muted">도시교통브레인: 교통 데이터 분석을 통하여 도시 교통흐름 최적화를 수행하는 인공지능 핵심기술</p>
        <!-- <h3 class="font-italic"> SALT</h3> -->
        <!-- <h5> Simulation for Analyzing Loads in Traffic</h5> -->
        <!-- <p> 솔트(SALT)란 Simulation for Analyzing Loads in Traffic의 약어로, 도심의 교통 혼잡 문제를 완화하기 위해 지방자치단체가 보유하고 있는 공공데이터와 내비게이션 서비스 업체의 민간 데이터를 통합해 정제하고 활용하여 교통 혼잡도를 예측하는 기술입니다. </p> -->
        <!-- <p>이를 통해 교통정책과 교통 신호체계 변경 시 이에 따른 효과를 사전 검증하는 교통 시뮬레이션 소프트웨어입니다. </p> -->
        <b-button variant="secondary" href="#">트래픽 시뮬레이션</b-button>
      </div>
    </div>
  </b-card>

  <!--
    SECTION #3
  -->
  <b-card bg-variant="secondary" text-variant="white" class="no-round-corner">
    <div class="d-flex bd-highlight">
      <div class="p-5 flex-fill bd-highlight ">
        <h1 class="font-italic">UNIQ Visualization</h1>
        <h1 class="font-italic">Subsystem</h1>
        <p class="mt-4">실시간 교통상황 시각적 분석 도구 서브 시스템은 실시간 교통상황 분석도구, 교통 시뮬레이션 결과 시각화 기능 그리고 추천 신호에 대한 시각적 분석 기능 제공 </p>
        <p><strong>클라우드-엣</strong>지 기반 실시간 교통상황 분석 및 대규모 교통 시뮬레이션 분산처리를 통해 교통제어 지능을 제공하는 <strong>도시교통 브레인 시스템 </strong></p>
        <p class="">클라우드 엣지: 중앙 데이터센터 중심의 기존 클라우드 시스템에 엣지컴퓨팅 기술을 적용‧보완하여 고도화한 데이터 활용 플랫폼</p>
        <p class="">도시교통브레인: 교통 데이터 분석을 통하여 도시 교통흐름 최적화를 수행하는 인공지능 핵심기술</p>
      </div>
      <div class="p-2 flex-fill bd-highlight">
        <img :src="img01">
      </div>
    </div>
  </b-card>

    <!--
      BOTTOM
    -->
    <b-card bg-variant="dark" text-variant="white" class="no-round-corner p-4">
      <b-card-text class="text-center">
        <b-button variant="secondary" href="#">트래픽 시뮬레이션</b-button>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import introImg from '../assets/images/bg1.jpg'
import img01 from '../assets/images/01.png'
import img02 from '../assets/images/02.png'
import img03 from '../assets/images/03.png'


export default {
  name: 'Intro',
  data() {
    return {
      features: ['UNIQ', 'SALT', '2020', '트래픽 시뮬레이션', '클라우드 엣지'],
      introImg,
      img01,
      img02,
      img03,
      styleTop: {
        height: '400px',
        backgroundImage: 'url(' + introImg + ')',
        'object-fit': 'cover',
        'border-radius': 0,
        backgroundPosition: 'center'}
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

.no-round-corner {
  border-radius: 0
}


</style>

<style>
* {
    scrollbar-width: thin;
    scrollbar-color: #f8f9fa #343a40;
  }
  *::-webkit-scrollbar {
    width: 12px;
  }
  *::-webkit-scrollbar-track {
    background: #343a40;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #f8f9fa;
    border-radius: 20px;
    border: 3px solid #343a40;
  }
</style>
