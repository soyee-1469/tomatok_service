# TomaTok Design System + Photocard Dark Extension

> 기존 TomaTok 메신저 디자인 시스템을 **Source of Truth**로 사용하고, 포토카드 서비스는 새 디자인 시스템을 만들지 않고 **Dark Theme + Photocard 전용 컴포넌트만 확장**합니다.

---

## 1. Core Principle

기준 파일:
- `src/index.css`
- `src/emoticon.css`
- `src/wallet.css`

새 화면 원칙:
- 새 좌우 여백 금지
- 새 버튼 높이 금지
- 새 라운드 체계 금지
- 새 타이포 스케일 금지
- 포토카드 전용 spacing system 금지

포토카드에서 새로 추가:
- Dark Color Tokens
- Random Pack Card
- Album Cover
- Photocard Slot
- Rarity Badge
- Collection Progress
- Reveal Animation UI

---

## 2. Canvas

| 항목 | 값 |
| --- | --- |
| 폰 프레임 | **360 × 800** |
| 프레임 라운드 | 36 |
| 좌우 패딩 | **20** |
| 본문 폭 | **320** |

풀블리드 허용:
- 헤더
- 푸터
- 바텀시트
- 탭
- GNB

본문 320 안에 배치:
- 카드
- 리스트
- 카피
- 앨범 정보
- 가격
- 포토카드 구성
- 상세 콘텐츠

고정 높이:

| 영역 | 높이 |
| --- | --- |
| 상태바 | 44 |
| 헤더 | 48 |
| 탭 | 40 |
| GNB | 64 |
| 스크롤 영역 | 나머지 (`flex: 1`) |

기존 클래스:
- `.phone`
- `.status`
- `.header`
- `.phone-scroll`
- `.footer`
- `.gnb-wallet`

---

## 3. Spacing

기본 토큰:
- 4
- 8
- 12
- 16
- 20

| 용도 | 값 |
| --- | --- |
| 아이콘·텍스트 gap | 4–8 |
| 작은 텍스트 그룹 | 4 |
| 연관 요소 | 8 |
| 카드 내부 요소 | 12 |
| 컴포넌트 간 | 12–16 |
| 그리드 가로 gap | 12 |
| 그리드 세로 gap | 16 |
| 섹션 사이 | 18 |
| 본문 좌우 | 20 |
| 본문 하단 여유 | 24–28 |
| 푸터 | `8 20 16` 또는 `10 16 18` |

포토카드 상세 권장 리듬:

```text
Header
↓ 16
Album Cover
↓ 20
Artist
↓ 4
Album Title
↓ 8
Meta
↓ 20
Price
↓ 16
CTA
↓ 18
Photocard Section
↓ 12
Grid
```

---

## 4. Typography

폰트:
- **Pretendard**
- fallback: `Noto Sans KR`
- fallback: `Apple SD Gothic Neo`

기본 행간: `1.4`  
제목 자간: `-0.2px ~ -0.3px`

| 역할 | 크기 | 굵기 |
| --- | --- | --- |
| 배지 | 9–10 | 700–800 |
| 캡션 | 11 | 500 |
| 보조 | 12 | 600–700 |
| 섹션/메타 | 13 | 500–700 |
| 본문 | 14 | 600–700 |
| 고스트 CTA | 15 | 600 |
| 주요 CTA | 16 | 700 |
| 화면 제목 | 17 | 600–700 |
| 브랜드 | 18 | 800 |
| 큰 타이틀 | 20 | 800 |

포토카드 예:

```text
BLACKPINK             12 / 600
BORN PINK             17 / 700
총 12종 중 랜덤 1장   13 / 500~600
25 TOTT               20 / 800
```

---

## 5. Core Color

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--red` | `#CD313E` | 브랜드, 활성 탭, CTA, GNB 선택 |
| `--red-soft` | `#FFF5F5` | 연한 강조 배경 |
| `--blue` | `#3186F6` | 링크·정보 강조 |
| `--bg` | `#F5F5F5` | 폰·리스트 배경 |
| `--surface` | `#FFFFFF` | 헤더, 카드, 시트 |
| `--text` | `#010101` | 본문 |
| `--muted` | `#6B6E76` | 보조 카피 |
| `--line` | `rgba(0, 0, 0, 0.08)` | 구분선 |
| `--gray-box` | `#E8EAEF` | 회색 박스 |

보조값:
- `#222` 아이콘
- `#404040` 안내 본문
- `#F3F4F6` / `#F4F5F8` 입력 pill, 칩
- `#F1F1F3` 선택 원
- `#ECECF0` 채팅 배경
- `#E4E4E8` 보더, 시트 핸들
- `#C8C8CE` 비활성 보내기
- `#D5D7DE` 비활성 CTA
- `#C5C5C8` 플레이스홀더
- `rgba(0, 0, 0, 0.4)` 시트 딤

```css
accent-color: var(--red);
```

---

## 6. Photocard Dark Theme

```css
:root {
  --pc-bg: #0B0B0D;

  --pc-surface: #151517;
  --pc-surface-2: #1C1C1F;
  --pc-surface-3: #222226;

  --pc-text: #F7F7F8;
  --pc-muted: #96969D;
  --pc-subtle: #6F6F76;

  --pc-line: rgba(255, 255, 255, 0.10);
  --pc-line-soft: rgba(255, 255, 255, 0.06);

  --pc-primary: #CD313E;
  --pc-primary-soft: rgba(205, 49, 62, 0.16);
}
```

브랜드 규칙:
- 포토카드 서비스도 Primary는 `#CD313E`
- 핑크/퍼플/네온은 오픈 애니메이션, 희귀도 FX, 결과 강조에만 사용
- UI 전체 Primary로 사용하지 않음

---

## 7. Radius

| 값 | 용도 |
| --- | --- |
| 8 | 작은 아웃라인 버튼, 그리드 셀 |
| 12 | 주요 버튼, 작은 카드 |
| 16 | 카드, 썸네일, 프로모 |
| 20 | 입력 pill, 시트 상단 |
| 50% | 아이콘 원, 아바타 |
| 36 | 폰 프레임 |

새 화면마다 radius를 임의로 만들지 않습니다.

---

## 8. Elevation

| 용도 | 값 |
| --- | --- |
| 카드 그림자 | `0 4px 16px rgba(0, 0, 0, 0.06)` |
| FAB | `0 6px 16px rgba(205, 49, 62, 0.35)` |
| 시트 딤 | `rgba(0, 0, 0, 0.4)` |
| 시트 핸들 | 36×4 / `#E4E4E7` / radius 2 |

Dark Theme에서는 그림자보다:
- Surface 명도차
- Border
- 이미지 대비

로 계층을 구분합니다.

기본 UI에 Glow를 사용하지 않습니다.

---

## 9. Icon

라이브러리:
`@phosphor-icons/react`

| 위치 | 크기 | weight |
| --- | --- | --- |
| 헤더 | 22 | light / regular |
| 입력·보내기 | 16–18 | bold / fill |
| 컴팩트 | 16 | bold |

---

## 10. Core Components

### Header
- 높이 48
- 가운데 제목 17/600
- 좌우 아이콘 버튼 44×44
- 뒤로가기: `ArrowLeft`

### Primary CTA
`.btn-red`
- width 100%
- height 48
- radius 12
- font 16/700

포토카드:
`25 TOTT · 랜덤 포토카드 뽑기`

### Ghost Button
`.btn-ghost`
- 15/600
- Dark에서는 `--pc-surface-2`, `--pc-line`, `--pc-text`

### Outline Red
`.btn-outline-red`
- height 32
- red border

### Chip
- height 32
- padding x12
- radius 16
- 13/600

Dark 비선택:
```css
background: var(--pc-surface-2);
color: var(--pc-muted);
```

### Tab
- height 40
- 비선택 `--muted`
- 선택 `--red`
- 하단 2px bar

### Bottom Sheet
- `absolute inset 0`
- 상단 radius 20
- padding `18 16 22`
- 취소 + 확정

### GNB
- 5칸
- height 64
- 상단 선
- 비선택 `#9AA0A6`
- 선택 `--red`

---

## 11. Photocard Product Definition

실제 앨범은 판매하지 않습니다.

판매 상품:
**앨범에 수록된 공식 포토카드 중 랜덤 1장**

상품 단위:
`Random Photocard Pack`

앨범 커버 역할:
- 어느 앨범에서 나온 포토카드인지 구분
- 상품 대표 이미지

실제 판매 상품:
- 해당 앨범 수록 포토카드 중 랜덤 1장

---

## 12. Product Copy

권장:

```text
BORN PINK 포토카드 랜덤팩
총 12종 중 랜덤 1장
25 TOTT
```

사용 권장:
- 랜덤 포토카드
- 포토카드 랜덤팩
- 포토카드 구성
- 수록 앨범
- 총 12종
- 랜덤 1장

사용 금지:
- 앨범 구매
- 앨범 뽑기
- 앨범 상품

---

## 13. Price

기준:
- 1 TOTT ≈ 200원
- 기본 포토카드 ≈ 5,000원

기본 가격:
**25 TOTT**

보조 표기 필요 시:
`약 ₩5,000`

TOTT를 항상 Primary Price로 사용합니다.

---

## 14. Random Pack List

목록에서는 실제 포토카드 앞면을 기본 노출하지 않습니다.

구성:
- 앨범 커버
- 아티스트
- 앨범명
- 총 카드 수
- 랜덤 수량
- 가격
- CTA

예:

```text
[ Album Cover ]

BLACKPINK
BORN PINK

총 12종 중 랜덤 1장

25 TOTT
[ 뽑기 ]
```

Layout:
- 좌우 20
- 카드 radius 16
- 카드 gap 12
- 내부 padding 16
- 앨범 이미지 정사각형
- image radius 12–16
- 과한 glow/gradient border 금지

---

## 15. Random Pack Detail

```text
Header

[ Album Cover 320 × 320 ]

Artist
Album Title

총 12종 중 랜덤 1장

25 TOTT

[ 25 TOTT · 랜덤 포토카드 뽑기 ]

포토카드 구성

Photocard Grid
```

---

## 16. Photocard Grid

12종이면 시스템에 12개 카드 데이터를 모두 등록합니다.

UI:
- 실제 앞면 기본 미공개
- 실제 카드 뒷면 또는 공통 placeholder 사용
- 번호 표시

예:

```text
01  02  03  04
05  06  07  08
09  10  11  12
```

Grid:
- 가로 gap 12
- 세로 gap 16
- slot radius 8

---

## 17. Asset Registration

필수:
1. 포토카드 앞면
2. 포토카드 뒷면
3. 앨범 커버

선택 메타:
- 아티스트
- 앨범명
- 멤버
- 버전
- 카드 번호
- 희귀도
- 재고
- 추첨 가중치

---

## 18. Data Model

### RandomPack

```json
{
  "packId": "bornpink_001",
  "artist": "BLACKPINK",
  "title": "BORN PINK 포토카드 랜덤팩",
  "sourceAlbum": "BORN PINK",
  "coverImage": "bornpink_cover.jpg",
  "cardCount": 12,
  "priceTott": 25
}
```

### Photocard

```json
{
  "cardId": "bornpink_pc_01",
  "packId": "bornpink_001",
  "frontImage": "bornpink_pc_01_front.jpg",
  "backImage": "bornpink_pc_01_back.jpg",
  "cardNumber": "01",
  "member": "member_a",
  "version": "A",
  "rarity": "normal",
  "weight": 1,
  "stock": 100
}
```

---

## 19. Random Logic

12종 중 랜덤 1장:
- 12개의 Photocard 데이터 중 1개 추첨
- 동일 확률이면 1/12

희귀 카드:
- `rarity`
- `weight`
- `stock`

으로 제어

---

## 20. Rarity

추천:
- NORMAL
- RARE
- SPECIAL

원칙:
- 실제 실물 카드가 일반 재질이면 앱에서 가짜 홀로그램 효과를 입히지 않음
- 희귀도는 출현확률, 희소성, 특별 컷 여부로 구분

---

## 21. Open Animation

구조:
**Motion Graphic + Flutter Real Card Layer**

### Motion Graphic
After Effects / Kling

```text
봉투 등장
→ 봉투 찢김
→ 빛 / 파티클
→ 카드 등장
→ 고속 회전
→ 공개 직전
```

### Flutter Card Layer

실제 이미지:
- `backImage`
- `frontImage`

회전:
```text
0°   뒷면
45°  회전
90°  옆면
135° 앞면으로 교체
180° 앞면
```

---

## 22. Rarity Reveal Motion

NORMAL:
```text
고속 회전
→ 감속
→ 앞면 공개
```

RARE:
```text
고속 회전
→ 순간 가속
→ 빛 확산
→ 앞면 공개
```

SPECIAL:
```text
고속 회전
→ 순간 정지
→ 짧은 암전
→ 강한 플래시
→ 앞면 공개
```

카드 표면에는 지속형 FX를 씌우지 않습니다.

---

## 23. Result Screen

```text
[ Real Photocard ]

RARE

BLACKPINK
BORN PINK

CARD 07 / 12
```

선택 정보:
- 희귀도
- 카드 번호
- 아티스트
- 앨범명
- 보유 수량

---

## 24. My Album

예:
```text
BORN PINK
3 / 12
```

획득:
- 실제 앞면

미획득:
- 카드 뒷면 또는 placeholder

진행 표현:
- 숫자
- progress bar
- completed state

---

## 25. Photocard Dark UI Rules

Do:
- 블랙 배경
- 명도차로 계층 구분
- 앨범 커버 중심
- TomaTok Red 유지
- 실제 카드 비율 유지
- 실물과 앱 결과 차이 최소화
- 기존 Core DS 여백과 줄맞춤 유지

Don't:
- 화면 전체 핑크 네온
- 카드마다 glow
- 카드마다 gradient border
- 모든 슬롯에 큰 물음표
- 모든 컴포넌트 pill
- 과도한 badge
- 포토카드 앞면 사전 노출
- 불필요한 drop shadow 남발

---

## 26. Existing TomaTok Rules

### 이모티콘
- 가격 `5 TOTT`
- 제작자 모두 토마톡
- 카드에는 제작자 미노출
- 카테고리: 회사 / 일상 / 리액션 / 응원
- 검색 태그 `#회사`
- 상세: 히어로 → 4열 그리드 → 확대 → 유의사항/동의 → 선물/구매
- 잔액 부족 시 TOTT 충전 시트

### 채팅 입력
- `+` 40 원
- 입력 pill 40
- 보내기 40 원
- 좌우 20
- gap 8
- placeholder `메시지를 입력하세요.`
- 스티커/이모지는 입력창에 먼저 들어가고 보내기 눌러 전송

### GNB
- 5칸
- height 64
- top border
- inactive `#9AA0A6`
- active `--red`
- 가운데 지갑 FAB 52

---

## 27. Do Not

- 360 안에서 20px가 아닌 새 좌우 여백 만들지 않기
- 카드 아래 `Tomatok` 영문 제작자 다시 넣지 않기
- 이모티콘을 고르자마자 채팅으로 보내지 않기
- 새 Vite 포트를 띄우지 않기
- 로컬은 `http://localhost:5173`
- 버튼/카드 라운드 화면마다 새로 정하지 않기
- 버튼 높이 화면마다 새로 정하지 않기
- 포토카드만의 별도 spacing system 만들지 않기
- 포토카드 Dark UI에 과한 네온/글로우 사용하지 않기

---

## 28. Summary

Core:

```text
Canvas: 360 × 800
Body Margin: 20
Content Width: 320
Spacing: 4 / 8 / 12 / 16 / 20
Header: 48
Tab: 40
GNB: 64
CTA: 48
Radius: 8 / 12 / 16 / 20
Font: Pretendard
Primary: #CD313E
```

Photocard Extension:

```text
Theme: Dark
Product Type: Random Photocard Pack
Main Image: Album Cover
Price: TOTT
Default Example: 25 TOTT
Card Detail: 총 N종 중 랜덤 1장
Reveal: Motion Graphic + Flutter Card Layer
Collection: My Album
```

**최종 원칙:**  
새 포토카드 디자인 시스템을 만들지 않고, 기존 TomaTok Core DS를 그대로 사용하며 **Dark Theme와 포토카드 전용 컴포넌트만 확장**합니다.
