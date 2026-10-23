import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { EMOTICON_SETS, INITIAL_GIFTS } from './data'
import type { Emoticon, EmoticonSet, Gift } from './types'

type EmoticonStore = {
  sets: EmoticonSet[]
  ownedIds: string[]
  favoriteIds: string[]
  hiddenIds: string[]
  setOrder: string[]
  recentEmoticonIds: string[]
  recentQueries: string[]
  gifts: Gift[]
  isOwned: (id: string) => boolean
  isFavorite: (id: string) => boolean
  isHidden: (id: string) => boolean
  addSet: (id: string) => void
  removeSet: (id: string) => void
  toggleFavorite: (id: string) => void
  hideSet: (id: string) => void
  unhideSet: (id: string) => void
  moveSet: (id: string, dir: -1 | 1) => void
  useEmoticon: (emoticon: Emoticon) => void
  rememberQuery: (query: string) => void
  clearRecentQueries: () => void
  tottBalance: number
  canAfford: (price: number) => boolean
  chargeTott: (amount?: number) => void
  purchaseSet: (id: string) => boolean
  sendGift: (input: { receiverId: string; receiverName: string; setId: string; message: string }) => Gift | null
  acceptGift: (giftId: string) => void
  pendingGifts: () => Gift[]
  visibleOwnedSets: () => EmoticonSet[]
  favoriteSets: () => EmoticonSet[]
  recentEmoticons: () => Emoticon[]
}

const Ctx = createContext<EmoticonStore | null>(null)

function seedOwned() {
  return EMOTICON_SETS.filter((s) => s.isOwned).map((s) => s.id)
}

function seedFavorite() {
  return EMOTICON_SETS.filter((s) => s.isFavorite).map((s) => s.id)
}

export function EmoticonProvider({ children }: { children: ReactNode }) {
  const [ownedIds, setOwnedIds] = useState<string[]>(seedOwned)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(seedFavorite)
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [setOrder, setSetOrder] = useState<string[]>(() => seedOwned())
  const [recentEmoticonIds, setRecentEmoticonIds] = useState<string[]>([
    'tomatok-daily-01-01',
    'hamster-react-01',
    'seal-react-01',
  ])
  const [recentQueries, setRecentQueries] = useState<string[]>(['토마콩즈', '리액션'])
  const [gifts, setGifts] = useState<Gift[]>(INITIAL_GIFTS)
  const [giftSeq, setGiftSeq] = useState(10)
  const [tottBalance, setTottBalance] = useState(8)

  const value = useMemo<EmoticonStore>(() => {
    const byId = new Map(EMOTICON_SETS.map((s) => [s.id, s]))
    const allEmoticons = EMOTICON_SETS.flatMap((s) => s.emoticons)

    const orderedOwned = () => {
      const extra = ownedIds.filter((id) => !setOrder.includes(id))
      return [...setOrder, ...extra].filter((id) => ownedIds.includes(id))
    }

    return {
      sets: EMOTICON_SETS,
      ownedIds,
      favoriteIds,
      hiddenIds,
      setOrder,
      recentEmoticonIds,
      recentQueries,
      gifts,
      tottBalance,
      isOwned: (id) => ownedIds.includes(id),
      isFavorite: (id) => favoriteIds.includes(id),
      isHidden: (id) => hiddenIds.includes(id),
      // TODO API: POST /emoticons/owned
      addSet: (id) => {
        setOwnedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
        setSetOrder((ids) => (ids.includes(id) ? ids : [...ids, id]))
      },
      // TODO API: DELETE /emoticons/owned/:id
      removeSet: (id) => {
        setOwnedIds((ids) => ids.filter((x) => x !== id))
        setSetOrder((ids) => ids.filter((x) => x !== id))
      },
      // TODO API: PUT /emoticons/favorites/:id
      toggleFavorite: (id) => {
        setFavoriteIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
      },
      // TODO API: PUT /emoticons/owned/:id/hidden
      hideSet: (id) => setHiddenIds((ids) => (ids.includes(id) ? ids : [...ids, id])),
      unhideSet: (id) => setHiddenIds((ids) => ids.filter((x) => x !== id)),
      // TODO API: PUT /emoticons/owned/order
      moveSet: (id, dir) => {
        setSetOrder((ids) => {
          const list = [...ids]
          const i = list.indexOf(id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= list.length) return list
          ;[list[i], list[j]] = [list[j], list[i]]
          return list
        })
      },
      // TODO API: POST /emoticons/recent  — do not call chat send API
      useEmoticon: (emoticon) => {
        setRecentEmoticonIds((ids) => [emoticon.id, ...ids.filter((x) => x !== emoticon.id)].slice(0, 24))
        console.info('[emoticon] pick', emoticon.id, emoticon.name)
      },
      rememberQuery: (query) => {
        const q = query.trim()
        if (!q) return
        setRecentQueries((list) => [q, ...list.filter((x) => x !== q)].slice(0, 8))
      },
      clearRecentQueries: () => setRecentQueries([]),
      canAfford: (price) => tottBalance >= price,
      // TODO API: POST /wallet/tott/charge
      chargeTott: (amount = 20) => setTottBalance((n) => n + amount),
      // TODO API: POST /store/purchase  — do not call payment API
      purchaseSet: (id) => {
        const pack = EMOTICON_SETS.find((s) => s.id === id)
        const price = pack?.price ?? 5
        if (ownedIds.includes(id)) return true
        if (tottBalance < price) return false
        console.info('[emoticon] purchase', id)
        setTottBalance((n) => n - price)
        setOwnedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
        setSetOrder((ids) => (ids.includes(id) ? ids : [...ids, id]))
        return true
      },
      // TODO API: POST /gifts  — do not call friend/message API
      sendGift: ({ receiverId, receiverName, setId, message }) => {
        const pack = EMOTICON_SETS.find((s) => s.id === setId)
        const price = pack?.price ?? 5
        if (tottBalance < price) return null
        setTottBalance((n) => n - price)
        const gift: Gift = {
          id: `gift-out-${giftSeq}`,
          senderId: 'me',
          senderName: '나',
          receiverId,
          emoticonSetId: setId,
          message,
          status: 'pending',
          createdAt: new Date().toISOString().slice(0, 10),
          receivedAt: null,
        }
        setGiftSeq((n) => n + 1)
        setGifts((list) => [gift, ...list])
        console.info('[emoticon] gift', receiverName, setId)
        return gift
      },
      // TODO API: POST /gifts/:id/accept
      acceptGift: (giftId) => {
        const gift = gifts.find((g) => g.id === giftId)
        if (!gift) return
        setGifts((list) =>
          list.map((g) =>
            g.id === giftId ? { ...g, status: 'received', receivedAt: new Date().toISOString().slice(0, 10) } : g,
          ),
        )
        setOwnedIds((ids) => (ids.includes(gift.emoticonSetId) ? ids : [...ids, gift.emoticonSetId]))
        setSetOrder((ids) => (ids.includes(gift.emoticonSetId) ? ids : [...ids, gift.emoticonSetId]))
      },
      pendingGifts: () => gifts.filter((g) => g.status === 'pending' && g.receiverId === 'me'),
      visibleOwnedSets: () =>
        orderedOwned()
          .filter((id) => !hiddenIds.includes(id))
          .map((id) => byId.get(id))
          .filter((s): s is EmoticonSet => !!s),
      favoriteSets: () =>
        favoriteIds.map((id) => byId.get(id)).filter((s): s is EmoticonSet => !!s),
      recentEmoticons: () =>
        recentEmoticonIds
          .map((id) => allEmoticons.find((e) => e.id === id))
          .filter((e): e is Emoticon => !!e),
    }
  }, [favoriteIds, giftSeq, gifts, hiddenIds, ownedIds, recentEmoticonIds, recentQueries, setOrder, tottBalance])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEmoticons() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useEmoticons must be used in EmoticonProvider')
  return ctx
}
