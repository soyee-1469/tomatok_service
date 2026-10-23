import { useEffect, useMemo, useState } from 'react'
import {
  Cards,
  CaretDown,
  ArrowsLeftRight,
  ClockCounterClockwise,
  Copy,
  FileText,
  Image,
  Microphone,
  ShareNetwork,
  SpeakerHigh,
  Translate,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Gnb, Header, Phone } from '../shell'
import { DocMode, ImageMode, LangPicker, TalkMode, VoiceMode } from './TranslateModes'
import {
  MAX_CHARS,
  TARGET_LANGS,
  detectLang,
  langOf,
  translateText,
  type LangId,
} from './data'
import '../translate.css'

const PH = { weight: 'regular' as const }

type ExtraMode = 'voice' | 'talk' | 'image' | 'doc'

type HistItem = { src: string; dst: string; from: LangId; to: string }

const EXTRA_MODES: { id: ExtraMode; label: string; Icon: Icon; hint: string }[] = [
  { id: 'voice', label: '음성', Icon: Microphone, hint: '마이크를 눌러 말하면 바로 번역돼요' },
  { id: 'talk', label: '번역 대화', Icon: ArrowsLeftRight, hint: '양쪽 언어로 번갈아 대화할 수 있어요' },
  { id: 'image', label: '이미지', Icon: Image, hint: '사진 속 글자를 읽어 번역해요' },
  { id: 'doc', label: '문서', Icon: FileText, hint: '문서를 올리면 내용을 번역해요' },
]

type SpeakSide = 'in' | 'out'

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

/** 포토카드·지갑 시안: public/photocard 의 정적 페이지 */
const PHOTOCARD_URL = `${import.meta.env.BASE_URL}photocard/app/`

export function ServicesHome() {
  const nav = useNavigate()
  return (
    <Phone>
      <Header title="서비스" />
      <div className="phone-scroll">
        <div className="tr-page">
          <div className="tr-list">
            <button type="button" className="tr-svc" onClick={() => nav('/services/translate')}>
              <span className="tr-svc-ico">
                <Translate size={22} {...PH} />
              </span>
              <span>
                <b>기본번역</b>
              </span>
            </button>
            <a className="tr-svc" href={PHOTOCARD_URL}>
              <span className="tr-svc-ico">
                <Cards size={22} {...PH} />
              </span>
              <span>
                <b>포토카드</b>
              </span>
            </a>
          </div>
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function TranslateScreen() {
  const nav = useNavigate()
  const [from, setFrom] = useState<LangId>('auto')
  const [to, setTo] = useState('en')
  const [input, setInput] = useState('')
  const [picker, setPicker] = useState<'from' | 'to' | null>(null)
  const [mode, setMode] = useState<ExtraMode | null>(null)
  const [speaking, setSpeaking] = useState<SpeakSide | null>(null)
  const [history, setHistory] = useState<HistItem[]>(() => {
    try {
      const saved = window.localStorage.getItem('tomatalk-translate-history')
      const parsed = saved ? (JSON.parse(saved) as HistItem[]) : []
      return Array.isArray(parsed) ? parsed.filter((h) => h.src && h.dst) : []
    } catch {
      return []
    }
  })
  const [showRecent, setShowRecent] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const detected = useMemo(() => (input.trim() ? detectLang(input) : 'ko'), [input])
  const source = from === 'auto' ? detected : from
  const output = useMemo(() => translateText(input, from, to), [input, from, to])
  const fromLabel = from === 'auto' ? (input.trim() ? langOf(detected).name : '언어 감지') : langOf(from).name

  useEffect(() => {
    if (from !== 'auto' && from === to) {
      const next = TARGET_LANGS.find((l) => l.id !== from)?.id
      if (next && next !== 'auto') setTo(next)
    }
  }, [from, to])

  useEffect(() => {
    return () => {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
    }
  }, [])

  const toggleSpeak = (side: SpeakSide, text: string, lang: LangId) => {
    if (!text || typeof speechSynthesis === 'undefined') return
    if (speaking === side) {
      speechSynthesis.cancel()
      setSpeaking(null)
      return
    }
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = langOf(lang === 'auto' ? detectLang(text) : lang).tts || 'ko-KR'
    u.onend = () => setSpeaking((cur) => (cur === side ? null : cur))
    u.onerror = () => setSpeaking((cur) => (cur === side ? null : cur))
    setSpeaking(side)
    speechSynthesis.speak(u)
  }

  const shareText = async (text: string) => {
    if (!text.trim()) return
    try {
      if (navigator.share) await navigator.share({ text })
      else await copyText(text)
    } catch {
      /* ignore */
    }
  }

  const shareOutput = async () => {
    await shareText(output)
  }

  const swap = () => {
    const nextFrom = to
    const nextTo = source === 'auto' ? 'en' : source
    setFrom(nextFrom)
    setTo(nextTo === 'auto' ? 'en' : nextTo)
    setInput(output || input)
  }

  const pickLang = (id: LangId) => {
    if (picker === 'from') setFrom(id)
    if (picker === 'to' && id !== 'auto') setTo(id)
    setPicker(null)
  }

  const remember = (src: string, dst: string) => {
    if (!src.trim() || !dst.trim()) return
    setHistory((cur) => [{ src, dst, from: source, to }, ...cur.filter((h) => h.src !== src || h.dst !== dst)].slice(0, 50))
  }

  useEffect(() => {
    if (!input.trim() || !output.trim()) return
    const t = window.setTimeout(() => remember(input, output), 400)
    return () => window.clearTimeout(t)
  }, [input, output])

  useEffect(() => {
    try {
      window.localStorage.setItem('tomatalk-translate-history', JSON.stringify(history))
    } catch {
      /* ignore */
    }
  }, [history])

  const typed = input.trim()
  const recent = history

  const modeDock = (current: ExtraMode | null) => (
    <div className="tr-dock" role="toolbar" aria-label="번역 도구">
      {EXTRA_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`tr-dock-btn ${m.id}${current === m.id ? ' on' : ''}`}
          aria-pressed={current === m.id}
          onClick={() => setMode(current === m.id ? null : m.id)}
        >
          <span className="tr-dock-icon">
            <m.Icon size={20} {...PH} />
          </span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  )

  if (mode === 'voice') {
    return (
      <Phone>
        <VoiceMode from={from} to={to} onBack={() => setMode(null)} onSwap={swap} onPick={setPicker} onResult={remember} />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (mode === 'talk') {
    return (
      <Phone>
        <TalkMode from={from} to={to} onBack={() => setMode(null)} onPick={setPicker} onSwap={swap} onResult={remember} />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (mode === 'image') {
    return (
      <Phone>
        <ImageMode from={from} to={to} onBack={() => setMode(null)} onPick={setPicker} onSwap={swap} onResult={remember} />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (mode === 'doc') {
    return (
      <Phone>
        <DocMode from={from} to={to} onBack={() => setMode(null)} onPick={setPicker} onSwap={swap} />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (showRecent) {
    return (
      <Phone>
        <Header title="최근" onBack={() => setShowRecent(false)} />
        <div className="phone-scroll">
          <div className="tr-page">
            {recent.length ? (
              <div>
                {recent.map((h) => (
                  <button
                    key={`${h.src}-${h.dst}`}
                    type="button"
                    className="tr-hist-item"
                    onClick={() => {
                      setFrom(h.from)
                      setTo(h.to)
                      setInput(h.src)
                      setShowRecent(false)
                    }}
                  >
                    <b>{h.src}</b>
                    <span>{h.dst}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="tr-thread-empty">없음</p>
            )}
          </div>
        </div>
      </Phone>
    )
  }

  return (
    <Phone>
      <Header
        title="기본번역"
        onBack={() => nav('/services')}
        right={
          <button type="button" className="icon-btn" aria-label="최근" onClick={() => setShowRecent(true)}>
            <ClockCounterClockwise size={22} {...PH} />
          </button>
        }
      />
      <div className="phone-scroll">
        <div className="tr-page">
          <section className="tr-voice-card tr-text-card">
            <div className="tr-voice-section">
              <div className="tr-voice-head">
                <span>원문</span>
                <div className="tr-head-actions">
                  <button type="button" className="tr-voice-lang" onClick={() => setPicker('from')}>
                    {fromLabel}
                    <CaretDown size={12} weight="regular" />
                  </button>
                  {typed ? (
                    <button
                      type="button"
                      className="tr-icon"
                      aria-label="지우기"
                      onClick={() => {
                        if (speaking) {
                          speechSynthesis.cancel()
                          setSpeaking(null)
                        }
                        setInput('')
                      }}
                    >
                      <X size={16} {...PH} />
                    </button>
                  ) : null}
                </div>
              </div>
              <textarea
                className="tr-input tr-text-input"
                value={input}
                maxLength={MAX_CHARS}
                placeholder="번역할 내용을 입력하세요"
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              />
              <div className="tr-text-foot">
                <p className="tr-count">
                  {input.length} / {MAX_CHARS}
                </p>
                <div className="tr-card-tools">
                  <button type="button" className="tr-icon" aria-label="음성 입력" onClick={() => setMode('voice')}>
                    <Microphone size={18} {...PH} />
                  </button>
                  <button
                    type="button"
                    className={`tr-icon${speaking === 'in' ? ' on' : ''}`}
                    aria-label={speaking === 'in' ? '입력 듣기 끄기' : '입력 듣기'}
                    aria-pressed={speaking === 'in'}
                    disabled={!input.trim()}
                    onClick={() => toggleSpeak('in', input, source)}
                  >
                    <SpeakerHigh size={18} weight={speaking === 'in' ? 'fill' : 'regular'} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="입력 복사" disabled={!input.trim()} onClick={() => void copyText(input)}>
                    <Copy size={18} {...PH} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="입력 공유" disabled={!input.trim()} onClick={() => void shareText(input)}>
                    <ShareNetwork size={18} {...PH} />
                  </button>
                </div>
              </div>
            </div>

            <div className="tr-voice-section result">
              <div className="tr-voice-head">
                <span>번역</span>
                <button type="button" className="tr-voice-lang" onClick={() => setPicker('to')}>
                  {langOf(to).name}
                  <CaretDown size={12} weight="regular" />
                </button>
              </div>
              <p className={`tr-result${output ? '' : ' tr-empty'}`}>{output || ''}</p>
              <div className="tr-card-tools">
                <button
                  type="button"
                  className={`tr-icon${speaking === 'out' ? ' on' : ''}`}
                  aria-label={speaking === 'out' ? '듣기 끄기' : '듣기'}
                  aria-pressed={speaking === 'out'}
                  disabled={!output.trim()}
                  onClick={() => toggleSpeak('out', output, to)}
                >
                  <SpeakerHigh size={18} weight={speaking === 'out' ? 'fill' : 'regular'} />
                </button>
                <button type="button" className="tr-icon" aria-label="복사" disabled={!output.trim()} onClick={() => void copyText(output)}>
                  <Copy size={18} {...PH} />
                </button>
                <button type="button" className="tr-icon" aria-label="공유" disabled={!output.trim()} onClick={() => void shareOutput()}>
                  <ShareNetwork size={18} {...PH} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {inputFocused ? null : modeDock(null)}

      {picker ? (
        <LangPicker
          side={picker}
          from={from}
          to={to}
          onPick={pickLang}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </Phone>
  )
}
