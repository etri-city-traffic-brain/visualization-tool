# 교통 시뮬레이션 및 신호 최적화 가시화 도구

## 구성

- client는 웹 기반 데이터 가시화 기능을 제공한다.
- server는 교통 시뮬레이터와 신호 최적화 서브시스템과 연계하여 실행제어 및 결과를 클라이언트로 제공한다.

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
