# [Ubuntu 16.04] node.js 와 npm 설치

4.x 버전을 설치하려면 아래 1번 방법을 통해 손쉽게 설치할 수 있으며, 그 이상의 버전을 설치하기 위해선 2번 방법을 통해 설치할 수 있습니다. 또는 여러 버전의 Node.js를 설치 및 관리하기 위해 nvm을 이용하는 3번의 방법으로도 설치할 수 있습니다.
설치하려는 환경에 맞게 방법을 선택하여 설치하시기 바랍니다.

## 우분투 저장소의 Distro-Stable 버전 설치
우분투 16.04의 패키지 저장소에 Node.js가 기본으로 들어가져 있습니다. 이 글을 쓰는 현 시점에 v4.2.6 버전이 저장소에 올려져있습니다.

apt 패키지 매니저를 통해 손쉽게 설치할 수 있습니다.
```
sudo apt-get update
sudo apt-get install nodejs
```
추가로 npm을 설치하기 위해서는 다음과 같이 입력하면 됩니다.
```
sudo apt-get install npm
```
다른 패키지와의 충돌을 방지하기 위해, 우분투 저장소의 Node.js는 node 대신 nodejs 명령어를 사용합니다.

다음 명령어로 정상적으로 Node.js가 설치되었는 지 확인할 수 있습니다.
```
nodejs -v
# v4.2.6
```

## PPA를 이용한 최신버전 설치
Node.js 최신 버전을 설치하기 위해서는 NodeSource에서 운영되는 PPA (personal package archive)를 추가하여 설치할 수 있습니다. PPA를 이용하면 우분투 저장소에서 제공하는 4.x 버전(2017년 4월까지 지워하는 예전 LTS 버전)뿐만 아니라 6.x 버전(2018년 4월까지 지원하는 최신 LTS 버전)와 7.x 버전(현재 개발 버전)까지 선택하여 설치할 수 있습니다.

이 예제에서는 6.x 버전을 설치할 것 입니다. 다른 버전을 설치하기 위해선 아래 curl 명령어의 6.x 문자를 원하는 버전으로 수정하여 다운로드 받으시면 됩니다.
```
cd ~
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
```
sudo 권한으로 다음 명령어를 실행하면 PPA를 추가하고 업데이트까지 자동으로 실행됩니다. 이후 작업은 첫번째 Distro-Stable 버전 설치 방법과 동일합니다.

```
sudo bash nodesource_setup.sh
sudo apt-get install nodejs
```
PPA를 통해 Node.js를 설치하면 nodejs 뿐만 아니라 npm까지 같이 설치되므로 따로 npm을 설치할 필요가 없습니다. 하지만 npm이 제대로 동작하기 위해선 build-essential 패키지를 설치해야 합니다.

```
sudo apt-get install build-essential
```
## NVM을 이용한 설치
apt 패키지 매니저 대신, Node.js version manager인 nvm을 이용하여 설치할 수 도 있습니다.

nvm을 이용하면 Node.js의 여러 버전을 설치하고 쉽게 환경 관리를 할 수 있습니다.

우선 우분투 저장소에서 nvm 설치에 필요한 패키지들을 설치합니다.
```
sudo apt-get update
sudo apt-get install build-essential libssl-dev
```
다음으로 nvm 설치 스크립트를 다운로드 후 실행시켜 줍니다.
```
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.profile
```
설치가 완료되면 home 디렉터리에 ~/.nvm 폴더가 생성됩니다.

설치 가능한 Node.js 버전 목록을 확인하기 위해서 다음과 같이 입력하면 됩니다.
```
nvm ls-remote
```
### 결과
```
v5.8.0
v5.9.0
v5.9.1
v5.10.0
v5.10.1
v5.11.0
v6.0.0
```

원하는 버전을 선택한 후 다음과 같이 설치하면 됩니다.
```
nvm install 6.0.0
```
여러 버전의 Node.js를 설치했다면 다음과 같이 특정 버전으로 변경하여 사용할 수 있습니다.

```
nvm use 6.0.0
```
nvm을 이용하여 Node.js를 설치하면 1, 2번 방법과 달리 node 명령어를 사용해야 합니다.
```
node -v
# v6.0.0
```
설치된 Node.js 버전 목록을 보려면 다음과 같이 입력하면 됩니다.
```
nvm ls
```
