# UNIQ-VIS 가시화 서버

## 빌드

```bash
npm install
```

## 공유 디렉토리 설정

가시화 서버는 교통 시뮬레이터 및 신화 최적화 서브시스템과 파일 시스템을 이용해서 데이터를 공유한다.

공유 디렉토리 구조는 다음과 같다.

```
uniq-sim/
├── cctv
├── data
├── dtg
├── map
├── output
├── routes
├── rse
├── sample
└── vds
```

교통 시뮬레이션 또는 신호 최적화를 위한 시뮬레이션 입력 데이터는 /uniq-sim/data/ 디렉토리에 생성한 시뮬레이션 아이디를 폴더명으로 생성된다.
신호 최적화 결과는 /uniq-sim/data/{simulation_id}/output 디렉토리에 생성된다.

```
data
├── OPTI_202208_00012
│   ├── data
│   ├── logs
│   ├── model
│   ├── output
│   └── scenario
└── SIMU_202211_00828
    ├── busstops.xml
    ├── connection.xml
    ├── edge.xml
    ├── node.xml
    ├── salt.scenario.json
    └── tss.xml
```

교통 시뮬레이션은 출력 결과는 /uniq-sim/output/{simulation_id} 에 생성된다.

```
output
├── SIMU_202011_00700
│   ├── 2020_dj_sample-PeriodicOutput.csv
│   ├── OPTI_202011_00653-PeriodicOutput.csv
│   ├── bar-data.json
│   ├── grid-data.json
│   ├── histogram-data.json
│   └── pie-data.json
├── SIMU_202211_00184
│   ├── SIMU_202211_00184_PeriodicOutput.csv
│   ├── bar-data.json
│   ├── grid-data.json
│   ├── histogram-data.json
│   ├── log.txt
│   ├── pie-data.json
│   └── progress.txt
├── SIMU_202211_00828
└── grid.geojson
```

## 시나리오 파일(시뮬레이션용)

/uniq-sim/routes 디렉토리에는 시뮬레이션에 사용할 수요 파일들이 위치한다.

- scenario_doan.zip
- scenario_seogu.zip
- scenario_youseonggu.zip
- scenario_dg.zip
- scenario_ddg.zip
- scenario_jg.zip

## 시나리오 파일(신호최적화용)

- scenario_cdd3.zip
- scenario_doan.zip

## 수요파일 목록

- doan.rou.xml
- seogu.rou.xml
- youseonggu.rou.xml
- dg.rou.xml
- ddg.rou.xml
- jg.rou.xml
