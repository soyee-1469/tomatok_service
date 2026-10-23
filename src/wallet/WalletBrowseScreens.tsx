import { useEffect, useMemo, useState } from 'react'
import { ArrowSquareOut, CaretDown } from '@phosphor-icons/react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import iconPhantom from '../assets/icon_wallet_phantom.png'
import { Gnb, Header, Phone } from '../shell'
import {
  MOCK_NOW,
  RARITY_RANK,
  fiatOf,
  fmtFiat,
  fmtTott,
  parseMockDate,
  resolveNft,
  resolveTx,
  shortOf,
  txKindLabel,
  type NftRarity,
  type PhantomWallet,
  type TxType,
} from './data'
import { statusClass, useWallet } from './WalletScreens'

const PH = { weight: 'light' as const }

const NFT_SORTS = [
  { id: 'recent', label: '최근 획득' },
  { id: 'name', label: '이름' },
  { id: 'rarity', label: '희귀도' },
] as const

const TX_KINDS: { id: 'all' | TxType; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'send', label: '보내기' },
  { id: 'receive', label: '받기' },
  { id: 'fill', label: '충전' },
]

const TX_PERIODS = [
  { id: 'all', label: '전체 기간', days: 0 },
  { id: '7', label: '7일', days: 7 },
  { id: '30', label: '30일', days: 30 },
  { id: '90', label: '90일', days: 90 },
] as const

const RARITY_KO: Record<NftRarity, string> = {
  Legendary: '전설',
  Epic: '영웅',
  Rare: '희귀',
  Common: '일반',
}

function useScopedWallet() {
  const { id } = useParams()
  const { wallets, selectById } = useWallet()
  const wallet = wallets.find((w) => w.id === id) ?? null

  useEffect(() => {
    if (wallet) selectById(wallet.id)
  }, [wallet, selectById])

  return { wallet, wallets, selectById }
}

function WalletScopeBar({
  wallet,
  wallets,
  onPick,
}: {
  wallet: PhantomWallet
  wallets: PhantomWallet[]
  onPick: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const multi = wallets.length > 1

  return (
    <div className="w-scope">
      <button
        type="button"
        className="w-scope-btn"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={!multi}
        onClick={() => multi && setOpen((v) => !v)}
      >
        <img className="w-ph" src={iconPhantom} alt="" />
        <span className="w-scope-meta">
          <b>{wallet.alias}</b>
          <em>{wallet.shortAddress}</em>
        </span>
        {multi ? <CaretDown size={16} {...PH} /> : null}
      </button>
      {open ? (
        <ul className="w-scope-list" role="listbox" aria-label="지갑 선택">
          {wallets.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                className={w.id === wallet.id ? 'on' : ''}
                onClick={() => {
                  onPick(w.id)
                  setOpen(false)
                }}
              >
                <b>{w.alias}</b>
                <em>{w.shortAddress}</em>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function MissingWallet({ title }: { title: string }) {
  const nav = useNavigate()
  return (
    <Phone>
      <Header title={title} onBack={() => nav('/wallet')} />
      <div className="phone-scroll w-scroll">
        <div className="w-empty-page">지갑을 찾을 수 없습니다.</div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function WalletNftList() {
  const nav = useNavigate()
  const { wallet, wallets } = useScopedWallet()
  const [sort, setSort] = useState<(typeof NFT_SORTS)[number]['id']>('recent')

  const items = useMemo(() => {
    if (!wallet) return []
    const list = wallet.nfts.map(resolveNft)
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko')
      if (sort === 'rarity') return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity]
      return parseMockDate(b.acquiredAt).getTime() - parseMockDate(a.acquiredAt).getTime()
    })
  }, [wallet, sort])

  if (!wallet) return <MissingWallet title="NFT 전체보기" />

  return (
    <Phone>
      <Header title="NFT 전체보기" onBack={() => nav('/wallet')} />
      <div className="phone-scroll w-scroll">
        <div className="w-pad w-browse-pad">
          <WalletScopeBar
            wallet={wallet}
            wallets={wallets}
            onPick={(id) => nav(`/wallet/${id}/nfts`)}
          />
          <div className="w-browse-head">
            <h2>
              보유 NFT <em>{wallet.nfts.length}개</em>
            </h2>
          </div>
          {wallet.nfts.length > 0 ? (
            <div className="w-chips" role="tablist" aria-label="정렬">
              {NFT_SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={sort === s.id}
                  className={sort === s.id ? 'on' : ''}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}
          {items.length === 0 ? (
            <div className="w-empty-box tall">
              <p className="w-empty-title">아직 보유한 NFT가 없습니다</p>
              <p className="w-empty-sub">이 지갑으로 받은 NFT가 여기에 모여요</p>
            </div>
          ) : (
            <div className="w-nft-grid browse">
              {items.map((n) => (
                <Link
                  key={n.id}
                  to={`/wallet/${wallet.id}/nfts/${n.id}`}
                  className="w-nft"
                  style={{ background: n.color }}
                >
                  <span className="w-nft-tag">{n.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function WalletNftDetail() {
  const nav = useNavigate()
  const { nftId } = useParams()
  const { wallet } = useScopedWallet()
  const nft = wallet?.nfts.find((n) => n.id === nftId)

  if (!wallet) return <MissingWallet title="NFT 상세" />
  if (!nft) return <Navigate to={`/wallet/${wallet.id}/nfts`} replace />

  const detail = resolveNft(nft)
  const explorer = `https://solscan.io/token/${detail.contract}`

  return (
    <Phone>
      <Header title="NFT 상세" onBack={() => nav(`/wallet/${wallet.id}/nfts`)} />
      <div className="phone-scroll w-scroll">
        <div className="w-pad w-browse-pad">
          <div className="w-nft-hero" style={{ background: detail.color }} />
          <div className="w-nft-title">
            <h2>{detail.name}</h2>
            <p>{detail.collection}</p>
          </div>
          <dl className="w-dl">
            <div>
              <dt>등급/희귀도</dt>
              <dd>
                {RARITY_KO[detail.rarity]} · {detail.rarity}
              </dd>
            </div>
            <div>
              <dt>Token ID</dt>
              <dd>{detail.tokenId}</dd>
            </div>
            <div>
              <dt>보유 지갑</dt>
              <dd>
                {wallet.alias}
                <em>{wallet.shortAddress}</em>
              </dd>
            </div>
            <div>
              <dt>컨트랙트 주소</dt>
              <dd>{shortOf(detail.contract)}</dd>
            </div>
            <div>
              <dt>획득일</dt>
              <dd>{detail.acquiredAt}</dd>
            </div>
          </dl>
          <a className="w-explorer" href={explorer} target="_blank" rel="noreferrer">
            <ArrowSquareOut size={18} {...PH} />
            외부 탐색기 보기
          </a>
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function WalletTxList() {
  const nav = useNavigate()
  const { wallet, wallets } = useScopedWallet()
  const [kind, setKind] = useState<(typeof TX_KINDS)[number]['id']>('all')
  const [period, setPeriod] = useState<(typeof TX_PERIODS)[number]['id']>('all')

  const items = useMemo(() => {
    if (!wallet) return []
    const days = TX_PERIODS.find((p) => p.id === period)?.days ?? 0
    const cutoff = days ? MOCK_NOW.getTime() - days * 24 * 60 * 60 * 1000 : 0
    return wallet.txs.filter((tx) => {
      if (kind !== 'all' && tx.type !== kind) return false
      if (cutoff && parseMockDate(tx.at).getTime() < cutoff) return false
      return true
    })
  }, [wallet, kind, period])

  if (!wallet) return <MissingWallet title="거래내역" />

  return (
    <Phone>
      <Header title="거래내역 전체보기" onBack={() => nav('/wallet')} />
      <div className="phone-scroll w-scroll">
        <div className="w-pad w-browse-pad">
          <WalletScopeBar
            wallet={wallet}
            wallets={wallets}
            onPick={(id) => nav(`/wallet/${id}/txs`)}
          />
          <div className="w-chips" role="tablist" aria-label="유형">
            {TX_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                role="tab"
                aria-selected={kind === k.id}
                className={kind === k.id ? 'on' : ''}
                onClick={() => setKind(k.id)}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className="w-chips sm" role="tablist" aria-label="기간">
            {TX_PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                className={period === p.id ? 'on' : ''}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {items.length === 0 ? (
            <div className="w-empty-box">해당하는 거래 내역이 없습니다.</div>
          ) : (
            <ul className="w-tx-list">
              {items.map((tx) => (
                <li key={tx.id}>
                  <Link to={`/wallet/${wallet.id}/txs/${tx.id}`} className="w-tx">
                    <span className={`w-tx-ico ${tx.type === 'send' ? 'out' : 'in'}`}>
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
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function WalletTxDetail() {
  const nav = useNavigate()
  const { txId } = useParams()
  const { currency } = useWallet()
  const { wallet: w } = useScopedWallet()
  const tx = w?.txs.find((t) => t.id === txId)

  if (!w) return <MissingWallet title="거래 상세" />
  if (!tx) return <Navigate to={`/wallet/${w.id}/txs`} replace />

  const detail = resolveTx(tx, w)
  const explorer = `https://solscan.io/tx/${detail.hash}`
  const sign = detail.type === 'send' ? '-' : '+'

  return (
    <Phone>
      <Header title="거래 상세" onBack={() => nav(`/wallet/${w.id}/txs`)} />
      <div className="phone-scroll w-scroll">
        <div className="w-pad w-browse-pad">
          <div className="w-tx-hero">
            <span className={`w-tx-ico lg ${detail.type === 'send' ? 'out' : 'in'}`}>
              {detail.type === 'send' ? '↑' : '↓'}
            </span>
            <p className="w-tx-kind">{txKindLabel(detail.type)}</p>
            <p className={`w-tx-amt ${detail.type === 'send' ? 'out' : 'in'}`}>
              {sign}
              {fmtTott(detail.amount)} TOTT
            </p>
            <p className="w-fiat">{fmtFiat(fiatOf(detail.amount, currency), currency)}</p>
            <span className={`w-badge ${statusClass(detail.status)}`}>{detail.status}</span>
          </div>
          <dl className="w-dl">
            <div>
              <dt>거래 유형</dt>
              <dd>{txKindLabel(detail.type)}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{detail.status}</dd>
            </div>
            <div>
              <dt>보낸 주소</dt>
              <dd>{shortOf(detail.from)}</dd>
            </div>
            <div>
              <dt>받은 주소</dt>
              <dd>{shortOf(detail.to)}</dd>
            </div>
            <div>
              <dt>네트워크 수수료</dt>
              <dd>{detail.fee === 0 ? '없음' : `${detail.fee} SOL`}</dd>
            </div>
            <div>
              <dt>Tx Hash</dt>
              <dd>{shortOf(detail.hash)}</dd>
            </div>
            <div>
              <dt>거래 시간</dt>
              <dd>{detail.at}</dd>
            </div>
          </dl>
          <a className="w-explorer" href={explorer} target="_blank" rel="noreferrer">
            <ArrowSquareOut size={18} {...PH} />
            블록체인 탐색기에서 보기
          </a>
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}
