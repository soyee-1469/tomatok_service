export type LangId = string

export type Lang = {
  id: LangId
  name: string
  tts: string
}

export const LANGS: Lang[] = [
  { id: 'auto', name: '언어 감지', tts: '' },
  { id: 'ko', name: '한국어', tts: 'ko-KR' },
  { id: 'en', name: '영어', tts: 'en-US' },
  { id: 'ja', name: '일본어', tts: 'ja-JP' },
  { id: 'zh', name: '중국어(간체)', tts: 'zh-CN' },
  { id: 'zh-TW', name: '중국어(번체)', tts: 'zh-TW' },
  { id: 'es', name: '스페인어', tts: 'es-ES' },
  { id: 'fr', name: '프랑스어', tts: 'fr-FR' },
  { id: 'de', name: '독일어', tts: 'de-DE' },
  { id: 'ru', name: '러시아어', tts: 'ru-RU' },
  { id: 'pt', name: '포르투갈어', tts: 'pt-PT' },
  { id: 'it', name: '이탈리아어', tts: 'it-IT' },
  { id: 'vi', name: '베트남어', tts: 'vi-VN' },
  { id: 'th', name: '태국어', tts: 'th-TH' },
  { id: 'id', name: '인도네시아어', tts: 'id-ID' },
  { id: 'ar', name: '아랍어', tts: 'ar-SA' },
  { id: 'hi', name: '힌디어', tts: 'hi-IN' },
  { id: 'gl', name: '갈리시아어', tts: 'gl-ES' },
  { id: 'gn', name: '과라니어', tts: 'gn' },
  { id: 'gu', name: '구자라트어', tts: 'gu-IN' },
  { id: 'el', name: '그리스어', tts: 'el-GR' },
  { id: 'nl', name: '네덜란드어', tts: 'nl-NL' },
  { id: 'ne', name: '네팔어', tts: 'ne-NP' },
  { id: 'no', name: '노르웨이어', tts: 'nb-NO' },
  { id: 'da', name: '덴마크어', tts: 'da-DK' },
  { id: 'lo', name: '라오어', tts: 'lo-LA' },
  { id: 'lv', name: '라트비아어', tts: 'lv-LV' },
  { id: 'la', name: '라틴어', tts: 'la' },
  { id: 'ro', name: '루마니아어', tts: 'ro-RO' },
  { id: 'lg', name: '루간다어', tts: 'lg' },
  { id: 'lb', name: '룩셈부르크어', tts: 'lb-LU' },
  { id: 'lt', name: '리투아니아어', tts: 'lt-LT' },
  { id: 'ln', name: '링갈라어', tts: 'ln' },
  { id: 'mni', name: '마니푸리어', tts: 'mni' },
  { id: 'mr', name: '마라티어', tts: 'mr-IN' },
  { id: 'mi', name: '마오리어', tts: 'mi-NZ' },
  { id: 'mai', name: '마이틸리어', tts: 'mai' },
  { id: 'mk', name: '마케도니아어', tts: 'mk-MK' },
  { id: 'mg', name: '말라가시어', tts: 'mg-MG' },
  { id: 'ml', name: '말라얄람어', tts: 'ml-IN' },
  { id: 'ms', name: '말레이어', tts: 'ms-MY' },
  { id: 'mn', name: '몽골어', tts: 'mn-MN' },
  { id: 'hmn', name: '몽어', tts: 'hmn' },
  { id: 'mt', name: '몰타어', tts: 'mt-MT' },
  { id: 'my', name: '미얀마어', tts: 'my-MM' },
  { id: 'eu', name: '바스크어', tts: 'eu-ES' },
  { id: 'be', name: '벨라루스어', tts: 'be-BY' },
  { id: 'bn', name: '벵골어', tts: 'bn-BD' },
  { id: 'bs', name: '보스니아어', tts: 'bs-BA' },
  { id: 'bg', name: '불가리아어', tts: 'bg-BG' },
  { id: 'sm', name: '사모아어', tts: 'sm' },
  { id: 'sa', name: '산스크리트어', tts: 'sa' },
  { id: 'sr', name: '세르비아어', tts: 'sr-RS' },
  { id: 'st', name: '세소토어', tts: 'st' },
  { id: 'ceb', name: '세부아노어', tts: 'ceb' },
  { id: 'so', name: '소말리어', tts: 'so-SO' },
  { id: 'sn', name: '쇼나어', tts: 'sn' },
  { id: 'su', name: '순다어', tts: 'su' },
  { id: 'sw', name: '스와힐리어', tts: 'sw-KE' },
  { id: 'sv', name: '스웨덴어', tts: 'sv-SE' },
  { id: 'gd', name: '스코틀랜드 게일어', tts: 'gd-GB' },
  { id: 'sk', name: '슬로바키아어', tts: 'sk-SK' },
  { id: 'sl', name: '슬로베니아어', tts: 'sl-SI' },
  { id: 'sd', name: '신디어', tts: 'sd' },
  { id: 'si', name: '싱할라어', tts: 'si-LK' },
  { id: 'hy', name: '아르메니아어', tts: 'hy-AM' },
  { id: 'as', name: '아삼어', tts: 'as-IN' },
  { id: 'is', name: '아이슬란드어', tts: 'is-IS' },
  { id: 'ht', name: '아이티 크리올어', tts: 'ht' },
  { id: 'ga', name: '아일랜드어', tts: 'ga-IE' },
  { id: 'az', name: '아제르바이잔어', tts: 'az-AZ' },
  { id: 'af', name: '아프리칸스어', tts: 'af-ZA' },
  { id: 'sq', name: '알바니아어', tts: 'sq-AL' },
  { id: 'am', name: '암하라어', tts: 'am-ET' },
  { id: 'et', name: '에스토니아어', tts: 'et-EE' },
  { id: 'eo', name: '에스페란토어', tts: 'eo' },
  { id: 'or', name: '오리야어', tts: 'or-IN' },
  { id: 'om', name: '오로모어', tts: 'om' },
  { id: 'uz', name: '우즈베크어', tts: 'uz-UZ' },
  { id: 'uk', name: '우크라이나어', tts: 'uk-UA' },
  { id: 'ur', name: '우르두어', tts: 'ur-PK' },
  { id: 'cy', name: '웨일스어', tts: 'cy-GB' },
  { id: 'ug', name: '위구르어', tts: 'ug' },
  { id: 'ig', name: '이그보어', tts: 'ig' },
  { id: 'yi', name: '이디시어', tts: 'yi' },
  { id: 'ilo', name: '일로카노어', tts: 'ilo' },
  { id: 'jv', name: '자바어', tts: 'jv' },
  { id: 'ka', name: '조지아어', tts: 'ka-GE' },
  { id: 'zu', name: '줄루어', tts: 'zu-ZA' },
  { id: 'ts', name: '총가어', tts: 'ts' },
  { id: 'cs', name: '체코어', tts: 'cs-CZ' },
  { id: 'kk', name: '카자흐어', tts: 'kk-KZ' },
  { id: 'ca', name: '카탈루냐어', tts: 'ca-ES' },
  { id: 'kn', name: '칸나다어', tts: 'kn-IN' },
  { id: 'qu', name: '케추아어', tts: 'qu' },
  { id: 'co', name: '코르시카어', tts: 'co' },
  { id: 'xh', name: '코사어', tts: 'xh-ZA' },
  { id: 'ku', name: '쿠르드어', tts: 'ku' },
  { id: 'hr', name: '크로아티아어', tts: 'hr-HR' },
  { id: 'km', name: '크메르어', tts: 'km-KH' },
  { id: 'ky', name: '키르기스어', tts: 'ky-KG' },
  { id: 'rw', name: '키냐르완다어', tts: 'rw-RW' },
  { id: 'ta', name: '타밀어', tts: 'ta-IN' },
  { id: 'tg', name: '타지크어', tts: 'tg' },
  { id: 'tt', name: '타타르어', tts: 'tt' },
  { id: 'tr', name: '터키어', tts: 'tr-TR' },
  { id: 'te', name: '텔루구어', tts: 'te-IN' },
  { id: 'tk', name: '투르크멘어', tts: 'tk' },
  { id: 'ak', name: '트위어', tts: 'ak' },
  { id: 'ti', name: '티그리냐어', tts: 'ti' },
  { id: 'ps', name: '파슈토어', tts: 'ps' },
  { id: 'pa', name: '펀자브어', tts: 'pa-IN' },
  { id: 'fa', name: '페르시아어', tts: 'fa-IR' },
  { id: 'pl', name: '폴란드어', tts: 'pl-PL' },
  { id: 'fy', name: '프리지아어', tts: 'fy' },
  { id: 'fi', name: '핀란드어', tts: 'fi-FI' },
  { id: 'fil', name: '필리핀어', tts: 'fil-PH' },
  { id: 'ha', name: '하우사어', tts: 'ha' },
  { id: 'haw', name: '하와이어', tts: 'haw' },
  { id: 'hu', name: '헝가리어', tts: 'hu-HU' },
  { id: 'he', name: '히브리어', tts: 'he-IL' },
]

export const TARGET_LANGS = LANGS.filter((l) => l.id !== 'auto')

export const MAX_CHARS = 5000

type Entry = Partial<Record<string, string>>

const PHRASES: Entry[] = [
  {
    ko: '안녕하세요',
    en: 'Hello',
    ja: 'こんにちは',
    zh: '你好',
    es: 'Hola',
    fr: 'Bonjour',
    de: 'Hallo',
    vi: 'Xin chào',
    th: 'สวัสดี',
  },
  {
    ko: '안녕',
    en: 'Hello',
    ja: 'こんにちは',
    zh: '你好',
    es: 'Hola',
    fr: 'Salut',
    de: 'Hallo',
    vi: 'Chào',
    th: 'สวัสดี',
  },
  {
    ko: '감사합니다',
    en: 'Thank you',
    ja: 'ありがとうございます',
    zh: '谢谢',
    es: 'Gracias',
    fr: 'Merci',
    de: 'Danke',
    vi: 'Cảm ơn',
    th: 'ขอบคุณ',
  },
  {
    ko: '사랑해요',
    en: 'I love you',
    ja: '愛してる',
    zh: '我爱你',
    es: 'Te quiero',
    fr: 'Je t’aime',
    de: 'Ich liebe dich',
    vi: 'Anh yêu em',
    th: 'รักนะ',
  },
  {
    ko: '어디예요',
    en: 'Where are you?',
    ja: 'どこですか',
    zh: '你在哪里',
    es: '¿Dónde estás?',
    fr: 'Où es-tu ?',
    de: 'Wo bist du?',
    vi: 'Bạn ở đâu?',
    th: 'คุณอยู่ไหน',
  },
  {
    ko: '얼마예요',
    en: 'How much is it?',
    ja: 'いくらですか',
    zh: '多少钱',
    es: '¿Cuánto cuesta?',
    fr: 'Ça coûte combien ?',
    de: 'Wie viel kostet das?',
    vi: 'Giá bao nhiêu?',
    th: 'เท่าไหร่',
  },
  {
    ko: '도와주세요',
    en: 'Please help me',
    ja: '助けてください',
    zh: '请帮帮我',
    es: 'Ayúdame por favor',
    fr: 'Aidez-moi s’il vous plaît',
    de: 'Bitte hilf mir',
    vi: 'Làm ơn giúp tôi',
    th: 'ช่วยด้วย',
  },
  {
    ko: '만나서 반가워요',
    en: 'Nice to meet you',
    ja: 'はじめまして',
    zh: '很高兴认识你',
    es: 'Encantado de conocerte',
    fr: 'Enchanté',
    de: 'Freut mich',
    vi: 'Rất vui được gặp bạn',
    th: 'ยินดีที่ได้รู้จัก',
  },
  {
    ko: '좋은 아침이에요',
    en: 'Good morning',
    ja: 'おはようございます',
    zh: '早上好',
    es: 'Buenos días',
    fr: 'Bonjour',
    de: 'Guten Morgen',
    vi: 'Chào buổi sáng',
    th: 'อรุณสวัสดิ์',
  },
  {
    ko: '잘 자요',
    en: 'Good night',
    ja: 'おやすみなさい',
    zh: '晚安',
    es: 'Buenas noches',
    fr: 'Bonne nuit',
    de: 'Gute Nacht',
    vi: 'Chúc ngủ ngon',
    th: 'ราตรีสวัสดิ์',
  },
  {
    ko: '네',
    en: 'Yes',
    ja: 'はい',
    zh: '是',
    es: 'Sí',
    fr: 'Oui',
    de: 'Ja',
    vi: 'Vâng',
    th: 'ใช่',
  },
  {
    ko: '아니요',
    en: 'No',
    ja: 'いいえ',
    zh: '不',
    es: 'No',
    fr: 'Non',
    de: 'Nein',
    vi: 'Không',
    th: 'ไม่',
  },
  {
    ko: '괜찮아요',
    en: 'It’s okay',
    ja: '大丈夫です',
    zh: '没关系',
    es: 'Está bien',
    fr: 'Ça va',
    de: 'Es ist okay',
    vi: 'Không sao',
    th: 'ไม่เป็นไร',
  },
  {
    ko: '미안해요',
    en: 'I’m sorry',
    ja: 'ごめんなさい',
    zh: '对不起',
    es: 'Lo siento',
    fr: 'Pardon',
    de: 'Es tut mir leid',
    vi: 'Xin lỗi',
    th: 'ขอโทษ',
  },
  {
    ko: '오늘 뭐 해',
    en: 'What are you doing today?',
    ja: '今日何するの',
    zh: '你今天做什么',
    es: '¿Qué haces hoy?',
    fr: 'Tu fais quoi aujourd’hui ?',
    de: 'Was machst du heute?',
    vi: 'Hôm nay bạn làm gì?',
    th: 'วันนี้ทำอะไร',
  },
  {
    ko: '토마톡',
    en: 'TomaTok',
    ja: 'トマトック',
    zh: 'TomaTok',
    es: 'TomaTok',
    fr: 'TomaTok',
    de: 'TomaTok',
    vi: 'TomaTok',
    th: 'TomaTok',
  },
]

function normalize(s: string) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase()
}

const INDEX = new Map<string, Entry>()
for (const row of PHRASES) {
  for (const val of Object.values(row)) {
    if (val) INDEX.set(normalize(val), row)
  }
}

export function langOf(id: LangId) {
  return LANGS.find((l) => l.id === id) ?? LANGS[1]
}

export function detectLang(text: string): string {
  const t = text.trim()
  if (!t) return 'ko'
  if (/[가-힣]/.test(t)) return 'ko'
  if (/[\u3040-\u30ff]/.test(t)) return 'ja'
  if (/[\u4e00-\u9fff]/.test(t)) return 'zh'
  if (/[\u0e00-\u0e7f]/.test(t)) return 'th'
  if (/[\u0600-\u06ff]/.test(t)) return 'ar'
  if (/[\u0590-\u05ff]/.test(t)) return 'he'
  if (/[\u0400-\u04ff]/.test(t)) return 'ru'
  if (/[\u0900-\u097f]/.test(t)) return 'hi'
  if (/[\u0370-\u03ff]/.test(t)) return 'el'
  if (/[ăâêôơưđ]/i.test(t)) return 'vi'
  if (/[àâäéèêëïîôùûüç]/i.test(t)) return 'fr'
  if (/[äöüß]/i.test(t)) return 'de'
  if (/[áéíóúñ¿¡]/i.test(t)) return 'es'
  return 'en'
}

export function translateText(text: string, from: LangId, to: string) {
  const raw = text.trim()
  if (!raw) return ''
  const source = from === 'auto' ? detectLang(raw) : from
  if (source === to) return raw

  const parts = raw.split(/(\n+)/)
  return parts
    .map((part) => {
      if (/^\n+$/.test(part) || !part.trim()) return part
      const hit = INDEX.get(normalize(part))
      if (hit?.[to]) return hit[to] as string
      const sentences = part.split(/([.!?。！？]+)/)
      return sentences
        .map((s) => {
          if (!s.trim() || /^[.!?。！？]+$/.test(s)) return s
          const row = INDEX.get(normalize(s))
          return row?.[to] ?? s
        })
        .join('')
    })
    .join('')
}
