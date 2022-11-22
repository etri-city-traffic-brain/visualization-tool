# UNIQ-VIS 가시화 서버

## 개요

가시화 서버는 다음 두 가지 기능을 제공한다.

1. 교통 시뮬레이션 연동 및 결과 가시화
2. 다중 교차로 신호 최적화 서브시스템 연동 및 결과 가시화

## 지도(Link, Cell) 데이터베이스 설정

가시화 서버는 교차로 정보, 링크 정보, 셀 정보 관리를 위해서 MongoDB 를 사용한다.
다음 파일을 MongoDB 에 import 한다.

- signals.json
- ucells.json
- ulinks.json

## 시뮬레이션 관리 데이터베이스

가시화 서버는 로컬 파일 시스템을 기반 JSON 데이터베이스를 사용해서 시뮬레이션 정보를 관리한다.
/server/db.json 파일에 시뮬레이션 및 신호최적화 관리 정보가 기록된다.

## 공유 데이터 설정

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

교통 시뮬레이션 또는 신호 최적화를 위한 시뮬레이션 입력 데이터는 /uniq-sim/data/{simulation_id} 디렉토리에 등록한 시뮬레이션 아이디를 폴더명으로 생성된다.
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
