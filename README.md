# 교통 시뮬레이션 및 신호 최적화 가시화 도구(UNIQ-VIS)

교통 시뮬레이션 및 신호 최적화 가시화 도구(이하 UNIQ-VIS)는 교통 시뮬레이션 및 신호 최적화를 위한 설정 및 실행 결과 가시화 기능을 제공한다.

![so1](https://github.com/etri-city-traffic-brain/visualization-tool/assets/2037433/a5d86ac2-f6f8-4c07-8443-b3f47dc1fbd1)

## 주요기능

1. SALT(교통시뮬레이터) 연동 및 시뮬레이션 결과 가시화
2. 교차로 신호 최적화 연동 및 최적화 결과 가시화

## 프로젝트 구성

UNIQ-VIS 는 웹 클라이언트 모듈과 가시화 서버 모듈로 구성된다.

- 웹 클라이언트
  - 웹 브라우저에서 동작하며 Vue.js 기반 SPA(Single Page Application) 형태로 구현 되었다.
  - [웹 클라이언트 설치문서](./client/README.md)를 참조한다.
- 가시화 서버
  - Node.js 를 사용하여 구현 되었으며 `교통 시뮬레이터`와 `신호 최적화 서브시스템`과 연계하여 실행제어 및 시뮬레이션 결과를 웹 클라이언트로 제공한다.
  - [가시화 서버 설치문서](./server/README.md)를 참조한다.

# UNIQ-VIS 활용

UNIQ-VIS 설치가 완료되면 `http://localhost:8080` 에 접속하여 웹 UI를 확인할 수 있다. 제공 기능은 아래와 같다.

## 교통 시뮬레이션

다음 절차에 따라서 교통 시뮬레이션 기능을 사용한다.

1. 웹 UI 에서 `교통 시뮬레이션` 메뉴 선택
2. `시뮬레이션 등록` 버튼 클릭
3. 시작날짜, 종료날짜, 통계주기, 가시화주기, 대상지역, 이미지 선택 후 저장 버튼 클릭
   - 대상 지역: `도안` 선택
   - 이미지: `images4uniq/salt:v2.1a.221019` 선택
4. 시뮬레이션 목록에서 위에서 등록한 시뮬레이션의 `상세보기` 클릭
5. 오른쪽 상단의 `시작` 버튼 클릭
6. 결과 확인
   - 지도 화면을 마우스로 조금씩 드래그 하여 해당 위치에 차량이 가시화 되는지 확인

## 신호 최적화

다음 절차에 따라 신호 최적화 기능을 사용한다.  
신호최적화 준비 > 신호 최적화 학습 > 최적화 결과 적용 의 세 단계로 구분된다.

### 신호 최적화 준비

1. 웹 UI 에서 `신호 최적화` 메뉴 선택
2. 왼쪽 상단에 있는 `환경등록` 버튼 클릭
3. 신호최적화를 위한 환경정보 입력

   - 지역: `도안` 선택
   - 대상교차로: 기본 설정된 값 사용
   - 도커 이미지: `images4uniq/optimizer:v2.1a.20221012` 선택
   - 에포크: 일반적으로는 큰 값을 사용하나 최초 실험이 정상 동작 하는지 확인을 위해서 5 이내의 값을 사용 (값이 큰 경우 가시화 서버가 구동되는 서버의 성능에 따라 메모리 부족으로 인해 중지될 수 있음)
   - 모델저장주기: 에포크가 큰 경우 모델저장주기도 크게 하지만 최초 동작 확인을 위해서는 1로 설정하여 사용 (기본 동작이 확인 되면 에포크와 모델저장 주기를 적절하게 변경)

4. `저장` 버튼 클릭 (신호죄적화 환경 목록에 최근 추가한 항목 확인)

### 신호 최적화 학습

1. 신호최적화 환경 목록에서 최근 추가한 항목의 `실험생성` 버튼 클릭
2. 아래쪽에 있는 신호최적화 실험 목록에서 항목 확인 후 신호 학습 버튼 클릭
3. 신호 학습 페이지에서 학습 시작 버튼 클릭 (신호 학습이 종료될때까지 대기)
4. 진행 상태가 변경 되지 않는 경우 왼쪽 상단의 `상태갱신` 버튼을 클릭하여 진행 상태 확인
5. 설정한 에포크 만큰 수행 되면 교차로별 보상 그래프가 출력 됨을 확인할 수 있음

### 신호 최적화 적용 결과 비교

1. 신호 학습 완료 확인 (신호 학습이 완료 될 때 까지 대기)
2. `신호비교` 버튼 클릭 (또는 신호 최적화 실험 목록에서 신호적용 버튼 클릭)
3. 오른쪽 상단의 모델 목록에서 사용할 `모델번호` 선택
4. `모델 실행` 버튼 클릭
5. 신호 결과 가시화 확인

지도상의 상태바가 모두 진행 되었는데도 결과가 표시되지 않으면 웹 브라우저의 새로고침(F5)버튼을 클릭한다.  
사용하는 값들이 많아서 로딩이 지연될 수 있다.
