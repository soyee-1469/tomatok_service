import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PaperPlaneTilt, Plus, Smiley } from '@phosphor-icons/react'
import { Footer, Phone } from '../shell'
import {
  EmptyState,
  EmoticonGrid,
  EmoticonHeader,
  EmoticonHorizontalList,
  EmoticonMenuSheet,
  EmoticonSearchBar,
  EmoticonSetGrid,
  EmoticonSetTabs,
  EmoticonTabs,
  MyEmoticonSetItem,
  PromotionCarousel,
} from './components'
import {
  FriendAvatar,
  FriendSelectItem,
  GiftCompleteModal,
  PurchaseBar,
  InsufficientTottSheet,
  PurchaseCompleteModal,
  PurchaseConfirmSheet,
  ReceivedGiftCard,
} from './commerce'
import {
  EMOTICON_CATEGORIES,
  EMOTICON_SETS,
  FRIENDS,
  PROMO_BANNERS,
  SUGGESTED_QUERIES,
  asSearchTag,
  bareQuery,
  fmtPrice,
  getFriendById,
  getSeriesById,
  getSetById,
  newSets,
  recommendedSets,
  searchSets,
  setsInSeries,
} from './data'
import { useEmoticons } from './store'
import type { Emoticon } from './types'
import '../emoticon.css'


const HOME_TABS = [
  { id: 'home', label: '홈' },
  { id: 'new', label: '신규' },
]

const MY_TABS = [
  { id: 'recent', label: '최근 사용' },
  { id: 'owned', label: '보유' },
  { id: 'fav', label: '찜' },
]

function useGoSet() {
  const nav = useNavigate()
  return (id: string) => nav(`/emoticon/sets/${id}`)
}

function EmoticonHome() {
  const nav = useNavigate()
  const goSet = useGoSet()
  const [menu, setMenu] = useState(false)
  const [category, setCategory] = useState('전체')
  const recs = recommendedSets()
  const listed = category === '전체' ? EMOTICON_SETS : EMOTICON_SETS.filter((set) => set.category === category)

  return (
    <Phone>
      <EmoticonHeader
        onBack={() => nav(-1)}
        onSearch={() => nav('/emoticon/search')}
        onMenu={() => setMenu(true)}
      />
      <EmoticonTabs items={HOME_TABS} value="home" onChange={(id) => nav(id === 'new' ? '/emoticon/new' : '/emoticon')} />
      <div className="phone-scroll">
        <div className="pad emo-pad">
          <PromotionCarousel items={PROMO_BANNERS} onSelect={goSet} />
          <h2 className="section-title">이번 주 추천</h2>
          <EmoticonHorizontalList sets={recs} onSelect={goSet} />
          <h2 className="section-title" style={{ marginTop: 18 }}>
            카테고리
          </h2>
          <div className="emo-chips">
            {['전체', ...EMOTICON_CATEGORIES].map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'on' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            {category === '전체' ? '전체 이모티콘' : `${category} 이모티콘`}
          </h2>
          <EmoticonSetGrid sets={listed} onSelect={goSet} />
        </div>
      </div>
      <EmoticonMenuSheet open={menu} onClose={() => setMenu(false)} />
    </Phone>
  )
}

function EmoticonNew() {
  const nav = useNavigate()
  const goSet = useGoSet()
  const [menu, setMenu] = useState(false)
  return (
    <Phone>
      <EmoticonHeader
        title="신규 이모티콘"
        onBack={() => nav(-1)}
        onSearch={() => nav('/emoticon/search')}
        onMenu={() => setMenu(true)}
      />
      <EmoticonTabs items={HOME_TABS} value="new" onChange={(id) => nav(id === 'new' ? '/emoticon/new' : '/emoticon')} />
      <div className="phone-scroll">
        <div className="pad emo-pad">
          <EmoticonSetGrid sets={newSets()} onSelect={goSet} />
        </div>
      </div>
      <EmoticonMenuSheet open={menu} onClose={() => setMenu(false)} />
    </Phone>
  )
}

function EmoticonSearch() {
  const nav = useNavigate()
  const goSet = useGoSet()
  const store = useEmoticons()
  const [params] = useSearchParams()
  const incoming = bareQuery(params.get('q') ?? '')
  const [q, setQ] = useState(incoming)
  const [submitted, setSubmitted] = useState(incoming)
  const results = useMemo(() => (submitted ? searchSets(submitted) : []), [submitted])

  function submit(next = q) {
    const value = bareQuery(next)
    setQ(value)
    setSubmitted(value)
    if (value) store.rememberQuery(value)
  }

  return (
    <Phone>
      <EmoticonHeader title="검색" onBack={() => nav(-1)} />
      <div className="emo-search-wrap">
        <EmoticonSearchBar value={q} onChange={setQ} onSubmit={() => submit()} />
      </div>
      <div className="phone-scroll">
        <div className="pad emo-pad">
          {!submitted ? (
            <>
              <div className="emo-chip-head">
                <h2 className="section-title">최근 검색어</h2>
                {store.recentQueries.length > 0 ? (
                  <button type="button" className="emo-text-btn" onClick={store.clearRecentQueries}>
                    지우기
                  </button>
                ) : null}
              </div>
              <div className="emo-chips">
                {store.recentQueries.length === 0 ? <span className="emo-quiet">최근 검색어가 없습니다.</span> : null}
                {store.recentQueries.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQ(item)
                      submit(item)
                    }}
                  >
                    {asSearchTag(item)}
                  </button>
                ))}
              </div>
              <h2 className="section-title" style={{ marginTop: 18 }}>
                추천 검색어
              </h2>
              <div className="emo-chips">
                {SUGGESTED_QUERIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQ(item)
                      submit(item)
                    }}
                  >
                    {asSearchTag(item)}
                  </button>
                ))}
              </div>
            </>
          ) : results.length === 0 ? (
            <EmptyState title="검색 결과가 없습니다." desc="다른 검색어를 입력해보세요." />
          ) : (
            <>
              <p className="emo-result-count">검색 결과 {results.length}개</p>
              <EmoticonSetGrid sets={results} onSelect={goSet} />
            </>
          )}
        </div>
      </div>
    </Phone>
  )
}

function EmoticonDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const store = useEmoticons()
  const set = getSetById(id)
  const [popId, setPopId] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [bought, setBought] = useState(false)
  const [needTott, setNeedTott] = useState(false)
  const [agreed, setAgreed] = useState(false)
  if (!set) return <Navigate to="/emoticon" replace />

  const owned = store.isOwned(set.id)
  const fav = store.isFavorite(set.id)

  function startPurchase() {
    if (owned || !agreed) return
    if (!store.canAfford(set!.price)) {
      setNeedTott(true)
      return
    }
    setBuying(true)
  }

  return (
    <Phone>
      <EmoticonHeader
        title="이모티콘"
        onBack={() => nav(-1)}
        onFavorite={() => store.toggleFavorite(set.id)}
        favorited={fav}
        onShare={() => window.alert('공유 목업입니다.')}
      />
      <div className="phone-scroll emo-detail-scroll">
        <div className="emo-detail-page">
          <div className="emo-detail-hero">
            <div className="emo-detail-art">
              <img src={set.thumbnail} alt="" />
            </div>
            <h2>{set.title}</h2>
            <p className="emo-detail-by">
              {set.creatorName} · {set.category}
            </p>
            <p className="emo-detail-meta">
              {fmtPrice(set.price)}
              <i />
              {owned ? '보유 중' : '무제한'}
            </p>
          </div>
          <EmoticonGrid
            items={set.emoticons}
            columns={4}
            activeId={popId}
            onSelect={(item) => setPopId((cur) => (cur === item.id ? null : item.id))}
          />
          <div className="emo-notice">
            <b>구매 시 유의사항</b>
            <ul>
              <li>TOTT로 구매한 이모티콘은 선물을 포함하여 구매 후 환불이 불가능해요.</li>
              <li>TOTT는 서비스 결제에 사용되며 디지털 콘텐츠로 청약철회 대상에 포함되지 않아요.</li>
              <li>구매 전 반드시 TOTT 수량과 상품 정보를 확인해 주세요.</li>
              <li>구매한 이모티콘은 내 이모티콘에서 확인할 수 있어요.</li>
            </ul>
            {owned ? (
              <p className="emo-notice-owned">이미 보유한 이모티콘입니다.</p>
            ) : (
              <label className="emo-agree">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>구매 후 환불이 불가함에 확인했으며 동의합니다.</span>
              </label>
            )}
          </div>
        </div>
      </div>
      <Footer>
        <PurchaseBar
          set={set}
          owned={owned}
          purchaseEnabled={agreed}
          onGift={() => nav(`/emoticon/sets/${set.id}/gift`)}
          onPurchase={startPurchase}
          onUse={() => nav(`/emoticon/chat?set=${set.id}`)}
        />
      </Footer>
      {buying ? (
        <PurchaseConfirmSheet
          set={set}
          onClose={() => setBuying(false)}
          onPay={() => {
            if (!store.purchaseSet(set.id)) {
              setBuying(false)
              setNeedTott(true)
              return
            }
            setBuying(false)
            setBought(true)
          }}
        />
      ) : null}
      {needTott ? (
        <InsufficientTottSheet
          price={set.price}
          balance={store.tottBalance}
          onCharge={() => {
            store.chargeTott()
            setNeedTott(false)
            setBuying(true)
          }}
          onClose={() => setNeedTott(false)}
        />
      ) : null}
      {bought ? (
        <PurchaseCompleteModal
          onUse={() => nav(`/emoticon/chat?set=${set.id}`)}
          onClose={() => setBought(false)}
        />
      ) : null}
    </Phone>
  )
}

function SeriesDetail() {
  const { seriesId = '' } = useParams()
  const nav = useNavigate()
  const goSet = useGoSet()
  const series = getSeriesById(seriesId)
  if (!series) return <Navigate to="/emoticon" replace />
  return (
    <Phone>
      <EmoticonHeader title={series.name} onBack={() => nav(-1)} />
      <div className="phone-scroll">
        <div className="pad emo-pad">
          <p className="emo-series-desc">{series.description}</p>
          <EmoticonSetGrid sets={setsInSeries(series.id)} onSelect={goSet} />
        </div>
      </div>
    </Phone>
  )
}

function GiftFriendSelect() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const set = getSetById(id)
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  if (!set) return <Navigate to="/emoticon" replace />

  const filtered = FRIENDS.filter((f) => {
    const hay = `${f.displayName} ${f.userId}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })
  const recent = filtered.filter((f) => f.recent)
  const all = filtered.filter((f) => !f.recent)

  return (
    <Phone>
      <EmoticonHeader title="선물할 친구 선택" onBack={() => nav(-1)} />
      <div className="emo-search-wrap">
        <EmoticonSearchBar
          value={q}
          onChange={setQ}
          onSubmit={() => undefined}
          placeholder="친구 이름 또는 아이디"
        />
      </div>
      <div className="phone-scroll">
        <div className="pad emo-pad">
          <h2 className="section-title">최근 친구</h2>
          <div className="emo-friend-list">
            {recent.map((f) => (
              <FriendSelectItem
                key={f.id}
                friend={f}
                owned={f.ownedSetIds.includes(set.id)}
                selected={picked === f.id}
                onSelect={() => setPicked(f.id)}
              />
            ))}
          </div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            전체 친구
          </h2>
          <div className="emo-friend-list">
            {all.map((f) => (
              <FriendSelectItem
                key={f.id}
                friend={f}
                owned={f.ownedSetIds.includes(set.id)}
                selected={picked === f.id}
                onSelect={() => setPicked(f.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer>
        <button
          className="btn-red"
          type="button"
          disabled={!picked}
          onClick={() => nav(`/emoticon/sets/${set.id}/gift/confirm?friend=${picked}`)}
        >
          다음
        </button>
      </Footer>
    </Phone>
  )
}

function GiftConfirm() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const store = useEmoticons()
  const set = getSetById(id)
  const friend = getFriendById(params.get('friend') ?? '')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [needTott, setNeedTott] = useState(false)
  if (!set || !friend) return <Navigate to={`/emoticon/sets/${id}`} replace />

  return (
    <Phone>
      <EmoticonHeader title="선물 확인" onBack={() => nav(-1)} />
      <div className="phone-scroll">
        <div className="pad emo-pad">
          <h2 className="section-title">받는 친구</h2>
          <div className="emo-friend static">
            <FriendAvatar />
            <div>
              <b>{friend.displayName}</b>
              <span>@{friend.userId}</span>
            </div>
          </div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            상품 정보
          </h2>
          <div className="emo-buy-row card">
            <img src={set.thumbnail} alt="" />
            <div>
              <b>{set.title}</b>
              <span>{set.seriesName}</span>
              <span>{set.emoticonCount}개 이모티콘</span>
            </div>
          </div>
          <p className="emo-buy-price">{fmtPrice(set.price)}</p>
          <label className="emo-msg-label">
            메시지
            <textarea
              maxLength={50}
              placeholder="선물 메시지를 입력해주세요"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 50))}
            />
            <i>{message.length}/50</i>
          </label>
        </div>
      </div>
      <Footer>
        <button
          className="btn-red"
          type="button"
          onClick={() => {
            if (!store.canAfford(set.price)) {
              setNeedTott(true)
              return
            }
            const gift = store.sendGift({
              receiverId: friend.id,
              receiverName: friend.displayName,
              setId: set.id,
              message,
            })
            if (!gift) {
              setNeedTott(true)
              return
            }
            setDone(true)
          }}
        >
          {fmtPrice(set.price)} 선물하기
        </button>
      </Footer>
      {needTott ? (
        <InsufficientTottSheet
          price={set.price}
          balance={store.tottBalance}
          onCharge={() => {
            store.chargeTott()
            setNeedTott(false)
          }}
          onClose={() => setNeedTott(false)}
        />
      ) : null}
      {done ? (
        <GiftCompleteModal
          friendName={friend.displayName}
          title={set.title}
          onClose={() => nav(`/emoticon/sets/${set.id}`)}
        />
      ) : null}
    </Phone>
  )
}

function ReceivedGift() {
  const { giftId = '' } = useParams()
  const nav = useNavigate()
  const store = useEmoticons()
  const gift = store.gifts.find((g) => g.id === giftId)
  const set = gift ? getSetById(gift.emoticonSetId) : null
  const sender = gift ? getFriendById(gift.senderId) : null
  if (!gift || !set) return <Navigate to="/emoticon/my" replace />
  const received = gift.status === 'received'

  return (
    <Phone>
      <EmoticonHeader title="받은 선물" onBack={() => nav(-1)} />
      <div className="phone-scroll">
        <div className="pad emo-pad">
          <div className="emo-recv-hero card">
            <img src={sender?.avatar ?? set.thumbnail} alt="" className="emo-recv-avatar lg" />
            <b>{gift.senderName}</b>
            <span>보낸 선물</span>
            <img src={set.thumbnail} alt="" className="emo-recv-set" />
            <h2>{set.title}</h2>
            {gift.message ? <p className="emo-detail-desc">“{gift.message}”</p> : null}
          </div>
          {received ? <p className="emo-using">선물을 받았습니다.</p> : null}
        </div>
      </div>
      <Footer>
        {received ? (
          <button className="btn-red" type="button" onClick={() => nav(`/emoticon/chat?set=${set.id}`)}>
            채팅에서 사용하기
          </button>
        ) : (
          <button className="btn-red" type="button" onClick={() => store.acceptGift(gift.id)}>
            선물 받기
          </button>
        )}
      </Footer>
    </Phone>
  )
}

function MyEmoticons() {
  const nav = useNavigate()
  const store = useEmoticons()
  const goSet = useGoSet()
  const [tab, setTab] = useState('owned')
  const [moreId, setMoreId] = useState<string | null>(null)
  const owned = store.visibleOwnedSets()
  const favs = store.favoriteSets()
  const recents = store.recentEmoticons()
  const moreSet = moreId ? getSetById(moreId) : null

  return (
    <Phone>
      <EmoticonHeader title="내 이모티콘" onBack={() => nav(-1)} />
      <EmoticonTabs items={MY_TABS} value={tab} onChange={setTab} />
      <div className="phone-scroll">
        <div className="pad emo-pad">
          {tab === 'recent' ? (
            recents.length === 0 ? (
              <EmptyState title="최근 사용한 이모티콘이 없습니다." desc="채팅에서 이모티콘을 보내 보세요." />
            ) : (
              <EmoticonGrid
                items={recents}
                columns={5}
                onSelect={(item) => {
                  store.useEmoticon(item)
                }}
              />
            )
          ) : null}
          {tab === 'owned' ? (
            <>
              {store.pendingGifts().length > 0 ? (
                <div className="emo-recv-list">
                  {store.pendingGifts().map((gift) => {
                    const pack = getSetById(gift.emoticonSetId)
                    const sender = getFriendById(gift.senderId)
                    if (!pack) return null
                    return (
                      <ReceivedGiftCard
                        key={gift.id}
                        senderName={gift.senderName}
                        senderAvatar={sender?.avatar ?? pack.thumbnail}
                        title={pack.title}
                        thumbnail={pack.thumbnail}
                        message={gift.message}
                        onOpen={() => nav(`/emoticon/gifts/${gift.id}`)}
                      />
                    )
                  })}
                </div>
              ) : null}
            {owned.length === 0 ? (
              <EmptyState title="보유한 이모티콘이 없습니다." desc="홈에서 세트를 추가해 보세요." />
            ) : (
              <div className="emo-my-list">
                {owned.map((set) => (
                  <MyEmoticonSetItem
                    key={set.id}
                    set={set}
                    onOpen={() => goSet(set.id)}
                    onMore={() => setMoreId(set.id)}
                  />
                ))}
              </div>
            )}
            </>
          ) : null}
          {tab === 'fav' ? (
            favs.length === 0 ? (
              <EmptyState title="찜한 이모티콘이 없습니다." desc="상세에서 하트를 눌러 저장하세요." />
            ) : (
              <EmoticonSetGrid sets={favs} onSelect={goSet} />
            )
          ) : null}
        </div>
      </div>
      {moreSet ? (
        <div className="emo-sheet-dim" onClick={() => setMoreId(null)} role="presentation">
          <div className="emo-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <b>{moreSet.title}</b>
            <button
              type="button"
              onClick={() => {
                store.moveSet(moreSet.id, -1)
                setMoreId(null)
              }}
            >
              순서 변경 · 위로
            </button>
            <button
              type="button"
              onClick={() => {
                store.moveSet(moreSet.id, 1)
                setMoreId(null)
              }}
            >
              순서 변경 · 아래로
            </button>
            <button
              type="button"
              onClick={() => {
                store.hideSet(moreSet.id)
                setMoreId(null)
              }}
            >
              숨기기
            </button>
            <button
              type="button"
              onClick={() => {
                store.removeSet(moreSet.id)
                setMoreId(null)
              }}
            >
              삭제
            </button>
            <button type="button" onClick={() => setMoreId(null)}>
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </Phone>
  )
}

type ChatLine = { id: string; text?: string; emoticon?: Emoticon }
type ChatTab = string | 'basic'
type RecentReaction =
  | { id: string; kind: 'emoji'; char: string }
  | { id: string; kind: 'sticker'; item: Emoticon }

const BASIC_EMOJIS = [
  '😈',
  '😊',
  '😆',
  '😖',
  '😘',
  '😗',
  '😍',
  '😁',
  '😜',
  '😂',
  '😮',
  '🥶',
  '😵',
  '😡',
  '😌',
  '😩',
  '😢',
  '😬',
  '😎',
  '😇',
  '😅',
  '😄',
  '🤕',
  '😟',
  '😋',
]

const DEFAULT_RECENT: RecentReaction[] = [
  { id: 'r-1', kind: 'emoji', char: '😊' },
  { id: 'r-2', kind: 'emoji', char: '😈' },
  { id: 'r-3', kind: 'emoji', char: '😖' },
  { id: 'r-4', kind: 'emoji', char: '😘' },
  { id: 'r-5', kind: 'emoji', char: '😄' },
  { id: 'r-6', kind: 'emoji', char: '😗' },
]

function ChatEmoticonPicker() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const store = useEmoticons()
  const owned = store.visibleOwnedSets()
  const initial = params.get('set')
  const [active, setActive] = useState<ChatTab>(
    initial && owned.some((s) => s.id === initial) ? initial : 'basic',
  )
  const [log, setLog] = useState<ChatLine[]>([])
  const [text, setText] = useState('')
  const [draft, setDraft] = useState<Emoticon | null>(null)
  const [pickerOpen, setPickerOpen] = useState(true)
  const [recent, setRecent] = useState<RecentReaction[]>(DEFAULT_RECENT)

  const items = active === 'basic' ? [] : (getSetById(active)?.emoticons ?? [])
  const canSend = Boolean(draft || text.trim())

  function remember(next: RecentReaction) {
    setRecent((rows) => [next, ...rows.filter((row) => row.id !== next.id)].slice(0, 6))
  }

  function pickEmoji(char: string) {
    setDraft(null)
    setText((value) => value + char)
    remember({ id: `emoji-${char}`, kind: 'emoji', char })
  }

  function pickSticker(item: Emoticon) {
    setDraft(item)
    remember({ id: item.id, kind: 'sticker', item })
  }

  function send() {
    if (draft) {
      store.useEmoticon(draft)
      setLog((rows) => [...rows.slice(-4), { id: `${draft.id}-${Date.now()}`, emoticon: draft }])
      setDraft(null)
      return
    }
    const message = text.trim()
    if (!message) return
    setLog((rows) => [...rows.slice(-4), { id: `text-${Date.now()}`, text: message }])
    setText('')
  }

  return (
    <Phone>
      <EmoticonHeader title="대화" onBack={() => nav(-1)} />
      <div className="phone-scroll emo-chat-scroll">
        <div className="emo-chat-log">
          {log.map((line) =>
            line.emoticon ? (
              <div key={line.id} className="emo-bubble emo-bubble-emo">
                <img
                  src={
                    line.emoticon.type === 'animated' && line.emoticon.animatedImage
                      ? line.emoticon.animatedImage
                      : line.emoticon.image
                  }
                  alt={line.emoticon.name}
                />
              </div>
            ) : (
              <div key={line.id} className="emo-bubble">
                {line.text}
              </div>
            ),
          )}
        </div>
      </div>
      <div className="emo-picker">
        <form
          className="emo-composer"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <button
            className="emo-plus"
            type="button"
            aria-label="추가"
            onClick={() => setPickerOpen(false)}
          >
            <Plus size={18} weight="bold" />
          </button>
          <div className="emo-composer-field">
            {draft ? (
              <span className="emo-composer-draft">
                <img
                  src={draft.type === 'animated' && draft.animatedImage ? draft.animatedImage : draft.image}
                  alt={draft.name}
                />
                <button type="button" className="emo-composer-x" aria-label="지우기" onClick={() => setDraft(null)}>
                  ×
                </button>
              </span>
            ) : null}
            <input
              value={text}
              onChange={(e) => {
                setDraft(null)
                setText(e.target.value)
              }}
              placeholder={draft ? '' : '메시지를 입력하세요.'}
              aria-label="메시지"
            />
            <button
              className={`emo-input-smile${pickerOpen ? ' on' : ''}`}
              type="button"
              aria-label="이모티콘"
              onClick={() => setPickerOpen((open) => !open)}
            >
              <Smiley size={22} />
            </button>
          </div>
          <button className="emo-send" type="submit" disabled={!canSend} aria-label="보내기">
            <PaperPlaneTilt size={16} weight="fill" />
          </button>
        </form>
        {pickerOpen ? (
          <div className="emo-picker-body">
            {active === 'basic' ? (
              <div className="emo-recent">
                <p>최근 반응</p>
                <div className="emo-recent-row">
                  {recent.map((item) =>
                    item.kind === 'emoji' ? (
                      <button key={item.id} type="button" onClick={() => pickEmoji(item.char)}>
                        {item.char}
                      </button>
                    ) : (
                      <button key={item.id} type="button" onClick={() => pickSticker(item.item)}>
                        <img
                          src={
                            item.item.type === 'animated' && item.item.animatedImage
                              ? item.item.animatedImage
                              : item.item.image
                          }
                          alt={item.item.name}
                        />
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : null}
            <EmoticonSetTabs
              sets={owned}
              active={active}
              onBasic={() => setActive('basic')}
              onSet={setActive}
              onShop={() => nav('/emoticon')}
            />
            {active === 'basic' ? (
              <div className="emo-emoji-grid">
                {BASIC_EMOJIS.map((char) => (
                  <button key={char} type="button" onClick={() => pickEmoji(char)}>
                    {char}
                  </button>
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState title="표시할 이모티콘이 없습니다." desc="상점에서 세트를 추가해 보세요." />
            ) : (
              <EmoticonGrid items={items} columns={4} activeId={draft?.id} onSelect={pickSticker} />
            )}
          </div>
        ) : null}
      </div>
    </Phone>
  )
}

export function EmoticonRoutes() {
  return (
    <Routes>
      <Route index element={<EmoticonHome />} />
      <Route path="new" element={<EmoticonNew />} />
      <Route path="search" element={<EmoticonSearch />} />
      <Route path="series/:seriesId" element={<SeriesDetail />} />
      <Route path="sets/:id/gift/confirm" element={<GiftConfirm />} />
      <Route path="sets/:id/gift" element={<GiftFriendSelect />} />
      <Route path="sets/:id" element={<EmoticonDetail />} />
      <Route path="gifts/:giftId" element={<ReceivedGift />} />
      <Route path="my" element={<MyEmoticons />} />
      <Route path="chat" element={<ChatEmoticonPicker />} />
      <Route path="*" element={<Navigate to="/emoticon" replace />} />
    </Routes>
  )
}
