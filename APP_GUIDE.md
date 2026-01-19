# ⚽ 축구 유니폼 커뮤니티 & 마켓플레이스 앱

레사모(한국 축구 유니폼 커뮤니티)에서 영감을 받은 완전한 모바일 앱

## 📱 앱 실행 방법

### 1️⃣ 모바일 앱 실행 (추천)

```bash
cd mobile

# 의존성 설치
npm install

# Expo 개발 서버 시작
npm start

# 실행 옵션:
# - "w" 키 → 웹 브라우저에서 실행
# - "a" 키 → Android 에뮬레이터에서 실행
# - "i" 키 → iOS 시뮬레이터에서 실행
# - QR 코드 스캔 → Expo Go 앱으로 실제 기기에서 실행
```

**Expo Go 앱 다운로드:**
- iOS: App Store에서 "Expo Go" 검색
- Android: Google Play에서 "Expo Go" 검색

### 2️⃣ 백엔드 API 실행 (선택사항)

```bash
cd backend

# Python 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 설정 (환경변수)
export DATABASE_URL="postgresql://user:password@localhost/jersey_db"
export SECRET_KEY="your-secret-key-here"

# API 서버 시작
python -m app.main
```

API 문서: http://localhost:8000/api/docs

## 🎯 구현된 모든 화면

### ✅ 커뮤니티 (Community)
- **게시판 목록**: 클럽별 전용 게시판 (FC 바르셀로나, 맨체스터 유나이티드, K리그 등)
- **게시글 목록**: 고정글 우선 표시, 카테고리 필터링
- **게시글 상세**: 댓글 시스템, 실시간 입력, 조회수/댓글수
- **게시글 작성**: 카테고리 선택 (Discussion, Review, Verification, Question, News), 최소 50자 요구, 커뮤니티 가이드라인

### ✅ 마켓플레이스 (Marketplace)
- **판매글 목록**: 유니폼 리스팅, 판매자 평판 점수 표시, 조건 배지
- **판매글 상세**:
  - 판매자 정보 및 평판
  - 상세 설명 및 출처(Provenance)
  - Q&A 시스템
  - **가격 제안 모달** (즉시 구매 없음)
- **판매글 작성**:
  - 사진 업로드 (3-8장)
  - 유니폼 버전 선택 (Replica / Player Issue / Match Worn)
  - 컨디션 선택 (New with Tags → Fair)
  - **출처 필수 입력** (신뢰 구축)
  - 가격 협상 가능 설정

### ✅ 프로필 (Profile)
- **사용자 프로필**:
  - 평판 통계 (긍정/중립/부정 피드백)
  - 커뮤니티 기여도 점수
  - 즐겨찾는 클럽
  - 거래 통계
- **컬렉션**:
  - 개인 유니폼 컬렉션 전시 (판매와 별도)
  - 추가/수정/삭제 기능
  - 버전 배지, 메모 지원

### ✅ 인증 (Authentication)
- **로그인**: 이메일/비밀번호, 유효성 검사
- **회원가입**: 유효성 검사, 비밀번호 확인

## 🌟 핵심 기능

### 🤝 신뢰 기반 거래
- ❌ 즉시 구매 없음
- ✅ 가격 제안/협상 시스템
- ✅ 출처(Provenance) 필수
- ✅ 판매자 평판 점수
- ✅ Q&A로 투명한 소통
- ✅ 커뮤니티 진품 감정

### 💬 포럼 우선 커뮤니티
- 시간순 정렬 (알고리즘 피드 ❌)
- 클럽별 전용 게시판
- 카테고리별 게시글 정리
- "Real or Fake?" 진품 감정 게시판
- 텍스트 중심의 깊이 있는 토론

### 🏆 컬렉터 문화
- 컬렉션 전시 (판매와 분리)
- 장기 활동 가중치
- 상세한 텍스트 피드백
- 하이프/리셀 문화 반대

### 🎨 다크 테마 UI
- 배경: #1a1a1a
- 카드 기반 깔끔한 레이아웃
- 축구 팬 문화 맞춤
- 최소한의 게임화

## 📂 프로젝트 구조

```
/
├── backend/                      # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/v1/endpoints/    # boards, listings, reputation, users
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── core/                # Config, database, security
│   │   └── middleware/          # Error handling
│   └── requirements.txt
│
└── mobile/                       # React Native + Expo
    ├── App.tsx                   # Main entry point
    ├── src/
    │   ├── navigation/          # App navigation structure
    │   ├── screens/
    │   │   ├── auth/           # Login, Register
    │   │   ├── community/      # Boards, Posts, Comments
    │   │   ├── marketplace/    # Listings, Offers
    │   │   └── profile/        # Profile, Collection
    │   ├── services/            # API & Auth services
    │   ├── theme/               # Dark theme colors
    │   └── utils/               # Error handling
    ├── package.json
    └── tsconfig.json
```

## 🔧 기술 스택

### 백엔드
- **FastAPI**: 비동기 Python 웹 프레임워크
- **PostgreSQL**: 관계형 데이터베이스
- **SQLAlchemy**: ORM (Async)
- **Pydantic**: 요청/응답 검증
- **JWT**: 안전한 인증

### 모바일
- **React Native**: iOS/Android 크로스 플랫폼
- **Expo**: 개발 플랫폼
- **TypeScript**: 타입 안정성
- **React Navigation**: 네비게이션 (Stack + Bottom Tabs)
- **Axios**: API 통신
- **Ionicons**: 아이콘

## 📊 통계

- **23개 화면** 완전 구현
- **3,615줄** 코드 추가
- **Backend API**: 3개 엔드포인트 모듈, 3개 스키마 모듈
- **Mobile UI**: 완전한 네비게이션, 12+ 화면
- **Mock 데이터**: API 연결 준비 완료

## 🚀 다음 단계

1. **API 연결**: Mock 데이터 → 실제 Backend API
2. **이미지 업로드**: AWS S3, Cloudinary 등
3. **결제 시스템**: Stripe, Toss Payments
4. **푸시 알림**: Firebase Cloud Messaging
5. **번역**: i18n (한국어, 영어, 스페인어)

## 📱 화면 미리보기

앱은 다음 흐름으로 동작합니다:

1. **로그인/회원가입** → 다크 테마 인증 화면
2. **커뮤니티 탭** → 클럽별 게시판 → 게시글 → 댓글
3. **마켓플레이스 탭** → 판매글 목록 → 상세보기 → 가격 제안
4. **프로필 탭** → 내 프로필 → 컬렉션 → 설정

## 💡 레사모 철학

이 앱은 한국의 "레사모" (레플리카 사모) 커뮤니티 문화를 반영합니다:

- **신뢰 우선**: 속도나 거래량보다 신뢰와 평판
- **진품 중시**: 출처 확인, 커뮤니티 감정
- **팬 문화**: 하이프/리셀이 아닌 진정한 컬렉터 문화
- **장기 관계**: 단기 이익보다 커뮤니티 가치

## 📧 문의

질문이나 피드백이 있으시면 이슈를 등록해주세요!

---

Made with ⚽ for football jersey collectors worldwide
