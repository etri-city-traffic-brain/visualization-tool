
const router = require('express').Router()
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const {
  config
} = require('../../globals')

router.get('/', (req, res) => {
  res.send([
    {
      id: 'cctv1',
      name: '갑천대교네거리',
      videoUrl: 'http://101.79.1.124:8081/cctv/%EA%B0%91%EC%B2%9C%EB%8C%80%EA%B5%90%EB%84%A4%EA%B1%B0%EB%A6%AC/N_20201020_080000.mp4',
      location: [127.36049818483963, 36.358783979208106],
      icon: 'http://101.79.1.124:8081/cctv/cctv.png'
    },
    {
      id: 'cctv2',
      name: '궁동네거리',
      videoUrl: 'http://101.79.1.124:8081/cctv/%EA%B6%81%EB%8F%99%EB%84%A4%EA%B1%B0%EB%A6%AC/SC0003101.mp4',
      location: [127.33813021182581, 36.364272361321746],
      icon: 'http://101.79.1.124:8081/cctv/cctv.png'
    },
    {
      id: 'cctv3',
      name: '진터지하차도',
      videoUrl: 'http://101.79.1.124:8081/cctv/%EC%A7%84%ED%84%B0%EC%A7%80%ED%95%98%EC%B0%A8%EB%8F%84/2.mp4',
      location: [127.3403287544994, 36.34852924511501],
      icon: 'http://101.79.1.124:8081/cctv/cctv.png'
    }

  ])
})

module.exports = router
