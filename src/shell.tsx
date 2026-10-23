import { ArrowLeft } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'

export function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={['phone', className].filter(Boolean).join(' ')}>
      <div className="status">
        <span>9:41</span>
        <span>LTE 100%</span>
      </div>
      {children}
    </div>
  )
}

export function Header({
  title,
  brand,
  onBack,
  right,
  className,
}: {
  title?: string
  brand?: boolean
  onBack?: () => void
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={['header', className].filter(Boolean).join(' ')}>
      {onBack ? (
        <button className="icon-btn" type="button" onClick={onBack} aria-label="뒤로">
          <ArrowLeft size={22} weight="light" />
        </button>
      ) : (
        <div style={{ width: 40 }} />
      )}
      {brand ? <div className="brand">TomaTok</div> : title ? <h1>{title}</h1> : <div />}
      {right ?? <div style={{ width: 40 }} />}
    </div>
  )
}

export function Footer({ children }: { children: React.ReactNode }) {
  return <div className="footer air">{children}</div>
}

const GNB_ITEMS = [
  { to: '/friends', label: '친구', icon: '👤', badge: 'dot' as const },
  { to: '/chat', label: '대화', icon: '💬', badge: '88' as const },
  { to: '/wallet', label: '지갑', icon: '👜', center: true },
  { to: '/services', label: '서비스', icon: '▦' },
  { to: '/more', label: '더보기', icon: '⋯' },
] as const

/**
 * 지갑 탭 → 포토카드·지갑 시안(별도 프로젝트 photocard/service/app).
 * 로컬: photocard 폴더에서 `python3 -m http.server 5500` 실행 후 열림.
 * 다른 주소를 쓰려면 .env 에 VITE_WALLET_URL 을 넣는다.
 */
const WALLET_URL: string = import.meta.env.VITE_WALLET_URL ?? 'http://localhost:5500/service/app/'

export function Gnb() {
  const loc = useLocation()
  return (
    <nav className="gnb gnb-wallet" aria-label="하단 메뉴">
      {GNB_ITEMS.map((item) => {
        const on =
          item.to === '/wallet' || item.to === '/services'
            ? loc.pathname.startsWith(item.to)
            : loc.pathname === item.to
        const center = 'center' in item && item.center
        if (item.to === '/wallet') {
          return (
            <a key={item.to} href={WALLET_URL} className={`gnb-item${on ? ' on' : ''} center`}>
              <span className="gnb-ico fab" aria-hidden>
                👜
              </span>
              <span className="gnb-label">{item.label}</span>
            </a>
          )
        }
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`gnb-item${on ? ' on' : ''}${center ? ' center' : ''}`}
          >
            <span className={`gnb-ico${center ? ' fab' : ''}`} aria-hidden>
              {center ? '👜' : item.icon}
              {'badge' in item && item.badge === 'dot' ? <i className="gnb-dot" /> : null}
              {'badge' in item && item.badge === '88' ? <i className="gnb-count">88</i> : null}
            </span>
            <span className="gnb-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
