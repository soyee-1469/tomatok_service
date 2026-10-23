import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type DragEvent as ReactDragEvent,
  type ReactNode,
} from 'react'
import {
  ArrowClockwise,
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  ArrowsLeftRight,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  Coins,
  Copy,
  DotsSixVertical,
  DotsThreeVertical,
  Gear,
  LinkBreak,
  PencilSimple,
  QrCode,
  Receipt,
  Star,
  type Icon,
} from '@phosphor-icons/react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import iconPhantom from '../assets/icon_wallet_phantom.png'
import { Footer, Gnb, Header, Phone } from '../shell'
import {
  EXCHANGE_MIN_TOTT,
  TOKEN_TICKERS,
  TP_SEED,
  WALLETS,
  PHANTOM_CAN_LIST_ACCOUNTS,
  currentPhantomWallet,
  discoverPhantom,
  fiatOf,
  fmtFiat,
  fmtTott,
  fmtTp,
  loadScene,
  mockStamp,
  shortManage,
  shortOf,
  sortWallets,
  totalTott,
  tottToTp,
  tpPerTott,
  txKindLabel,
} from './data'
import type {
  Currency,
  PhantomDiscoveryMode,
  PhantomSessionId,
  PhantomWallet,
  WalletNft,
  WalletScene,
  WalletTx,
} from './data'

type WalletContextValue = {
  wallets: PhantomWallet[]
  index: number
  setIndex: (i: number) => void
  selected: PhantomWallet | null
  currency: Currency
  setCurrency: (c: Currency | ((prev: Currency) => Currency)) => void
  loading: boolean
  selectById: (id: string) => void
  toggleFavorite: (id: string) => void
  setPrimary: (id: string) => void
  renameWallet: (id: string, alias: string) => void
  addWallet: () => void
  addWallets: (incoming: PhantomWallet[]) => void
  applyScene: (scene: WalletScene) => void
  scene: WalletScene | null
  phantomSession: PhantomSessionId
  discovered: PhantomWallet[]
  currentPhantom: PhantomWallet | null
  discoveryMode: PhantomDiscoveryMode
  setDiscoveryMode: (mode: PhantomDiscoveryMode) => void
  switchPhantomSession: () => void
  switchPhantomWallet: () => void
  selectPhantomWallet: (address: string) => void
  canSign: (address: string) => boolean
  removeWallet: (id: string) => void
  moveWallet: (id: string, dir: -1 | 1) => void
  reorderWallet: (from: number, to: number) => void
  total: number
  /** 토마톡 포인트(TP) 잔액. 지갑과 무관한 계정 단위 값 */
  tp: number
  /** 선택 지갑의 TOTT를 TP로 교환. 성공하면 받은 TP, 실패하면 null */
  exchange: (id: string, tott: number) => number | null
}

const WalletContext = createContext<WalletContextValue | null>(null)

const PH = { weight: 'light' as const }

const WALLET_ACTIONS: { label: string; path: (id: string) => string; Icon: Icon }[] = [
  { label: '보내기', path: (id) => `/wallet/${id}/send`, Icon: ArrowUp },
  { label: '받기', path: (id) => `/wallet/${id}/receive`, Icon: ArrowDown },
  { label: '채우기', path: (id) => `/wallet/${id}/fill`, Icon: Coins },
  { label: '거래보기', path: (id) => `/wallet/${id}/txs`, Icon: Receipt },
]

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState(() => sortWallets(WALLETS))
  const [index, setIndex] = useState(() => {
    const i = sortWallets(WALLETS).findIndex((w) => w.primary)
    return i >= 0 ? i : 0
  })
  const [currency, setCurrency] = useState<Currency>('KRW')
  const [phantomSession, setPhantomSession] = useState<PhantomSessionId>('A')
  const [phantomIndex, setPhantomIndex] = useState(0)
  const [discoveryMode, setDiscoveryMode] = useState<PhantomDiscoveryMode>(
    PHANTOM_CAN_LIST_ACCOUNTS ? 'multi' : 'single',
  )
  const [loading] = useState(false)
  const [tp, setTp] = useState(TP_SEED)
  const addSeq = useRef(10)
  const discovered = useMemo(() => discoverPhantom(phantomSession), [phantomSession])
  const currentPhantom = useMemo(
    () => currentPhantomWallet(phantomSession, phantomIndex),
    [phantomSession, phantomIndex],
  )
  const liveAddresses = useMemo(() => new Set(discovered.map((w) => w.address)), [discovered])

  const selected = wallets.length
    ? (wallets[Math.min(index, wallets.length - 1)] ?? wallets[0])
    : null

  const value = useMemo<WalletContextValue>(
    () => ({
      wallets,
      index,
      setIndex,
      selected,
      currency,
      setCurrency,
      loading,
      total: totalTott(wallets),
      tp,
      exchange(id, tott) {
        const w = wallets.find((x) => x.id === id)
        if (!w || !(tott >= EXCHANGE_MIN_TOTT) || tott > w.tott) return null
        const gain = tottToTp(tott)
        const tx: WalletTx = {
          id: `tx-ex-${Date.now().toString(36)}`,
          type: 'exchange',
          amount: tott,
          at: mockStamp(),
          status: '완료',
        }
        setWallets((list) =>
          list.map((x) => (x.id === id ? { ...x, tott: x.tott - tott, txs: [tx, ...x.txs] } : x)),
        )
        setTp((cur) => cur + gain)
        return gain
      },
      selectById(id) {
        const i = wallets.findIndex((w) => w.id === id)
        if (i >= 0) setIndex(i)
      },
      toggleFavorite(id) {
        setWallets((list) => {
          const next = list.map((w) => (w.id === id ? { ...w, favorite: !w.favorite } : w))
          const sorted = sortWallets(next)
          const curId = selected?.id ?? id
          const cur = sorted.findIndex((w) => w.id === curId)
          if (cur >= 0) setIndex(cur)
          return sorted
        })
      },
      setPrimary(id) {
        setWallets((list) => {
          const incoming = list.find((w) => w.id === id)
          const outgoing = list.find((w) => w.primary)
          if (!incoming || incoming.id === outgoing?.id) return list
          const incomingOrder = incoming.order
          const outgoingOrder = outgoing?.order ?? 0
          const next = list.map((w) => {
            if (w.id === incoming.id) {
              return { ...w, primary: true, favorite: true, order: outgoingOrder }
            }
            if (outgoing && w.id === outgoing.id) {
              return { ...w, primary: false, order: incomingOrder }
            }
            return { ...w, primary: false }
          })
          return sortWallets(next)
        })
        setIndex(0)
      },
      renameWallet(id, alias) {
        const name = alias.trim()
        if (!name) return
        setWallets((list) => list.map((w) => (w.id === id ? { ...w, alias: name } : w)))
      },
      addWallet() {
        addSeq.current += 1
        const n = addSeq.current
        const tag = n.toString(16).padStart(4, '0')
        const address = `0x${tag}${'ab'.repeat(12)}${tag}`
        const next: PhantomWallet = {
          id: `w-new-${n}`,
          alias: `지갑 ${n}`,
          address,
          shortAddress: shortOf(address),
          tott: 0,
          favorite: false,
          lastUsedAt: Date.now(),
          order: wallets.length,
          nfts: [],
          txs: [],
        }
        setWallets((list) => sortWallets([...list, next]))
        setIndex(wallets.length)
      },
      addWallets(incoming) {
        setWallets((list) => {
          const have = new Set(list.map((w) => w.address))
          const extras = incoming
            .filter((w) => !have.has(w.address))
            .map((w, i) => ({
              ...w,
              nfts: w.nfts.map((n) => ({ ...n })),
              txs: w.txs.map((t) => ({ ...t })),
              primary: false,
              order: list.length + i,
            }))
          if (!extras.length) return list
          return sortWallets([...list, ...extras])
        })
      },
      applyScene(scene) {
        const next = sortWallets(loadScene(scene))
        setWallets(next)
        setPhantomSession('A')
        setPhantomIndex(0)
        const i = next.findIndex((w) => w.primary)
        setIndex(i >= 0 ? i : 0)
      },
      phantomSession,
      discovered,
      currentPhantom,
      discoveryMode,
      setDiscoveryMode,
      switchPhantomSession() {
        setPhantomSession((cur) => (cur === 'A' ? 'B' : 'A'))
        setPhantomIndex(0)
      },
      switchPhantomWallet() {
        setPhantomIndex((i) => i + 1)
      },
      selectPhantomWallet(address) {
        const i = discovered.findIndex((w) => w.address === address)
        if (i >= 0) setPhantomIndex(i)
      },
      canSign(address) {
        return liveAddresses.has(address)
      },
      scene:
        wallets.length === 1 && wallets[0]?.nfts.length === 0
          ? 'solo-empty'
          : wallets.length >= 3 && wallets.some((w) => w.nfts.length >= 3)
            ? 'multi-nft'
            : null,
      removeWallet(id) {
        setWallets((list) => {
          const next = list.filter((w) => w.id !== id).map((w, order) => ({ ...w, order }))
          if (!next.some((w) => w.primary) && next[0]) {
            next[0] = { ...next[0], primary: true, favorite: true }
          }
          const arranged = sortWallets(next)
          const keepId = selected?.id === id ? arranged[0]?.id : selected?.id
          const ni = arranged.findIndex((w) => w.id === keepId)
          setIndex(ni >= 0 ? ni : 0)
          return arranged
        })
      },
      moveWallet(id, dir) {
        setWallets((list) => {
          const primary = list.find((w) => w.primary)
          const rest = list.filter((w) => w.id !== primary?.id)
          const i = rest.findIndex((w) => w.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= rest.length) return list
          const arr = [...rest]
          const a = arr[i]
          const b = arr[j]
          if (!a || !b) return list
          arr[i] = b
          arr[j] = a
          return sortWallets(primary ? [primary, ...arr] : arr)
        })
      },
      reorderWallet(from, to) {
        setWallets((list) => {
          const primary = list.find((w) => w.primary)
          const rest = list.filter((w) => w.id !== primary?.id)
          if (from === to || from < 0 || to < 0 || from >= rest.length || to >= rest.length) {
            return list
          }
          const arr = [...rest]
          const [item] = arr.splice(from, 1)
          if (!item) return list
          arr.splice(to, 0, item)
          const next = sortWallets(primary ? [primary, ...arr] : arr)
          const curId = selected?.id
          if (curId) {
            const ni = next.findIndex((w) => w.id === curId)
            if (ni >= 0) setIndex(ni)
          }
          return next
        })
      },
    }),
    [
      wallets,
      index,
      selected,
      currency,
      loading,
      phantomSession,
      discovered,
      currentPhantom,
      discoveryMode,
      liveAddresses,
      tp,
    ],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('WalletProvider required')
  return ctx
}

export function statusClass(status: string) {
  if (status === '검증완료') return 's-verify'
  if (status === '진행중') return 's-pending'
  if (status === '완료') return 's-done'
  if (status === '실패') return 's-fail'
  if (status === '성공') return 's-ok'
  return ''
}

/** One wallet card = address + balance + actions (keeps selection feel unified) */
function WalletCardCarousel({
  wallets,
  index,
  onIndex,
  currency,
  setCurrency,
  onSelect,
}: {
  wallets: PhantomWallet[]
  index: number
  onIndex: (i: number) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  onSelect: (id: string) => void
}) {
  const { tp } = useWallet()
  const trackRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const deltaX = useRef(0)
  const dragging = useRef(false)
  const multi = wallets.length > 1
  /** Multi: peek + gap. Solo: 20 + 320 + 20 */
  const GAP = multi ? 20 : 0
  const PEEK = multi ? 22 : 20
  const CARD = 360 - PEEK * 2 - GAP
  const STEP = CARD + GAP

  function baseX(i: number) {
    return PEEK - i * STEP
  }

  function commit(dx: number) {
    if (Math.abs(dx) < 36) return
    if (dx < 0 && index < wallets.length - 1) onIndex(index + 1)
    if (dx > 0 && index > 0) onIndex(index - 1)
  }

  if (wallets.length === 0) return null

  return (
    <div className="w-carousel">
      <div
        className="w-carousel-viewport"
        onPointerDown={(e) => {
          if (!multi) return
          dragging.current = true
          startX.current = e.clientX
          deltaX.current = 0
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return
          deltaX.current = e.clientX - startX.current
          if (trackRef.current) {
            trackRef.current.style.transition = 'none'
            trackRef.current.style.transform = `translateX(${baseX(index) + deltaX.current}px)`
          }
        }}
        onPointerUp={() => {
          dragging.current = false
          if (trackRef.current) {
            trackRef.current.style.transition = ''
            trackRef.current.style.transform = ''
          }
          commit(deltaX.current)
          deltaX.current = 0
        }}
        onPointerCancel={() => {
          dragging.current = false
          if (trackRef.current) {
            trackRef.current.style.transition = ''
            trackRef.current.style.transform = ''
          }
          deltaX.current = 0
        }}
      >
        <div
          ref={trackRef}
          className="w-carousel-track"
          style={{
            transform: `translateX(${baseX(index)}px)`,
            width: wallets.length * CARD + Math.max(0, wallets.length - 1) * GAP,
            gap: GAP,
          }}
        >
          {wallets.map((w) => (
            <div key={w.id} className="w-carousel-slide" style={{ width: CARD }}>
              <div className={`w-main-card${w.primary ? ' primary' : ''}`}>
                <div className="w-card-head">
                  <div className="w-card-title">
                    <b className="w-card-alias">{w.alias}</b>
                    {w.primary ? (
                      <span className="w-card-badge">
                        <Star size={12} weight="fill" />
                        대표
                      </span>
                    ) : null}
                  </div>
                  <div className="w-addr-pill">
                    <img className="w-ph" src={iconPhantom} alt="" />
                    <span className="w-addr-text">{w.shortAddress}</span>
                    <div className="w-id-tools">
                      <button
                        type="button"
                        className="w-mini"
                        aria-label="주소 복사"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => void navigator.clipboard?.writeText(w.address)}
                      >
                        <Copy size={16} {...PH} />
                      </button>
                      <button
                        type="button"
                        className="w-mini"
                        aria-label="QR"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <QrCode size={16} {...PH} />
                      </button>
                      <button
                        type="button"
                        className="w-mini"
                        aria-label="공유"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <ArrowSquareOut size={16} {...PH} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-card-body">
                  <div className="w-tott-label">토마톡(TOTT)</div>
                  <p className="w-balance static">{fmtTott(w.tott)}</p>
                  <div className="w-asset-row">
                    <p className="w-fiat">
                      {fmtFiat(fiatOf(w.tott, currency), currency)}
                      <i className="w-info">i</i>
                    </p>
                    <div
                      className="w-seg sm"
                      role="group"
                      aria-label="통화"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={currency === 'USD' ? 'on' : ''}
                        onClick={() => setCurrency('USD')}
                      >
                        USD
                      </button>
                      <button
                        type="button"
                        className={currency === 'KRW' ? 'on' : ''}
                        onClick={() => setCurrency('KRW')}
                      >
                        KRW
                      </button>
                    </div>
                  </div>

                  <div className="w-tp-row" onPointerDown={(e) => e.stopPropagation()}>
                    <span className="w-tp-label">
                      <i className="w-tp-mark" aria-hidden>
                        TP
                      </i>
                      포인트(TP)
                    </span>
                    <b className="w-tp-amount">
                      {fmtTp(tp)} <small>TP</small>
                    </b>
                    <Link
                      to={`/wallet/${w.id}/exchange`}
                      className="w-tp-link"
                      onClick={() => onSelect(w.id)}
                    >
                      교환하기 <CaretRight size={12} weight="bold" />
                    </Link>
                  </div>

                  <div className="w-actions flat">
                    {WALLET_ACTIONS.map((a) => (
                      <Link
                        key={a.label}
                        to={a.path(w.id)}
                        className="w-action"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onSelect(w.id)}
                      >
                        <span className="w-action-ico">
                          <a.Icon size={26} {...PH} />
                        </span>
                        <span>{a.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {multi && wallets.length <= 5 ? (
        <div className="w-pager">
          <div className="w-dots">
            {wallets.map((w, i) => (
              <button
                key={w.id}
                type="button"
                className={`w-dot${i === index ? ' on' : ''}`}
                aria-label={`${i + 1}번 지갑`}
                onClick={() => onIndex(i)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NftPreviewCarousel({
  walletId,
  nfts,
}: {
  walletId: string
  nfts: WalletNft[]
}) {
  const slide = nfts.length >= 3
  const GAP = 10
  const PEEK = slide ? 36 : 0
  const CARD = slide ? (320 - GAP - PEEK) / 2 : nfts.length === 1 ? 200 : (320 - GAP) / 2

  return (
    <div className={`w-nft-carousel${slide ? ' slide' : ''}`}>
      <div
        className="w-nft-track"
        style={{
          width: nfts.length * CARD + Math.max(0, nfts.length - 1) * GAP,
          gap: GAP,
        }}
      >
        {nfts.map((n) => (
          <Link
            key={n.id}
            to={`/wallet/${walletId}/nfts/${n.id}`}
            className="w-nft"
            style={{ width: CARD, flexBasis: CARD, height: CARD, background: n.color }}
          >
            <span className="w-nft-tag">{n.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function WalletHome() {
  const {
    wallets,
    index,
    setIndex,
    selected,
    selectById,
    currency,
    setCurrency,
    loading,
  } = useWallet()

  const previewTxs = selected?.txs.slice(0, 4) ?? []

  if (loading) {
    return (
      <Phone>
        <div className="w-topbar">
          <h1>지갑</h1>
        </div>
        <div className="phone-scroll w-scroll">
          <div className="w-empty-page">지갑 정보를 불러오는 중…</div>
        </div>
        <Gnb />
      </Phone>
    )
  }

  if (!selected || wallets.length === 0) {
    return (
      <Phone>
        <div className="w-topbar">
          <h1>지갑</h1>
          <Link to="/wallet/all" className="w-manage-link" aria-label="지갑 관리">
            <span>지갑 관리</span>
            <Gear size={20} {...PH} />
          </Link>
        </div>
        <div className="phone-scroll w-scroll">
          <div className="w-empty-page">
            <p>연결된 Phantom 지갑이 없습니다.</p>
            <Link to="/wallet/add" className="btn-red w-empty-cta">
              지갑 추가
            </Link>
          </div>
        </div>
        <Gnb />
      </Phone>
    )
  }

  return (
    <Phone>
        <div className="w-topbar">
          <h1>지갑</h1>
          <div className="w-topbar-right">
            <Link to="/wallet/all" className="w-manage-link" aria-label="지갑 관리">
              <span>지갑 관리</span>
              <Gear size={20} {...PH} />
            </Link>
          </div>
        </div>

      <div className="phone-scroll w-scroll">
        <div className="w-red-band">
          <div className="w-red-meta">
            <span>2025.08.17 14:03</span>
            <div className="w-red-tools">
              <button type="button" className="w-refresh" aria-label="새로고침">
                <ArrowClockwise size={18} {...PH} />
              </button>
            </div>
          </div>
          {wallets.length > 1 ? (
            <p className="w-slide-pos">
              {index + 1} / {wallets.length}
            </p>
          ) : null}
        </div>

        <WalletCardCarousel
          wallets={wallets}
          index={index}
          onIndex={setIndex}
          currency={currency}
          setCurrency={setCurrency}
          onSelect={selectById}
        />

        <div className="w-pad">
          <section className="w-section">
            <div className="w-section-head">
              <h2>
                보유 NFT <em>{selected.nfts.length}개</em>
              </h2>
              <Link to={`/wallet/${selected.id}/nfts`} className="w-more">
                전체보기 ›
              </Link>
            </div>
            {selected.nfts.length === 0 ? (
              <div className="w-empty-box tall">
                <p className="w-empty-title">아직 보유한 NFT가 없습니다</p>
                <p className="w-empty-sub">이 지갑으로 받은 NFT가 여기에 모여요</p>
              </div>
            ) : (
              <NftPreviewCarousel walletId={selected.id} nfts={selected.nfts} />
            )}
          </section>

          <section className="w-section">
            <div className="w-section-head">
              <h2>최근 거래내역</h2>
              <Link to={`/wallet/${selected.id}/txs`} className="w-more">
                전체보기 ›
              </Link>
            </div>
            {previewTxs.length === 0 ? (
              <div className="w-empty-box">거래 내역이 없습니다.</div>
            ) : (
              <ul className="w-tx-list">
                {previewTxs.map((tx) => (
                  <li key={tx.id}>
                    <Link to={`/wallet/${selected.id}/txs/${tx.id}`} className="w-tx">
                      <span
                        className={`w-tx-ico ${tx.type === 'send' ? 'out' : 'in'}`}
                      >
                        {tx.type === 'send' ? '↑' : '↓'}
                      </span>
                      <div className="w-tx-mid">
                        <b>{txKindLabel(tx.type)}</b>
                        <em>{tx.at}</em>
                      </div>
                      <div className="w-tx-right">
                        <strong className={tx.type === 'send' ? 'out' : 'in'}>
                          {tx.type === 'send' ? '-' : '+'}
                          {fmtTott(tx.amount)} TOTT
                        </strong>
                      </div>
                      <span className={`w-badge ${statusClass(tx.status)}`}>{tx.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="w-section">
            <div className="w-section-head">
              <h2>토큰 정보</h2>
            </div>
            <div className="w-token-grid duo">
              {TOKEN_TICKERS.map((t) => (
                <div key={t.id} className="w-token-card">
                  <div className="w-token-head">
                    <span className={`w-token-badge ${t.id}`}>{t.symbol[0]}</span>
                    <b>
                      {t.symbol} {t.quote}
                    </b>
                  </div>
                  {t.loading ? (
                    <em className="w-muted">시세 불러오는 중…</em>
                  ) : (
                    <>
                      <strong>{t.price}</strong>
                      <em className={t.change >= 0 ? 'up' : 'down'}>
                        {t.change >= 0 ? '+' : ''}
                        {t.change.toFixed(2)}%
                      </em>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function WalletAll() {
  const nav = useNavigate()
  const {
    wallets,
    selectById,
    setPrimary,
    renameWallet,
    removeWallet,
    reorderWallet,
  } = useWallet()
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const drag = useRef<{
    id: string
    from: number
    startY: number
    pointerId: number
  } | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragY, setDragY] = useState(0)
  const didDrag = useRef(false)

  const primaryWallet = wallets.find((w) => w.primary) ?? null
  const restWallets = wallets.filter((w) => w.id !== primaryWallet?.id)

  const indexAtY = (clientY: number) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('.w-manage-card')
    if (!items?.length) return 0
    const skipId = drag.current?.id
    let idx = 0
    for (const el of items) {
      if (el.dataset.walletId === skipId) continue
      const r = el.getBoundingClientRect()
      if (clientY < r.top + r.height / 2) return idx
      idx += 1
    }
    return items.length - 1
  }

  const closeSheet = () => setSheetId(null)

  useEffect(() => {
    if (!sheetId && !confirmId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (confirmId) setConfirmId(null)
      else closeSheet()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetId, confirmId])

  const startRename = (id: string, alias: string) => {
    setEditingId(id)
    setDraft(alias)
    closeSheet()
  }

  const commitRename = (id: string) => {
    renameWallet(id, draft)
    setEditingId(null)
  }

  const goAddWallet = () => {
    closeSheet()
    nav('/wallet/add')
  }

  const endDrag = () => {
    const session = drag.current
    if (session) {
    try {
      const node = listRef.current?.querySelector<HTMLElement>(`[data-wallet-id="${session.id}"]`)
      node?.releasePointerCapture(session.pointerId)
    } catch {
      /* already released */
    }
    }
    drag.current = null
    setDragId(null)
    setDragY(0)
    const scroller = listRef.current?.closest('.phone-scroll') as HTMLElement | null
    if (scroller) scroller.style.overflow = ''
  }

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLElement>, id: string) => {
    if (restWallets.length < 2) return
    const from = restWallets.findIndex((w) => w.id === id)
    if (from < 0) return
    didDrag.current = false
    drag.current = { id, from, startY: e.clientY, pointerId: e.pointerId }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic */
    }
  }

  const onCardPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const session = drag.current
    if (!session) return
    const dy = e.clientY - session.startY
    if (!didDrag.current) {
      if (Math.abs(dy) < 10) return
      didDrag.current = true
      closeSheet()
      setDragId(session.id)
      const scroller = listRef.current?.closest('.phone-scroll') as HTMLElement | null
      if (scroller) scroller.style.overflow = 'hidden'
    }
    e.preventDefault()
    setDragY(dy)
    const over = indexAtY(e.clientY)
    const from = restWallets.findIndex((w) => w.id === session.id)
    if (from >= 0 && over !== from) {
      reorderWallet(from, over)
      session.from = over
      session.startY = e.clientY
      setDragY(0)
    }
  }

  const onCardDragStart = (e: ReactDragEvent<HTMLElement>, id: string) => {
    if ((e.target as HTMLElement).closest('.w-alias-input, .w-card-more, .w-action-menu')) {
      e.preventDefault()
      return
    }
    const from = restWallets.findIndex((w) => w.id === id)
    if (from < 0) {
      e.preventDefault()
      return
    }
    didDrag.current = true
    drag.current = { id, from, startY: e.clientY, pointerId: 0 }
    setDragId(id)
    closeSheet()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const onCardDragOver = (e: ReactDragEvent<HTMLLIElement>) => {
    e.preventDefault()
    const session = drag.current
    if (!session) return
    const over = indexAtY(e.clientY)
    const from = restWallets.findIndex((w) => w.id === session.id)
    if (from >= 0 && over !== from) {
      reorderWallet(from, over)
      session.from = over
    }
  }

  const sheetWallet = sheetId ? wallets.find((w) => w.id === sheetId) : null
  const confirmWallet = confirmId ? wallets.find((w) => w.id === confirmId) : null

  const MD = { weight: 'regular' as const }

  const renderCard = (w: PhantomWallet, rest: boolean) => (
    <li
      key={w.id}
      data-wallet-id={w.id}
      className={`w-manage-card w-md-row${w.primary ? ' primary' : ''}${dragId === w.id ? ' dragging' : ''}`}
      style={dragId === w.id ? { transform: `translateY(${dragY}px)` } : undefined}
      onDragOver={rest ? onCardDragOver : undefined}
      onDrop={
        rest
          ? (e) => {
              e.preventDefault()
              endDrag()
            }
          : undefined
      }
    >
      {rest && restWallets.length > 1 ? (
        <span
          className="w-drag-handle"
          draggable
          role="button"
          aria-label={`${w.alias} 순서 변경`}
          onPointerDown={(e) => onHandlePointerDown(e, w.id)}
          onPointerMove={onCardPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(e) => onCardDragStart(e, w.id)}
        >
          <DotsSixVertical size={20} {...MD} />
        </span>
      ) : w.primary ? (
        <span className="w-md-star" aria-hidden>
          <Star size={18} weight="fill" />
        </span>
      ) : null}
      <span className="w-md-avatar">
        <img className="w-ph" src={iconPhantom} alt="" />
      </span>
      <div
        className="w-manage-body"
        onClick={() => {
          if (editingId === w.id || didDrag.current) return
          selectById(w.id)
          nav('/wallet')
        }}
      >
        {editingId === w.id ? (
          <input
            className="w-alias-input"
            value={draft}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitRename(w.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') setEditingId(null)
            }}
            aria-label="지갑 별칭"
          />
        ) : (
          <b>
            <span className="w-manage-alias">{w.alias}</span>
            {w.primary ? <em className="w-primary-badge">대표</em> : null}
          </b>
        )}
        <span className="w-manage-addr">{shortManage(w.address)}</span>
        <div className="w-manage-amt">
          <strong>{w.tott.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
          <span className="w-muted">{fmtFiat(fiatOf(w.tott, 'KRW'), 'KRW')}</span>
        </div>
      </div>
      <button
        type="button"
        className="w-card-more"
        aria-haspopup="dialog"
        aria-label={`${w.alias} 설정`}
        onClick={() => setSheetId(w.id)}
      >
        <DotsThreeVertical size={20} {...MD} />
      </button>
    </li>
  )

  return (
    <Phone>
      <Header title="지갑 관리" onBack={() => nav('/wallet')} />
      <div className="phone-scroll w-scroll w-md-scroll">
        <div className="w-md-page">
          {wallets.length === 0 ? (
            <div className="w-md-empty">
              <p>아직 추가된 지갑이 없습니다</p>
            </div>
          ) : (
            <>
              {primaryWallet ? (
                <section className="w-md-block">
                  <p className="w-md-kicker">대표 지갑</p>
                  <ul className="w-md-list pin">{renderCard(primaryWallet, false)}</ul>
                </section>
              ) : null}

              {restWallets.length > 0 ? (
                <section className="w-md-block">
                  <p className="w-md-kicker">다른 지갑 {restWallets.length}개</p>
                  {restWallets.length > 1 ? (
                    <p className="w-manage-hint">카드를 위아래로 밀어 노출 순서를 바꿀 수 있어요</p>
                  ) : null}
                  <ul ref={listRef} className={`w-md-list${dragId ? ' reordering' : ''}`}>
                    {restWallets.map((w) => renderCard(w, true))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
      <Gnb />
      {!sheetWallet && !confirmWallet ? (
        <div className="w-manage-dock">
          <button type="button" className="w-manage-add-btn" onClick={goAddWallet}>
            + 지갑 추가
          </button>
        </div>
      ) : null}
      {sheetWallet ? (
        <div className="w-sheet-backdrop w-md-scrim" onClick={closeSheet}>
          <div
            className="w-sheet w-md-sheet"
            role="dialog"
            aria-label="지갑 설정"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-sheet-handle" />
            <h2>지갑 설정</h2>
            {!sheetWallet.primary ? (
              <button
                type="button"
                className="w-sheet-item"
                onClick={() => {
                  setPrimary(sheetWallet.id)
                  closeSheet()
                }}
              >
                <Star size={20} {...MD} />
                대표 지갑으로 설정
              </button>
            ) : null}
            <button
              type="button"
              className="w-sheet-item"
              onClick={() => startRename(sheetWallet.id, sheetWallet.alias)}
            >
              <PencilSimple size={20} {...MD} />
              이름 변경
            </button>
            <button
              type="button"
              className="w-sheet-item danger"
              onClick={() => {
                closeSheet()
                setConfirmId(sheetWallet.id)
              }}
            >
              <LinkBreak size={20} {...MD} />
              연결 해제
            </button>
          </div>
        </div>
      ) : null}
      {confirmWallet ? (
        <div className="w-md-scrim w-confirm-layer" onClick={() => setConfirmId(null)}>
          <div
            className="w-md-dialog"
            role="dialog"
            aria-label="연결 해제"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>연결을 해제할까요?</h2>
            <p>
              ‘{confirmWallet.alias}’ 연결을 해제하면 목록에서 사라집니다. Phantom 앱의 지갑은
              삭제되지 않습니다.
            </p>
            <p className="w-md-dialog-addr">{confirmWallet.shortAddress}</p>
            <div className="w-md-dialog-actions">
              <button type="button" onClick={() => setConfirmId(null)}>
                취소
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  removeWallet(confirmWallet.id)
                  setConfirmId(null)
                }}
              >
                연결 해제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Phone>
  )
}

export function WalletIdRedirect() {
  const { id } = useParams()
  const { selectById } = useWallet()
  useEffect(() => {
    if (id) selectById(id)
  }, [id, selectById])
  return <Navigate to="/wallet/all" replace />
}

function PlaceholderScreen({ title }: { title: string }) {
  const nav = useNavigate()
  return (
    <Phone>
      <Header title={title} onBack={() => nav(-1)} />
      <div className="phone-scroll">
        <div className="w-pad">
          <p className="w-muted">목업 화면입니다. 선택 지갑 기준으로 동작합니다.</p>
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function WalletActionPlaceholder() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { id } = useParams()
  const { wallets, canSign } = useWallet()
  const wallet = wallets.find((w) => w.id === id)
  const title = pathname.includes('/send')
    ? '보내기'
    : pathname.includes('/receive')
      ? '받기'
      : pathname.includes('/fill')
        ? '채우기'
        : '거래보기'
  const blocked = Boolean(title === '보내기' && wallet && !canSign(wallet.address))

  if (blocked) {
    return (
      <Phone>
        <Header title={title} onBack={() => nav(-1)} />
        <div className="phone-scroll w-scroll">
          <div className="w-pad">
            <div className="w-empty-box tall">
              <p className="w-empty-title">Phantom에서 이 지갑을 연결해 주세요</p>
              <p className="w-empty-sub">
                ‘{wallet?.alias}’ 잔액·NFT·거래내역은 그대로 볼 수 있어요. 보내려면 이 주소가 있는
                Phantom 계정으로 연결해 주세요.
              </p>
              <button
                type="button"
                className="btn-phantom w-empty-cta"
                onClick={() => nav('/wallet/add')}
              >
                Phantom 연결하기
              </button>
            </div>
          </div>
        </div>
        <Gnb />
      </Phone>
    )
  }

  return <PlaceholderScreen title={title} />
}

function LinkedBadge() {
  return <em className="w-linked-badge">연결됨</em>
}

function AddWalletCard({
  wallet,
  linked,
  selected,
  selectable,
  showAmount,
  onToggle,
}: {
  wallet: PhantomWallet
  linked?: boolean
  selected?: boolean
  selectable?: boolean
  showAmount?: boolean
  onToggle?: () => void
}) {
  const body = (
    <>
      {selectable ? (
        <span className={`w-add-check${selected ? ' on' : ''}`} aria-hidden>
          {selected ? <Check size={13} weight="bold" /> : null}
        </span>
      ) : null}
      <span className="w-md-avatar">
        <img className="w-ph" src={iconPhantom} alt="" />
      </span>
      <span className="w-add-copy">
        <b>
          <span className="w-manage-alias">{wallet.alias}</span>
          {linked ? <LinkedBadge /> : null}
        </b>
        <span>{shortManage(wallet.address)}</span>
      </span>
      {showAmount ? (
        <span className="w-manage-amt">
          <strong>{wallet.tott.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
          <span className="w-muted">{fmtFiat(fiatOf(wallet.tott, 'KRW'), 'KRW')}</span>
        </span>
      ) : null}
    </>
  )

  if (selectable) {
    return (
      <button
        type="button"
        className={`w-add-card${selected ? ' on' : ''}`}
        aria-pressed={selected}
        onClick={onToggle}
      >
        {body}
      </button>
    )
  }

  return <div className={`w-add-card${linked ? ' linked' : ''}`}>{body}</div>
}

function PhantomConnectSheet({
  wallets,
  current,
  onClose,
  onConnect,
  onSwitchAccount,
}: {
  wallets: PhantomWallet[]
  current: PhantomWallet | null
  onClose: () => void
  onConnect: (wallet: PhantomWallet) => void
  onSwitchAccount: () => void
}) {
  const [listOpen, setListOpen] = useState(false)
  const [pick, setPick] = useState(current?.address ?? wallets[0]?.address ?? '')
  const chosen = wallets.find((w) => w.address === pick) ?? current ?? wallets[0] ?? null

  useEffect(() => {
    const next = current?.address ?? wallets[0]?.address ?? ''
    if (next) setPick(next)
  }, [current, wallets])

  return (
    <div className="ph-scrim" onClick={onClose}>
      <div
        className="ph-sheet"
        role="dialog"
        aria-label="Phantom 연결"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ph-profile" onClick={() => setListOpen((v) => !v)}>
          <img className="w-ph" src={iconPhantom} alt="" />
          <span>
            <b>{chosen?.alias ?? 'Phantom'}</b>
            {chosen ? <em>{shortManage(chosen.address)}</em> : null}
          </span>
          <CaretDown size={16} weight="bold" />
        </button>
        {listOpen ? (
          <ul className="ph-accounts">
            {wallets.map((w) => (
              <li key={w.address}>
                <button
                  type="button"
                  className={w.address === pick ? 'on' : ''}
                  onClick={() => {
                    setPick(w.address)
                    setListOpen(false)
                  }}
                >
                  <img className="w-ph" src={iconPhantom} alt="" />
                  <span>
                    <b>{w.alias}</b>
                    <em>{shortManage(w.address)}</em>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="ph-other"
                onClick={() => {
                  onSwitchAccount()
                  setListOpen(true)
                }}
              >
                다른 계정
              </button>
            </li>
          </ul>
        ) : (
          <p className="ph-ask">Tomatok이 지갑 연결을 요청합니다</p>
        )}
        <button
          type="button"
          className="btn-phantom"
          disabled={!chosen}
          onClick={() => chosen && onConnect(chosen)}
        >
          연결
        </button>
      </div>
    </div>
  )
}

export function WalletAdd() {
  const nav = useNavigate()
  const {
    wallets,
    addWallets,
    discovered,
    currentPhantom,
    discoveryMode,
    switchPhantomSession,
    selectPhantomWallet,
  } = useWallet()
  const loc = useLocation()
  const locState = (loc.state as { done?: boolean; connected?: boolean } | null) ?? {}
  const [picked, setPicked] = useState<string[]>([])
  const [phantomOpen, setPhantomOpen] = useState(false)
  const done = Boolean(locState.done)
  const connectedFlow = Boolean(locState.connected)
  const [review, setReview] = useState(connectedFlow)

  const registered = useMemo(() => new Set(wallets.map((w) => w.address)), [wallets])
  const rows = useMemo(
    () =>
      discovered.map((w) => ({
        wallet: w,
        linked: registered.has(w.address),
      })),
    [discovered, registered],
  )
  const selected = rows.filter((r) => !r.linked && picked.includes(r.wallet.address)).map((r) => r.wallet)
  const linkedCount = rows.filter((r) => r.linked).length
  const currentLinked = currentPhantom ? registered.has(currentPhantom.address) : false
  const multi = discoveryMode === 'multi'

  useEffect(() => {
    setPicked([])
  }, [discovered, discoveryMode])

  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(() => nav('/wallet/all', { replace: true }), 900)
    return () => window.clearTimeout(t)
  }, [done, nav])

  const toggle = (address: string) => {
    if (registered.has(address)) return
    setPicked((list) => (list.includes(address) ? list.filter((x) => x !== address) : [...list, address]))
  }

  const finish = (incoming: PhantomWallet[]) => {
    const fresh = incoming.filter((w) => !registered.has(w.address))
    if (!fresh.length) return
    addWallets(fresh)
    nav('/wallet/add', { replace: true, state: { done: true, connected: true } })
  }

  const openPhantom = () => setPhantomOpen(true)

  const handlePhantomConnect = (wallet: PhantomWallet) => {
    selectPhantomWallet(wallet.address)
    setPhantomOpen(false)
    setReview(true)
    nav('/wallet/add', { replace: true, state: { connected: true } })
  }

  if (done) {
    return (
      <Phone>
        <Header title="지갑 추가" />
        <div className="phone-scroll w-scroll w-md-scroll">
          <div className="w-add-done">
            <CheckCircle size={48} weight="fill" />
            <p>지갑이 추가됐어요</p>
          </div>
        </div>
      </Phone>
    )
  }

  return (
    <Phone>
      <Header title="지갑 추가" onBack={() => nav('/wallet/all')} />
      <div className="phone-scroll w-scroll w-md-scroll">
        <div className="w-md-page w-add-page">
          {!review ? (
            <div className="w-add-guide">
              <img className="w-add-ph" src={iconPhantom} alt="" />
              <h2 className="w-add-lead">Phantom 지갑 연결하기</h2>
              <p className="w-add-sub">Phantom에서 연결할 지갑을 선택할 수 있어요.</p>
              <p className="w-add-help">
                연결 화면 상단의 프로필을 누르면 보유한 지갑 목록을 확인할 수 있어요.
                <br />
                원하는 지갑을 선택한 뒤 ‘연결’을 눌러주세요.
              </p>
            </div>
          ) : multi ? (
            <>
              <h2 className="w-add-lead">추가할 지갑을 선택하세요</h2>
              <p className="w-add-sub">
                Phantom에서 {rows.length}개를 찾았어요 · {linkedCount}개 연결됨
              </p>
              <ul className="w-add-list">
                {rows.map(({ wallet: w, linked }) => (
                  <li key={w.address}>
                    <AddWalletCard
                      wallet={w}
                      linked={linked}
                      selected={picked.includes(w.address)}
                      selectable={!linked}
                      onToggle={() => toggle(w.address)}
                    />
                  </li>
                ))}
              </ul>
              <button type="button" className="w-add-switch phantom" onClick={openPhantom}>
                Phantom 다시 연결하기
              </button>
            </>
          ) : (
            <>
              <p className="w-md-kicker">현재 연결된 Phantom 지갑</p>
              {currentPhantom ? (
                <AddWalletCard wallet={currentPhantom} linked={currentLinked} showAmount />
              ) : (
                <p className="w-add-sub">연결된 Phantom 지갑이 없어요</p>
              )}
              <button type="button" className="w-add-switch phantom" onClick={openPhantom}>
                Phantom 다시 연결하기
              </button>
            </>
          )}
        </div>
      </div>
      <Footer>
        {!review ? (
          <button type="button" className="btn-phantom" onClick={openPhantom}>
            Phantom 연결하기
          </button>
        ) : multi ? (
          <button
            type="button"
            className="btn-red"
            disabled={!selected.length}
            onClick={() => finish(selected)}
          >
            {selected.length ? `선택한 지갑 ${selected.length}개 추가` : '지갑을 선택하세요'}
          </button>
        ) : currentLinked || !currentPhantom ? (
          <p className="w-add-cta-note">이미 연결된 지갑이에요</p>
        ) : (
          <button type="button" className="btn-red" onClick={() => finish([currentPhantom])}>
            이 지갑 추가
          </button>
        )}
      </Footer>
      {phantomOpen ? (
        <PhantomConnectSheet
          wallets={discovered}
          current={currentPhantom}
          onClose={() => setPhantomOpen(false)}
          onConnect={handlePhantomConnect}
          onSwitchAccount={() => switchPhantomSession()}
        />
      ) : null}
    </Phone>
  )
}

export function WalletSceneNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const { applyScene, scene, selected, discoveryMode, setDiscoveryMode } = useWallet()

  return (
    <>
      <h2 style={{ marginTop: 18 }}>지갑 화면</h2>
      <button
        type="button"
        className={scene === 'solo-empty' && loc.pathname === '/wallet' ? 'on' : ''}
        onClick={() => {
          applyScene('solo-empty')
          nav('/wallet')
        }}
      >
        지갑 1개 · NFT 없음
      </button>
      <button
        type="button"
        className={scene === 'multi-nft' && loc.pathname === '/wallet' ? 'on' : ''}
        onClick={() => {
          applyScene('multi-nft')
          nav('/wallet')
        }}
      >
        지갑 여러 개 · NFT 여러 개
      </button>
      <button
        type="button"
        className={loc.pathname === '/wallet/add' && discoveryMode === 'multi' ? 'on' : ''}
        onClick={() => {
          setDiscoveryMode('multi')
          nav('/wallet/add')
        }}
      >
        지갑 추가 · 여러 개
      </button>
      <button
        type="button"
        className={loc.pathname === '/wallet/add' && discoveryMode === 'single' ? 'on' : ''}
        onClick={() => {
          setDiscoveryMode('single')
          nav('/wallet/add')
        }}
      >
        지갑 추가 · 1개
      </button>
      {selected ? (
        <>
          <Link
            to={`/wallet/${selected.id}/nfts`}
            className={loc.pathname.includes('/nfts') ? 'on' : ''}
          >
            NFT 전체보기
          </Link>
          <Link
            to={`/wallet/${selected.id}/txs`}
            className={loc.pathname.includes('/txs') ? 'on' : ''}
          >
            거래내역 전체보기
          </Link>
        </>
      ) : null}
    </>
  )
}

/* ---------- TOTT · TP 교환 ---------- */

function trimTott(n: number) {
  return Number(n.toFixed(6)).toString()
}

/** 지갑의 TOTT를 TP로 교환하는 화면. 포토카드 앱의 교환 페이지 구성(보유 → 입력 → 미리보기 → 유의사항)을 따른다. */
export function WalletExchangeScreen() {
  const nav = useNavigate()
  const { id } = useParams()
  const { wallets, tp, exchange } = useWallet()
  const wallet = wallets.find((w) => w.id === id) ?? null
  const [input, setInput] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [done, setDone] = useState<{ tott: number; tp: number } | null>(null)

  if (!wallet) return <Navigate to="/wallet" replace />

  const tott = Math.max(0, Number(input.replace(/,/g, '')) || 0)
  const gain = tottToTp(tott)
  const tooBig = tott > wallet.tott
  const ready = tott >= EXCHANGE_MIN_TOTT && !tooBig
  const hint =
    tott > 0 && tooBig
      ? '보유한 TOTT보다 많아요. 채우기에서 TOTT를 구매해요.'
      : tott < EXCHANGE_MIN_TOTT
        ? `최소 ${EXCHANGE_MIN_TOTT} TOTT부터 교환할 수 있어요.`
        : ''
  const setPct = (pct: number) => setInput(trimTott((wallet.tott * pct) / 100))

  function confirm() {
    const got = exchange(wallet!.id, tott)
    if (got === null) return
    setDone({ tott, tp: got })
    setStep('done')
  }

  if (step === 'done' && done) {
    return (
      <Phone>
        <Header title="TOTT · TP 교환" />
        <div className="phone-scroll w-scroll">
          <div className="w-pad w-ex-page">
            <div className="w-ex-done">
              <span className="w-ex-done-ico">
                <CheckCircle size={44} weight="fill" />
              </span>
              <h2>교환이 완료됐어요</h2>
              <p>
                <b>{fmtTott(done.tott)} TOTT</b> → <b className="w-ex-plus">+ {fmtTp(done.tp)} TP</b>
              </p>
            </div>
            <section className="w-ex-card">
              <div className="w-ex-line">
                <span>지갑</span>
                <strong>{wallet.alias}</strong>
              </div>
              <div className="w-ex-line">
                <span>남은 TOTT</span>
                <strong>{fmtTott(wallet.tott)} TOTT</strong>
              </div>
              <div className="w-ex-line">
                <span>TP 보유량</span>
                <strong>{fmtTp(tp)} TP</strong>
              </div>
            </section>
          </div>
        </div>
        <Footer>
          <button type="button" className="btn-ghost" onClick={() => nav(`/wallet/${wallet.id}/txs`)}>
            거래 내역
          </button>
          <button type="button" className="btn-red" onClick={() => nav('/wallet')}>
            지갑으로
          </button>
        </Footer>
      </Phone>
    )
  }

  return (
    <Phone>
      <Header title="TOTT · TP 교환" onBack={() => (step === 'confirm' ? setStep('form') : nav(-1))} />
      <div className="phone-scroll w-scroll">
        <div className="w-pad w-ex-page">
          <section className="w-ex-card">
            <div className="w-ex-line">
              <span>연결 지갑</span>
              <strong className="w-ex-wallet">
                <img className="w-ph" src={iconPhantom} alt="" />
                {wallet.alias} <small>{wallet.shortAddress}</small>
              </strong>
            </div>
            <div className="w-ex-line">
              <span>보유 TOTT</span>
              <strong>
                {fmtTott(wallet.tott)} TOTT <small>≈ {fmtTp(tottToTp(wallet.tott))} TP</small>
              </strong>
            </div>
            <div className="w-ex-line">
              <span>보유 TP</span>
              <strong>
                {fmtTp(tp)} <i className="w-tp-mark">TP</i>
              </strong>
            </div>
          </section>

          <div className="w-ex-head">
            <h2>교환할 TOTT 입력</h2>
            <small>1 TOTT ≈ {fmtTp(tpPerTott())} TP · 1 TP = ₩1</small>
          </div>
          <section className="w-ex-card">
            <label className="w-ex-field">
              <span>TOTT</span>
              <span className="w-ex-input">
                <input
                  inputMode="decimal"
                  placeholder="0"
                  value={input}
                  disabled={step === 'confirm'}
                  onChange={(e) => setInput(e.target.value.replace(/[^\d.]/g, ''))}
                />
                <b>TOTT</b>
              </span>
            </label>
            <div className="w-ex-chips">
              {[10, 25, 50, 75].map((pct) => (
                <button key={pct} type="button" disabled={step === 'confirm'} onClick={() => setPct(pct)}>
                  {pct}%
                </button>
              ))}
              <button type="button" disabled={step === 'confirm'} onClick={() => setPct(100)}>
                최대
              </button>
            </div>
            <div className="w-ex-swap" aria-hidden>
              <ArrowsLeftRight size={16} weight="bold" />
            </div>
            <div className="w-ex-field static">
              <span>받을 TP</span>
              <span className="w-ex-input">
                <output>{tott ? fmtTp(gain) : '0'}</output>
                <b>TP</b>
              </span>
            </div>
            <p className={`w-ex-hint${hint && tott ? ' warn' : ''}`}>
              {hint || 'TOTT 가격 변동으로 실제 지급 TP가 달라질 수 있어요.'}
            </p>
          </section>

          <section className="w-ex-card w-ex-preview">
            <div className="w-ex-line">
              <span>받을 TP</span>
              <strong className="w-ex-plus">+ {fmtTp(gain)} TP</strong>
            </div>
            <div className="w-ex-line">
              <span>교환 후 TP 보유량</span>
              <strong>{fmtTp(tp + gain)} TP</strong>
            </div>
            <div className="w-ex-line">
              <span>교환 후 남은 TOTT</span>
              <strong>{fmtTott(Math.max(0, wallet.tott - tott))} TOTT</strong>
            </div>
          </section>

          <section className="w-ex-notice">
            <h3>교환 시 유의사항</h3>
            <ol>
              <li>교환된 TP는 취소·환불이 불가합니다.</li>
              <li>교환 비율은 운영 정책에 따라 변경될 수 있습니다.</li>
              <li>최소 교환 수량은 {EXCHANGE_MIN_TOTT} TOTT입니다.</li>
            </ol>
          </section>
        </div>
      </div>

      {step === 'confirm' ? (
        <Footer>
          <div className="w-ex-confirm">
            <p>
              <b>{fmtTott(tott)} TOTT</b>를 <b className="w-ex-plus">{fmtTp(gain)} TP</b>로 교환할까요?
            </p>
            <div className="w-ex-confirm-btns">
              <button type="button" className="btn-ghost" onClick={() => setStep('form')}>
                취소
              </button>
              <button type="button" className="btn-red" onClick={confirm}>
                교환 확정
              </button>
            </div>
          </div>
        </Footer>
      ) : (
        <Footer>
          <button type="button" className="btn-red" disabled={!ready} onClick={() => setStep('confirm')}>
            TP로 교환
          </button>
        </Footer>
      )}
    </Phone>
  )
}
