import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  List,
  MagnifyingGlass,
  ShareNetwork,
  Storefront,
  X,
} from '@phosphor-icons/react'
import { Header } from '../shell'
import type { Emoticon, EmoticonSet, PreviewBg } from './types'

export function EmoticonHeader({
  title = '이모티콘',
  onBack,
  onSearch,
  onMenu,
  onFavorite,
  favorited,
  onShare,
}: {
  title?: string
  onBack?: () => void
  onSearch?: () => void
  onMenu?: () => void
  onFavorite?: () => void
  favorited?: boolean
  onShare?: () => void
}) {
  return (
    <Header
      title={title}
      onBack={onBack}
      right={
        <div className="emo-head-right">
          {onSearch ? (
            <button className="icon-btn" type="button" aria-label="검색" onClick={onSearch}>
              <MagnifyingGlass size={22} />
            </button>
          ) : null}
          {onFavorite ? (
            <button className="icon-btn" type="button" aria-label="찜" onClick={onFavorite}>
              <Heart size={22} weight={favorited ? 'fill' : 'regular'} color={favorited ? 'var(--red)' : '#222'} />
            </button>
          ) : null}
          {onShare ? (
            <button className="icon-btn" type="button" aria-label="공유" onClick={onShare}>
              <ShareNetwork size={22} />
            </button>
          ) : null}
          {onMenu ? (
            <button className="icon-btn" type="button" aria-label="메뉴" onClick={onMenu}>
              <List size={22} />
            </button>
          ) : null}
        </div>
      }
    />
  )
}

export function EmoticonTabs({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="emo-tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`emo-tab${value === item.id ? ' on' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function PromotionCarousel({
  items,
  onSelect,
}: {
  items: {
    id: string
    setId: string
    title: string
    eyebrow: string
    theme: string
    stills: string[]
  }[]
  onSelect: (setId: string) => void
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  function onScroll() {
    const el = scroller.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const w = card ? card.offsetWidth + 8 : 1
    setIndex(Math.round(el.scrollLeft / w))
  }

  return (
    <div className="emo-promo">
      <div className="emo-promo-track" ref={scroller} onScroll={onScroll}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`emo-promo-card theme-${item.theme}`}
            onClick={() => onSelect(item.setId)}
          >
            <div className="emo-promo-copy">
              <em>{item.eyebrow}</em>
              <b>{item.title}</b>
            </div>
            <div className="emo-promo-stills">
              {item.stills.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="emo-promo-dots">
        {items.map((item, i) => (
          <i key={item.id} className={i === index ? 'on' : ''} />
        ))}
      </div>
    </div>
  )
}

export function EmoticonSetCard({
  set,
  onClick,
}: {
  set: EmoticonSet
  onClick: () => void
}) {
  return (
    <button type="button" className="emo-set-card" onClick={onClick}>
      <div className="emo-set-thumb">
        <img src={set.thumbnail} alt="" />
        {set.isNew ? <em>NEW</em> : null}
      </div>
      <div className="emo-set-meta">
        <b>{set.title}</b>
        <span>{set.category}</span>
      </div>
    </button>
  )
}

export function EmoticonSetGrid({
  sets,
  onSelect,
}: {
  sets: EmoticonSet[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="emo-set-grid">
      {sets.map((set) => (
        <EmoticonSetCard key={set.id} set={set} onClick={() => onSelect(set.id)} />
      ))}
    </div>
  )
}

export function EmoticonHorizontalList({
  sets,
  onSelect,
}: {
  sets: EmoticonSet[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="emo-hlist">
      {sets.map((set) => (
        <EmoticonSetCard key={set.id} set={set} onClick={() => onSelect(set.id)} />
      ))}
    </div>
  )
}

export function EmoticonGrid({
  items,
  columns = 4,
  onSelect,
  activeId,
}: {
  items: Emoticon[]
  columns?: 4 | 5
  onSelect: (item: Emoticon) => void
  activeId?: string | null
}) {
  return (
    <div className={`emo-grid cols-${columns}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`emo-cell${activeId === item.id ? ' pop' : ''}`}
          onClick={() => onSelect(item)}
        >
          <img
            src={
              activeId === item.id && item.type === 'animated' && item.animatedImage
                ? item.animatedImage
                : item.image
            }
            alt={item.name}
          />
        </button>
      ))}
    </div>
  )
}

export function EmoticonPreviewModal({
  item,
  onClose,
}: {
  item: Emoticon | null
  onClose: () => void
}) {
  const [bg, setBg] = useState<PreviewBg>('white')
  if (!item) return null
  const src = item.type === 'animated' && item.animatedImage ? item.animatedImage : item.image
  return (
    <div className="emo-sheet-dim" onClick={onClose} role="presentation">
      <div className="emo-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="이모티콘 미리보기">
        <button className="icon-btn emo-sheet-x" type="button" aria-label="닫기" onClick={onClose}>
          <X size={20} />
        </button>
        <div className={`emo-preview-stage bg-${bg}`}>
          <img src={src} alt={item.name} className={item.type === 'animated' ? 'is-anim' : ''} />
        </div>
        <b>{item.name}</b>
        <span>{item.tags.join(' · ')}</span>
        {item.type === 'animated' ? <em className="emo-anim-tag">움직임 미리보기</em> : null}
        <div className="emo-bg-opts">
          {(
            [
              ['white', '화이트'],
              ['gray', '연회색'],
              ['dark', '다크'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={bg === id ? 'on' : ''}
              onClick={() => setBg(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function EmoticonSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '이모티콘 이름을 검색해보세요',
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <form
      className="emo-search-bar"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <MagnifyingGlass size={18} />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value ? (
        <button type="button" aria-label="지우기" onClick={() => onChange('')}>
          <X size={16} />
        </button>
      ) : null}
    </form>
  )
}

export function MyEmoticonSetItem({
  set,
  onOpen,
  onMore,
}: {
  set: EmoticonSet
  onOpen: () => void
  onMore: () => void
}) {
  return (
    <div className="emo-my-item">
      <button type="button" className="emo-my-main" onClick={onOpen}>
        <img src={set.thumbnail} alt="" />
        <div>
          <b>{set.title}</b>
          <span>{set.characterName}</span>
          <div className="emo-my-previews">
            {set.emoticons.slice(0, 4).map((e) => (
              <img key={e.id} src={e.image} alt="" />
            ))}
          </div>
        </div>
      </button>
      <button type="button" className="icon-btn" aria-label="더보기" onClick={onMore}>
        ⋯
      </button>
    </div>
  )
}

export function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="emo-empty">
      <b>{title}</b>
      <p>{desc}</p>
    </div>
  )
}

export function EmoticonMenuSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const nav = useNavigate()
  if (!open) return null
  return (
    <div className="emo-sheet-dim" onClick={onClose} role="presentation">
      <div className="emo-menu-sheet" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => {
            onClose()
            nav('/emoticon/my')
          }}
        >
          내 이모티콘
        </button>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}

export function EmoticonSetTabs({
  sets,
  active,
  onBasic,
  onSet,
  onShop,
}: {
  sets: EmoticonSet[]
  active: string | 'basic'
  onBasic: () => void
  onSet: (id: string) => void
  onShop: () => void
}) {
  return (
    <div className="emo-set-tabs">
      {sets.map((set) => (
        <button
          key={set.id}
          type="button"
          className={`emo-pack-tab${active === set.id ? ' on' : ''}`}
          onClick={() => onSet(set.id)}
        >
          <span className="emo-pack-ico">
            <img src={set.thumbnail} alt="" />
          </span>
          <em>{set.characterName}</em>
        </button>
      ))}
      <button
        type="button"
        className={`emo-pack-tab${active === 'basic' ? ' on' : ''}`}
        onClick={onBasic}
      >
        <span className="emo-pack-ico">😄</span>
        <em>기본</em>
      </button>
      <button type="button" className="emo-pack-tab" onClick={onShop}>
        <span className="emo-pack-ico shop">
          <Storefront size={22} color="#b0b0b4" />
        </span>
        <em>상점</em>
      </button>
    </div>
  )
}
