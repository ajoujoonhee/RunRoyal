🏃‍♂️ RunRoyale — 실전 웹서비스 개발 기말 프로젝트

러닝 기록을 업로드하고, 시뮬레이션 대결, 랭킹 시스템까지 구현하는 웹 서비스 프로젝트입니다.

📌 프로젝트 구조
runroyale/
├── client/        # React + Vite + Tailwind (Frontend)
└── server/        # Node.js + Express + MongoDB (Backend)

📆 개발 일정 (Updated)
1주차 (11.10 ~ 11.16)

🔹 프로젝트 환경 초기 세팅
🔹 Frontend · Backend 기본 구조 생성
🔹 MongoDB Atlas 연결
🔹 회원가입/로그인 API 구현
🔹 클라이언트 로그인/회원가입 연동
🟡 JWT 발급 기능만 구현 완료 (인증 시스템은 2주차로 이월)

2주차 (11.17 ~ 11.23)

⛳ 주요 목표
✔ JWT 인증 시스템 완성

/auth/me API 구현

토큰 검증 미들웨어(authMiddleware) 적용

ProtectedRoute 적용

로그인 필요 페이지 보호 로직 적용

로그인 시 토큰으로 유저 정보 자동 불러오기

✔ 러닝 기록 업로드 기능 시작

러닝 데이터 스키마 설계

기록 저장 API 일부 구현

3주차 (11.24 ~ 11.30)

✔ 기록 업로드/저장 기능 마무리
✔ 대결 시뮬레이션(비동기 처리) 기능 구현

4주차 (12.01 ~ 12.07)

✔ 그래프 UI 구축
✔ 개인 기록 요약 페이지
✔ 대결 결과 페이지 UI 완성

5주차 (12.08 ~ 12.14)

✔ 랭킹 시스템 구현
✔ Socket.io 실시간 대결 프로토타입 구축

6주차 (12.15 ~ 12.21)

✔ UI 마감
✔ 배포(프론트 + 백엔드)
✔ 시연 발표 준비

🔧 기술 스택
Frontend

React (Vite)

React Router

TailwindCSS

Axios

Backend

Node.js

Express

MongoDB (Atlas)

Mongoose

JWT / bcrypt

🚀 실행 방법
1) 서버 설치 & 실행
cd server
npm install
npm run dev

2) 클라이언트 설치 & 실행
cd client
npm install
npm run dev

📁 환경 변수 (.env)
server/.env
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret

client/.env
VITE_API_URL=http://localhost:4000

📌 1주차 완료 내용 (Summary)

FE/BE 프로젝트 구조 완성

MongoDB Atlas 연결 성공

회원가입/로그인 API 구축

클라이언트 UI 연결

JWT 발급 기능 구현

✨ 다음 목표

2주차에서 JWT 인증 시스템 완성 + 러닝 기록 업로드 기능 시작

📝 라이선스

MIT License

⭐ 기여자

정준희 (Ajou University)