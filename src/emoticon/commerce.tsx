import { Gift as GiftIcon, User } from '@phosphor-icons/react'
import { fmtPrice, isOnSale } from './data'
import type { EmoticonSet, Friend } from './types'

export function FriendAvatar({ size = 40 }: { size?: number }) {
  return (
    <span className="emo-friend-avatar" style={{ width: size, height: size }} aria-hidden>
      <User size={Math.round(size * 0.5)} weight="fill" />
    </span>
  )
}

export function SeriesSection({
  name,
  onClick,
}: {
  name: string
  onClick: () => void
}) {
  return (
    <button type="button" className="emo-series-link" onClick={onClick}>
      {name} <span>›</span>
    </button>
  )
}

export function PurchaseBar({
  set,
  owned,
  purchaseEnabled = true,
  onGift,
  onPurchase,
  onUse,
}: {
  set: EmoticonSet
  owned: boolean
  purchaseEnabled?: boolean
  onGift: () => void
  onPurchase: () => void
  onUse: () => void
}) {
  const onSale = isOnSale(set)
  return (
    <div className="emo-buy-bar">
      <GiftButton onClick={onGift} disabled={!set.isGiftable} />
      {owned ? (
        <button className="btn-red" type="button" onClick={onUse}>
          채팅에서 사용하기
        </button>
      ) : (
        <button className="btn-red" type="button" onClick={onPurchase} disabled={!onSale || !purchaseEnabled}>
          {onSale ? '구매하기' : '판매 종료'}
        </button>
      )}
    </div>
  )
}

export function GiftButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button className="emo-gift-btn" type="button" onClick={onClick} disabled={disabled}>
      <GiftIcon size={20} />
      <em>선물하기</em>
    </button>
  )
}

export function PurchaseConfirmSheet({
  set,
  onClose,
  onPay,
}: {
  set: EmoticonSet
  onClose: () => void
  onPay: () => void
}) {
  return (
    <div className="emo-sheet-dim" onClick={onClose} role="presentation">
      <div className="emo-sheet emo-buy-sheet" onClick={(e) => e.stopPropagation()}>
        <i className="emo-sheet-handle" />
        <h3>구매 확인</h3>
        <img className="emo-buy-thumb" src={set.thumbnail} alt="" />
        <dl className="emo-buy-dl">
          <div>
            <dt>상품명</dt>
            <dd>{set.title}</dd>
          </div>
          <div>
            <dt>구매 수량</dt>
            <dd>{fmtPrice(set.price)}</dd>
          </div>
          <div>
            <dt>사용기한</dt>
            <dd>무제한</dd>
          </div>
        </dl>
        <p className="emo-buy-warn">TOTT로 구매한 이모티콘은 선물하기를 포함하여, 구매 완료 후 환불이 불가합니다.</p>
        <div className="emo-confirm-actions">
          <button className="btn-ghost" type="button" onClick={onClose}>
            취소
          </button>
          <button className="btn-red" type="button" onClick={onPay}>
            구매확정
          </button>
        </div>
      </div>
    </div>
  )
}

export function InsufficientTottSheet({
  price,
  balance,
  onCharge,
  onClose,
}: {
  price: number
  balance: number
  onCharge: () => void
  onClose: () => void
}) {
  return (
    <div className="emo-sheet-dim emo-center-dim" onClick={onClose} role="presentation">
      <div className="emo-modal" onClick={(e) => e.stopPropagation()}>
        <b>TOTT가 부족합니다.</b>
        <p>
          이 세트는 {fmtPrice(price)}입니다.
          <br />
          현재 잔액은 {fmtPrice(balance)}입니다.
        </p>
        <button className="btn-red" type="button" onClick={onCharge}>
          TOTT 충전하기
        </button>
        <button className="btn-ghost" type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}

export function PurchaseCompleteModal({
  onUse,
  onClose,
}: {
  onUse: () => void
  onClose: () => void
}) {
  return (
    <div className="emo-sheet-dim emo-center-dim" onClick={onClose} role="presentation">
      <div className="emo-modal" onClick={(e) => e.stopPropagation()}>
        <b>구매가 완료되었습니다.</b>
        <p>구매한 이모티콘 세트는 내 이모티콘에 추가되었습니다.</p>
        <button className="btn-red" type="button" onClick={onUse}>
          채팅에서 사용하기
        </button>
        <button className="btn-ghost" type="button" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  )
}

export function FriendSelectItem({
  friend,
  owned,
  selected,
  onSelect,
}: {
  friend: Friend
  owned: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`emo-friend${selected ? ' on' : ''}${owned ? ' off' : ''}`}
      onClick={owned ? undefined : onSelect}
      disabled={owned}
    >
      <FriendAvatar />
      <div>
        <b>{friend.displayName}</b>
        <span>@{friend.userId}</span>
      </div>
      {owned ? <em>이미 보유 중</em> : selected ? <i className="emo-friend-check">✓</i> : null}
    </button>
  )
}

export function GiftCompleteModal({
  friendName,
  title,
  onClose,
}: {
  friendName: string
  title: string
  onClose: () => void
}) {
  return (
    <div className="emo-sheet-dim emo-center-dim" onClick={onClose} role="presentation">
      <div className="emo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="emo-modal-ico">🎁</div>
        <b>선물을 보냈습니다.</b>
        <p>
          {friendName}님에게
          <br />
          {title}을 선물했습니다.
        </p>
        <button className="btn-red" type="button" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  )
}

export function ReceivedGiftCard({
  senderName,
  senderAvatar,
  title,
  thumbnail,
  message,
  onOpen,
}: {
  senderName: string
  senderAvatar: string
  title: string
  thumbnail: string
  message: string
  onOpen: () => void
}) {
  return (
    <button type="button" className="emo-recv-card" onClick={onOpen}>
      <img src={senderAvatar} alt="" className="emo-recv-avatar" />
      <div>
        <b>{senderName}님의 선물</b>
        <span>{title}</span>
        {message ? <em>“{message}”</em> : null}
      </div>
      <img src={thumbnail} alt="" className="emo-recv-thumb" />
    </button>
  )
}
