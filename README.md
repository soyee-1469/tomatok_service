# TomaTok 서비스 / 계정 통합 (웹 · Figma용)

**시안은 이 React(Vite) 웹만 사용합니다.**  
Flutter(`photocard/flutter`)는 포토카드 모션용이며, 계정 통합·공지 시안 대상이 아닙니다.

360×800 폰 프레임 → 브라우저 캡처/드래그로 Figma에 붙이기.

```bash
cd tomatalk-service-web
npm install
npm run dev
```

기본 주소: http://localhost:5173/tomatok_translate/

## 화면

- 서비스 메뉴 → 포인트·계정 안내 허브
- 포인트 공지 모달
- 로그인 변경 안내 → 계정 통합 **3단계**
  1. **선택**
     - ① 인증한 계정에서 포함할 계정 선택
     - ② 대표로 쓸 계정 (Google / Apple만. 없으면 만들기)
  2. **확인**
  3. **완료**

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해서 GitHub Pages에 올립니다.

- 주소: https://soyee-1469.github.io/tomatok_translate/
- 화면별 주소 예: `/services`, `/services/translate`, `/emoticon`, `/emoticon/new`, `/emoticon/my`

## 포토카드 · 지갑 시안

`public/photocard/`에 정적 HTML/JS로 들어 있습니다(원본: `photocard/service`, `photocard/assets`). 빌드 없이 그대로 서빙됩니다.

- 포토카드 앱: `/photocard/app/`
- 등록 화면: `/photocard/register/`
- 서비스 메뉴의 **포토카드**, 하단 **지갑** 탭에서 진입
