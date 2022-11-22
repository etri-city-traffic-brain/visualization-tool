# 교통 시뮬레이션 및 신호 최적화 가시화 도구

![스크린샷_20221118_023813](https://user-images.githubusercontent.com/2037433/203231188-d9abdfda-f559-4b19-8f8d-bc846876fbe8.png)

## 프로젝트 구성

uniq-vis 는 웹 클라이언트와 서버 프로젝트로 구성되면 상세 내용은 다음과 같다.

- client 프로젝트는 웹 기반 데이터 가시화 기능을 제공한다.
- server 프로젝트는 교통 시뮬레이터와 신호 최적화 서브시스템과 연계하여 실행제어 및 결과를 클라이언트로 제공한다.

## 주의사항

가시화 서버 실행을 위해서는 여러가지 사전 조건이 필요하다. 예를들어) 가시화 서버에서 링크, 셀, 교차로 정보를 가시화 하기 위해서는 해당 데이터가 데이터베이스에 등록되어야 한다. 또한 교통 시뮬레이터 또는 신호최적화 서브시스템과 연동을 위해서 공유 디렉토리 설정이 필요하다. 공유디렉토리는 컨테이너 실행 시 입력/출력 파일 공유를 위해 사용된다.

다음은 공유 디렉토리 구조를 보인다. uniq-sim 디렉토리는 /server/config.js 파일을 통해서 설정한다.

```
/home/{user}/uniq-sim/data
/home/{user}/uniq-sim/routes
/home/{user}/uniq-sim/output
```

## 빌드

### 사전조건

- 데이터 저장 관리를 위한 MongoDB 를 설치한다.
- 시각화 서버 실행을 위해서 Node.js 를 설치한다.

### client

클라이언트는 SPA(Single Page Application) 형태이며 개발시에는 개발서버를 구동하여 개발한다.

```
npm install
npm run dev
```

빌드를 위해서는 다음 명령을 수행한다.

```
npm run build
```

빌드 명령을 수행하면 클라이언트 코드를 빌드하고 서버의 public 디렉토리에 복사된다.

### server

서버 실행을 위해서 다음 명령을 수행한다.

```
npm install
npm run dev
```

### 서버 실행

먼저 server/ 디렉토리의 config.js 를 수정 후 다음 명령을 실행하여 가시화 서버를 구동한다.

```
npx pm2 start ./bin/www
```

## 확인

웹 브라우저를 사용해서 `http://localhost:8080` 접속하여 UI를 확인한다.
