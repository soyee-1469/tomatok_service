---
name: tomatalk-design-system
description: >-
  Applies the TomaTok Core Design System and Photocard Dark Extension.
  Use when building, restyling, or reviewing TomaTok phone UI, emoticon store,
  wallet, chat composer, photocard random packs, My Album, reveal motion,
  or when the user mentions DESIGN.md, TomaTok DS, 포토카드, 랜덤팩, TOTT, 360px.
---

# TomaTok Design System

기존 TomaTok 메신저 DS가 Source of Truth다. 포토카드는 새 시스템을 만들지 않고 **Dark Theme + 전용 컴포넌트만 확장**한다.

전체 스펙은 [reference.md](reference.md)를 그대로 따른다. 구현 전에 해당 파일을 읽는다.

## 적용 순서

1. `reference.md`의 Canvas / Spacing / Type / Color / Radius를 확인한다.
2. 이모티콘·지갑·채팅은 Core(라이트) 토큰을 쓴다.
3. 포토카드는 `--pc-*` Dark 토큰을 쓰고 Primary는 `#CD313E`를 유지한다.
4. 새 좌우 여백, 버튼 높이, 라운드, 타이포, spacing 체계를 만들지 않는다.

## 빠른 제약

- Canvas **360 × 800**, 본문 좌우 **20**, 내용 **320**
- Spacing **4 / 8 / 12 / 16 / 20**
- Header 48 / Tab 40 / GNB 64 / CTA 48
- Radius **8 / 12 / 16 / 20**
- Font Pretendard
- Primary `#CD313E`
- 로컬은 `http://localhost:5173`만 사용

## 포토카드 제품

- 판매 상품은 앨범이 아니라 **랜덤 포토카드 1장**
- 카피: `총 N종 중 랜덤 1장` / `25 TOTT · 랜덤 포토카드 뽑기`
- 목록·상세에서 앞면 사전 노출 금지
- 공개 연출은 Motion + 카드 플립, 카드 표면에 지속 FX 금지
- 금지 카피: 앨범 구매, 앨범 뽑기, 앨범 상품
