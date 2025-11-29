# 🏃 RunRoyale — 실전 웹서비스 개발 기말 프로젝트

러닝 기록을 업로드하고, 시뮬레이션 대결, 랭킹 시스템까지 구현하는 웹 서비스 프로젝트입니다.

---

## 📁 프로젝트 구조

```
runroyale/
├── client/    # React + Vite + Tailwind (Frontend)
└── server/    # Node.js + Express + MongoDB (Backend)
```

---

## 📅 개발 일정 (Updated)

### **1주차 (11.10 ~ 11.16)**  
> 프로젝트 환경 구축 + 기본 로그인 흐름 연결

- 프로젝트 환경 초기 세팅  
- Frontend · Backend 기본 구조 생성  
- MongoDB Atlas 연결  
- 회원가입/로그인 API 구현  
- 클라이언트 로그인/회원가입 연동  
- (인증 시스템은 2주차로 이월)

---

### **2주차 (11.17 ~ 11.23)**  
> 🔥 **주요 목표: JWT 인증 + 러닝 기록 기본 기능 완성**

- JWT 기반 인증 로직 정리  
  - 로그인 성공 시 토큰 발급  
  - Axios 인터셉터로 `Authorization: Bearer <token>` 자동 추가  
  - `authMiddleware` 로 보호가 필요한 API에 토큰 검증 적용  

- 보호된 페이지(대시보드) 접근 제어  
  - `ProtectedRoute` 컴포넌트로 로그인 여부 체크  
  - 비로그인 시 `/login` 으로 리다이렉트  
  - localStorage 기반 로그인 상태 유지  

- 러닝 기록 업로드 · 저장 기능 구현  
  - 거리(km), 시간(분/초) 입력 폼 구현  
  - 시간은 내부에서 초 단위(`timeSec`)로 변환하여 저장  
  - `Run` 스키마 설계: `distanceKm`, `timeSec`, `pace`, `createdAt`  

- 러닝 기록 조회 UI 구현  
  - 로그인한 사용자의 기록만 조회  
  - 리스트 형태로 최근 기록 표시  
  - 시간(분·초)과 페이스(분/초 per km) 포맷팅하여 출력

---

### **3주차 (11.24 ~ 11.30)**  
> 🔥 **주요 목표: 비동기 대결 시뮬레이션 기능 구현**
- 대결 시뮬레이션
  - 최신 러닝 기록 vs 봇 3단계(초급 7:00/km, 중급 5:30/km, 상급 4:30/km) 비동기 계산
  - 기록/봇 페이스 비교로 승패 결정, 결과 목록 표시

- 삭제 기능
  - 러닝 기록 및 대결 결과를 웹 UI에서 즉시 삭제 가능

- 배포/스모크
  - Render(API) · Vercel(웹) 정상 동작 확인
  - 주요 플로우(로그인 → 기록 업로드 → 대결 → 삭제) 스모크 테스트 완료

---

## 🚀 기술 스택

### **Frontend**
- React + Vite
- TailwindCSS
- Axios

### **Backend**
- Node.js + Express
- MongoDB Atlas
- JWT (jsonwebtoken)
- bcryptjs

---

## 📌 진행 현황 요약

- [x] 프로젝트 초기 세팅  
- [x] MongoDB 연결  
- [x] 회원가입/로그인 API  
- [x] JWT 인증 시스템  
- [x] ProtectedRoute 적용  
- [x] 러닝 기록 업로드  
- [x] 러닝 기록 조회  
- [ ] 시뮬레이션 대결 기능  
- [ ] 그래프/리포트 UI  
- [ ] 랭킹 시스템  
- [ ] UI 마감 + 배포  

---

## 📄 라이선스
해당 프로젝트는 학습용으로 제작되었습니다.
