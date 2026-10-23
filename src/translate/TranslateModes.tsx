import { useEffect, useRef, useState } from 'react'
import {
  ArrowCounterClockwise,
  ArrowsLeftRight,
  ArrowsVertical,
  Camera,
  CaretDown,
  Check,
  Copy,
  FileText,
  Images,
  Lightning,
  MagnifyingGlass,
  Microphone,
  ShareNetwork,
  SpeakerHigh,
} from '@phosphor-icons/react'
import { Header } from '../shell'
import { LANGS, TARGET_LANGS, langOf, translateText, type LangId } from './data'

const PH = { weight: 'regular' as const }

const VOICE_SAMPLES = ['안녕하세요', '감사합니다', '만나서 반가워요']

type PickerSide = 'from' | 'to'

function speakOnce(text: string, lang: string) {
  if (!text || typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = langOf(lang).tts || 'ko-KR'
  speechSynthesis.speak(u)
}

async function copyOnce(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

async function shareOnce(text: string) {
  if (!text) return
  try {
    if (navigator.share) {
      await navigator.share({ text })
      return
    }
    throw new Error('share unavailable')
  } catch {
    await copyOnce(text)
  }
}

export function ModeLangs({
  from,
  to,
  onPick,
  onSwap,
  fromLabel,
  swapVertical,
}: {
  from: LangId
  to: string
  onPick: (side: PickerSide) => void
  onSwap?: () => void
  fromLabel?: string
  swapVertical?: boolean
}) {
  const source = from === 'auto' ? 'ko' : from
  return (
    <div className="tr-pairbar">
      <div className="tr-pairbar-main">
        <button type="button" className="tr-pairbar-lang" onClick={() => onPick('from')}>
          {fromLabel ?? langOf(source).name}
          <CaretDown size={12} weight="regular" />
        </button>
        <button
          type="button"
          className="tr-swap tr-swap-inline"
          aria-label="언어 바꾸기"
          onClick={onSwap}
          disabled={!onSwap}
        >
          {swapVertical ? <ArrowsVertical size={20} {...PH} /> : <ArrowsLeftRight size={20} {...PH} />}
        </button>
        <button type="button" className="tr-pairbar-lang" onClick={() => onPick('to')}>
          {langOf(to).name}
          <CaretDown size={12} weight="regular" />
        </button>
      </div>
    </div>
  )
}

function nativeName(id: string, tts: string, fallback: string) {
  if (id === 'auto') return '자동'
  try {
    const name = new Intl.DisplayNames([tts || id], { type: 'language' }).of(id === 'zh' ? 'zh-CN' : id) || fallback
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return fallback
  }
}

export function LangPicker({
  side,
  from,
  to,
  onPick,
  onClose,
}: {
  side: PickerSide
  from: LangId
  to: string
  onPick: (id: LangId) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const current = side === 'from' ? from : to
  const currentLang = langOf(current)
  const q = query.trim().toLowerCase()
  const list = (side === 'from' ? LANGS : TARGET_LANGS).filter(
    (l) =>
      !q ||
      [l.id, l.name, nativeName(l.id, l.tts, l.name)].some((v) => v.toLowerCase().includes(q)),
  )

  return (
    <div className="tr-full" role="dialog" aria-label="언어 선택">
      <Header title={side === 'from' ? '원문 언어' : '번역 언어'} onBack={onClose} />
      <div className="phone-scroll">
        <div className="tr-pick-current">
          <em>설정된 언어</em>
          <div>{nativeName(currentLang.id, currentLang.tts, currentLang.name)}</div>
        </div>
        <label className="tr-pick-search">
          <MagnifyingGlass size={20} {...PH} />
          <input
            type="search"
            value={query}
            placeholder="국가 또는 언어 검색"
            aria-label="국가 또는 언어 검색"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="tr-pick-list">
          {list.length === 0 ? <p className="tr-pick-empty">검색 결과가 없어요</p> : null}
          {list.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`tr-sheet-item${current === l.id ? ' on' : ''}`}
              aria-pressed={current === l.id}
              onClick={() => onPick(l.id)}
            >
              <span>{nativeName(l.id, l.tts, l.name)}</span>
              <span className="tr-radio">{current === l.id ? <Check size={14} weight="bold" /> : null}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function VoiceMode({
  from,
  to,
  onBack,
  onPick,
  onResult,
}: {
  from: LangId
  to: string
  onBack: () => void
  onSwap: () => void
  onPick: (side: PickerSide) => void
  onResult?: (src: string, dst: string) => void
}) {
  const [heard, setHeard] = useState('')
  const [listening, setListening] = useState(false)
  const timer = useRef<number | null>(null)
  const source = from === 'auto' ? 'ko' : from
  const output = heard ? translateText(heard, source, to) : ''

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const speak = () => {
    if (listening) return
    const i = VOICE_SAMPLES.indexOf(heard)
    const next = VOICE_SAMPLES[(i + 1) % VOICE_SAMPLES.length]
    setListening(true)
    timer.current = window.setTimeout(() => {
      setHeard(next)
      setListening(false)
      onResult?.(next, translateText(next, source, to))
    }, 900)
  }

  return (
    <div className="tr-full">
      <Header title="음성 번역" onBack={onBack} />
      <div className="phone-scroll">
        <div className="tr-page">
          {listening ? (
            <div className="tr-voice-status" aria-live="polite">
              <span className="tr-voice-wave" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <strong>듣고 있어요···</strong>
            </div>
          ) : !heard ? (
            <div className="tr-speak-empty">
              <span className="tr-speak-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
              <strong>말해 주세요</strong>
            </div>
          ) : (
            <section className="tr-voice-card">
              <div className="tr-voice-section">
                <div className="tr-voice-head">
                  <span>원문</span>
                  <button type="button" className="tr-voice-lang" onClick={() => onPick('from')}>
                    자동 · {langOf(source).name}
                    <CaretDown size={12} weight="regular" />
                  </button>
                </div>
                <p>{heard}</p>
                <div className="tr-card-tools">
                  <button type="button" className="tr-icon" aria-label="원문 듣기" onClick={() => speakOnce(heard, source)}>
                    <SpeakerHigh size={18} {...PH} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="원문 복사" onClick={() => void copyOnce(heard)}>
                    <Copy size={18} {...PH} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="원문 공유" onClick={() => void shareOnce(heard)}>
                    <ShareNetwork size={18} {...PH} />
                  </button>
                </div>
              </div>
              <div className="tr-voice-section result">
                <div className="tr-voice-head">
                  <span>번역</span>
                  <button type="button" className="tr-voice-lang" onClick={() => onPick('to')}>
                    {langOf(to).name}
                    <CaretDown size={12} weight="regular" />
                  </button>
                </div>
                <p>{output}</p>
                <div className="tr-card-tools">
                  <button type="button" className="tr-icon" aria-label="번역 듣기" onClick={() => speakOnce(output, to)}>
                    <SpeakerHigh size={18} {...PH} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="번역 복사" onClick={() => void copyOnce(output)}>
                    <Copy size={18} {...PH} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="번역 공유" onClick={() => void shareOnce(output)}>
                    <ShareNetwork size={18} {...PH} />
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      <div className="tr-mode-foot">
        <button
          type="button"
          className={`tr-cta${listening ? ' listening' : ''}`}
          aria-label={heard ? '다시 말하기' : '말하기'}
          disabled={listening}
          onClick={speak}
        >
          <Microphone size={22} {...PH} />
          {listening ? '듣는 중···' : heard ? '다시 말하기' : '말하기'}
        </button>
      </div>
    </div>
  )
}

type TalkLine = { who: 'me' | 'them'; src: string; dst: string }

export function TalkMode({
  from,
  to,
  onBack,
  onPick,
  onSwap,
  onResult,
}: {
  from: LangId
  to: string
  onBack: () => void
  onPick: (side: PickerSide) => void
  onSwap?: () => void
  onResult?: (src: string, dst: string) => void
}) {
  const source = from === 'auto' ? 'ko' : from
  const [lines, setLines] = useState<TalkLine[]>([])
  const [listening, setListening] = useState<TalkLine['who'] | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const say = (who: TalkLine['who']) => {
    if (listening) return
    const i = lines.filter((l) => l.who === who).length
    const base = VOICE_SAMPLES[i % VOICE_SAMPLES.length]
    const src = who === 'me' ? translateText(base, 'ko', source) || base : translateText(base, 'ko', to) || base
    const dst =
      who === 'me' ? translateText(src, source, to) || src : translateText(src, to, source) || src
    setListening(who)
    timer.current = window.setTimeout(() => {
      setLines((cur) => [...cur, { who, src, dst }])
      setListening(null)
      onResult?.(src, dst)
      speakOnce(dst, who === 'me' ? to : source)
    }, 900)
  }

  const activeSpeaker = listening

  return (
    <div className="tr-full">
      <Header title="대화 번역" onBack={onBack} />
      <ModeLangs from={from} to={to} onPick={onPick} onSwap={onSwap} />
      <div className="phone-scroll">
        <div className="tr-page">
          {lines.length || listening ? (
            <div className="tr-bubbles">
              {lines.map((l, i) => (
                <article key={`${l.who}-${i}`} className={`tr-bubble ${l.who}`}>
                  <em>{l.who === 'me' ? '나' : '상대'}</em>
                  <p>{l.src}</p>
                  <b>{l.dst}</b>
                </article>
              ))}
              {listening ? (
                <article className={`tr-bubble ${listening} tr-listening`} aria-live="polite">
                  <em>{listening === 'me' ? '나' : '상대'}</em>
                  <span>듣고 있어요···</span>
                </article>
              ) : null}
            </div>
          ) : (
            <div className="tr-speak-empty">
              <span className="tr-speak-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
              <strong>말해 주세요</strong>
            </div>
          )}
        </div>
      </div>
      <div className="tr-talk-panel">
        <div className="tr-talk-guide">
          <p>말할 사람을 선택하세요</p>
          <span>선택한 사람의 음성을 반대 언어로 번역합니다</span>
        </div>
        <div className="tr-talk-actions">
          <button type="button" className={`tr-cta${activeSpeaker === 'them' ? ' listening' : ' ghost'}`} aria-label="상대방 말하기" disabled={!!listening} onClick={() => say('them')}>
            <Microphone size={22} {...PH} />
            {listening === 'them' ? '듣는 중' : '상대방 말하기'}
          </button>
          <button type="button" className={`tr-cta${activeSpeaker === 'me' ? ' listening' : ' ghost'}`} aria-label="내가 말하기" disabled={!!listening} onClick={() => say('me')}>
            <Microphone size={22} {...PH} />
            {listening === 'me' ? '듣는 중' : '내가 말하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ImageMode({
  from,
  to,
  onBack,
  onPick,
  onSwap,
  onResult,
}: {
  from: LangId
  to: string
  onBack: () => void
  onPick: (side: PickerSide) => void
  onSwap?: () => void
  onResult?: (src: string, dst: string) => void
}) {
  const source = from === 'auto' ? 'ko' : from
  const [tab, setTab] = useState<'full' | 'live' | 'part'>('full')
  const [shot, setShot] = useState<'camera' | 'image' | 'file' | null>(null)
  const [live, setLive] = useState(false)
  const [flash, setFlash] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [capturedImage, setCapturedImage] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [part, setPart] = useState('')
  const parts = ['안녕하세요', '감사합니다', '도와주세요']
  const src =
    tab === 'part'
      ? part
      : tab === 'live'
        ? live
          ? '안녕하세요'
          : ''
        : shot === 'image'
          ? '감사합니다'
          : shot === 'file'
            ? '도와주세요'
            : shot === 'camera'
              ? '안녕하세요'
              : ''
  const dst = src ? translateText(src, source, to) || src : ''

  useEffect(() => {
    let cancelled = false
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraOn(true)
      } catch {
        setCameraOn(false)
      }
    }
    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const toggleFlash = async () => {
    const next = !flash
    setFlash(next)
    const track = streamRef.current?.getVideoTracks()[0]
    try {
      await track?.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
    } catch {
      /* ignore */
    }
  }

  const selectTab = (next: typeof tab) => {
    setTab(next)
    setLive(next === 'live')
    setPart('')
    setShot(null)
    setCapturedImage('')
    if (next === 'live') onResult?.('안녕하세요', translateText('안녕하세요', source, to) || '안녕하세요')
  }

  const capture = () => {
    if (videoRef.current?.videoWidth) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      setCapturedImage(canvas.toDataURL('image/png'))
    }
    setShot('camera')
    if (tab === 'full') onResult?.('안녕하세요', translateText('안녕하세요', source, to) || '안녕하세요')
  }

  const resetCapture = () => {
    setShot(null)
    setPart('')
    setCapturedImage('')
  }

  const pickPart = (text: string) => {
    setPart(text)
    onResult?.(text, translateText(text, source, to) || text)
  }

  return (
    <div className="tr-full">
      <Header title="이미지 번역" onBack={onBack} />
      <ModeLangs from={from} to={to} onPick={onPick} onSwap={onSwap} />
      <div className="phone-scroll">
        <div className="tr-page">
          <section className={`tr-preview${cameraOn ? ' has-camera' : ''}`}>
            {capturedImage ? (
              <img className="tr-camera" src={capturedImage} alt="" />
            ) : cameraOn ? (
              <video ref={videoRef} className="tr-camera" autoPlay muted playsInline />
            ) : null}
            {cameraOn && !capturedImage ? (
              <button
                type="button"
                className={`tr-flash${flash ? ' on' : ''}`}
                aria-label={flash ? '플래시 끄기' : '플래시 켜기'}
                aria-pressed={flash}
                onClick={() => void toggleFlash()}
              >
                <Lightning size={20} weight={flash ? 'fill' : 'regular'} color={flash ? '#ffb800' : '#fff'} />
              </button>
            ) : null}
            {tab === 'part' && shot ? (
              <div className="tr-part-list">
                {parts.map((text) => (
                  <button key={text} type="button" className={part === text ? 'on' : ''} onClick={() => pickPart(text)}>
                    {text}
                  </button>
                ))}
              </div>
            ) : tab === 'live' ? null : shot ? null : cameraOn ? null : (
              <Images size={32} weight="fill" color="#fff" />
            )}
            {tab === 'live' ? (
              <span className="tr-live-badge">
                <i />
                촬영 중
              </span>
            ) : null}
            {tab !== 'live' ? (
              <button
                type="button"
                className="tr-shutter"
                aria-label={shot ? '다시 촬영' : '촬영'}
                onClick={shot ? resetCapture : capture}
              >
                {shot ? <ArrowCounterClockwise size={24} {...PH} /> : <Camera size={26} {...PH} />}
              </button>
            ) : null}
            <div className="tr-seg in-camera" role="tablist" aria-label="이미지 번역 방식">
              <button type="button" className={tab === 'full' ? 'on' : ''} aria-pressed={tab === 'full'} onClick={() => selectTab('full')}>
                전체
              </button>
              <button type="button" className={tab === 'live' ? 'on' : ''} aria-pressed={tab === 'live'} onClick={() => selectTab('live')}>
                실시간
              </button>
              <button type="button" className={tab === 'part' ? 'on' : ''} aria-pressed={tab === 'part'} onClick={() => selectTab('part')}>
                부분
              </button>
            </div>
          </section>
          {src ? (
            <section className="tr-voice-card">
              <p className="tr-image-src">{src}</p>
              <p className="tr-image-dst">{dst}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type DocJob = { name: string; status: 'working' | 'done' }

export function DocMode({
  from,
  to,
  onBack,
  onPick,
  onSwap,
}: {
  from: LangId
  to: string
  onBack: () => void
  onPick: (side: PickerSide) => void
  onSwap?: () => void
}) {
  const [job, setJob] = useState<DocJob | null>(null)
  const [saved, setSaved] = useState(false)

  const download = () => {
    if (!job) return
    const url = URL.createObjectURL(new Blob([`번역 완료\n${job.name}`], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `번역_${job.name}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setSaved(true)
  }

  useEffect(() => {
    if (job?.status !== 'working') return
    const t = window.setTimeout(() => setJob({ name: job.name, status: 'done' }), 800)
    return () => window.clearTimeout(t)
  }, [job])

  return (
    <div className="tr-full">
      <Header title="문서 번역" onBack={onBack} />
      <ModeLangs from={from} to={to} onPick={onPick} onSwap={onSwap} />
      <div className="phone-scroll">
        <div className="tr-page">
          {!job ? (
            <button type="button" className="tr-drop" onClick={() => setJob({ name: '일정표.pdf', status: 'working' })}>
              <FileText size={28} {...PH} />
              <b>문서 첨부</b>
              <span>pdf, docx, xlsx, pptx</span>
            </button>
          ) : (
            <section className="tr-card tr-file">
              <span className="tr-svc-ico">
                <FileText size={22} {...PH} />
              </span>
              <div>
                <b>{job.name}</b>
                <span>{job.status === 'working' ? '번역 중' : saved ? '다운로드됨' : '번역 완료'}</span>
              </div>
            </section>
          )}
        </div>
      </div>
      {job && job.status !== 'working' ? (
        <div className="tr-mode-foot">
          <button type="button" className="tr-cta" onClick={download}>
            다운로드
          </button>
        </div>
      ) : null}
    </div>
  )
}
