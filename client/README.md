# UNIQ-VIS 웹 클라이언트

UNIQ-VIS 웹 클라이언트는 `교통시뮬레이션` 및 `다중교차로 신호최적화`를 위한 설정 및 결과 가시화 기능을 제공한다.  
SPA(Single Page Application) 형태로 개발되어 `가시화서버`에 탑재된다.

## 사전 환경

클라이언트 모듈 빌드를 위해서는 Node.js 가 설치되어 있어야 한다.

- [Node.js 홈페이지](https://nodejs.org/en/)
- [다운로드 v14.21.3](https://nodejs.org/download/release/v14.21.3/)
- [Installing Node.js via binary archive](https://github.com/nodejs/help/wiki/Installation)

## 설정

`./client/src/realtime/ws-client.js` 파일의 line14 의 `wsUrl` 의 정보를 `가시화서버`가 설치한 서버의 IP 주소로 변경한다.  
해당 정보는 웹 소켓을 사용하여 가시화 서버에서 실시간 정보를 웹 브라우저로 전송할 때 사용된다.

```js
// line 14
const wsUrl =
  env.NODE_ENV === "development"
    ? "ws://127.0.0.1:8080"
    : "ws://101.79.1.124:8080/";
```

101.79.1.124 를 `가시화서버`가 설치된 호스트의 IP 주소로 변경한다.

> 참고로 개발서버를 사용하는 경우 NODE_ENV가 `development` 로 설정되어 로컬정보를 사용한다.

## 빌드

아래 명령을 통해서 필요한 패키지를 설치하고 배포를 위한 결과물을 생성한다.  
`npm run build` 명령을 실행하면 `../server/public` 디렉토리에 결과물이 생성된다.

```bash
# 의존성 라이브러리 설치
npm install

# 배포를 위한 빌드
npm run build
```

## 개발서버 실행

개발 시에는 개발 서버를 실행한다. 아래 명령을 실행하면 웹 클라이언트 개발을 위한 개벌서버가 구동된다.

```
npm run dev
```

> 개발서버를 사용하는 경우 `./client/config/index.js` 파일의 `target` 과 `dev.proxyTable`의 값을 확인하여 필요시 수정한다.
