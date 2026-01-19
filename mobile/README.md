# ⚽ Football Jersey Community - Mobile App

레사모 문화를 담은 축구 유니폼 커뮤니티 & 마켓플레이스

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 이후 선택:
# - "w" 키: 웹 브라우저에서 실행
# - "a" 키: Android 에뮬레이터
# - "i" 키: iOS 시뮬레이터
# - QR 코드 스캔: 실제 기기 (Expo Go 앱 필요)
```

## 📱 Expo Go로 실제 기기에서 실행

1. **Expo Go 다운로드**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **앱 실행**
   ```bash
   npm start
   ```

3. **QR 코드 스캔**
   - iOS: 카메라 앱으로 QR 코드 스캔
   - Android: Expo Go 앱에서 QR 코드 스캔

## 🎯 구현된 기능

### ✅ 커뮤니티
- 클럽별 게시판 (FC 바르셀로나, 맨유, K리그 등)
- 게시글 카테고리 (Discussion, Review, Verification, Question, News)
- 실시간 댓글 시스템
- 고정글 지원

### ✅ 마켓플레이스
- 유니폼 판매글 (Replica / Player Issue / Match Worn)
- 판매자 평판 시스템
- 가격 제안/협상 (즉시 구매 없음)
- 출처(Provenance) 필수
- Q&A 시스템

### ✅ 프로필
- 평판 통계
- 개인 컬렉션 전시
- 커뮤니티 기여도

### ✅ 인증
- 이메일/비밀번호 로그인
- 회원가입 with 유효성 검사

## 🎨 다크 테마

축구 팬 문화를 반영한 다크 테마:
- 배경: `#1a1a1a`
- 카드: `#2a2a2a`
- 프라이머리: `#00a8ff`

## 📂 구조

```
src/
├── navigation/      # 앱 네비게이션
├── screens/
│   ├── auth/       # 로그인, 회원가입
│   ├── community/  # 게시판, 게시글
│   ├── marketplace/# 마켓플레이스
│   └── profile/    # 프로필, 컬렉션
├── services/       # API, 인증
├── theme/          # 색상, 스타일
└── utils/          # 에러 핸들링
```

## 🔧 기술 스택

- React Native 0.73.2
- Expo ~50.0.0
- TypeScript 5.3.3
- React Navigation 6.x
- Axios
- Ionicons

## 📝 라이센스

Built for football jersey collectors worldwide

---

Made with ⚽ by Claude
