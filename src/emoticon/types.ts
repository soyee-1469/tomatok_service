export type EmoticonType = 'static' | 'animated'

export type Emoticon = {
  id: string
  setId: string
  name: string
  image: string
  animatedImage: string | null
  type: EmoticonType
  tags: string[]
}

export type EmoticonSet = {
  id: string
  title: string
  characterName: string
  creatorName: string
  category: string
  description: string
  thumbnail: string
  bannerImage: string
  emoticonCount: number
  isNew: boolean
  isRecommended: boolean
  isOwned: boolean
  isFavorite: boolean
  createdAt: string
  tags: string[]
  emoticons: Emoticon[]
  price: number
  currency: 'TOTT'
  seriesId: string
  seriesName: string
  isForSale: boolean
  isGiftable: boolean
  storeProductId: string
  saleStartAt: string
  saleEndAt: string
}

export type EmoticonSeries = {
  id: string
  name: string
  description: string
  setIds: string[]
}

export type GiftStatus = 'pending' | 'received' | 'expired'

export type Gift = {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  emoticonSetId: string
  message: string
  status: GiftStatus
  createdAt: string
  receivedAt: string | null
}

export type Friend = {
  id: string
  displayName: string
  userId: string
  avatar: string
  ownedSetIds: string[]
  recent: boolean
}

export type PreviewBg = 'white' | 'gray' | 'dark'
