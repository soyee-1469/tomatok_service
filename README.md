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

## 지갑 (Phantom 멀티 지갑 · TOTT 목업)

하단 **지갑** 탭 → `/wallet`. 지갑이 여러 개면 카드 슬라이드로 넘기고, 카드 안의 **포인트(TP) › 교환하기**로 TOTT → TP 교환 화면에 들어갑니다.

| 화면 | 주소 |
| --- | --- |
| 지갑 홈(슬라이드) | `/wallet` |
| 지갑 관리(전체·대표·순서) | `/wallet/all` |
| 지갑 추가(Phantom 연결) | `/wallet/add` |
| TOTT · TP 교환 | `/wallet/:id/exchange` |
| NFT 목록·상세 | `/wallet/:id/nfts`, `/wallet/:id/nfts/:nftId` |
| 거래 내역·상세 | `/wallet/:id/txs`, `/wallet/:id/txs/:txId` |

- 교환 규칙은 포토카드 앱과 같습니다: 1 TOTT = `TOTT_KRW`(9.134) TP, 1 TP = ₩1, 최소 50 TOTT. 교환하면 지갑 TOTT가 줄고 TP가 늘며 거래 내역에 **TP 교환**으로 남습니다.
- 지갑 화면에서는 왼쪽에 시안 전환 패널(지갑 1개/여러 개, 지갑 추가 모드)이 보입니다.
- 포토카드 앱(`photocard/service/app`)의 **지갑 연결하기** 버튼은 로컬 주소 http://localhost:5173/tomatok_translate/wallet 로 옵니다.
