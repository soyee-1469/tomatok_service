const ARTISTS = [
  { id: "lesserafim", name: "LE SSERAFIM", kind: "group", members: ["김채원", "사쿠라", "허윤진", "카즈하", "홍은채"] },
  { id: "ive", name: "IVE", kind: "group", members: ["안유진", "가을", "레이", "장원영", "리즈", "이서"] },
  { id: "blackpink", name: "BLACKPINK", kind: "group", members: ["지수", "제니", "로제", "리사"] },
  { id: "bts", name: "방탄소년단", kind: "group", members: ["전정국"] },
  { id: "rose", name: "로제", kind: "solo", members: ["로제"], groupId: "blackpink" },
  { id: "jungkook", name: "전정국", kind: "solo", members: ["전정국"], groupId: "bts" },
];

const HOLDING_ID = "holding";

const PROFILE_PHOTOS = {
  blackpink: "../assets/profiles/blackpink.png",
  ive: "../assets/profiles/ive.jpg",
  bts: "../assets/profiles/bts.jpg",
  rose: "../assets/profiles/rose.jpg",
  lesserafim: "../assets/profiles/lesserafim.png",
};

const ALIASES = {
  lesserafim: ["르세라핌"],
  ive: ["아이브"],
  blackpink: ["블랙핑크"],
  bts: ["방탄", "BTS"],
  rose: ["로제", "로지", "rose", "rosé", "blackpink rose"],
  jungkook: ["정국"],
};

const ARTIST_I18N = {
  blackpink: { ko: "블랙핑크", en: "BLACKPINK", aliases: "블랙핑크" },
  lesserafim: { ko: "르세라핌", en: "LE SSERAFIM", aliases: "르세라핌" },
  ive: { ko: "아이브", en: "IVE", aliases: "아이브" },
  rose: { ko: "로제", en: "ROSÉ", aliases: "로제, rose, rosé, blackpink rose, 로지" },
  bts: { ko: "방탄소년단", en: "BTS", aliases: "방탄, BTS" },
  jungkook: { ko: "전정국", en: "Jung Kook", aliases: "정국" },
};

const EVENT_TYPES = [
  { id: "album", label: "앨범 수록" },
  { id: "pob", label: "사전예약 특전" },
  { id: "fansign", label: "팬사인 / 영상통화" },
  { id: "japan", label: "일본반 특전" },
  { id: "unknown", label: "기타" },
];

const VERSIONS = [
  { id: "unset", label: "미정" },
  { id: "standard", label: "일반" },
  { id: "compact", label: "컴팩트" },
  { id: "weverse", label: "위버스" },
  { id: "japan", label: "일본반" },
  { id: "pob", label: "특전" },
];

const RARITIES = ["NORMAL", "RARE", "SPECIAL"];

const PACK_FIELDS = [
  ["활동", "그룹인지 개인인지. 앱 화면에는 안 나온다"],
  ["가수명", "프로필 옆에 나오는 이름"],
  ["앨범명", "상품명에 들어간다. 목록은 가수명 앨범명 - 포토 세트"],
  ["행사 종류", "앨범 수록, 특전, 팬사인, 일본반, 미확인"],
  ["행사명", "있으면 상품명에 붙는다"],
  ["상품 이미지", "NEW, 앨범, 상세에 나오는 이미지. 카드 앞면으로 대신하지 않음"],
  ["가격", "앱에 N TOTT로 나온다"],
  ["판매", "판매, 품절, 입고예정. 품절과 입고예정은 뽑을 수 없다"],
];

const CARD_FIELDS = [
  ["번호", "팩 안 슬롯 번호"],
  ["멤버", "그룹이면 팀 안 누구인지. 개인이면 본인"],
  ["앞면", "구매 후에만 공개"],
  ["뒷면", "구성 슬롯에 보이는 면"],
  ["버전", "실물에 적힌 판만. 모르면 미정"],
  ["등급", "한정이나 특별 컷일 때만 RARE, SPECIAL"],
  ["재고", "실물 수량. 0이면 추첨에서 빠짐"],
  ["추첨 가중치", "뽑힐 비율. 확정 전에는 전부 1"],
];

function card(no, member, front, back, version) {
  const n = String(no).padStart(2, "0");
  return {
    no: n,
    member,
    front: `../assets/photocards/${front}`,
    back: `../assets/photocards/${back}`,
    version,
    rarity: "NORMAL",
    stock: "",
    weight: 1,
  };
}

function pack(partial) {
  return {
    cover: "",
    price: 2500,
    status: "draft",
    eventName: "",
    kind: "group",
    home: false,
    ...partial,
  };
}

const SEED = [
  pack({
    id: "lesserafim-crazy",
    artistId: "lesserafim",
    album: "CRAZY",
    cover: "../assets/covers/crazy.jpg",
    eventType: "album",
    home: true,
    status: "out",
    cards: [1, 2, 3, 4, 5].map((no) => card(no, "", `0${no}.jpg`, "06.jpg", "unset")),
  }),
  pack({
    id: "lesserafim-easy",
    artistId: "lesserafim",
    album: "EASY",
    cover: "../assets/covers/easy.jpg",
    eventType: "album",
    home: true,
    status: "soon",
    cards: [
      card(1, "", "10.jpg", "11.jpg", "unset"),
      card(2, "", "12.jpg", "11.jpg", "unset"),
      card(3, "", "14.jpg", "11.jpg", "unset"),
      card(4, "", "16.jpg", "11.jpg", "unset"),
      card(5, "", "18.jpg", "11.jpg", "unset"),
    ],
  }),
  pack({
    id: "ive-empathy-makestar",
    artistId: "ive",
    album: "IVE EMPATHY",
    cover: "../assets/covers/ive-empathy.jpg",
    eventType: "pob",
    eventName: "MAKESTAR",
    home: true,
    status: "on",
    cards: [
      card(1, "", "20.jpg", "19.jpg", "pob"),
      card(2, "", "22.jpg", "19.jpg", "pob"),
      card(3, "", "24.jpg", "19.jpg", "pob"),
      card(4, "", "26.jpg", "19.jpg", "pob"),
      card(5, "", "28.jpg", "19.jpg", "pob"),
    ],
  }),
  pack({
    id: "ive-empathy-popo",
    artistId: "ive",
    album: "IVE EMPATHY",
    cover: "../assets/covers/ive-empathy.jpg",
    eventType: "unknown",
    eventName: "Team POPO",
    cards: [
      card(1, "", "30.jpg", "29.jpg", "pob"),
      card(2, "", "32.jpg", "31.jpg", "pob"),
      card(3, "", "34.jpg", "33.jpg", "pob"),
      card(4, "", "36.jpg", "35.jpg", "pob"),
      card(5, "", "38.jpg", "37.jpg", "pob"),
      card(6, "", "40.jpg", "39.jpg", "pob"),
    ],
  }),
  pack({
    id: "rose-rosie-jp",
    artistId: "rose",
    kind: "solo",
    album: "rosie",
    cover: "../assets/covers/rosie.jpg",
    eventType: "japan",
    eventName: "WPCR-18718",
    home: true,
    status: "on",
    cards: [
      card(1, "로제", "59.jpg", "60.jpg", "japan"),
      card(2, "로제", "61.jpg", "62.jpg", "japan"),
      card(3, "로제", "63.jpg", "64.jpg", "japan"),
      card(4, "로제", "65.jpg", "66.jpg", "japan"),
    ],
  }),
  pack({
    id: "blackpink-jump",
    artistId: "blackpink",
    album: "JUMP",
    cover: "../assets/covers/jump.jpg",
    eventType: "album",
    home: true,
    status: "on",
    cards: [
      card(1, "리사", "67.jpg", "68.jpg", "unset"),
      card(2, "로제", "69.jpg", "68.jpg", "unset"),
      card(3, "제니", "71.jpg", "68.jpg", "unset"),
      card(4, "지수", "73.jpg", "68.jpg", "unset"),
      card(5, "단체", "75.jpg", "68.jpg", "unset"),
    ],
  }),
  pack({
    id: "bts-unknown",
    artistId: "bts",
    album: "",
    eventType: "unknown",
    cards: [
      card(1, "전정국", "51.jpg", "52.jpg", "unset"),
      card(2, "전정국", "53.jpg", "54.jpg", "unset"),
      card(3, "전정국", "55.jpg", "56.jpg", "unset"),
      card(4, "전정국", "57.jpg", "58.jpg", "unset"),
    ],
  }),
  pack({
    id: "unsorted",
    artistId: HOLDING_ID,
    kind: "unknown",
    album: "",
    eventType: "unknown",
    cards: [41, 43, 45, 47, 49].map((front, index) =>
      card(index + 1, "", `${front}.jpg`, `${front + 1}.jpg`, "unset"),
    ),
  }),
];
