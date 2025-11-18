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
> 🔥 **주요 목표: JWT 인증 시스템 완성**

- `/auth/me` API 구현  
- 토큰 검증 미들웨어 (`authMiddleware`) 적용  
- ProtectedRoute 적용  
- 로그인 필요 페이지 보호 로직 구현  
- 로그인 시 토큰으로 유저 정보 자동 불러오기  
- 러닝 기록 업로드 기능 시작 예정  

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
- [x] 클라이언트 로그인 연동  
- [ ] JWT 인증 시스템 (2주차 목표)  
- [ ] 러닝 기록 저장/불러오기  
- [ ] 시뮬레이션 대결  
- [ ] 랭킹 시스템  
- [ ] UI 마감 + 배포  

---

## 📄 라이선스
해당 프로젝트는 학습용으로 제작되었습니다.
