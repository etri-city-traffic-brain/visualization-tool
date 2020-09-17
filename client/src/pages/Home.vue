<template>
  <div>
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

h1, h2, h3, h4, h5 {
  font-style:italic
}
</style>
