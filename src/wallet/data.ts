export type Currency = 'KRW' | 'USD'

export type TxType = 'receive' | 'send' | 'fill' | 'exchange'
export type TxStatus = '검증완료' | '진행중' | '완료' | '실패' | '성공'
export type NftRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export type WalletTx = {
  id: string
  type: TxType
  amount: number
  at: string
  status: TxStatus
  from?: string
  to?: string
  fee?: number
  hash?: string
}

export type WalletNft = {
  id: string
  name: string
  color: string
  collection?: string
  rarity?: NftRarity
  tokenId?: string
  acquiredAt?: string
  contract?: string
}

export type PhantomWallet = {
  id: string
  alias: string
  address: string
  shortAddress: string
  tott: number
  favorite: boolean
  primary?: boolean
  lastUsedAt: number
  order: number
  nfts: WalletNft[]
  txs: WalletTx[]
}

export type TokenTicker = {
  id: string
  symbol: string
  quote: string
  price: string
  change: number
  loading?: boolean
}

/** Mock TOTT price for fiat conversion */
export const TOTT_KRW = 9.134
export const TOTT_USD = 0.0067

/** Common market tickers — not tied to selected wallet */
export const TOKEN_TICKERS: TokenTicker[] = [
  {
    id: 'tott',
    symbol: 'TOTT',
    quote: 'USDT',
    price: '0.112388',
    change: 5.67,
  },
  {
    id: 'sol',
    symbol: 'Solana',
    quote: 'USDT',
    price: '200.96',
    change: -0.49,
  },
]

const NFTS = {
  ring: {
    id: 'n-ring',
    name: '토마톡 링',
    color: '#f5d76e',
    collection: '토마톡 오리지널',
    rarity: 'Legendary' as const,
    contract: '0x7a1c91e4b7d0a5f6e8c1RING',
  },
  stake: {
    id: 'n-stake',
    name: '스테이킹',
    color: '#7ec8a3',
    collection: '토마톡 스테이킹',
    rarity: 'Epic' as const,
    contract: '0x3e90c91e4b7d0a5f6STAKE',
  },
  col: {
    id: 'n-col',
    name: '컬렉션',
    color: '#8ec5ff',
    collection: '토마톡 컬렉션',
    rarity: 'Rare' as const,
    contract: '0x91AFc91e4b7d0a5f6eCOLL',
  },
  pass: {
    id: 'n-pass',
    name: '시즌패스',
    color: '#7b5cff',
    collection: '시즌 패스',
    rarity: 'Epic' as const,
    contract: '0xB104c91e4b7d0a5f6PASS',
  },
  badge: {
    id: 'n-badge',
    name: '뱃지',
    color: '#ff6b8a',
    collection: '토마톡 뱃지',
    rarity: 'Rare' as const,
    contract: '0xC77a91e4b7d0a5f6BADGE',
  },
  event: {
    id: 'n-event',
    name: '이벤트',
    color: '#ff9f68',
    collection: '이벤트',
    rarity: 'Common' as const,
    contract: '0xA832c91e4b7d0a5EVENT',
  },
  club: {
    id: 'n-club',
    name: '클럽',
    color: '#5ad0c8',
    collection: '클럽',
    rarity: 'Epic' as const,
    contract: '0x5961a7c2d9ef4b1fCLUB',
  },
  art: {
    id: 'n-art',
    name: '아트',
    color: '#c9a0ff',
    collection: '토마톡 아트',
    rarity: 'Legendary' as const,
    contract: '0x3a8f91c4e2b7d0a5ART0',
  },
}

const NFT_META: Record<string, { collection: string; rarity: NftRarity; contract: string }> = {
  '토마톡 링': NFTS.ring,
  스테이킹: NFTS.stake,
  컬렉션: NFTS.col,
  시즌패스: NFTS.pass,
  뱃지: NFTS.badge,
  이벤트: NFTS.event,
  클럽: NFTS.club,
  아트: NFTS.art,
}

export const WALLETS: PhantomWallet[] = [
  {
    id: 'w1',
    alias: '메인 지갑',
    address: '0x5961a7c2d9ef4b1f8c0e3d6a9b2f5e8c1d4a7b0e3f6c9gb2485',
    shortAddress: '0x5961...gb2485',
    tott: 123456.789123,
    favorite: true,
    primary: true,
    lastUsedAt: 3,
    order: 0,
    nfts: [
      { id: 'n1', name: '토마톡 링', color: '#f5d76e' },
      { id: 'n2', name: '스테이킹', color: '#7ec8a3' },
      { id: 'n3', name: '컬렉션', color: '#8ec5ff' },
    ],
    txs: [
      { id: 't1', type: 'receive', amount: 14.51136, at: '25-08-07 14:00', status: '검증완료' },
      { id: 't2', type: 'send', amount: 14.51136, at: '25-08-07 14:00', status: '진행중' },
      { id: 't3', type: 'send', amount: 14.51136, at: '25-08-07 14:00', status: '완료' },
      { id: 't4', type: 'send', amount: 14.51136, at: '25-08-07 14:00', status: '실패' },
      { id: 't5', type: 'receive', amount: 220.5, at: '25-08-06 11:20', status: '성공' },
      { id: 't11', type: 'fill', amount: 1000, at: '25-08-16 18:40', status: '완료' },
      { id: 't12', type: 'fill', amount: 250, at: '25-08-10 09:12', status: '검증완료' },
    ],
  },
  {
    id: 'w2',
    alias: '개인 지갑',
    address: '0x3a8f91c4e2b7d0a5f6e8c1b3d4a9e2f7c0b5d8921K',
    shortAddress: '0x3a8f...921K',
    tott: 82340.112,
    favorite: false,
    lastUsedAt: 2,
    order: 1,
    nfts: [],
    txs: [
      { id: 't6', type: 'send', amount: 340, at: '25-08-06 16:08', status: '완료' },
      { id: 't7', type: 'receive', amount: 10000, at: '25-08-05 08:30', status: '성공' },
      { id: 't8', type: 'receive', amount: 44.2, at: '25-08-04 19:55', status: '검증완료' },
      { id: 't13', type: 'fill', amount: 80, at: '25-08-14 13:05', status: '완료' },
    ],
  },
  {
    id: 'w3',
    alias: '보조 지갑',
    address: '0xc882f0e1d2c3b4a59687766554433221100ffee34A',
    shortAddress: '0xc882...34A',
    tott: 45210.5,
    favorite: false,
    lastUsedAt: 1,
    order: 2,
    nfts: [
      { id: 'n5', name: '토마톡 링', color: '#7b5cff' },
      { id: 'n6', name: '스테이킹', color: '#ff6b8a' },
    ],
    txs: [],
  },
]

export type WalletScene = 'solo-empty' | 'multi-nft'

function copyWallet(w: PhantomWallet): PhantomWallet {
  return { ...w, nfts: w.nfts.map((n) => ({ ...n })), txs: w.txs.map((t) => ({ ...t })) }
}

/** 지갑 1개 · NFT 없음 */
export const SCENE_SOLO_EMPTY: PhantomWallet[] = [
  {
    ...WALLETS[0],
    nfts: [],
  },
].map(copyWallet)

/** 지갑 여러 개 · NFT 여러 개 */
export const SCENE_MULTI_NFT: PhantomWallet[] = ([
  {
    ...WALLETS[0],
    nfts: [
      { ...NFTS.ring, id: 'm1-1' },
      { ...NFTS.stake, id: 'm1-2' },
      { ...NFTS.col, id: 'm1-3' },
      { ...NFTS.pass, id: 'm1-4' },
    ],
  },
  {
    ...WALLETS[1],
    nfts: [
      { ...NFTS.badge, id: 'm2-1' },
      { ...NFTS.event, id: 'm2-2' },
      { ...NFTS.club, id: 'm2-3' },
      { ...NFTS.art, id: 'm2-4' },
    ],
  },
  {
    ...WALLETS[2],
    nfts: [
      { ...NFTS.pass, id: 'm3-1' },
      { ...NFTS.badge, id: 'm3-2' },
      { ...NFTS.ring, id: 'm3-3' },
    ],
  },
  {
    id: 'w4',
    alias: 'NFT 지갑',
    address: '0xA832c91e4b7d0a5f6e8c1b3d4a9e2f7c0b553B1',
    shortAddress: '0xA832...53B1',
    tott: 8900,
    favorite: false,
    lastUsedAt: 0,
    order: 3,
    nfts: [
      { ...NFTS.art, id: 'm4-1' },
      { ...NFTS.col, id: 'm4-2' },
      { ...NFTS.event, id: 'm4-3' },
      { ...NFTS.club, id: 'm4-4' },
      { ...NFTS.stake, id: 'm4-5' },
    ],
    txs: [
      { id: 't9', type: 'receive', amount: 120, at: '25-08-03 11:12', status: '완료' },
      { id: 't10', type: 'send', amount: 8.5, at: '25-08-02 09:40', status: '검증완료' },
    ],
  },
] as PhantomWallet[]).map(copyWallet)

export const WALLET_SCENES: Record<WalletScene, PhantomWallet[]> = {
  'solo-empty': SCENE_SOLO_EMPTY,
  'multi-nft': SCENE_MULTI_NFT,
}

export type PhantomSessionId = 'A' | 'B'

/**
 * Phantom 연동 방식.
 * - 이 프로젝트는 실제 Phantom SDK를 쓰지 않는 목업이다.
 * - 표준 injected `window.phantom.solana.connect()` / wallet-adapter는
 *   현재 선택된 publicKey 1개만 반환한다 (CASE B).
 * - 같은 세션의 여러 keypair를 한 번에 나열하는 공식 API는 없다.
 * - `@phantom/react-sdk` useAccounts는 체인별(solana/evm) 주소를 줄 수 있어
 *   그 경로가 붙으면 CASE A로 전환한다.
 */
export type PhantomDiscoveryMode = 'multi' | 'single'

export const PHANTOM_CAN_LIST_ACCOUNTS = false

/** Phantom에서 가져올 수 있는 추가 주소 (아직 미연결) */
export const PHANTOM_CANDIDATES: PhantomWallet[] = [
  {
    id: 'ph-1',
    alias: '회사 지갑',
    address: '0x91AFe2b7d0a5f6e8c1b3d4a9e2f7c0b53892',
    shortAddress: '0x91AF...3892',
    tott: 25300,
    favorite: false,
    lastUsedAt: Date.now(),
    order: 0,
    nfts: [
      { ...NFTS.club, id: 'ph1-n1' },
      { ...NFTS.badge, id: 'ph1-n2' },
    ],
    txs: [],
  },
  {
    id: 'ph-2',
    alias: '출금 지갑',
    address: '0xB104c91e4b7d0a5f6e8c1b3d4a9e2f7c04421',
    shortAddress: '0xB104...4421',
    tott: 4100.25,
    favorite: false,
    lastUsedAt: Date.now(),
    order: 0,
    nfts: [],
    txs: [],
  },
  {
    id: 'ph-3',
    alias: '보관 지갑',
    address: '0xC77a91e4b7d0a5f6e8c1b3d4a9e2f7c0b5D90',
    shortAddress: '0xC77a...5D90',
    tott: 67000,
    favorite: false,
    lastUsedAt: Date.now(),
    order: 0,
    nfts: [{ ...NFTS.pass, id: 'ph3-n1' }],
    txs: [],
  },
]

const SESSION_A_EXTRA: PhantomWallet = {
  id: 'w4',
  alias: 'NFT 지갑',
  address: '0xA832c91e4b7d0a5f6e8c1b3d4a9e2f7c0b553B1',
  shortAddress: '0xA832...53B1',
  tott: 8900,
  favorite: false,
  lastUsedAt: 0,
  order: 3,
  nfts: [],
  txs: [],
}

/** 현재 Phantom 확장에 로그인된 계정별로 노출되는 주소 */
export const PHANTOM_SESSIONS: Record<
  PhantomSessionId,
  { label: string; wallets: PhantomWallet[] }
> = {
  A: {
    label: '계정 A',
    wallets: [WALLETS[0], WALLETS[1], WALLETS[2], SESSION_A_EXTRA].map(copyWallet),
  },
  B: {
    label: '계정 B',
    wallets: PHANTOM_CANDIDATES.map(copyWallet),
  },
}

export function discoverPhantom(session: PhantomSessionId) {
  return PHANTOM_SESSIONS[session].wallets.map(copyWallet)
}

export function currentPhantomWallet(session: PhantomSessionId, index: number) {
  const list = discoverPhantom(session)
  if (!list.length) return null
  return list[((index % list.length) + list.length) % list.length] ?? null
}

export function loadScene(scene: WalletScene) {
  return WALLET_SCENES[scene].map(copyWallet)
}

export function fiatOf(tott: number, currency: Currency) {
  if (currency === 'USD') return tott * TOTT_USD
  return tott * TOTT_KRW
}

export function fmtTott(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

export function fmtFiat(n: number, currency: Currency) {
  if (currency === 'USD') {
    return `≈ $ ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
  return `≈ ₩ ${Math.round(n).toLocaleString('en-US')}`
}

/** 대표 지갑은 항상 1번. 나머지는 sortOrder(order)만 따른다. */
export function sortWallets(list: PhantomWallet[]) {
  const primary = list.find((w) => w.primary)
  const rest = list
    .filter((w) => w.id !== primary?.id)
    .map((w) => (w.primary ? { ...w, primary: false } : w))
    .sort((a, b) => a.order - b.order)
  const arranged = primary ? [{ ...primary, primary: true }, ...rest] : rest
  return arranged.map((w, order) => ({ ...w, order }))
}

export function totalTott(list: PhantomWallet[]) {
  return list.reduce((s, w) => s + w.tott, 0)
}

export function shortOf(address: string) {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

/** 지갑 관리 카드용 축약: 0x5961...2485 */
export function shortManage(address: string) {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const RARITY_RANK: Record<NftRarity, number> = {
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Common: 1,
}

/** 지갑 화면 목업 기준 시각 (상단 빨간 띠와 동일) */
export const MOCK_NOW = new Date(2025, 7, 17, 14, 3)

export function parseMockDate(at: string) {
  const [date, time] = at.split(' ')
  const [yy, mm, dd] = date.split('-').map(Number)
  const [hh, mi] = (time ?? '00:00').split(':').map(Number)
  return new Date(2000 + yy, (mm || 1) - 1, dd || 1, hh || 0, mi || 0)
}

export function txKindLabel(type: TxType) {
  if (type === 'send') return '보내기'
  if (type === 'fill') return '충전'
  if (type === 'exchange') return 'TP 교환'
  return '받기'
}

function seedFromId(id: string) {
  return [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

export function resolveNft(n: WalletNft): Required<WalletNft> {
  const meta = NFT_META[n.name]
  const seed = seedFromId(n.id)
  const day = 1 + (seed % 16)
  const hour = 8 + (seed % 10)
  return {
    id: n.id,
    name: n.name,
    color: n.color,
    collection: n.collection ?? meta?.collection ?? '토마톡 컬렉션',
    rarity: n.rarity ?? meta?.rarity ?? 'Rare',
    tokenId: n.tokenId ?? `#${String(1000 + (seed % 9000))}`,
    acquiredAt: n.acquiredAt ?? `25-08-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:20`,
    contract: n.contract ?? meta?.contract ?? `0xTOMA${n.id.slice(-4).padStart(4, '0')}COLLECT`,
  }
}

export function resolveTx(tx: WalletTx, wallet: PhantomWallet): Required<WalletTx> {
  const peer =
    tx.type === 'fill'
      ? '충전 풀'
      : tx.type === 'exchange'
        ? 'TP 교환소'
        : tx.type === 'send'
          ? '0x4e2a91c4...91F0'
          : '0x88c1e2b7...2B10'
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    at: tx.at,
    status: tx.status,
    from: tx.from ?? (tx.type === 'send' || tx.type === 'exchange' ? wallet.address : peer),
    to: tx.to ?? (tx.type === 'send' || tx.type === 'exchange' ? peer : wallet.address),
    fee: tx.fee ?? (tx.type === 'fill' || tx.type === 'exchange' ? 0 : 0.000012),
    hash: tx.hash ?? `5Kq8${tx.id}a7c2d9ef4b1f8c0e3d6a9b2f5e8c1d4a7`,
  }
}

/* ---------- TOTT · TP 교환 ----------
 * TP는 원화 1:1 포인트. 1 TOTT = TOTT_KRW TP 로 교환한다(포토카드 앱의 교환 규칙과 동일).
 */
export const EXCHANGE_MIN_TOTT = 50
/** 목업 초기 TP 잔액 */
export const TP_SEED = 12000

export function tpPerTott() {
  return TOTT_KRW
}

export function tottToTp(tott: number) {
  return Math.round((Number(tott) || 0) * tpPerTott())
}

export function fmtTp(n: number) {
  return Math.round(n).toLocaleString('ko-KR')
}

/** 거래 내역에 쓰는 'yy-mm-dd hh:mm' 형식 (parseMockDate 와 짝) */
export function mockStamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${String(d.getFullYear()).slice(2)}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
