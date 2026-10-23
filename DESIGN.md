# TomaTok 디자인 가이드

새 화면은 이 파일과 아래 남긴 컴포넌트를 기준으로 만든다. 새 여백·버튼 높이·라운드·타이포를 임의로 만들지 않는다.

## 유지 범위

- 서비스: `/services`, `/services/translate`
- 이모티콘: `/emoticon/*`
- 공용 셸: `src/shell.tsx`
- 번역: `src/translate/*`, `src/translate.css`
- 이모티콘: `src/emoticon/*`, `src/emoticon.css`
- 지갑: `/wallet`, `/wallet/all`, `/wallet/add`, `/wallet/:id/*` (NFT·거래·TP 교환) — `src/wallet/*`, `src/wallet.css`, `src/assets/icon_wallet_*`

## 캔버스

| 항목 | 값 |
| --- | --- |
| 폰 프레임 | 360 × 800 |
| 좌우 패딩 | 20 |
| 본문 폭 | 320 |
| 상태바 | 44 |
| 헤더 | 48 |
| GNB | 64 |
| 주요 CTA | 48 |

풀블리드 영역만 360을 쓰고, 카드·리스트·본문은 320 안에 둔다.

## 토큰

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--red` | `#CD313E` | Primary, 활성, 주요 CTA |
| `--red-soft` | `#FFF5F5` | 연한 강조 배경 |
| `--blue` | `#3186F6` | 정보 강조 |
| `--bg` | `#F5F5F5` | 화면 배경 |
| `--surface` | `#FFFFFF` | 헤더, 카드 |
| `--text` | `#010101` | 본문 |
| `--muted` | `#6B6E76` | 보조 텍스트 |
| `--line` | `rgba(0, 0, 0, 0.08)` | 구분선 |
| `--gray-box` | `#E8EAEF` | 회색 박스 |

- 폰트: Pretendard
- 간격: 4 / 8 / 12 / 16 / 20
- 라운드: 8 / 12 / 16 / 20, 원형은 50%
- 아이콘: `@phosphor-icons/react`, 기본 Regular
- 로컬 주소: `http://localhost:5173`만 사용

## 공용 컴포넌트

### `src/shell.tsx`

- `Phone`: 360 × 800 폰 프레임과 상태바
- `Header`: 높이 48, 뒤로가기와 가운데 제목
- `Footer`: 하단 고정 영역
- `Gnb`: 기존 하단 내비게이션이 필요한 화면에서만 사용

### 번역 컴포넌트

- `ServicesHome`: 서비스 목록
- `TranslateScreen`: 기본번역. 입력하면 결과가 자동 표시
- `ModeLangs`: 원문 → 번역 언어쌍과 가운데 바꾸기
- `LangPicker`: 언어 선택
- `VoiceMode`: 음성 번역
- `TalkMode`: 대화 번역
- `ImageMode`: 이미지 번역
- `DocMode`: 문서 번역

번역 하단 메뉴는 네비게이션 바가 아니라 음성·대화·이미지·문서 메뉴로 둔다.

### 이모티콘 컴포넌트

`src/emoticon/components.tsx`의 기존 컴포넌트를 재사용한다.

- `EmoticonHeader`, `EmoticonTabs`, `EmoticonSetTabs`
- `PromotionCarousel`
- `EmoticonSetCard`, `EmoticonSetGrid`, `EmoticonHorizontalList`
- `EmoticonGrid`, `EmoticonPreviewModal`
- `EmoticonSearchBar`, `MyEmoticonSetItem`
- `EmptyState`, `EmoticonMenuSheet`

## 새 화면 규칙

1. 먼저 `Phone`과 `Header`로 화면 골격을 만든다.
2. 본문은 좌우 20, 폭 320을 유지한다.
3. 버튼·카드·입력은 기존 컴포넌트와 CSS 클래스를 먼저 찾는다.
4. Primary와 상태 색상은 위 토큰만 쓴다.
5. 아이콘은 Phosphor Regular를 기본으로 한다.
6. 번역서비스 내부 화면에는 GNB를 넣지 않는다.
