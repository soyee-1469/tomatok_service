const TRACK = ["shipping_requested", "preparing", "shipped", "delivered"];
const TRACK_SHORT = {
  shipping_requested: "요청",
  preparing: "출고",
  shipped: "배송",
  delivered: "수령",
};

const SHIPPING = { maxCards: 50 };

function shippingPolicy() {
  const base = {
    maxCards: 50,
    cardWeight: "",
    packBands: [
      { label: "1~10장", from: 1, to: 10, weight: "" },
      { label: "11~30장", from: 11, to: 30, weight: "" },
      { label: "31~50장", from: 31, to: 50, weight: "" },
    ],
    zones: [],
  };
  try {
    const saved = JSON.parse(localStorage.getItem("photocard-shipping-policy-v1") || "null");
    if (!saved) return base;
    return {
      ...base,
      ...saved,
      maxCards: Number(saved.maxCards) || base.maxCards,
      packBands: base.packBands.map((band, index) => ({
        ...band,
        ...(saved.packBands?.[index] || {}),
        label: band.label,
        from: band.from,
        to: band.to,
      })),
      zones: Array.isArray(saved.zones) ? saved.zones : [],
    };
  } catch (error) {
    console.warn(error);
    return base;
  }
}

function maxShipCards() {
  const count = Number(shippingPolicy().maxCards);
  return count > 0 ? count : SHIPPING.maxCards;
}

function feeLabel(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "미정";
  const digits = raw.replace(/[^\d.]/g, "");
  if (digits && /^[\d,.\s원]*$/.test(raw)) {
    const amount = Number(digits);
    if (Number.isFinite(amount)) return `${amount.toLocaleString("ko-KR")}원`;
  }
  return raw;
}

function shippingQuote(count, country) {
  const policy = shippingPolicy();
  const zone = (policy.zones || []).find((item) => item.country === country);
  const cardWeight = Number(String(policy.cardWeight || "").replace(/[^\d.]/g, ""));
  const band = (policy.packBands || []).find((item) => count >= Number(item.from) && count <= Number(item.to));
  const packWeight = Number(String(band?.weight || "").replace(/[^\d.]/g, ""));
  const ready = cardWeight > 0 && band && String(band.weight ?? "").trim() !== "" && Number.isFinite(packWeight);
  const grams = ready ? count * cardWeight + packWeight : null;
  const steps = zone ? [[100, zone.w100], [250, zone.w250], [500, zone.w500]] : [];
  const hit = grams == null ? null : steps.find(([max, amount]) => grams <= max && String(amount || "").trim());
  return {
    place: country || "—",
    count,
    method: String(zone?.method || "").trim() || "—",
    feeText: feeLabel(hit?.[1]),
  };
}

const STATUS = {
  stored: "보관 중",
  shipping_cart: "배송바구니",
  shipping_requested: "배송 요청 완료",
  preparing: "출고 준비",
  shipped: "배송 중",
  delivered: "수령",
};

const BADGE = {
  stored: "보관중",
  shipping_cart: "배송바구니",
  shipping_requested: "배송요청",
  preparing: "출고준비",
  shipped: "배송중",
  delivered: "수령완료",
};

function statusGlyph(status) {
  if (status === "stored") return icon("track");
  if (status === "shipped") return icon("ship");
  if (status === "delivered") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 12.5l2.5 2.5 4.5-5"></path></svg>`;
  }
  return "";
}

const PRODUCTS = [
  {
    id: "blackpink-jump",
    artist: "BLACKPINK",
    artistId: "blackpink",
    album: "JUMP",
    eventType: "album",
    eventName: "",
    cover: "../assets/covers/jump.jpg",
    price: 2500,
    home: true,
    banner: true,
    cards: [
      { no: "01", front: "67.jpg", back: "68.jpg", member: "리사", rarity: "NORMAL" },
      { no: "02", front: "69.jpg", back: "68.jpg", member: "로제", rarity: "NORMAL" },
      { no: "03", front: "71.jpg", back: "68.jpg", member: "제니", rarity: "NORMAL" },
      { no: "04", front: "73.jpg", back: "68.jpg", member: "지수", rarity: "NORMAL" },
      { no: "05", front: "75.jpg", back: "68.jpg", member: "단체", rarity: "NORMAL" },
    ],
  },
  {
    id: "lesserafim-crazy",
    artist: "LE SSERAFIM",
    artistId: "lesserafim",
    album: "CRAZY",
    eventType: "album",
    eventName: "",
    cover: "../assets/covers/crazy.jpg",
    price: 2500,
    home: true,
    sale: "out",
    cards: [1, 2, 3, 4, 5].map((no) => ({
      no: String(no).padStart(2, "0"),
      front: `0${no}.jpg`,
      back: "06.jpg",
      member: "",
      rarity: "NORMAL",
    })),
  },
  {
    id: "lesserafim-easy",
    artist: "LE SSERAFIM",
    artistId: "lesserafim",
    album: "EASY",
    eventType: "album",
    eventName: "",
    cover: "../assets/covers/easy.jpg",
    price: 2500,
    home: true,
    sale: "soon",
    cards: [
      { no: "01", front: "10.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "02", front: "12.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "03", front: "14.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "04", front: "16.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "05", front: "18.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
    ],
  },
  {
    id: "ive-empathy-makestar",
    artist: "IVE",
    artistId: "ive",
    album: "IVE EMPATHY",
    eventType: "pob",
    eventName: "MAKESTAR",
    cover: "../assets/covers/ive-empathy.jpg",
    price: 2500,
    home: true,
    cards: [20, 22, 24, 26, 28].map((front, index) => ({
      no: String(index + 1).padStart(2, "0"),
      front: `${front}.jpg`,
      back: "19.jpg",
      member: "",
      rarity: "NORMAL",
    })),
  },
  {
    id: "rose-rosie-jp",
    artist: "로제",
    artistId: "rose",
    album: "rosie",
    eventType: "japan",
    eventName: "WPCR-18718",
    cover: "../assets/covers/rosie.jpg",
    price: 2500,
    home: true,
    cards: [59, 61, 63, 65].map((front, index) => ({
      no: String(index + 1).padStart(2, "0"),
      front: `${front}.jpg`,
      back: `${front + 1}.jpg`,
      member: "로제",
      rarity: "NORMAL",
    })),
  },
];

let nextId = 1;

function isoDate(daysAgo = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return "";
  return `${year}. ${month}. ${day}.`;
}

function own(partial) {
  const card = { id: `UC_${nextId}`, status: "stored", purchasedOn: isoDate(), ...partial };
  nextId += 1;
  return card;
}

function shipmentMock(status) {
  const mock = {
    receiver: "홍길동",
    phone: "010-0000-0000",
    place: "대한민국",
    address: "서울특별시 강남구 테헤란로 123, 101동 1001호",
  };
  if (status === "shipped" || status === "delivered") {
    mock.carrier = "CJ대한통운";
    mock.tracking = status === "shipped" ? "123456789012" : "987654321098";
  }
  mock.requestedOn = isoDate(3);
  return mock;
}

function seedShipments(owned) {
  const byStatus = new Map();
  owned.forEach((card) => {
    if (!TRACK.includes(card.status)) return;
    const list = byStatus.get(card.status) || [];
    list.push(card.id);
    byStatus.set(card.status, list);
  });
  return [...byStatus.entries()].map(([status, cardIds], index) => ({
    id: `SH_${index + 1}`,
    kind: "ship",
    status,
    cardIds,
    feeText: "",
    method: "",
    ...shipmentMock(status),
  }));
}

function seedOwned() {
  return [
    own({ artist: "BLACKPINK", album: "JUMP", no: "01", front: "67.jpg", member: "리사", rarity: "NORMAL", status: "shipping_cart" }),
    own({ artist: "BLACKPINK", album: "JUMP", no: "02", front: "69.jpg", member: "로제", rarity: "NORMAL", status: "stored" }),
    own({ artist: "BLACKPINK", album: "JUMP", no: "02", front: "69.jpg", member: "로제", rarity: "NORMAL", status: "stored" }),
    own({ artist: "LE SSERAFIM", album: "CRAZY", no: "01", front: "01.jpg", member: "", rarity: "NORMAL", status: "stored" }),
    own({ artist: "LE SSERAFIM", album: "EASY", no: "01", front: "10.jpg", member: "", rarity: "NORMAL", status: "shipped" }),
    own({ artist: "LE SSERAFIM", album: "EASY", no: "02", front: "12.jpg", member: "", rarity: "NORMAL", status: "shipped" }),
    own({ artist: "LE SSERAFIM", album: "EASY", no: "03", front: "14.jpg", member: "", rarity: "NORMAL", status: "shipped" }),
    own({ artist: "IVE", album: "IVE EMPATHY", no: "01", front: "20.jpg", member: "", rarity: "NORMAL", status: "delivered" }),
    own({ artist: "로제", album: "rosie", no: "01", front: "59.jpg", member: "로제", rarity: "NORMAL", status: "stored" }),
  ].map((card) => ({ ...card, purchasedOn: isoDate(14) }));
}

const state = {
  tab: "home",
  screen: "home",
  board: "service",
  adminScene: "",
  productId: "blackpink-jump",
  sheet: null,
  focusStatus: null,
  albumArtist: "all",
  bannerIndex: 0,
  bannerSuppress: false,
  midIndex: 0,
  midSuppress: false,
  balance: 100000,
  walletConnected: false,
  walletReturn: null,
  walletCurrency: "KRW",
  ledgerFilter: "all",
  walletModal: false,
  cartModal: false,
  resultBox: false,
  reveal: [],
  revealIndex: 0,
  country: "",
  region: "",
  receiver: "",
  phone: "",
  email: "",
  postcode: "",
  address: "",
  addressDetail: "",
  city: "",
  province: "",
  cardId: "",
  cardFrom: "album",
  addressId: "",
  postcodeOpen: false,
  postcodeError: false,
  shipments: [],
  focusTrack: "all",
  shipmentId: "",
  searchOpen: false,
  menuOpen: false,
  menuGroups: { mypage: false, artist: false },
  query: "",
  catalogQuery: "",
  catalogSearch: false,
  catalogFilter: "all",
  catalogKind: "all",
  excludeSold: false,
  profile: "",
  profileFrom: "",
  pickMode: false,
  shipPick: false,
  picked: [],
  shipQty: 1,
  wished: [],
  toast: "",
  openPhase: "pack",
  openCut: "idle",
  motionArmed: false,
  owned: seedOwned(),
  // 포인트 교환(mock). TP와 교환 내역은 localStorage에 남긴다.
  tp: 0,
  exchanges: [],
  exWallet: 0,
  exTott: "",
  exTp: "",
  exDate: "",
  // 첫 진입: splash → push → marketing → consent → guide → done
  boot: "done",
  guideFrom: "home",
  guideSeen: false,
  guidePage: 0,
};

const ORDERS_KEY = "photocard-orders-v1";
const ADDRESS_KEY = "photocard-addresses-v1";
const WALLET_KEY = "photocard-wallet-v3";
// mock 초기 TP. 저장된 지갑이 없을 때만 쓴다.
const TP_SEED = 50000;
const ONBOARD_KEY = "photocard-onboard-v1";

// 최소 교환 수량. 환율은 시세 모듈(rates)에서 온다: TP는 원화 1:1이라 1 TOTT = tottKrw TP.
const EXCHANGE_MIN = 50;
const WALLETS = [
  { id: "phantom-1", short: "Fr92nqkb…8v7qy7Bu", full: "Fr92nqkbQx4tL9v2mAe7Hs8v7qy7Bu" },
  { id: "phantom-2", short: "0x5961…gb2485", full: "0x5961c3f0a8d14e7b92ab2485" },
];

function loadWallet() {
  try {
    const saved = JSON.parse(localStorage.getItem(WALLET_KEY) || "null");
    if (!saved) {
      state.tp = TP_SEED;
      return;
    }
    if (Number.isFinite(Number(saved.balance))) state.balance = Number(saved.balance);
    state.tp = Number(saved.tp) || 0;
    state.exchanges = Array.isArray(saved.exchanges) ? saved.exchanges : [];
    state.exWallet = WALLETS.some((_, index) => index === Number(saved.wallet)) ? Number(saved.wallet) : 0;
  } catch (error) {
    console.warn(error);
  }
}

function persistWallet() {
  localStorage.setItem(WALLET_KEY, JSON.stringify({
    balance: state.balance,
    tp: state.tp,
    exchanges: state.exchanges,
    wallet: state.exWallet,
  }));
}

function loadOnboard() {
  try {
    const saved = JSON.parse(localStorage.getItem(ONBOARD_KEY) || "null");
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    console.warn(error);
    return {};
  }
}

function saveOnboard(patch) {
  localStorage.setItem(ONBOARD_KEY, JSON.stringify({ ...loadOnboard(), ...patch }));
}

loadWallet();
state.boot = loadOnboard().done ? "done" : "splash";

// ---- 시세·환율 ----
// TP는 원화 1:1 고정이라 상품 가격은 시세와 무관하다. 시세는 TOTT 참고 표기와 USD 보조 표기에만 쓴다.
// API가 정해지면 관리자(배송정책 화면)의 '시세 API 주소'에 넣는다. 응답 예: { "tottKrw": 60.39, "usdKrw": 1400, "at": "2026-10-23T14:05:00Z" }
const RATES_KEY = "photocard-rates-v1";
const RATES_CONFIG_KEY = "photocard-rates-config-v1";
const RATES_INTERVAL = 5 * 60 * 1000;
const RATES_DEFAULT = { tottKrw: 1, usdKrw: 1400, at: "" };

function ratesConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(RATES_CONFIG_KEY) || "null") || {};
    return {
      api: String(saved.api || "").trim(),
      tottKrw: Number(saved.tottKrw) > 0 ? Number(saved.tottKrw) : RATES_DEFAULT.tottKrw,
      usdKrw: Number(saved.usdKrw) > 0 ? Number(saved.usdKrw) : RATES_DEFAULT.usdKrw,
    };
  } catch (error) {
    console.warn(error);
    return { api: "", ...RATES_DEFAULT };
  }
}

function rates() {
  const config = ratesConfig();
  try {
    const saved = JSON.parse(localStorage.getItem(RATES_KEY) || "null");
    if (saved && Number(saved.tottKrw) > 0 && Number(saved.usdKrw) > 0) {
      return { tottKrw: Number(saved.tottKrw), usdKrw: Number(saved.usdKrw), at: saved.at || "", fetchedAt: Number(saved.fetchedAt) || 0 };
    }
  } catch (error) {
    console.warn(error);
  }
  return { tottKrw: config.tottKrw, usdKrw: config.usdKrw, at: "", fetchedAt: 0 };
}

async function fetchRates() {
  const url = ratesConfig().api;
  if (!url) return false;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return false;
    const data = await response.json();
    const tottKrw = Number(data.tottKrw);
    const usdKrw = Number(data.usdKrw);
    if (!(tottKrw > 0) || !(usdKrw > 0)) return false;
    localStorage.setItem(RATES_KEY, JSON.stringify({ tottKrw, usdKrw, at: data.at || new Date().toISOString(), fetchedAt: Date.now() }));
    paintPrices();
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

let ratesTimer = 0;

function startRates() {
  fetchRates();
  window.clearInterval(ratesTimer);
  ratesTimer = window.setInterval(fetchRates, RATES_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (Date.now() - (rates().fetchedAt || 0) >= RATES_INTERVAL) fetchRates();
  });
}

function isKorean() {
  return (document.documentElement.lang || "ko").toLowerCase().startsWith("ko");
}

function tpNumber(amount) {
  return Math.round(Number(amount) || 0).toLocaleString("ko-KR");
}

// 보조 표기: TP는 원화 1:1, USD는 환율로 나눈다. 한국어면 ₩ 먼저, 아니면 $ 먼저.
function priceSub(tp) {
  const amount = Number(tp) || 0;
  const { usdKrw } = rates();
  const won = `₩${Math.round(amount).toLocaleString("ko-KR")}`;
  const dollar = `$${(amount / usdKrw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return isKorean() ? `≈ ${won} · ${dollar}` : `≈ ${dollar} · ${won}`;
}

function rateNote() {
  const { at, usdKrw, tottKrw } = rates();
  const when = at ? `${clockText(new Date(at)).slice(11)} 기준` : "기본값";
  return `환율 ${when} · 1 TP = ₩1 · 1 USD = ₩${Math.round(usdKrw).toLocaleString("ko-KR")} · 1 TOTT ≈ ${tpNumber(tottKrw)} TP`;
}

function paintPrices() {
  document.querySelectorAll("[data-price-sub]").forEach((node) => {
    node.textContent = priceSub(node.dataset.priceSub);
  });
  document.querySelectorAll("[data-rate-note]").forEach((node) => {
    node.textContent = rateNote();
  });
}

function orderCards(cardIds) {
  return cardIds.map((id) => {
    const card = state.owned.find((item) => item.id === id);
    return card
      ? { id: card.id, artist: card.artist, album: card.album, no: card.no, member: card.member || "" }
      : { id, artist: "", album: "", no: "", member: "" };
  });
}

function persistOrders() {
  const purchases = readOrderStore().filter((order) => order.kind === "purchase");
  const ships = state.shipments.map((order) => ({
    id: order.id,
    kind: "ship",
    status: order.status,
    place: order.place || "",
    receiver: order.receiver || "",
    phone: order.phone || "",
    address: order.address || "",
    carrier: order.carrier || "",
    carrierName: order.carrierName || "",
    tracking: order.tracking || "",
    requestedOn: order.requestedOn || "",
    feeText: order.feeText || "",
    method: order.method || "",
    shippedOn: order.shippedOn || "",
    memo: order.memo || "",
    problem: Boolean(order.problem),
    exception: order.exception || "",
    email: order.email || "",
    postcode: order.postcode || "",
    cardIds: order.cardIds,
    cards: order.cards?.length ? order.cards : orderCards(order.cardIds),
  }));
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders: [...purchases, ...ships] }));
}

function readOrderStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "null");
    return Array.isArray(saved?.orders) ? saved.orders : [];
  } catch (error) {
    return [];
  }
}

function seedPurchases(owned) {
  const groups = new Map();
  owned.forEach((card) => {
    const key = `${card.artist}|${card.album}`;
    const list = groups.get(key) || [];
    list.push(card);
    groups.set(key, list);
  });
  return [...groups.values()].map((cards, index) => {
    const item = catalog().find((pack) => pack.artist === cards[0].artist && pack.album === cards[0].album);
    return {
      id: `PU_${index + 1}`,
      kind: "purchase",
      status: "paid",
      purchasedOn: cards.find((card) => card.purchasedOn)?.purchasedOn || isoDate(),
      productId: item?.id || "",
      productName: item ? productName(item) : `${cards[0].album} Photocard`,
      artist: cards[0].artist,
      album: cards[0].album,
      count: cards.length,
      price: item ? item.price * cards.length : null,
      cards: cards.map((card) => ({
        id: card.id,
        artist: card.artist,
        album: card.album,
        no: card.no,
        member: card.member || "",
      })),
    };
  });
}

function persistPurchase(record) {
  const orders = readOrderStore().filter((order) => order.id !== record.id);
  orders.unshift(record);
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders }));
}

function loadOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "null");
    if (Array.isArray(saved?.orders) && saved.orders.length) return saved.orders;
  } catch (error) {
    console.warn(error);
  }
  return null;
}

function applyStoredOrders(orders) {
  state.shipments = orders.map((order) => {
    const filled = { ...order, kind: "ship" };
    if (!filled.requestedOn) filled.requestedOn = isoDate(3);
    return filled;
  });
  orders.forEach((order) => {
    order.cardIds.forEach((id) => {
      const card = state.owned.find((item) => item.id === id);
      if (card && TRACK.includes(order.status)) card.status = order.status;
    });
  });
}

function shipStub(order) {
  return !order.receiver && !order.requestedOn && !order.tracking;
}

const storedOrders = loadOrders();
if (storedOrders) {
  const ships = storedOrders.filter((order) => order.kind !== "purchase");
  if (ships.length && ships.every(shipStub)) {
    state.shipments = seedShipments(state.owned);
    persistOrders();
  } else applyStoredOrders(ships);
} else {
  state.shipments = seedShipments(state.owned);
  persistOrders();
}

function ensurePurchases() {
  const orders = readOrderStore();
  if (orders.some((order) => order.kind === "purchase")) return;
  const purchases = seedPurchases(state.owned);
  const ships = orders.filter((order) => order.kind !== "purchase");
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders: [...purchases, ...ships] }));
}

const app = document.querySelector("#app");

const ARTIST_NAMES = {
  lesserafim: "LE SSERAFIM",
  ive: "IVE",
  blackpink: "BLACKPINK",
  bts: "방탄소년단",
  rose: "로제",
  jungkook: "전정국",
  holding: "미분류",
};

const FACTS = {
  unit: "1장",
  size: "55 × 85 mm",
  type: "Official MD",
  state: "미사용 공식 MD",
  keep: "가능",
  ship: "국내·해외 실물 배송 가능",
};

// 배송은 Ver.02라 '배송 가능' 혜택은 뺀다.
const PERKS = ["실물 카드", "보관 가능"];

const GUIDES = {
  random: [
    "상품마다 구성된 포토카드 중 1장이 랜덤으로 제공돼요.",
    "동일한 카드가 다시 나올 수 있어요.",
  ],
  photocard: [
    "뽑은 포토카드는 보유카드에서 확인이 가능해요.",
    "배송 기능은 추후 업데이트 될 예정이에요.(국내, 해외)",
    "공식 상품의 제작 및 포장 과정에서 미세한 스크래치, 인쇄점, 재단차이가 있을 수 있어요.",
    "상품은 구매 후 교환 또는 환불이 불가능합니다.",
  ],
};

const SHEET_NOTES = [
  "뽑은 카드는 보유 카드에 보관됩니다.",
  "동일 카드가 중복으로 뽑힐 수 있습니다.",
];

function registerStore() {
  try {
    return JSON.parse(localStorage.getItem("photocard-register-v5") || "null");
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function linesOf(value, fallback) {
  const custom = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return custom.length ? custom : fallback;
}

function factValue(item, key) {
  const value = String(item?.facts?.[key] || "").trim();
  return value || FACTS[key];
}

function perkLabels(item) {
  const custom = (item?.perks || []).slice(0, PERKS.length).map((line) => String(line || "").trim());
  if (!custom.some(Boolean)) return PERKS;
  return PERKS.map((label, index) => custom[index] || label);
}

function summaryLine(item) {
  return String(item?.summary || "").trim() || "공식 실물 포토카드 랜덤팩";
}

// 관리자 값은 앞의 두 칸만 쓴다. 세 번째 칸(옛 배송 문구)은 더 이상 쓰지 않는다.
function sheetNotes(item) {
  const notes = (item?.sheetNotes || []).slice(0, SHEET_NOTES.length);
  return SHEET_NOTES.map((line, index) => String(notes[index] || "").trim() || line);
}

function packToProduct(pack) {
  return {
    id: pack.id,
    artist: shownArtist(pack, ARTIST_NAMES[pack.artistId]),
    artistId: pack.artistId,
    album: pack.album || "",
    eventType: pack.eventType || "",
    eventName: pack.eventName || "",
    eventNameKo: pack.eventNameKo || "",
    eventNameEn: pack.eventNameEn || "",
    cover: pack.cover || "",
    price: Number(pack.price) || 0,
    home: Boolean(pack.home),
    cards: (pack.cards || []).map((card) => ({
      no: card.no,
      front: card.front || "",
      back: card.back || "",
      member: card.member || "",
      rarity: card.rarity || "NORMAL",
      stock: card.stock,
    })),
    displayName: pack.displayName || "",
    summary: pack.summary || "",
    perks: pack.perks || null,
    facts: pack.facts || null,
    guides: pack.guides || null,
    sheetNotes: pack.sheetNotes || null,
  };
}

function applyPack(item) {
  const pack = registerPack(item.id);
  if (!pack) return item;
  const cards = pack.cards?.length
    ? pack.cards.map((card) => ({
      no: card.no,
      front: card.front || "",
      back: card.back || "",
      member: card.member || "",
      rarity: card.rarity || "NORMAL",
      stock: card.stock,
    }))
    : item.cards;
  return {
    ...item,
    artistId: pack.artistId || item.artistId,
    artist: shownArtist(pack, item.artist),
    album: pack.album != null ? pack.album : item.album,
    eventName: pack.eventName != null ? pack.eventName : item.eventName,
    eventNameKo: pack.eventNameKo != null ? pack.eventNameKo : (item.eventNameKo || ""),
    eventNameEn: pack.eventNameEn != null ? pack.eventNameEn : (item.eventNameEn || ""),
    eventType: pack.eventType || item.eventType,
    cover: pack.cover || item.cover,
    price: pack.price != null ? Number(pack.price) : item.price,
    cards,
    displayName: pack.displayName || "",
    summary: pack.summary || "",
    perks: pack.perks || null,
    facts: pack.facts || null,
    guides: pack.guides || null,
    sheetNotes: pack.sheetNotes || null,
  };
}

function catalog() {
  const saved = registerStore();
  const packs = (saved?.packs || []).filter((pack) => !pack.deletedAt);
  const removed = new Set((saved?.packs || []).filter((pack) => pack.deletedAt).map((pack) => pack.id));
  const known = new Set(PRODUCTS.map((item) => item.id));
  const merged = PRODUCTS.map(applyPack).filter((item) => !removed.has(item.id));
  packs.forEach((pack) => {
    if (known.has(pack.id) || !pack.home) return;
    merged.push(packToProduct(pack));
  });
  return merged;
}

function product(id) {
  return catalog().find((item) => item.id === id) || null;
}

function productName(item) {
  if (item?.displayName) return item.displayName;
  const eventName = eventTitle(item);
  const which = eventName ? `${albumTitle(item)} ${eventName}` : albumTitle(item);
  return `${which} Photocard`;
}

function lineup(count) {
  return `${count}종 중 랜덤 1장`;
}

// 포토카드 결제 단위는 TP다. TOTT는 토마톡 지갑에서 TP로 바꿔 쓴다.
function tott(amount) {
  return `${tpNumber(amount)}<span class="tott">TP</span>`;
}

// TP 금액 + 원화·USD 보조 표기. 시세가 갱신되면 paintPrices()가 보조 줄만 바꾼다.
function priceBlock(amount) {
  return `<span class="price"><span class="price-main">${tott(amount)}</span><small class="price-sub" data-price-sub="${Number(amount) || 0}">${priceSub(amount)}</small></span>`;
}

function setTitle(item) {
  if (item?.displayName) return item.displayName;
  const eventName = eventTitle(item);
  const which = eventName ? `${albumTitle(item)} ${eventName}` : albumTitle(item);
  return `${which} Random Photocard`;
}

function photo(file) {
  if (!file) return "";
  if (file.startsWith("data:") || file.startsWith("/") || file.startsWith("http") || file.startsWith("blob:")) return file;
  return `../assets/photocards/${file}`;
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function gradeClass(rarity) {
  if (rarity === "RARE") return "grade rare";
  if (rarity === "SPECIAL") return "grade special";
  return "grade";
}

const FALLBACK_BANNERS = [
  { packId: "blackpink-jump", image: "../assets/covers/jump.jpg" },
  { packId: "lesserafim-crazy", image: "../assets/covers/crazy.jpg" },
  { packId: "ive-empathy-makestar", image: "../assets/covers/ive-empathy.jpg" },
];

function bannerLines(packId, line1, line2) {
  const item = product(packId);
  const fallback1 = item ? productName(item) : "";
  const fallback2 = item ? lineup(item.cards.length) : "";
  return {
    line1: String(line1 || "").trim() || fallback1,
    line2: String(line2 || "").trim() || fallback2,
  };
}

function liveBanners(place) {
  const saved = registerStore();
  if (!saved?.banners) return null;
  return saved.banners
    .filter((banner) => banner.on && banner.image && (banner.place || "top") === place)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

function eventBanners() {
  const live = liveBanners("top");
  if (live?.length) {
    return live.map((banner) => {
      const lines = bannerLines(banner.packId, banner.line1, banner.line2);
      return { packId: banner.packId, image: banner.image, ...lines };
    });
  }
  return FALLBACK_BANNERS.map((banner) => ({ ...banner, ...bannerLines(banner.packId) }));
}

let bannerTimer = 0;
let bannerDrag = 0;
let midTimer = 0;
let midDrag = 0;

function unshipped(status) {
  return status === "stored" || status === "shipping_cart";
}

function registerPack(id) {
  return (registerStore()?.packs || []).find((entry) => entry.id === id) || null;
}

function listed(item) {
  const pack = registerPack(item.id);
  if (pack?.deletedAt) return false;
  if (!pack) return Boolean(item.home);
  return Boolean(pack.home);
}

function saleOf(item) {
  if (!item) return "on";
  const pack = registerPack(item.id);
  if (pack) {
    if (pack.status === "on") return "on";
    if (pack.status === "soon") return "soon";
    if (pack.status === "stop") return "stop";
    if (pack.status === "out") return "out";
    if (pack.status === "draft") return "draft";
    if (pack.home) return "out";
  }
  if (item.sale === "soon") return "soon";
  return item.sale === "out" ? "out" : "on";
}

function cardStock(card) {
  if (card.stock === "" || card.stock == null) return 0;
  const value = Number(card.stock);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function packStock(item) {
  if (!item) return 0;
  const pack = registerPack(item.id);
  const cards = pack?.cards?.length ? pack.cards : item.cards;
  return cards.reduce((sum, card) => sum + cardStock(card), 0);
}

// 재고를 하나도 정하지 않은 상품은 재고 제한 없이 연속 뽑기가 가능하다.
function canDrawFive(item) {
  if (!item) return false;
  const pack = registerPack(item.id);
  const cards = pack?.cards?.length ? pack.cards : item.cards;
  const tracked = cards.some((card) => card.stock !== "" && card.stock != null);
  return !tracked || packStock(item) >= 5;
}

function saleWord(item) {
  const sale = saleOf(item);
  if (sale === "out") return "품절";
  if (sale === "soon") return "입고예정";
  if (sale === "stop") return "판매중지";
  if (sale === "draft") return "등록중";
  return "";
}

const ARTIST_META = {
  blackpink: { kind: "group", aliases: ["블랙핑크"] },
  lesserafim: { kind: "group", aliases: ["르세라핌"] },
  ive: { kind: "group", aliases: ["아이브"] },
  rose: { kind: "solo", aliases: ["로지", "rose", "rosé"], group: "BLACKPINK", groupAliases: ["블랙핑크"] },
};

const MEMBER_ALIASES = {
  로제: ["로지", "rose", "rosé"],
};

function artistKindOf(item) {
  const pack = registerPack(item.id);
  if (pack?.kind === "solo" || pack?.kind === "group") return pack.kind;
  return ARTIST_META[item.artistId]?.kind || "group";
}

function eventKindOf(item) {
  const pack = registerPack(item.id);
  const type = pack?.eventType || item.eventType;
  if (type === "album") return "album";
  if (type) return "event";
  return item.eventName ? "event" : "album";
}

function productHaystack(item) {
  const meta = ARTIST_META[item.artistId] || {};
  const members = item.cards.map((card) => card.member).filter(Boolean);
  const memberAliases = members.flatMap((member) => MEMBER_ALIASES[member] || []);
  const names = artistNames(item.artistId);
  const albums = categoryOf(item.artistId)?.albums || [];
  const album = albums.find((entry) => entry && entry.name === item.album);
  return [
    item.artist,
    names.ko,
    names.en,
    ...aliasTokens(names.aliases),
    item.album,
    album?.nameKo,
    album?.nameEn,
    item.eventName,
    item.eventNameKo,
    item.eventNameEn,
    eventTitle(item),
    albumTitle(item),
    productName(item),
    meta.group,
    ...(meta.aliases || []),
    ...(meta.groupAliases || []),
    ...members,
    ...memberAliases,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function searchIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>`;
}

function catalogChips(current, options) {
  return `<div class="artist-tabs">${options
    .map(([id, label]) => `<button type="button" data-catalog="${id}" class="${id === current ? "on" : ""}">${label}</button>`)
    .join("")}</div>`;
}

function catalogGrid(items) {
  if (!items.length) return `<p class="empty catalog-empty">찾는 상품이 없어요.</p>`;
  return `<div class="album-block"><div class="album-grid">${items.map(productTile).join("")}</div></div>`;
}

function resetCatalog() {
  state.catalogQuery = "";
  state.catalogSearch = false;
  state.catalogFilter = "all";
  state.catalogKind = "all";
  state.excludeSold = false;
}

function artistEmblems() {
  try {
    const saved = JSON.parse(localStorage.getItem("photocard-register-v5") || "null");
    return saved?.artistEmblems || {};
  } catch (error) {
    console.warn(error);
    return {};
  }
}

function categoryOf(artistId) {
  return (registerStore()?.categories || []).find((item) => item.id === artistId);
}

const PROFILE_PHOTOS = {
  blackpink: "../assets/profiles/blackpink.png",
  ive: "../assets/profiles/ive.jpg",
  bts: "../assets/profiles/bts.jpg",
  rose: "../assets/profiles/rose.jpg",
  lesserafim: "../assets/profiles/lesserafim.png",
};

function profileImage(artistId, options = {}) {
  const category = categoryOf(artistId);
  if (category?.profileImage) return category.profileImage;
  const emblem = artistEmblems()[artistId];
  if (emblem) return emblem;
  if (PROFILE_PHOTOS[artistId]) return PROFILE_PHOTOS[artistId];
  if (options.cover === false) return "";
  const pack = catalog().find((item) => item.artistId === artistId && item.cover);
  return pack?.cover || "";
}

const ARTIST_I18N = {
  blackpink: { ko: "블랙핑크", en: "BLACKPINK", aliases: "블랙핑크" },
  lesserafim: { ko: "르세라핌", en: "LE SSERAFIM", aliases: "르세라핌" },
  ive: { ko: "아이브", en: "IVE", aliases: "아이브" },
  rose: { ko: "로제", en: "ROSÉ", aliases: "로제, rose, rosé, blackpink rose, 로지" },
  bts: { ko: "방탄소년단", en: "BTS", aliases: "방탄, BTS" },
  jungkook: { ko: "전정국", en: "Jung Kook", aliases: "정국" },
};

function localizedName(ko, en, fallback) {
  const korean = (document.documentElement.lang || "ko").toLowerCase().startsWith("ko");
  const first = korean ? ko : en;
  const second = korean ? en : ko;
  return String(first || second || fallback || "").trim();
}

function aliasTokens(value) {
  return String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

function artistNames(artistId) {
  const category = categoryOf(artistId);
  const seed = ARTIST_I18N[artistId] || {};
  return {
    ko: category && "nameKo" in category ? category.nameKo : (seed.ko || ""),
    en: category && "nameEn" in category ? category.nameEn : (seed.en || ""),
    aliases: category && "aliases" in category ? category.aliases : (seed.aliases || ""),
  };
}

function albumTitle(item) {
  const albums = categoryOf(item?.artistId)?.albums || [];
  const album = albums.find((entry) => entry && (entry.name === item.album || entry.nameEn === item.album || entry.nameKo === item.album));
  if (!album || typeof album !== "object") return item?.album || "";
  return localizedName(album.nameKo, album.nameEn, item.album);
}

function eventTitle(item) {
  return localizedName(item?.eventNameKo, item?.eventNameEn, item?.eventName);
}

function shownArtist(pack, fallback) {
  const names = artistNames(pack?.artistId);
  const named = localizedName(names.ko, names.en, "");
  if (named) return named;
  const category = categoryOf(pack?.artistId);
  return String(category?.profileName || category?.name || pack?.artistName || fallback || "").trim() || fallback || "미분류";
}

function artistImage(item) {
  return profileImage(item?.artistId);
}

function artistMark(item, options = {}) {
  const name = esc(item?.artist || "");
  const src = artistImage(item);
  const image = src ? `<img src="${src}" alt="" />` : "";
  const face = options.link && item?.artistId
    ? `<button type="button" data-profile="${esc(item.artistId)}" aria-label="${name} 상품">${image}</button>`
    : image;
  return `<span class="artist-mark">${face}<span>${name}</span></span>`;
}

function artistProfiles() {
  const seen = new Set();
  const profiles = [];
  catalog().filter((item) => listed(item)).forEach((item) => {
    if (!item.artistId || seen.has(item.artistId)) return;
    seen.add(item.artistId);
    profiles.push({
      id: item.artistId,
      name: item.artist,
      image: profileImage(item.artistId),
    });
  });
  return profiles;
}

function randomCardOverlay() {
  return `<span class="random-card" aria-hidden="true"><b>?</b><small>TOMATOK</small></span>`;
}

function productThumbnail(cover, badge) {
  return `
    <span class="tile-shot">
      <img class="album-cover" src="${cover}" alt="" />
      ${randomCardOverlay()}
      ${badge}
    </span>`;
}

function saleMark(item) {
  const sale = saleOf(item);
  const word = saleWord(item);
  if (!word) return "";
  return `<span class="sale-mark ${sale}">${esc(word)}</span>`;
}

function productTile(item) {
  const word = saleWord(item);
  return `
    <button class="tile${word ? " sold" : ""}" data-open="${item.id}">
      ${productThumbnail(item.cover, saleMark(item))}
      <span class="tile-who">${artistMark(item)}</span>
      <span class="tile-name">${esc(setTitle(item))}</span>
      <span class="tile-line">${esc(lineup(item.cards.length))}</span>
      <span class="tile-price">${priceBlock(item.price)}</span>
    </button>`;
}

function artistsPage() {
  const rows = artistProfiles().map((profile) => {
    const src = profileImage(profile.id, { cover: false });
    const face = src ? `<img src="${src}" alt="" />` : `<i class="artist-fallback" aria-hidden="true"></i>`;
    return `
      <button type="button" class="artist-row" data-profile="${esc(profile.id)}">
        ${face}
        <span>${esc(profile.name)}</span>
      </button>`;
  }).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>전체 아티스트</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <div class="artist-list">${rows || `<p class="empty">등록된 아티스트가 없어요.</p>`}</div>
    </div>
  `;
}

function artistFilterBar() {
  const on = state.excludeSold;
  return `
    <div class="catalog-tools">
      ${catalogChips(state.catalogFilter, [["all", "전체"], ["album", "앨범"], ["event", "특전/이벤트"]])}
      <button type="button" class="sold-toggle${on ? " on" : ""}" data-exclude-sold aria-pressed="${on ? "true" : "false"}">
        <span>품절제외</span>
        <i aria-hidden="true"></i>
      </button>
    </div>`;
}

function artistPage() {
  const profile = artistProfiles().find((item) => item.id === state.profile);
  if (!profile) return home();
  const query = state.catalogQuery.trim().toLowerCase();
  const mine = catalog().filter((item) => listed(item) && item.artistId === profile.id);
  const items = mine
    .filter((item) => state.catalogFilter === "all" || eventKindOf(item) === state.catalogFilter)
    .filter((item) => !state.excludeSold || saleOf(item) !== "out")
    .filter((item) => !query || productHaystack(item).includes(query));
  const search = state.catalogSearch
    ? `<label class="catalog-search">
        <input data-field="catalogQuery" value="${esc(state.catalogQuery)}" placeholder="앨범, 이벤트" />
        <button type="button" data-catalog-search-close>취소</button>
      </label>`
    : "";
  return `
    <header class="bar">
      <button data-back="${state.profileFrom === "artists" ? "artists" : "home"}" aria-label="뒤로">←</button>
      <h1>${esc(profile.name)}</h1>
      <button type="button" class="icon-btn" data-catalog-search aria-label="검색">${searchIcon()}</button>
    </header>
    <div class="scroll">
      ${search}
      <div class="catalog-head">
        <img src="${profile.image}" alt="" />
        <div>
          <strong>${esc(profile.name)}</strong>
          <span>총 ${mine.length}개 상품</span>
        </div>
      </div>
      ${artistFilterBar()}
      ${items.length ? catalogGrid(items) : `<p class="empty catalog-empty">${query ? "찾는 상품이 없어요." : "이 분류의 상품이 없어요."}</p>`}
    </div>
  `;
}

function home() {
  const query = state.query.trim().toLowerCase();
  const banners = eventBanners();
  const slide = (banner) => `
      <button class="banner-slide" data-open="${banner.packId}">
        <img src="${banner.image}" alt="" />
        <span class="banner-copy">
          <strong>${esc(banner.line1)}</strong>
          <span>${esc(banner.line2)}</span>
        </span>
      </button>`;
  const slides = banners.map(slide).join("");
  const loop = banners.length > 1;
  const trackSlides = loop ? `${slide(banners.at(-1))}${slides}${slide(banners[0])}` : slides;
  const dots = banners.map(
    (_, index) => `<button type="button" data-dot="${index}" class="${index === state.bannerIndex ? "on" : ""}" aria-label="이벤트 ${index + 1}"></button>`,
  ).join("");
  const cards = catalog().filter((item) => listed(item) && (!query || productHaystack(item).includes(query)))
    .map(productTile)
    .join("");
  const list = cards
    ? `<div class="shelf">${cards}</div>`
    : `<p class="empty">찾는 상품이 없어요.</p>`;
  const header = state.searchOpen
    ? `
    <header class="bar">
      <input class="search-input" data-field="query" value="${esc(state.query)}" placeholder="가수, 앨범, 이벤트" />
      <button type="button" data-search-close>취소</button>
    </header>`
    : `
    <header class="bar">
      <h1>포토카드</h1>
      <span class="bar-tools">${searchButton()}${menuButton()}</span>
    </header>`;
  const profiles = artistProfiles().map((profile) => `
    <button type="button" class="profile" data-profile="${esc(profile.id)}">
      <img src="${profile.image}" alt="" />
      <span>${esc(profile.name)}</span>
    </button>`).join("");
  const allArtists = `
    <button type="button" class="profile" data-profile="all">
      <i class="profile-all" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg></i>
      <span>전체</span>
    </button>`;
  const rail = state.searchOpen ? "" : `<div class="profiles">${profiles}${allArtists}</div>`;
  const banner = state.searchOpen
    ? ""
    : `
      <div class="banner-wrap">
        <div class="banner-viewport${loop ? "" : " is-single"}">
          <div class="banner-track" style="transform:${bannerTransform(loop ? state.bannerIndex + 1 : 0)}">${trackSlides}</div>
        </div>
        <div class="banner-dots">${dots}</div>
      </div>`;
  // 슬라이드 7 순서: 프로필 레일, 배너, NEW, 이용 방법 안내 배너. 관리자 중간 배너는 그 아래에 둔다.
  const below = state.searchOpen ? "" : `${guideBanner()}${midBanner()}`;

  return `
    ${header}
    <div class="scroll">
      ${rail}
      ${banner}
      <div class="shelf-wrap">${state.searchOpen ? "" : `<h2>NEW</h2>`}${list}</div>
      ${below}
    </div>
  `;
}

function guideBanner() {
  return `
    <section class="guide-banner-wrap">
      <button type="button" class="guide-banner" data-nav="guide">
        <img src="pack_closed.png" alt="" />
        <span class="guide-banner-copy">
          <small>이용 방법 안내</small>
          <strong>포토카드, 이렇게 뽑아요</strong>
          <span>상품 선택부터 개봉, 보유 카드까지 한눈에</span>
        </span>
        <i class="guide-banner-arrow" aria-hidden="true">›</i>
      </button>
    </section>`;
}

function groupCards(list) {
  const groups = new Map();
  list.forEach((card) => {
    const key = [card.artist, card.album, card.no, card.status, card.rarity].join("|");
    const found = groups.get(key);
    if (found) found.count += 1;
    else groups.set(key, { ...card, count: 1 });
  });
  return [...groups.values()];
}

function sameDesign(left, right) {
  return left.artist === right.artist && left.album === right.album && left.no === right.no && left.rarity === right.rarity;
}

function storedCopies(card) {
  return state.owned.filter((item) => item.status === "stored" && sameDesign(item, card));
}

function cardShot(card) {
  return `<img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />`;
}

function sameText(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function artistIdForName(name) {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return "";
  const ids = new Set([
    ...Object.keys(ARTIST_I18N),
    ...Object.keys(ARTIST_NAMES),
    ...catalog().map((item) => item.artistId).filter(Boolean),
  ]);
  for (const id of ids) {
    const names = artistNames(id);
    const aliases = [names.ko, names.en, ...aliasTokens(names.aliases), ARTIST_NAMES[id], id];
    if (aliases.some((item) => sameText(item, target))) return id;
  }
  return "";
}

function productForCard(card) {
  const list = catalog();
  const named = list.find((product) => sameText(product.artist, card.artist) && sameText(product.album, card.album))
    || list.find((product) => sameText(product.artist, card.artist));
  if (named) return named;
  const artistId = artistIdForName(card.artist);
  if (!artistId) return null;
  const mine = list.filter((product) => product.artistId === artistId);
  const albumHit = mine.find((product) => sameText(product.album, card.album))
    || mine.find((product) => {
      const albums = categoryOf(artistId)?.albums || [];
      return albums.some((entry) => [entry?.name, entry?.nameKo, entry?.nameEn].some((label) => sameText(label, card.album)));
    });
  return albumHit || mine[0] || { artist: card.artist, artistId };
}

function cardMark(card) {
  const item = productForCard(card);
  if (!item) return `<span class="artist-mark"><span>${esc(card.artist)}</span></span>`;
  return artistMark(item);
}

function statusBadge(status) {
  if (status === "shipping_cart") return "";
  const label = status === "stored" ? "배송바구니에 담을 수 있어요" : (BADGE[status] || STATUS[status] || "");
  const glyph = statusGlyph(status);
  if (!glyph) return `<span class="status-badge ${esc(status)}">${esc(label)}</span>`;
  return `<span class="status-badge icon ${esc(status)}" role="img" aria-label="${esc(label)}">${glyph}</span>`;
}

function sourceEvent(card) {
  const events = [...new Set(catalog()
    .filter((item) => item.artist === card.artist && item.album === card.album)
    .map((item) => item.eventName)
    .filter(Boolean))];
  return events.length === 1 ? events[0] : "";
}

function cardSourceLine(card) {
  const event = sourceEvent(card);
  const extra = event ? ` · ${esc(event)}` : (card.no ? ` · <small>${esc(card.no)}</small>` : "");
  return `<p class="card-source">${esc(card.album || "")}${extra}</p>`;
}

// 배송 상태 표시(statusBadge)는 Ver.02라 보유 카드 격자에서 뺀다.
function cardFigure(card) {
  const qty = Number(card.count) > 0 ? `<span class="qty-badge">${card.count}장</span>` : "";
  return `
    <figure data-card="${esc(card.id)}">
      <div class="shot">
        ${cardShot(card)}
        ${qty}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

function pickFigure(card, forShip = false) {
  const selectable = card.status === "stored";
  const on = selectable && state.picked.includes(card.id);
  const mark = selectable ? `<span class="pick-mark">${on ? "✓" : ""}</span>` : statusBadge(card.status);
  const shipBadge = forShip && selectable ? `<span class="box-badge add">${on ? "선택됨" : "담을 수 있음"}</span>` : "";
  return `
    <figure class="pick-card${on ? " on" : ""}${selectable ? "" : " locked"}${forShip ? " ship-pick" : ""}" ${selectable ? `data-pick-card="${esc(card.id)}"` : ""}>
      <div class="shot">
        ${cardShot(card)}
        ${mark}
        ${shipBadge}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

function boxedFigure(card) {
  const qty = Number(card.count) > 0 ? `<span class="qty-badge">${card.count}장</span>` : "";
  return `
    <figure class="box-card" data-card="${esc(card.id)}">
      <div class="shot">
        ${cardShot(card)}
        <span class="box-badge in">담김</span>
        ${qty}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

// 보유 카드(슬라이드 22·23). 배송 상태 드롭다운과 배송바구니 링크는 Ver.02라 숨긴다.
function album() {
  const source = state.owned;
  const artists = [...new Set(source.map((card) => card.artist))];
  const selected = artists.includes(state.albumArtist) ? state.albumArtist : "all";
  const shown = selected === "all" ? source : source.filter((card) => card.artist === selected);
  const cards = groupCards(shown.map((card) => ({ ...card, status: "stored" })));
  const chips = ["all", ...artists]
    .map((artist) => {
      const label = artist === "all" ? "전체" : artist;
      const on = artist === selected ? "on" : "";
      return `<button class="${on}" data-artist="${esc(artist)}">${esc(label)}</button>`;
    })
    .join("");
  const figures = cards.map(cardFigure);
  const body = figures.length
    ? `<div class="owned gallery">${figures.join("")}</div>`
    : `<p class="empty album-empty">보유 카드가 없습니다.<br>포토카드를 구매해보세요.</p>`;
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>보유 카드</h1>
      ${menuButton()}
    </header>
    <div class="album-filters">
      <div class="artist-tabs snap">${chips}</div>
    </div>
    <div class="scroll">${body}</div>
  `;
}

const SHIP_BADGE = {
  shipping_requested: "배송 요청",
  preparing: "준비중",
  shipped: "배송 중",
  delivered: "수령 완료",
};

const STEP_LABEL = {
  shipping_requested: "요청 완료",
  preparing: "출고 완료",
  shipped: "배송 중",
  delivered: "수령 완료",
};

function orderFacts(order) {
  return `
    <div class="ship-facts">
      <div><span>배송 요청일</span><strong>${esc(formatDate(order.requestedOn) || "—")}</strong></div>
      <div><span>포토카드 수</span><strong>${shipmentCards(order).length}장</strong></div>
      <div><span>배송비</span><strong>${esc(order.feeText || "미정")}</strong></div>
    </div>`;
}

function shipmentCards(order) {
  return order.cardIds
    .map((id) => state.owned.find((card) => card.id === id))
    .filter(Boolean);
}

function stepList(order) {
  const current = TRACK.indexOf(order.status);
  return TRACK.map((status, index) => {
    const cls = index === current ? "current" : index < current ? "on" : "";
    const raw = status === "shipping_requested" ? order.requestedOn : status === "shipped" ? order.shippedOn : "";
    const when = raw ? formatDate(raw) : index === current ? "현재" : "";
    return `<li class="${cls}"><b>${STEP_LABEL[status]}</b>${when ? `<small>${esc(when)}</small>` : ""}</li>`;
  }).join("");
}

function tracking() {
  const selected = TRACK.includes(state.focusTrack) ? state.focusTrack : "all";
  const filters = [
    ["all", "전체"],
    ["shipping_requested", "배송 요청"],
    ["preparing", "준비중"],
    ["shipped", "배송중"],
    ["delivered", "완료"],
  ];
  const chips = filters
    .map(([id, label]) => `<button class="${id === selected ? "on" : ""}" data-track-status="${id}">${label}</button>`)
    .join("");
  const orders = state.shipments.filter((order) => selected === "all" || order.status === selected);
  const body = orders.length
    ? orders.map((order) => {
        const cards = shipmentCards(order);
        const preview = cards.slice(0, 4);
        const extra = cards.length - preview.length;
        const thumbs = preview
          .map((card) => `<img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id)}" alt="" draggable="false" />`)
          .join("");
        const more = extra > 0 ? `<span class="ship-more">+${extra}</span>` : "";
        const moving = order.status === "shipped" && (order.carrier || order.tracking);
        const parcel = moving
          ? `<p class="meta">${esc([order.carrier, order.tracking].filter(Boolean).join(" · "))}</p>`
          : "";
        const lookup = moving && order.tracking
          ? `<button type="button" class="shipment-more" data-track-copy="${esc(order.tracking)}">배송조회</button>`
          : "";
        return `
          <article class="shipment">
            <p class="ship-when">${esc(formatDate(order.requestedOn) || "—")}</p>
            <header>
              <strong>배송 주문 ${esc(order.id)}</strong>
              <span>${esc(SHIP_BADGE[order.status] || STATUS[order.status])}</span>
            </header>
            <p class="meta">포토카드 ${cards.length}장</p>
            <div class="shipment-cards">${thumbs}${more}</div>
            ${parcel}
            <div class="ship-actions${lookup ? "" : " is-single"}">
              ${lookup}
              <button type="button" class="shipment-more" data-shipment="${esc(order.id)}">상세보기</button>
            </div>
          </article>`;
      }).join("")
    : `<p class="empty">이 단계 배송이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="mypage" aria-label="마이페이지">←</button>
      <h1>배송내역</h1>
      ${menuButton()}
    </header>
    <div class="artist-tabs">${chips}</div>
    <div class="scroll">${body}</div>
  `;
}

function shipmentDetail() {
  const order = state.shipments.find((item) => item.id === state.shipmentId);
  if (!order) return tracking();
  const cards = shipmentCards(order);
  const rows = cards
    .map((card) => {
      const member = card.member ? ` · ${esc(card.member)}` : "";
      return `
        <button class="ship-line" data-card="${esc(card.id)}">
          <img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id)}" alt="" draggable="false" />
          <span>
            <strong>${esc(card.album)} ${esc(card.no)}</strong>
            <em>${esc(card.artist)}${member}${card.purchasedOn ? ` · 뽑은 날 ${esc(formatDate(card.purchasedOn))}` : ""}</em>
          </span>
        </button>`;
    })
    .join("");
  const address = [order.receiver, order.phone, order.address, order.place].filter(Boolean);
  const moving = order.status === "shipped" && (order.carrier || order.tracking);
  const lookup = moving && order.tracking
    ? `<button type="button" class="shipment-more" data-track-copy="${esc(order.tracking)}">배송조회</button>`
    : "";
  return `
    <div class="detail-top">
      <button data-back="track-list" aria-label="뒤로">←</button>
      <strong>${esc(order.id)}</strong>
      ${menuButton()}
    </div>
    <div class="scroll">
      <section class="shipment open">
        <p class="lead">${esc(SHIP_BADGE[order.status] || STATUS[order.status])}</p>
        ${moving ? `<p>${esc(order.carrier || "")}</p><p>${esc(order.tracking || "")}</p>${lookup}` : ""}
        <section class="ship-block">
          <h3>배송 진행</h3>
          <ol class="steps">${stepList(order)}</ol>
        </section>
        <section class="ship-block">
          <h3>배송 정보</h3>
          ${orderFacts(order)}
        </section>
        <section class="ship-block">
          <h3>배송지</h3>
          ${address.map((line) => `<p>${esc(line)}</p>`).join("")}
        </section>
        <section class="ship-block">
          <h3>담긴 카드</h3>
          <div class="ship-lines">${rows}</div>
        </section>
      </section>
    </div>
  `;
}

function ownedCard() {
  return state.owned.find((card) => card.id === state.cardId);
}

function ownedBackSrc(card) {
  const pack = catalog().find((item) => item.artist === card.artist && item.album === card.album);
  const found = pack?.cards.find((entry) => entry.no === card.no && entry.back);
  return found ? photo(found.back) : "";
}

function otherCards(card) {
  const pool = state.owned.map((item) => ({ ...item, status: "stored" }));
  const figures = groupCards(pool.filter((item) => item.id !== card.id)).map(cardFigure).join("");
  if (!figures) return "";
  return `
    <section class="other-cards">
      <h3>다른 카드</h3>
      <div class="owned gallery">${figures}</div>
    </section>`;
}

function ownedDetail() {
  const card = ownedCard();
  if (!card) return album();
  const pack = catalog().find((item) => item.artist === card.artist && item.album === card.album);
  // 배송바구니 담기·배송받기는 Ver.02라 카드 상세에서 뺀다.
  const copies = state.owned.filter((item) => sameDesign(item, card));
  const action = "";
  const member = card.member ? `<tr><th>멤버</th><td>${esc(card.member)}</td></tr>` : "";
  const back = ownedBackSrc(card);
  const backFace = back
    ? `<figure><img class="guard" src="${back}" alt="뒷면" draggable="false" /><figcaption>뒷면</figcaption></figure>`
    : "";
  return `
    <header class="bar">
      <button data-back="${state.cardFrom}" aria-label="뒤로">←</button>
      <h1>보유 카드</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <div class="owned-detail">
        <div class="owned-faces${back ? "" : " is-single"}">
          <figure>
            <img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id)}" alt="앞면" draggable="false" />
            <figcaption>앞면</figcaption>
          </figure>
          ${backFace}
        </div>
        ${cardMark(card)}
        <h2>${esc(card.album)} ${esc(card.no)}</h2>
        <div class="facts-box">
          <table class="facts">
            <tr><th>상품</th><td>${pack ? esc(productName(pack)) : esc(card.album)}</td></tr>
            ${member}
            <tr><th>번호</th><td>${esc(card.no)}</td></tr>
            <tr><th>등급</th><td>${esc(card.rarity)}</td></tr>
            <tr><th>보유 수량</th><td>${copies.length}장</td></tr>
            <tr><th>보유 번호</th><td>${esc(card.id)}</td></tr>
          </table>
        </div>
        <section class="card-origin">
          <h3>출처</h3>
          <div class="source-row">
            ${pack?.cover ? `<img src="${esc(pack.cover)}" alt="" />` : ""}
            <div>
              <strong>${esc(card.album)}${sourceEvent(card) ? ` · ${esc(sourceEvent(card))}` : ""}</strong>
              <span>${esc(card.artist)}</span>
            </div>
          </div>
        </section>
      </div>
      ${otherCards(card)}
    </div>
    ${action ? `<div class="buy">${action}</div>` : ""}
  `;
}

function feeNote(cart, place, abroad) {
  const quote = shippingQuote(cart.length, place);
  const customs = abroad
    ? `<p class="notice">관세 및 현지 세금은 배송비에 포함되지 않으며, 발생 시 수취인이 부담할 수 있습니다.</p>`
    : "";
  return `
    <div class="ship-facts">
      <div><span>배송지</span><strong>${esc(quote.place)}</strong></div>
      <div><span>포토카드</span><strong>${quote.count}장</strong></div>
      <div><span>배송방법</span><strong>${esc(quote.method)}</strong></div>
      <div><span>배송비</span><strong>${esc(quote.feeText)}</strong></div>
    </div>
    ${customs}`;
}

function loadAddresses() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADDRESS_KEY) || "null");
    return Array.isArray(saved) ? saved.filter((item) => item && item.id && item.region) : [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

let addresses = loadAddresses();

function persistAddresses() {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));
}

function addressesFor(region) {
  return addresses.filter((item) => item.region === region);
}

function blankAddressFields() {
  state.addressId = "";
  state.receiver = "";
  state.phone = "";
  state.email = "";
  state.postcode = "";
  state.address = "";
  state.addressDetail = "";
  state.city = "";
  state.province = "";
  state.country = state.region === "domestic" ? "대한민국" : "";
}

function fillAddress(item) {
  state.addressId = item.id;
  state.receiver = item.receiver || "";
  state.phone = item.phone || "";
  state.email = item.email || "";
  state.postcode = item.postcode || "";
  state.address = item.address || "";
  state.addressDetail = item.addressDetail || "";
  state.city = item.city || "";
  state.province = item.province || "";
  state.country = item.country || (item.region === "domestic" ? "대한민국" : "");
}

function applyDefaultAddress() {
  const list = addressesFor(state.region);
  const picked = list.find((item) => item.isDefault) || list[0];
  if (picked) fillAddress(picked);
  else blankAddressFields();
}

function addressSummary(item) {
  if (item.region === "domestic") return [item.address, item.addressDetail].filter(Boolean).join(" ");
  return [item.address, item.city, item.country].filter(Boolean).join(", ");
}

function currentAddressPayload() {
  return {
    region: state.region,
    receiver: state.receiver.trim(),
    phone: state.phone.trim(),
    email: state.email.trim(),
    postcode: state.postcode.trim(),
    address: state.address.trim(),
    addressDetail: state.addressDetail.trim(),
    city: state.city.trim(),
    province: state.province.trim(),
    country: state.country,
  };
}

function saveCurrentAddress() {
  if (!shipReady()) return false;
  const payload = currentAddressPayload();
  const found = addresses.find((item) => item.id === state.addressId);
  if (found) {
    Object.assign(found, payload);
  } else {
    const id = `AD_${Date.now()}`;
    const isDefault = !addresses.some((item) => item.region === state.region && item.isDefault);
    addresses.push({ id, isDefault, ...payload });
    state.addressId = id;
  }
  persistAddresses();
  return true;
}

function setDefaultAddress(id) {
  const found = addresses.find((item) => item.id === id);
  if (!found) return;
  addresses.forEach((item) => {
    if (item.region === found.region) item.isDefault = item.id === id;
  });
  persistAddresses();
  fillAddress(found);
}

function addressBook() {
  const list = addressesFor(state.region);
  const rows = list.length
    ? list.map((item) => `
      <div class="addr-item${item.id === state.addressId ? " on" : ""}">
        <button type="button" data-address="${esc(item.id)}">
          <strong>${esc(item.receiver)}${item.isDefault ? `<em>기본</em>` : ""}</strong>
          <span>${esc(addressSummary(item))}</span>
        </button>
        ${item.isDefault ? "" : `<button type="button" data-address-default="${esc(item.id)}">기본으로</button>`}
      </div>`).join("")
    : `<p class="meta">저장된 배송지가 없어요. 주소를 입력하고 저장해 주세요.</p>`;
  const add = list.length ? `<button type="button" data-address-new>신규 배송지</button>` : "";
  return `
    <div class="addr-book">
      <div class="addr-book-head">
        <strong>배송지</strong>
        ${add}
      </div>
      ${rows}
    </div>
  `;
}

function addressSaveButton() {
  return `<button type="button" class="ghost" data-address-save ${shipReady() ? "" : "disabled"}>이 배송지 저장</button>`;
}

function shipReady() {
  const cart = state.owned.some((card) => card.status === "shipping_cart");
  if (!cart || !state.receiver.trim() || !state.phone.trim()) return false;
  if (state.region === "domestic") return Boolean(state.postcode && state.address && state.addressDetail.trim());
  if (state.region === "abroad") {
    return Boolean(state.country && state.email.trim() && state.address.trim() && state.city.trim() && state.postcode.trim());
  }
  return false;
}

function domesticForm(cart) {
  return `
    <form class="ship-form">
      ${addressBook()}
      <label>받는 사람
        <input data-field="receiver" value="${esc(state.receiver)}" />
      </label>
      <label>연락처
        <input data-field="phone" value="${esc(state.phone)}" inputmode="tel" />
      </label>
      <label>우편번호
        <span class="postcode-row">
          <input value="${esc(state.postcode)}" readonly placeholder="검색해 주세요" />
          <button type="button" data-postcode>우편번호 검색</button>
        </span>
      </label>
      <label>주소
        <input value="${esc(state.address)}" readonly />
      </label>
      <label>상세 주소
        <input data-field="addressDetail" value="${esc(state.addressDetail)}" placeholder="동, 호수" />
      </label>
      ${addressSaveButton()}
      ${feeNote(cart, "대한민국", false)}
    </form>
  `;
}

function abroadForm(cart) {
  const countries = shippingPolicy().zones.map((item) => String(item.country || "").trim()).filter(Boolean);
  const options = countries.length
    ? countries.map((name) => `<option ${name === state.country ? "selected" : ""}>${esc(name)}</option>`).join("")
    : "";
  return `
    <form class="ship-form">
      ${addressBook()}
      <label>이름
        <input data-field="receiver" value="${esc(state.receiver)}" placeholder="영문 이름" autocomplete="name" />
      </label>
      <label>주소
        <input data-field="address" value="${esc(state.address)}" placeholder="도로명, 번지" autocomplete="address-line1" />
      </label>
      <label>상세 주소
        <input data-field="addressDetail" value="${esc(state.addressDetail)}" placeholder="아파트, 동호. 없으면 비워요" autocomplete="address-line2" />
      </label>
      <div class="addr-split">
        <label>City
          <input data-field="city" value="${esc(state.city)}" placeholder="City" autocomplete="address-level2" />
        </label>
        <label>State
          <input data-field="province" value="${esc(state.province)}" placeholder="Optional" autocomplete="address-level1" />
        </label>
      </div>
      <div class="addr-split">
        <label>Postal code
          <input data-field="postcode" value="${esc(state.postcode)}" placeholder="Postal code" autocomplete="postal-code" />
        </label>
        <label>국가
          <select data-country autocomplete="country-name">
            <option value="" ${state.country ? "" : "selected"} disabled>국가</option>
            ${options}
          </select>
        </label>
      </div>
      <label>연락처
        <input data-field="phone" value="${esc(state.phone)}" inputmode="tel" placeholder="국가번호 포함" autocomplete="tel" />
      </label>
      <label>이메일
        <input data-field="email" value="${esc(state.email)}" inputmode="email" autocomplete="email" />
      </label>
      ${addressSaveButton()}
      ${feeNote(cart, state.country, true)}
    </form>
  `;
}

function postcodeLayer() {
  const failed = state.postcodeError ? `<p class="notice">우편번호 검색을 불러오지 못했어요.</p>` : "";
  return `
    <div class="postcode-layer">
      <div class="postcode-bar">
        <button type="button" data-postcode-close>닫기</button>
        <strong>우편번호 검색</strong>
      </div>
      <div id="postcode-box"></div>
      ${failed}
    </div>
  `;
}

function shipBasket() {
  const cart = state.owned.filter((card) => card.status === "shipping_cart");
  const stored = state.owned.filter((card) => card.status === "stored");
  const figures = groupCards(cart).map(boxedFigure).join("");
  const addLabel = state.shipPick ? "닫기" : "카드 추가";
  const picker = state.shipPick
    ? `
      <section class="ship-section is-add">
        <div class="ship-section-head"><h2>더 담을 수 있는 카드</h2><span>${stored.length}장</span></div>
        ${stored.length
          ? `<div class="owned picker">${stored.map((card) => pickFigure(card, true)).join("")}</div>
             <button type="button" class="ship-confirm" data-ship-add-confirm ${state.picked.length ? "" : "disabled"}>${icon("track")}<span>${state.picked.length ? `${state.picked.length}장 담기` : "담을 카드 선택"}</span></button>`
          : `<p class="empty">담을 수 있는 카드가 없어요.</p>`}
      </section>`
    : "";
  return `
    <section class="ship-section is-in">
      <div class="ship-section-head"><h2>배송박스에 담긴 카드</h2><span>${cart.length}장</span></div>
      <div class="owned">${figures}<button type="button" class="ship-add" data-ship-add>${addLabel}</button></div>
    </section>
    ${picker}`;
}

function ship() {
  const cart = state.owned.filter((card) => card.status === "shipping_cart");
  const cards = shipBasket();
  const count = `<p class="ship-count">${cart.length} / ${maxShipCards()}장</p>`;
  if (!cart.length || !state.region) {
    return `
      <header class="bar">
        <button data-back="mypage" aria-label="마이페이지">←</button>
        <h1>배송바구니</h1>
        <span class="bar-tools">${menuButton()}</span>
      </header>
      <div class="scroll">
        ${count}
        ${cards}
        ${cart.length && !state.shipPick ? `
          <div class="region-pick">
            <p class="lead">어디로 받을까요?</p>
            <button class="primary" data-region="domestic">국내</button>
            <button class="ghost" data-region="abroad">해외</button>
          </div>` : ""}
      </div>
    `;
  }
  const title = state.region === "domestic" ? "국내 배송" : "해외 배송";
  const form = state.region === "domestic" ? domesticForm(cart) : abroadForm(cart);
  return `
    <header class="bar">
      <button data-region="" aria-label="국내 해외 다시 고르기">←</button>
      <h1>${title}</h1>
      <span class="bar-tools">${menuButton()}</span>
    </header>
    <div class="scroll">${count}${cards}${form}</div>
    <button class="primary pay-bar" data-request ${shipReady() ? "" : "disabled"}>배송비 결제</button>
    ${state.postcodeOpen ? postcodeLayer() : ""}
  `;
}

const ICON_PATH = {
  home: "M217.9,110.1l-80-80a14,14,0,0,0-19.8,0l-80,80A13.92,13.92,0,0,0,34,120v96a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V158h36v58a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V120A13.92,13.92,0,0,0,217.9,110.1ZM210,210H158V152a6,6,0,0,0-6-6H104a6,6,0,0,0-6,6v58H46V120a2,2,0,0,1,.58-1.42l80-80a2,2,0,0,1,2.84,0l80,80A2,2,0,0,1,210,120Z",
  album: "M216,42H72A14,14,0,0,0,58,56V74H40A14,14,0,0,0,26,88V200a14,14,0,0,0,14,14H184a14,14,0,0,0,14-14V182h18a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM70,56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2v67.57L204.53,110.1a14,14,0,0,0-19.8,0l-21.42,21.41L117.9,86.1a14,14,0,0,0-19.8,0L70,114.2ZM186,200a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V88a2,2,0,0,1,2-2H58v82a14,14,0,0,0,14,14H186Zm30-30H72a2,2,0,0,1-2-2V131.17l36.58-36.58a2,2,0,0,1,2.83,0l49.66,49.66a6,6,0,0,0,8.49,0l25.65-25.66a2,2,0,0,1,2.83,0l22,22V168A2,2,0,0,1,216,170ZM162,84a10,10,0,1,1,10,10A10,10,0,0,1,162,84Z",
  mypage: "M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z",
  ship: "M253.57,117.78l-14-35a13.93,13.93,0,0,0-13-8.8H190V64a6,6,0,0,0-6-6H32A14,14,0,0,0,18,72V184a14,14,0,0,0,14,14H50.6a30,30,0,0,0,58.8,0h53.2a30,30,0,0,0,58.8,0H240a14,14,0,0,0,14-14V120A6,6,0,0,0,253.57,117.78ZM190,86h36.58a2,2,0,0,1,1.86,1.26L239.14,114H190ZM30,72a2,2,0,0,1,2-2H178v68H30ZM80,210a18,18,0,1,1,18-18A18,18,0,0,1,80,210Zm82.6-24H109.4a30,30,0,0,0-58.8,0H32a2,2,0,0,1-2-2V150H178v15.48A30.1,30.1,0,0,0,162.6,186ZM192,210a18,18,0,1,1,18-18A18,18,0,0,1,192,210Zm50-26a2,2,0,0,1-2,2H221.4A30.05,30.05,0,0,0,192,162c-.67,0-1.34,0-2,.07V126h52Z",
  cart: "M134,120v56a6,6,0,0,1-12,0V120a6,6,0,0,1,12,0Zm40.83-.6-5.6,56A6,6,0,0,0,174.6,182l.61,0a6,6,0,0,0,6-5.4l5.6-56a6,6,0,0,0-11.94-1.2Zm-93.66,0a6,6,0,0,0-11.94,1.2l5.6,56a6,6,0,0,0,6,5.4l.61,0a6,6,0,0,0,5.37-6.57ZM238,88.79,222.87,201.85A14,14,0,0,1,209,214H47a14,14,0,0,1-13.87-12.15L18.05,88.79A6,6,0,0,1,24,82H69.28l54.2-61.95a6,6,0,0,1,9,0l54.2,62H232A6,6,0,0,1,238,88.79ZM85.22,82h85.56L128,33.11ZM225.15,94H30.85L45,200.26A2,2,0,0,0,47,202H209a2,2,0,0,0,2-1.74Z",
  heart: "M178,42c-21,0-39.26,9.47-50,25.34C117.26,51.47,99,42,78,42a60.07,60.07,0,0,0-60,60c0,29.2,18.2,59.59,54.1,90.31a334.68,334.68,0,0,0,53.06,37,6,6,0,0,0,5.68,0,334.68,334.68,0,0,0,53.06-37C219.8,161.59,238,131.2,238,102A60.07,60.07,0,0,0,178,42ZM128,217.11C111.59,207.64,30,157.72,30,102A48.05,48.05,0,0,1,78,54c20.28,0,37.31,10.83,44.45,28.27a6,6,0,0,0,11.1,0C140.69,64.83,157.72,54,178,54a48.05,48.05,0,0,1,48,48C226,157.72,144.41,207.64,128,217.11Z",
  heartFill: "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z",
  track: "M222.72,67.91l-88-48.18a13.9,13.9,0,0,0-13.44,0l-88,48.18A14,14,0,0,0,26,80.18v95.64a14,14,0,0,0,7.28,12.27l88,48.18a13.92,13.92,0,0,0,13.44,0l88-48.18A14,14,0,0,0,230,175.82V80.18A14,14,0,0,0,222.72,67.91ZM127,30.25a2,2,0,0,1,1.92,0L212.51,76,178.57,94.57,94.05,48.31ZM122,223,39,177.57a2,2,0,0,1-1-1.75V86.66l84,46ZM43.49,76,81.56,55.15l84.51,46.26L128,122.24ZM218,175.82a2,2,0,0,1-1,1.75h0L134,223V132.64l36-19.71V152a6,6,0,0,0,12,0V106.37l36-19.71Z",
  share: "M176,162a37.91,37.91,0,0,0-28.3,12.67L98.8,143.24a37.89,37.89,0,0,0,0-30.48l48.9-31.43a38,38,0,1,0-6.5-10.09L92.3,102.67a38,38,0,1,0,0,50.66l48.9,31.43A38,38,0,1,0,176,162Zm0-132a26,26,0,1,1-26,26A26,26,0,0,1,176,30ZM64,154a26,26,0,1,1,26-26A26,26,0,0,1,64,154Zm112,72a26,26,0,1,1,26-26A26,26,0,0,1,176,226Z",
  plus: "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z",
  minus: "M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z",
  caret: "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z",
  // Phosphor regular (phosphoricons.com)
  copy: "M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z",
  qr: "M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm0,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48ZM200,40H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-64,72V144a8,8,0,0,1,16,0v32a8,8,0,0,1-16,0Zm80-16a8,8,0,0,1-8,8H184v40a8,8,0,0,1-8,8H144a8,8,0,0,1,0-16h24V144a8,8,0,0,1,16,0v8h24A8,8,0,0,1,216,160Zm0,32v16a8,8,0,0,1-16,0V192a8,8,0,0,1,16,0Z",
  external: "M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z",
  arrowUp: "M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z",
  arrowDown: "M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z",
  coins: "M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132ZM72,150.25V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54v23.79A163,163,0,0,1,96,152,163,163,0,0,1,72,150.25Zm96-40.32V124c0,8.39-12.41,17.4-32,22.87V123.5C148.91,120.37,159.84,115.71,168,109.93ZM96,56c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,97.22,24,84,54.79,56,96,56ZM24,124V109.93c8.16,5.78,19.09,10.44,32,13.57v23.37C36.41,141.4,24,132.39,24,124Zm64,48v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41v23.46C100.41,189.4,88,180.39,88,172Zm48,26.25V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54v23.79a165.45,165.45,0,0,1-48,0Zm64-3.38V171.5c12.91-3.13,23.84-7.79,32-13.57V172C232,180.39,219.59,189.4,200,194.87Z",
  receipt: "M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z",
  info: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z",
  swap: "M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Zm96-96-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z",
  caretRight: "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z",
  refresh: "M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z",
  bell: "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z",
  megaphone: "M248,120a48.05,48.05,0,0,0-48-48H160.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,32,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,159.12,214l11,7.33A16,16,0,0,0,194.5,212l11.77-44.36A48.07,48.07,0,0,0,248,120ZM48,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C134.65,155,90.84,164.07,48,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM200,152H168V88h32a32,32,0,1,1,0,64Z",
  checkCircle: "M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z",
  check: "M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z",
  x: "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z",
};

function icon(name) {
  return `<svg class="ico" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${ICON_PATH[name]}"/></svg>`;
}

function searchButton() {
  return `<button type="button" class="icon-btn" data-search aria-label="검색">${searchIcon()}</button>`;
}

function menuButton() {
  return `<button type="button" class="icon-btn" data-drawer aria-label="메뉴"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>`;
}

const TAB_ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v10h13V10"></path><path d="M10 20v-6h4v6"></path></svg>`,
  products: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.5l2.2 11h10.6L21 7H6.3"></path><circle cx="9.5" cy="19" r="1.4"></circle><circle cx="17" cy="19" r="1.4"></circle></svg>`,
  exchange: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.6"></path><path d="M5 3v4.5h4.5"></path><path d="M4 13a8 8 0 0 0 14.5 4.6"></path><path d="M19 21v-4.5h-4.5"></path></svg>`,
  album: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="11" height="15" rx="1.6"></rect><path d="M5 7.5v11A1.5 1.5 0 0 0 6.5 20H15"></path></svg>`,
  mypage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"></path></svg>`,
};

// 햄버거 드로어. 메뉴는 마이페이지(슬라이드 24)와 같고, 맨 위에 홈·보유 카드 진입만 둔다.
// 포인트 교환은 토마톡 지갑에서 하므로 여기에는 없다.
function drawer() {
  if (!state.menuOpen) return "";
  const item = (name, label) => `<button type="button" class="nav-item" data-nav="${name}">${label}</button>`;
  const soon = (label) => `<button type="button" class="nav-item nav-sub-item" data-soon="${esc(label)}">${esc(label)}</button>`;
  return `
    <div class="nav-bg">
      <aside class="nav-panel">
        <div class="nav-head">
          <strong>메뉴</strong>
          <button type="button" data-drawer-close aria-label="닫기">닫기</button>
        </div>
        ${item("home", "홈")}
        ${item("album", "보유 카드")}
        ${item("purchases", "구매 내역")}
        ${item("wished", "찜 목록")}
        ${item("notice", "공지사항")}
        ${soon("이벤트")}
        ${item("wallet", "지갑 · 토마톡")}
        <div class="nav-box">
          ${soon("1:1 문의")}
          <button type="button" class="nav-item nav-sub-item" data-nav="guide">이용자 가이드</button>
          ${soon("FAQ")}
          ${soon("이용약관")}
          ${soon("SNS")}
        </div>
      </aside>
      <button type="button" class="nav-dim" data-drawer-close aria-label="메뉴 닫기"></button>
    </div>
  `;
}

function noticeItems() {
  try {
    const saved = JSON.parse(localStorage.getItem("photocard-notices-v1") || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    console.warn(error);
  }
  return [{
    title: "보유 카드 안내",
    body: "뽑은 카드는 보유 카드에 보관돼요. 같은 카드를 여러 장 뽑으면 장수로 표시돼요.",
    start: "2026-10-08",
  }];
}

function notices() {
  const articles = noticeItems().map((item) => {
    const date = String(item.start || "").slice(0, 10);
    const time = date ? `<time datetime="${esc(date)}">${esc(date.replaceAll("-", "."))}</time>` : "";
    return `
      <article class="notice">
        <strong>${esc(item.title || "공지")}</strong>
        <p>${esc(item.body || "").replaceAll("\n", "<br>")}</p>
        ${time}
      </article>`;
  }).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>공지사항</h1>
      ${menuButton()}
    </header>
    <div class="scroll">${articles}</div>
  `;
}

// 마이페이지(슬라이드 24). 배송바구니·배송내역 진입은 Ver.02라 뺀다.
function mypage() {
  const card = (label, attrs) => `<button type="button" class="menu-card" ${attrs}><span>${label}</span><i aria-hidden="true">›</i></button>`;
  const line = (label, attrs) => `<button type="button" class="menu-line" ${attrs}>${label}</button>`;
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>마이페이지</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <div class="menu-cards">
        ${card("구매 내역", `data-nav="purchases"`)}
        ${card("찜 목록", `data-nav="wished"`)}
        ${card("공지사항", `data-nav="notice"`)}
        ${card("이벤트", `data-soon="이벤트"`)}
      </div>
      <div class="menu-box">
        ${line("1:1 문의", `data-soon="1:1 문의"`)}
        ${line("이용자 가이드", `data-nav="guide"`)}
        ${line("FAQ", `data-soon="FAQ"`)}
        ${line("이용약관", `data-soon="이용약관"`)}
        ${line("SNS", `data-soon="SNS"`)}
      </div>
    </div>
  `;
}

function purchaseDate(value) {
  const text = String(value || "");
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return formatDate(text.slice(0, 10));
  return formatDate(text);
}

// 구매 내역(Q22 기본값): 결제 기록을 단순 목록으로 보여 준다.
function purchases() {
  const orders = readOrderStore()
    .filter((order) => order.kind === "purchase")
    .sort((a, b) => String(b.purchasedOn || "").localeCompare(String(a.purchasedOn || "")));
  const rows = orders.length
    ? orders.map((order) => {
      const item = product(order.productId);
      const cover = item?.cover ? `<img src="${esc(item.cover)}" alt="" />` : `<span class="thumb-blank"></span>`;
      const price = Number.isFinite(Number(order.price)) && order.price != null ? priceBlock(order.price) : "—";
      return `
        <article class="purchase">
          <span class="thumb">${cover}</span>
          <span>
            <p class="purchase-when">${esc(purchaseDate(order.purchasedOn) || "—")}</p>
            <p class="name">${esc(order.productName || order.album || "")}</p>
            <p class="meta">${esc(order.artist || "")} · ${Number(order.count) || (order.cards || []).length}장</p>
          </span>
          <strong>${price}</strong>
        </article>`;
    }).join("")
    : `<p class="empty">구매 내역이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>구매 내역</h1>
      ${menuButton()}
    </header>
    <div class="scroll"><div class="list">${rows}</div></div>
  `;
}

function wished() {
  const items = state.wished.map((id) => product(id)).filter(Boolean);
  const rows = items.length
    ? items.map((item) => {
      const word = saleWord(item);
      return `
      <button class="row${word ? " sold" : ""}" data-open="${item.id}">
        <span class="thumb">
          <img src="${item.cover}" alt="" />
          ${word ? `<em>${word}</em>` : ""}
        </span>
        <span>
          ${artistMark(item)}
          <p class="name">${esc(productName(item))}</p>
        </span>
      </button>`;
    }).join("")
    : `<p class="empty">찜한 상품이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>찜 목록</h1>
      ${menuButton()}
    </header>
    <div class="scroll"><div class="list">${rows}</div></div>
  `;
}

function detail(item) {
  const slots = item.cards
    .map((card) => {
      const imgs = [
        card.front ? `<span class="face front"><img src="${photo(card.front)}" alt="" /></span>` : "",
        card.back ? `<span class="face"><img src="${photo(card.back)}" alt="" /></span>` : "",
      ].join("");
      return `
      <div class="slot pair">
        <div class="pair-imgs">${imgs}</div>
        <small>${esc(card.no)}</small>
      </div>`;
    })
    .join("");
  // TP가 모자라도 버튼은 열어 둔다. 결제 시트가 부족분과 [TP 교환하기]를 보여 준다.
  const canOne = true;
  const stockForFive = canDrawFive(item);
  const canFive = stockForFive;
  const word = saleWord(item);
  const fiveNote = !word && !stockForFive ? `<p class="five-note">현재 연속 뽑기 불가</p>` : "";
  const buy = word
    ? `<button class="primary" type="button" disabled>${word}</button>`
    : `
      <div class="actions">
        <button class="primary" data-buy="1" ${canOne ? "" : "disabled"}>1장 뽑기</button>
        <button class="ghost" data-buy="5" ${canFive ? "" : "disabled"}>5장 연속 뽑기</button>
      </div>
      ${fiveNote}`;
  return `
    <header class="bar">
      <button data-back="${state.productFrom === "artist" || state.productFrom === "artists" ? state.productFrom : ""}" aria-label="뒤로">←</button>
      <h1>${esc(item.artist)}</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <img class="cover" src="${item.cover}" alt="" />
      <div class="detail">
        <div class="artist-row">
          <button type="button" class="artist" data-profile="${esc(item.artistId)}" aria-label="${esc(item.artist)} 상품">${artistMark(item)}</button>
          <span class="detail-tools">
            <button type="button" data-wish="${item.id}" class="${state.wished.includes(item.id) ? "on" : ""}" aria-label="${state.wished.includes(item.id) ? "찜함" : "찜"}">${icon(state.wished.includes(item.id) ? "heartFill" : "heart")}</button>
            <button type="button" data-share="${item.id}" aria-label="공유하기">${icon("share")}</button>
          </span>
        </div>
        <h2>${esc(productName(item))}</h2>
        <p class="kind">${esc(summaryLine(item))}</p>
        <div class="detail-offer">
          <p class="lead">${lineup(item.cards.length)}</p>
          <p class="lead">${priceBlock(item.price)}</p>
        </div>
        <p class="pay-note">TP로 결제해요 · TOTT는 토마톡 지갑에서 TP로 바꿔요</p>
        <div class="perks">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="1.5"></rect></svg>${esc(perkLabels(item)[0])}</span>
          <span>${icon("track")}${esc(perkLabels(item)[1])}</span>
        </div>
        <section class="section">
          <h3>포토카드 구성 ${item.cards.length}종</h3>
          <div class="slots">${slots}</div>
        </section>
        <section class="section">
          <div class="facts-box">
          <h3>상품 정보</h3>
          <table class="facts">
            <tr><th>사이즈</th><td>${esc(factValue(item, "size"))}</td></tr>
            <tr><th>상품 유형</th><td>${esc(factValue(item, "type"))}</td></tr>
            <tr><th>상품 상태</th><td>${esc(factValue(item, "state"))}</td></tr>
          </table>
          </div>
        </section>
        <div class="guides">
          ${guideSection("랜덤 상품 안내", item, "random")}
          ${guideSection("포토카드 안내", item, "photocard")}
        </div>
      </div>
    </div>
    <div class="buy">
      ${buy}
    </div>
  `;
}

const OPEN_CUT = {
  minDistance: 72,
  duration: 1200,
  haptic: true,
  particles: 6,
  trail: [0, 200],
  cut: [150, 450],
  flap: [400, 700],
  rise: [600, 1100],
};

// 1은 통이미지로 포장 위쪽을 찢고, 2는 자른 찢어짐을 손가락 높이에 붙인다.
const TEAR_METHOD = 2;
// false면 결제 뒤 바로 포장 개봉으로 간다. 덱 연출만 뺄 때 이 값만 바꾸면 된다.
const CARD_DECK = true;
const DECK_FAN = [
  { x: -105, y: 16, r: -18 },
  { x: -55, y: 5, r: -9 },
  { x: 0, y: 0, r: 0 },
  { x: 55, y: 5, r: 9 },
  { x: 105, y: 16, r: 18 },
];
// 5장 바로 오픈하기(슬라이드 16): 다섯 장을 2-1-2로 펼친다.
const SPREAD_GRID = [
  { x: -82, y: -158 },
  { x: 82, y: -158 },
  { x: 0, y: 0 },
  { x: -82, y: 158 },
  { x: 82, y: 158 },
];
const OPEN_BASE = "tears/base.jpg?v=4";
const DECK_PACK = "tears/base.png?v=1";
const DECK_BACK = "tears/back.png?v=1";
const DECK_HIT = { x0: 0.111, y0: 0.057, x1: 0.885, y1: 0.971 };
const OPEN_OVERS = [1, 2, 3, 4].map((index) => (
  TEAR_METHOD === 1 ? `tears/method-1/over-${index}.png?v=1` : `tears/over-${index}.png?v=5`
));

function showOpenFrame(stage, index) {
  const overs = [...stage.querySelectorAll(".open-over")];
  const next = Math.max(0, Math.min(overs.length, index));
  overs.forEach((img, item) => img.classList.toggle("is-on", item + 1 === next));
  return next;
}

function dragSpan(dx, dy) {
  return Math.hypot(dx, dy);
}

function dragFrame(stage, distance) {
  const stack = stage.querySelector(".open-stack");
  const width = stack?.getBoundingClientRect().width || 1;
  const progress = Math.max(0, Math.min(1, Math.abs(distance) / width));
  const count = stage.querySelectorAll(".open-over").length;
  if (progress <= 0 || !count) return 0;
  return Math.min(count, Math.ceil(progress * count));
}

const TEAR_INK = [
  { x0: 0.044, y0: 0.1, x1: 0.463, y1: 0.703 },
  { x0: 0.077, y0: 0.062, x1: 0.682, y1: 0.591 },
  { x0: 0.037, y0: 0, x1: 0.727, y1: 0.668 },
  { x0: 0.02, y0: 0.015, x1: 0.978, y1: 1 },
];

function tearInk(stage, frame) {
  if (TEAR_METHOD !== 2) return { x0: 0, x1: 1, y0: 0, y1: 1 };
  const stack = stage.querySelector(".open-stack");
  if (!stack) return null;
  const box = stack.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const ink = TEAR_INK[Math.max(0, Math.min(TEAR_INK.length, frame) - 1)];
  const mid = stage.classList.contains("is-mid");
  const span = (parseFloat(stack.style.getPropertyValue("--tear-span")) || 0);
  if (stage.classList.contains("is-vert")) {
    const thick = (parseFloat(stack.style.getPropertyValue("--tear-thick")) || 0) / box.width;
    const left = (parseFloat(stack.style.getPropertyValue("--tear-left")) || 0) / box.width;
    const anchor = 85 / 259;
    const up = stage.classList.contains("is-up");
    const across = (iy) => left + (up ? 1 : -1) * (iy - anchor) * thick;
    const x0 = Math.min(across(ink.y0), across(ink.y1));
    const x1 = Math.max(across(ink.y0), across(ink.y1));
    if (!mid) {
      return {
        x0,
        x1,
        y0: up ? 1 - ink.x1 : ink.x0,
        y1: up ? 1 - ink.x0 : ink.x1,
      };
    }
    const originY = (parseFloat(stack.style.getPropertyValue("--tear-origin-y")) || 0) / box.height;
    const shown = Math.min(ink.x1, span / box.height);
    if (shown <= ink.x0) return null;
    const y0 = up ? originY - shown : originY + ink.x0;
    const y1 = up ? originY - ink.x0 : originY + shown;
    return { x0, x1, y0: Math.min(y0, y1), y1: Math.max(y0, y1) };
  }
  const top = (parseFloat(stack.style.getPropertyValue("--tear-top")) || 0) / box.height;
  const height = (box.width * (259 / 985)) / box.height;
  const fromRight = stage.classList.contains("is-rtl");
  if (!mid) {
    return {
      x0: fromRight ? 1 - ink.x1 : ink.x0,
      x1: fromRight ? 1 - ink.x0 : ink.x1,
      y0: top + ink.y0 * height,
      y1: top + ink.y1 * height,
    };
  }
  const originX = (parseFloat(stack.style.getPropertyValue("--tear-origin-x")) || 0) / box.width;
  const shown = Math.min(ink.x1, span / box.width);
  if (shown <= ink.x0) return null;
  return {
    x0: fromRight ? originX - shown : originX + ink.x0,
    x1: fromRight ? originX - ink.x0 : originX + shown,
    y0: top + ink.y0 * height,
    y1: top + ink.y1 * height,
  };
}

function fingerOnTear(stage, frame) {
  const ink = tearInk(stage, frame);
  const x = Number(stage.dataset.fingerX);
  const y = Number(stage.dataset.fingerY);
  if (!ink || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x < ink.x0 || x > ink.x1 || y < ink.y0 || y > ink.y1) return null;
  return { x, y, ink };
}

function tearSparks(stage, frame, hit) {
  if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const stack = stage.querySelector(".open-stack");
  const ink = hit?.ink || tearInk(stage, frame);
  if (!stack || !ink || stack.querySelectorAll(".tear-spark").length > 120) return;
  const fromRight = stage.classList.contains("is-rtl");
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const addSpark = (x, top, hot, reach) => {
    const spark = document.createElement("i");
    const tooth = Math.random() < 0.5 ? -1 : 1;
    let angle = hot ? tooth * (18 + Math.random() * 120) : tooth * (42 + Math.random() * 58);
    spark.className = hot ? "tear-spark is-hot" : "tear-spark";
    spark.style.left = `${clamp(x, ink.x0, ink.x1) * 100}%`;
    spark.style.top = `${clamp(top, ink.y0, ink.y1) * 100}%`;
    if (stage.classList.contains("is-vert")) angle += stage.classList.contains("is-up") ? -90 : 90;
    else if (fromRight) angle = 180 - angle;
    spark.style.setProperty("--rot", `${angle}deg`);
    spark.style.setProperty("--dist", reach);
    spark.style.setProperty("--len", `${8 + Math.random() * 14}px`);
    spark.style.animationDuration = `${0.14 + Math.random() * 0.15}s`;
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
    stack.appendChild(spark);
  };
  for (let index = 0; index < 8; index += 1) {
    addSpark(
      ink.x0 + Math.random() * (ink.x1 - ink.x0),
      ink.y0 + Math.random() * (ink.y1 - ink.y0),
      false,
      `${46 + Math.random() * 94}px`
    );
  }
  for (let index = 0; index < 8; index += 1) {
    addSpark(
      ink.x0 + Math.random() * (ink.x1 - ink.x0),
      ink.y0 + Math.random() * (ink.y1 - ink.y0),
      true,
      `${18 + Math.random() * 40}px`
    );
  }
  if (!hit) return;
  for (let index = 0; index < 10; index += 1) {
    addSpark(
      hit.x + (Math.random() - 0.5) * 0.04,
      hit.y + (Math.random() - 0.5) * 0.02,
      true,
      `${14 + Math.random() * 48}px`
    );
  }
}

function visibleTear(stage) {
  const overs = [...stage.querySelectorAll(".open-over")];
  const index = overs.findIndex((img) => img.classList.contains("is-on"));
  return index < 0 ? 0 : index + 1;
}

function keepTearSparks(stage) {
  if (stage.dataset.sparking) return;
  stage.dataset.sparking = "1";
  const tick = () => {
    if (!stage.isConnected || stage.dataset.sparkStop) return;
    const frame = visibleTear(stage);
    if (!frame) {
      window.setTimeout(tick, 69);
      return;
    }
    const hit = stage.classList.contains("is-touching") ? fingerOnTear(stage, frame) : null;
    tearSparks(stage, frame, hit);
    window.setTimeout(tick, 69);
  };
  tick();
}

function revealBackSrc(card) {
  const item = product(state.productId);
  const found = item?.cards.find((entry) => entry.no === card.no && entry.back);
  return found ? photo(found.back) : "";
}

function openEase(elapsed, start, end) {
  if (elapsed <= start) return 0;
  if (elapsed >= end) return 1;
  const progress = (elapsed - start) / (end - start);
  return 1 - (1 - progress) ** 3;
}

function openHaptic(kind) {
  if (!OPEN_CUT.haptic || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(kind === "medium" ? 18 : 8);
}

function sealedPack() {
  const card = state.reveal[state.revealIndex];
  const count = state.reveal.length;
  const back = card ? revealBackSrc(card) : "";
  const cardLayer = back
    ? `<img class="open-card" src="${back}" alt="" draggable="false" />`
    : `<div class="open-card open-card-blank"></div>`;
  const overs = OPEN_OVERS.map((src) => `<img class="open-over" src="${src}" alt="" draggable="false" />`).join("");
  const frontFace = card?.front
    ? `<img class="fly-face front guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />`
    : `<span class="fly-face front fly-blank"></span>`;
  const backFace = back
    ? `<img class="fly-face back" src="${back}" alt="" draggable="false" />`
    : `<span class="fly-face back fly-blank"></span>`;
  return `
    ${openBar(count > 1 ? `${count}장 뽑기` : "")}
    <div class="open-stage tear-${TEAR_METHOD}" data-open-stage>
      <video class="open-fire-src" data-fireworks src="fx/fireworks.mp4?v=4" muted loop playsinline preload="auto"></video>
      <div class="open-stack">
        <div class="env-back"></div>
        ${cardLayer}
        <div class="open-frames">
          <img class="open-base" src="${OPEN_BASE}" alt="" draggable="false" />
          ${overs}
          <img class="open-shell" src="tears/over-5.png?v=3" alt="" draggable="false" />
        </div>
        <img class="pack-piece p-top" src="tears/pieces/top.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-ul" src="tears/pieces/ul.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-ur" src="tears/pieces/ur.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-ll" src="tears/pieces/ll.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-lr" src="tears/pieces/lr.png?v=1" alt="" draggable="false" />
      </div>
      <div class="fly-card">
        <div class="fly-spin">${frontFace}<span class="prism" aria-hidden="true"></span>${backFace}</div>
      </div>
      <video class="open-burst" data-open-burst src="fx/splash.mp4?v=1" muted playsinline preload="auto"></video>
      <p class="open-guide"><span class="open-finger" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8h8.5a1.5 1.5 0 0 1 0 3h-7.5"></path><path d="M13.5 11h2a1.5 1.5 0 0 1 0 3h-2.5"></path><path d="M14.5 14a1.5 1.5 0 0 1 0 3h-1.5"></path><path d="M13.5 17a1.5 1.5 0 1 1 0 3h-4.5a6 6 0 0 1 -6 -6v-2v.208a6 6 0 0 1 2.7 -5.012l.3 -.196q .718 -.468 5.728 -3.286a1.5 1.5 0 0 1 2.022 .536c.44 .734 .325 1.674 -.28 2.28l-1.47 1.47"></path></svg></span>손가락으로 밀어 열어보세요</p>
      <p class="open-turn"><span class="open-turn-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="12" rx="1.4"></rect><path d="M4 19h16"></path><path d="M7 16.5 4 19l3 2.5"></path><path d="M17 16.5 20 19l-3 2.5"></path></svg></span>드래그해서 앞뒤를 돌려보세요</p>
      <button class="primary open-ok" type="button" data-open-ok>OK</button>
    </div>
  `;
}

function openMotion() {
  return `
    <div class="motion" aria-label="Photocard Open">
      <span class="motion-ring"></span>
      <span class="motion-flash"></span>
      <img class="motion-pack" src="pack_closed.png" alt="" />
    </div>
  `;
}

// 개봉 흐름 공통 헤더(슬라이드 11~17): ←는 결과 화면으로 건너뛴다(Q13 기본값).
function openBar(note) {
  return `
    <header class="bar open-bar">
      <button type="button" data-open-skip aria-label="결과로 건너뛰기">←</button>
      <h1>Photocard Open</h1>
      ${note ? `<span class="result-progress">${esc(note)}</span>` : ""}
    </header>`;
}

function cardWho(card) {
  return [card.member, card.rarity].filter(Boolean).join(" · ");
}

function revealSlide(card, index) {
  const back = revealBackSrc(card);
  const backFace = back
    ? `<img class="reveal-face back" src="${back}" alt="" draggable="false" />`
    : `<span class="reveal-face back reveal-back-blank"></span>`;
  return `
    <div class="result-slide" data-result-slide="${index}">
      <div class="reveal-flip">
        <div class="reveal-spin">
          <img class="reveal-face front guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />
          ${backFace}
        </div>
      </div>
    </div>`;
}

// 결과 화면(슬라이드 14·17). 5장 뽑기는 좌우 스와이프 캐러셀로 다섯 장을 모두 보여 준다.
function result() {
  const item = product(state.productId);
  const count = state.reveal.length;
  const index = Math.max(0, Math.min(count - 1, state.revealIndex));
  const card = state.reveal[index];
  const many = count > 1;
  const progress = many ? `${index + 1} / ${count}` : "";
  const dots = many
    ? `<div class="result-dots" data-result-dots>${state.reveal.map((_, i) => `<i class="${i === index ? "on" : ""}"></i>`).join("")}</div>`
    : "";
  const otherLabel = many ? "1장 뽑기 구매" : "5장 연속 뽑기 구매";
  const otherCount = many ? 1 : 5;
  return `
    <header class="bar open-bar">
      <button type="button" data-result-close aria-label="닫기">←</button>
      <h1>Photocard Open</h1>
      ${progress ? `<span class="result-progress" data-result-progress>${progress}</span>` : ""}
    </header>
    <div class="scroll">
      <div class="result">
        <div class="result-top">
          <button type="button" class="result-mine" data-nav="album">보유 카드</button>
        </div>
        <div class="result-cards${many ? " is-many" : ""}" data-result-cards>
          ${state.reveal.map(revealSlide).join("")}
        </div>
        ${dots}
        ${artistMark(item)}
        <h2 data-result-name>${esc(item.album)} ${esc(card.no)}</h2>
        <p class="result-grade" data-result-grade>${esc(cardWho(card))}</p>
        <p class="result-status">보유 카드에서 확인 가능해요</p>
        <div class="result-actions">
          <button class="primary" data-again="1">한 번 더 뽑기</button>
          <div class="result-split">
            <button class="ghost" data-nav="products">다른 상품 보기</button>
            <button class="ghost" data-again="${otherCount}">${otherLabel}</button>
          </div>
          <button class="ghost" data-result-close>닫기</button>
        </div>
      </div>
    </div>
  `;
}

// 5장 결과 캐러셀: 스와이프하면 이름·등급·n / 5 표시를 바꾼다.
function armResultCarousel() {
  const rail = document.querySelector("[data-result-cards]");
  if (!rail || rail.dataset.bound || state.reveal.length < 2) return;
  rail.dataset.bound = "1";
  const item = product(state.productId);
  const name = document.querySelector("[data-result-name]");
  const grade = document.querySelector("[data-result-grade]");
  const progress = document.querySelector("[data-result-progress]");
  const dots = [...document.querySelectorAll("[data-result-dots] i")];
  const width = () => rail.clientWidth || 1;
  if (state.revealIndex > 0) rail.scrollLeft = width() * state.revealIndex;
  let timer = 0;
  rail.addEventListener("scroll", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const index = Math.max(0, Math.min(state.reveal.length - 1, Math.round(rail.scrollLeft / width())));
      if (index === state.revealIndex) return;
      state.revealIndex = index;
      const card = state.reveal[index];
      if (name) name.textContent = `${item.album} ${card.no}`;
      if (grade) grade.textContent = cardWho(card);
      if (progress) progress.textContent = `${index + 1} / ${state.reveal.length}`;
      dots.forEach((dot, i) => dot.classList.toggle("on", i === index));
    }, 60);
  }, { passive: true });
}

function balanceLabel() {
  return state.walletConnected ? tott(state.tp) : "미연결";
}

function sheet() {
  if (!state.sheet) return "";
  const item = product(state.productId);
  const count = state.sheet;
  const cost = item.price * count;
  const short = state.tp < cost;
  const rows = count === 1
    ? [
        ["현재가격", priceBlock(cost)],
        ["보유", priceBlock(state.tp)],
        short ? ["부족한 TP", `<span class="price short">${tott(cost - state.tp)}</span>`] : ["차감 후 남은 잔액", priceBlock(state.tp - cost)],
      ]
    : [
        ["5장 뽑기", priceBlock(cost)],
        ["보유", priceBlock(state.tp)],
        short ? ["부족한 TP", `<span class="price short">${tott(cost - state.tp)}</span>`] : ["결제 후", priceBlock(state.tp - cost)],
      ];
  if (!state.walletConnected) {
    return `
      <div class="sheet-bg">
        <div class="sheet">
          <span class="sheet-grab"></span>
          <h2 class="sheet-need">지갑 연결이 필요해요</h2>
          <p class="sheet-copy">포토카드는 TP로 결제해요.<br>지갑을 연결하면 바로 결제를 계속할 수 있어요.</p>
          <p class="sheet-copy sub">연결 후 현재 결제 화면으로 돌아옵니다.</p>
          <button class="primary" type="button" data-wallet-connect>지갑 연결하기</button>
          <button class="ghost" type="button" data-sheet-close>닫기</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="sheet-bg">
      <div class="sheet">
        <span class="sheet-grab"></span>
        <img class="sheet-cover" src="${item.cover}" alt="" />
        <div class="sheet-who">${artistMark(item)}</div>
        <h2>${esc(productName(item))}</h2>
        <p class="sheet-lineup">${esc(lineup(item.cards.length))}</p>
        <div class="sheet-box">
          ${rows
            .map(
              ([label, value]) => `<div class="sheet-line"><span>${label}</span><strong>${value}</strong></div>`,
            )
            .join("")}
        </div>
        <p class="rate-note" data-rate-note>${esc(rateNote())}</p>
        <div class="sheet-note">
          ${sheetNotes(item).map((line) => `<p>${esc(line)}</p>`).join("")}
        </div>
        ${state.tp < cost
          ? `<p class="sheet-short">TP가 ${tpNumber(cost - state.tp)} TP 부족해요. 토마톡 지갑에서 TOTT를 TP로 교환해요.</p>
             <button class="primary" type="button" data-go-exchange>TP 교환하기</button>
             <button class="ghost" type="button" disabled>결제하기</button>`
          : `<button class="primary" data-pay="${count}">결제하기</button>`}
      </div>
    </div>
  `;
}

function resultBoxModal() {
  if (!state.resultBox) return "";
  return `
    <div class="modal-bg">
      <div class="modal">
        <h2>배송박스에 담았어요.</h2>
        <p>여러 장을 모아 한 번에 배송받을 수 있어요.</p>
        <button type="button" class="primary" data-result-box-go>배송박스 보기</button>
        <button type="button" class="ghost" data-result-box-stay>계속 둘러보기</button>
      </div>
    </div>
  `;
}

function cartModal() {
  if (!state.cartModal) return "";
  return `
    <div class="modal-bg">
      <div class="modal">
        <h2>배송바구니에 담겼습니다.</h2>
        <button type="button" class="primary" data-cart-go>바로이동</button>
        <button type="button" class="ghost" data-cart-more>더담기</button>
      </div>
    </div>
  `;
}

function walletModal() {
  if (!state.walletModal) return "";
  return `
    <div class="modal-bg">
      <div class="modal wallet-modal">
        <h2>지갑 연결</h2>
        <p>TP로 결제하려면<br>지갑을 먼저 연결해 주세요.</p>
        <button type="button" class="primary" data-wallet-connect>지갑 연결하기</button>
        <button type="button" class="ghost" data-wallet-close>닫기</button>
      </div>
    </div>
  `;
}

function moveOne(id, status) {
  const card = state.owned.find((item) => item.id === id);
  if (!card) return false;
  if (status === "shipping_cart") {
    const count = state.owned.filter((item) => item.status === "shipping_cart").length;
    if (count >= maxShipCards()) return false;
  }
  card.status = status;
  return true;
}

function moveStored(ids) {
  const targets = [...new Set(ids)]
    .map((id) => state.owned.find((item) => item.id === id))
    .filter((card) => card && card.status === "stored");
  const room = maxShipCards() - state.owned.filter((item) => item.status === "shipping_cart").length;
  if (!targets.length || targets.length > room) return false;
  targets.forEach((card) => {
    card.status = "shipping_cart";
  });
  return true;
}

function draw(item, count) {
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    const card = item.cards[Math.floor(Math.random() * item.cards.length)];
    const owned = own({
      artist: item.artist,
      album: item.album,
      no: card.no,
      front: card.front,
      member: card.member,
      rarity: card.rarity,
      status: "stored",
    });
    picked.push(owned);
    state.owned.push(owned);
  }
  persistPurchase({
    id: `PU_${Date.now()}`,
    kind: "purchase",
    status: "paid",
    purchasedOn: isoDate(),
    productId: item.id,
    productName: productName(item),
    artist: item.artist,
    album: item.album,
    count,
    price: item.price * count,
    cards: picked.map((card) => ({
      id: card.id,
      artist: card.artist,
      album: card.album,
      no: card.no,
      member: card.member || "",
    })),
  });
  state.tp -= item.price * count;
  persistWallet();
  state.reveal = picked;
  state.revealIndex = 0;
  beginOpen();
}

function beginOpen() {
  if (!CARD_DECK) {
    showPack();
    return;
  }
  state.sheet = null;
  state.openPhase = "deck";
  state.openCut = "idle";
  state.motionArmed = false;
  state.screen = "open";
  state.tab = "home";
  render();
}

// 셔플 화면(슬라이드 11·15·16): SKIP, [한 번 더 섞기 | 바로 오픈하기], 선택 뒤 중간 연출.
function cardDeck() {
  const count = state.reveal.length;
  const packs = DECK_FAN.map((spot, index) => `
    <button type="button" class="deck-card" data-deck-pick="${index}" style="--i:${index};--fan-x:${spot.x}px;--fan-y:${spot.y}px;--fan-r:${spot.r}deg" aria-label="포장 ${index + 1}">
      <span class="deck-spin">
        <img class="deck-face" src="${DECK_PACK}" alt="" draggable="false" />
        <span class="prism" aria-hidden="true"></span>
        <img class="deck-face back" src="${DECK_BACK}" alt="" draggable="false" />
      </span>
    </button>`).join("");
  return `
    ${openBar(count > 1 ? `${count}장 뽑기` : "")}
    <div class="deck-stage" data-deck>
      <p class="deck-hint" data-deck-hint>한 장을 선택하세요</p>
      <button class="deck-skip" type="button" data-open-skip>SKIP</button>
      <div class="deck" data-deck-cards>${packs}</div>
      <span class="deck-ring" aria-hidden="true"></span>
      <span class="deck-flash" aria-hidden="true"></span>
      <div class="deck-actions">
        <button class="ghost deck-again" type="button" data-deck-again><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>한 번 더 섞기</button>
        <button class="primary deck-direct" type="button" data-deck-direct>바로 오픈하기</button>
      </div>
      <img class="deck-cover" src="${DECK_PACK}" alt="" draggable="false" />
    </div>
  `;
}

function deckCardAt(deck, clientX, clientY) {
  const cards = [...deck.querySelectorAll(".deck-card")].sort((a, b) => {
    const za = Number(getComputedStyle(a).zIndex) || 0;
    const zb = Number(getComputedStyle(b).zIndex) || 0;
    return zb - za;
  });
  return cards.find((card) => {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const parent = card.offsetParent;
    if (!width || !height || !parent) return false;
    const parentBox = parent.getBoundingClientRect();
    const origin = getComputedStyle(card).transformOrigin.split(" ");
    const originX = parseFloat(origin[0]) || width / 2;
    const originY = parseFloat(origin[1]) || height / 2;
    const matrix = new DOMMatrix(getComputedStyle(card).transform);
    const inverse = matrix.inverse();
    if (!inverse) return false;
    const local = inverse.transformPoint(new DOMPoint(
      clientX - (parentBox.left + card.offsetLeft + originX),
      clientY - (parentBox.top + card.offsetTop + originY),
    ));
    const x = local.x + originX;
    const y = local.y + originY;
    return x >= width * DECK_HIT.x0 && x <= width * DECK_HIT.x1
      && y >= height * DECK_HIT.y0 && y <= height * DECK_HIT.y1;
  }) || null;
}

function armDeck() {
  const stage = document.querySelector("[data-deck]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  const deck = stage.querySelector("[data-deck-cards]");
  const hint = stage.querySelector("[data-deck-hint]");
  const cards = [...deck.querySelectorAll(".deck-card")];
  const row = [-120, -60, 0, 60, 120];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stops = [];
  let seats = cards.map((_, index) => index);
  const later = (fn, ms) => {
    stops.push(window.setTimeout(fn, ms));
  };
  const clearInline = () => {
    cards.forEach((card) => {
      card.style.removeProperty("--x");
      card.style.removeProperty("--y");
      card.style.zIndex = "";
    });
  };
  const layout = (lifted) => {
    cards.forEach((card, index) => {
      const moving = lifted?.has(index);
      card.style.setProperty("--x", `${row[seats[index]]}px`);
      card.style.setProperty("--y", moving ? "-30px" : "0px");
      card.style.zIndex = moving ? "8" : String(seats[index] + 1);
    });
  };
  const swap = () => {
    let first = Math.floor(Math.random() * cards.length);
    let second = Math.floor(Math.random() * (cards.length - 1));
    if (second >= first) second += 1;
    const seat = seats[first];
    seats[first] = seats[second];
    seats[second] = seat;
    layout(new Set([first, second]));
    cards[first].style.zIndex = "9";
    cards[second].style.zIndex = "7";
    later(() => layout(null), 340);
  };
  const gather = () => {
    cards.forEach((card, index) => {
      card.style.setProperty("--x", `${(index - 2) * 4}px`);
      card.style.setProperty("--y", `${(2 - index) * 3}px`);
      card.style.zIndex = String(index + 1);
    });
  };
  const playShuffle = () => {
    stops.forEach((id) => window.clearTimeout(id));
    stops = [];
    deck.classList.remove("is-fan", "is-shuffle", "is-picked");
    stage.classList.remove("is-cover");
    seats = cards.map((_, index) => index);
    clearInline();
    if (hint) hint.textContent = "한 장을 선택하세요";
    if (reduced) {
      deck.classList.add("is-fan");
      return;
    }
    cards.forEach((card, index) => {
      card.style.setProperty("--x", `${row[index]}px`);
      card.style.setProperty("--y", "0px");
    });
    void deck.offsetWidth;
    deck.classList.add("is-shuffle");
    [420, 940, 1460, 1980].forEach((ms) => later(swap, ms));
    later(gather, 2460);
    later(() => {
      if (!stage.isConnected) return;
      clearInline();
      deck.classList.remove("is-shuffle");
      deck.classList.add("is-fan");
    }, 2920);
  };
  playShuffle();
  // 중간 연출(슬라이드 16): 나머지 넉 장이 X자 네 방향으로 퍼지고, 고른 포장이 가운데서 커지며 돈다.
  const corners = [[-104, -176], [104, -176], [-104, 176], [104, 176]];
  const choose = (pick, direct = false) => {
    if (!deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
    deck.classList.add("is-picked");
    pick.classList.add("is-choice");
    let seat = 0;
    cards.forEach((card) => {
      if (card === pick) return;
      const [x, y] = corners[seat];
      seat += 1;
      card.style.setProperty("--sx", `${x}px`);
      card.style.setProperty("--sy", `${y}px`);
    });
    if (hint) hint.textContent = "선택 완료";
    if (!reduced) {
      stage.classList.add("is-burst");
      const prism = pick.querySelector(".prism");
      const shine = () => {
        if (!prism || !stage.isConnected) return;
        prism.classList.remove("is-shine");
        void prism.offsetWidth;
        prism.classList.add("is-shine");
      };
      later(shine, 200);
      later(shine, 700);
    }
    later(() => {
      if (!stage.isConnected) return;
      if (direct) showSpread();
      else showPack();
    }, reduced ? 240 : 1500);
  };
  stage.addEventListener("click", (event) => {
    const again = event.target.closest("[data-deck-again]");
    if (again) {
      event.stopPropagation();
      if (!deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
      playShuffle();
      return;
    }
    // 바로 오픈하기: 무작위 한 장을 고른 뒤 찢기 없이 바로 공개한다.
    // 1장이면 결과로, 5장이면 2-1-2 펼침 화면(슬라이드 16)으로 간다.
    const direct = event.target.closest("[data-deck-direct]");
    if (direct) {
      event.stopPropagation();
      if (!deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
      choose(cards[Math.floor(Math.random() * cards.length)], true);
      return;
    }
    if (event.target.closest("[data-open-skip]")) return;
    const pick = deckCardAt(deck, event.clientX, event.clientY);
    if (!pick || !deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
    event.stopPropagation();
    choose(pick);
  });
}

// 찢기 없이 공개: 1장은 결과, 여러 장은 2-1-2 펼침 화면.
function showSpread() {
  state.sheet = null;
  state.revealIndex = 0;
  if (state.reveal.length < 2) {
    finishOpen();
    return;
  }
  state.openPhase = "spread";
  state.openCut = "idle";
  state.motionArmed = false;
  state.screen = "open";
  state.tab = "home";
  render();
}

function cardSpread() {
  const count = state.reveal.length;
  const cards = state.reveal.slice(0, SPREAD_GRID.length).map((card, index) => {
    const spot = SPREAD_GRID[index];
    return `
      <div class="spread-card" style="--i:${index};--sx:${spot.x}px;--sy:${spot.y}px">
        <div class="spread-spin">
          <img class="spread-face back" src="${DECK_PACK}" alt="" draggable="false" />
          <span class="spread-face front"><img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" /><span class="prism" aria-hidden="true"></span></span>
        </div>
        <small>${esc(card.no)}</small>
      </div>`;
  }).join("");
  return `
    ${openBar(`${count}장 뽑기`)}
    <div class="spread-stage" data-spread>
      <p class="deck-hint">뽑은 카드 ${count}장</p>
      <div class="spread">${cards}</div>
      <button class="primary open-ok spread-ok" type="button" data-open-ok>OK</button>
    </div>
  `;
}

function armSpread() {
  const stage = document.querySelector("[data-spread]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = [...stage.querySelectorAll(".spread-card")];
  const flips = cards.length;
  if (reduced) {
    stage.classList.add("is-done");
    return;
  }
  requestAnimationFrame(() => stage.classList.add("is-live"));
  window.setTimeout(() => {
    if (stage.isConnected) stage.classList.add("is-done");
  }, 700 + flips * 320 + 500);
}

function showPack() {
  const go = () => {
    state.sheet = null;
    state.openPhase = "pack";
    state.openCut = "idle";
    state.motionArmed = false;
    state.screen = "open";
    state.tab = "home";
    render();
  };
  const pack = new Image();
  pack.src = new URL(OPEN_BASE, document.baseURI).href;
  if (pack.complete && pack.naturalWidth) {
    go();
    return;
  }
  const ready = typeof pack.decode === "function" ? pack.decode() : new Promise((resolve, reject) => {
    pack.onload = resolve;
    pack.onerror = reject;
  });
  ready.then(go, go);
}

function blurFronts() {
  document.querySelectorAll("[data-front]").forEach((img) => {
    const sourceUrl = img.dataset.front;
    img.removeAttribute("data-front");
    const source = new Image();
    source.onload = () => {
      if (!img.isConnected) return;
      const width = 180;
      const height = Math.round((width * 85) / 55);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const pad = 16;
      ctx.filter = "blur(8px)";
      ctx.drawImage(source, -pad, -pad, width + pad * 2, height + pad * 2);
      ctx.filter = "none";
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, width, height);
      img.src = canvas.toDataURL("image/jpeg", 0.82);
    };
    source.src = sourceUrl;
  });
}

function protectFronts() {
  document.querySelectorAll("[data-protect]").forEach((img) => {
    const sourceUrl = img.dataset.protect;
    const mark = img.dataset.mark || "TOMATOK";
    img.removeAttribute("data-protect");
    const source = new Image();
    source.onload = () => {
      if (!img.isConnected) return;
      const width = 540;
      const height = Math.max(1, Math.round(width * (source.naturalHeight / source.naturalWidth)));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(source, 0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-0.45);
      ctx.textAlign = "center";
      ctx.font = "600 28px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.34)";
      for (let y = -height; y <= height; y += 120) {
        for (let x = -width; x <= width; x += 220) {
          ctx.fillText("TOMATOK", x, y);
          ctx.font = "500 16px sans-serif";
          ctx.fillText(mark, x, y + 24);
          ctx.font = "600 28px sans-serif";
        }
      }
      ctx.restore();
      img.src = canvas.toDataURL("image/jpeg", 0.82);
    };
    source.src = sourceUrl;
  });
}

function shieldFronts(hidden) {
  document.querySelectorAll(".guard").forEach((img) => {
    img.style.visibility = hidden ? "hidden" : "";
  });
}

function previewCard(productId, index) {
  const item = product(productId);
  const card = item.cards[index];
  return {
    artist: item.artist,
    album: item.album,
    no: card.no,
    front: card.front,
    member: card.member,
    rarity: card.rarity,
    status: "stored",
    id: `UC_PREVIEW_${index + 1}`,
  };
}

const ADMIN_PAGES = {
  "admin-dash": "dash",
  "admin-pack": "pack",
  "admin-cards": "cards",
  "admin-banner": "banner",
  "admin-orders": "orders",
  "admin-ship": "ship",
  "admin-track": "track",
  "admin-policy": "policy",
  "admin-notice": "notice",
};

function applyScene(id) {
  if (id === "admin" || ADMIN_PAGES[id]) {
    state.board = "admin";
    state.adminScene = ADMIN_PAGES[id] ? id : "admin-dash";
    state.sheet = null;
    document.body.classList.remove("admin-board");
    openAdmin(ADMIN_PAGES[state.adminScene]);
    paintBoard();
    return;
  }
  state.board = "service";
  state.adminScene = "";
  document.body.classList.remove("admin-board");
  closeAdmin();
  state.owned = seedOwned();
  state.shipments = seedShipments(state.owned);
  state.focusTrack = "all";
  state.shipmentId = "";
  state.searchOpen = false;
  state.query = "";
  state.catalogQuery = "";
  state.catalogSearch = false;
  state.catalogFilter = "all";
  state.catalogKind = "all";
  state.profile = "";
  state.profileFrom = "";
  state.menuOpen = false;
  state.menuGroups = { mypage: false, artist: false };
  state.pickMode = false;
  state.picked = [];
  state.shipQty = 1;
  state.openPhase = "card";
  state.motionArmed = false;
  state.sheet = null;
  state.screen = "home";
  state.tab = "home";
  state.focusStatus = null;
  state.albumArtist = "all";
  state.productId = "blackpink-jump";
  state.reveal = [];
  state.revealIndex = 0;
  state.balance = 100000;
  state.tp = TP_SEED;
  state.walletConnected = false;
  state.walletModal = false;
  state.cartModal = false;
  state.region = "";
  state.country = "";
  state.addressId = "";
  state.receiver = "";
  state.phone = "";
  state.email = "";
  state.postcode = "";
  state.address = "";
  state.addressDetail = "";
  state.city = "";
  state.province = "";
  state.cardId = "";
  state.postcodeOpen = false;
  state.postcodeError = false;
  if (id === "detail" || id === "pay" || id === "pay5") {
    state.screen = "detail";
    if (id === "pay") state.sheet = 1;
    if (id === "pay5") state.sheet = 5;
  } else if (id === "result") {
    state.screen = "result";
    state.reveal = [previewCard("blackpink-jump", 1)];
  } else if (id === "five") {
    state.screen = "result";
    state.reveal = product("blackpink-jump").cards.map((_, index) => previewCard("blackpink-jump", index));
  } else if (id === "album") {
    state.tab = "album";
    state.screen = "album";
  } else if (id === "mypage") {
    state.tab = "mypage";
    state.screen = "mypage";
  } else if (id === "ship") {
    state.tab = "mypage";
    state.screen = "ship";
  } else if (id === "stored") {
    state.tab = "album";
    state.screen = "album";
    state.focusStatus = "stored";
  } else if (id === "track" || TRACK.includes(id)) {
    state.tab = "mypage";
    state.screen = "track";
    state.focusTrack = id === "track" ? "all" : id;
    state.shipmentId = "";
  }
  render();
}

function openAdmin(menu = "dash") {
  document.body.classList.add("admin-view");
  let frame = document.querySelector("#admin-frame");
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "admin-frame";
    frame.title = "포토카드 관리자";
    document.querySelector("#stage").append(frame);
  }
  const tell = () => {
    frame.contentWindow?.postMessage({ source: "photocard-preview", screen: menu }, "*");
  };
  frame.onload = tell;
  if (!frame.getAttribute("src")) frame.src = `../register/index.html?v=63&menu=${encodeURIComponent(menu)}`;
  else tell();
}

function closeAdmin() {
  document.body.classList.remove("admin-view");
}

function currentScene() {
  if (state.board === "admin" && state.adminScene) return state.adminScene;
  if (state.screen === "admin") return "admin";
  if (state.sheet === 1 && state.screen === "detail") return "pay";
  if (state.sheet === 5 && state.screen === "detail") return "pay5";
  if (state.screen === "card") return "card";
  if (state.screen === "detail") return "detail";
  if (state.screen === "open" || state.screen === "result") return state.reveal.length > 1 ? "five" : "result";
  if (state.tab === "track" || state.screen === "track") return TRACK.includes(state.focusTrack) ? state.focusTrack : "track";
  if (state.tab === "ship" || state.screen === "ship") return "ship";
  if (state.screen === "mypage" || state.screen === "wished") return "mypage";
  if (state.screen === "album" || state.tab === "album") return state.focusStatus === "stored" ? "stored" : "album";
  if (state.screen === "artist" || state.screen === "artists") return "artist";
  return "home";
}

const NOTES = {
  "admin-dash": "",
  "admin-pack": `<h2>상품관리</h2><p>랜덤팩의 판매와 노출을 정해요.</p>`,
  "admin-cards": `<h2>카드관리</h2><p>팩 안 카드의 앞뒷면과 재고를 정해요.</p>`,
  "admin-banner": `<h2>배너관리</h2><p>홈 배너의 이미지와 순서를 정해요.</p>`,
  "admin-orders": `<h2>주문관리</h2><p>배송 요청과 송장 상태를 봐요.</p>`,
  "admin-policy": `<h2>배송정책</h2><p>나라와 무게구간 배송비를 적어요. 비우면 앱은 미정이에요.</p>`,
  "admin-notice": `<h2>공지관리</h2><p>앱 공지를 등록해요.</p>`,
  home: `<h2>홈</h2><p>가수 프로필과 노출된 상품이 나와요. 카드 앞면은 여기 없어요.</p>`,
  detail: `<h2>상세</h2><p>이 팩을 바로 뽑는 화면이에요.</p>`,
  pay: `<h2>1장 결제</h2><p>같은 팩 1장을 TP로 결제해요. 잔액이 부족하면 안 돼요.</p>`,
  pay5: `<h2>5장 결제</h2><p>같은 팩 5장을 한 번에 결제해요. 재고가 5장 미만이면 막혀요.</p>`,
  result: `<h2>결과</h2><p>포장을 연 뒤에 카드 앞면이 나와요.</p>`,
  five: `<h2>5장 연속</h2><p>같은 팩 5장을 한 장씩 이어서 열어요.</p>`,
  mypage: `<h2>마이페이지</h2><p>찜, 배송, 배송 현황으로 가는 메뉴예요.</p>`,
  album: `<h2>보유 카드</h2><p>가진 카드예요. 같은 카드는 장수로 묶여요.</p>`,
  card: `<h2>보유 카드</h2><p>카드 한 장의 앞뒷면과 상태예요.</p>`,
  stored: `<h2>보관 중</h2><p>뽑고 아직 배송 전인 카드예요.</p>`,
  ship: `<h2>배송바구니</h2><p>뽑은 카드를 모아 배송비를 내는 화면이에요.</p>`,
  track: `<h2>배송 현황</h2><p>배송 한 건의 요청, 출고, 배송, 수령이에요.</p>`,
  shipping_requested: `<h2>배송 요청 완료</h2><p>배송비를 낸 직후예요. 송장은 아직 없어요.</p>`,
  preparing: `<h2>출고 준비</h2><p>출고 준비 중인 배송이에요.</p>`,
  shipped: `<h2>배송 중</h2><p>송장이 등록된 배송이에요.</p>`,
  delivered: `<h2>수령</h2><p>받은 배송이에요.</p>`,
  artist: `<h2>가수 상품</h2><p>그 가수의 상품만 나와요.</p>`,
  "sale-on": `<h2>판매중</h2><p>목록에 가격이 보이고 뽑을 수 있어요.</p>`,
  "sale-out": `<h2>품절</h2><p>목록에는 있지만 뽑기는 막혀요.</p>`,
  "sale-soon": `<h2>입고예정</h2><p>목록에는 있지만 아직 뽑을 수 없어요.</p>`,
  "sale-draft": `<h2>등록중</h2><p>앱 목록에 안 나와요.</p>`,
  "ship-requested": `<h2>배송 요청 완료</h2><p>배송비를 낸 직후예요. 다음은 출고 준비예요.</p>`,
  "ship-preparing": `<h2>출고 준비</h2><p>송장을 적은 뒤에 배송 중으로 넘겨요.</p>`,
  "ship-shipped": `<h2>배송 중</h2><p>송장이 등록된 상태예요.</p>`,
  "ship-delivered": `<h2>수령</h2><p>받은 뒤예요. 다음 단계는 없어요.</p>`,
};

function loadPostcode(done) {
  if (window.daum && window.daum.Postcode) {
    done();
    return;
  }
  const existing = document.querySelector("script[data-daum-postcode]");
  if (existing) {
    existing.addEventListener("load", done, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  script.dataset.daumPostcode = "1";
  script.onload = done;
  script.onerror = () => {
    state.postcodeError = true;
    const box = document.querySelector("#postcode-box");
    if (box) box.insertAdjacentHTML("afterend", `<p class="notice">우편번호 검색을 불러오지 못했어요.</p>`);
  };
  document.head.appendChild(script);
}

function mountPostcode() {
  const box = document.querySelector("#postcode-box");
  if (!box || !state.postcodeOpen) return;
  loadPostcode(() => {
    if (!state.postcodeOpen || !window.daum || !window.daum.Postcode) return;
    const current = document.querySelector("#postcode-box");
    if (!current) return;
    current.innerHTML = "";
    new window.daum.Postcode({
      oncomplete(data) {
        state.postcode = data.zonecode;
        state.address = data.roadAddress || data.autoRoadAddress || data.jibunAddress;
        state.postcodeOpen = false;
        render();
      },
      width: "100%",
      height: "100%",
    }).embed(current);
  });
}

function playFireworks(stage) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const video = stage.querySelector("[data-fireworks]");
  if (!video || stage.dataset.fire) return;
  stage.dataset.fire = "1";
  stage.classList.add("is-fire");
  video.loop = true;
  video.muted = true;
  const started = video.play();
  if (started && typeof started.catch === "function") started.catch(() => {});
}

function finishOpen() {
  state.openCut = "completed";
  state.openPhase = "card";
  state.screen = "result";
  render();
}

function playBurst(stage, done) {
  const video = stage.querySelector("[data-open-burst]");
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    video?.pause();
    done();
  };
  if (!video || !stage.isConnected) {
    window.setTimeout(finish, 1000);
    return;
  }
  video.playbackRate = 2;
  video.classList.add("is-on");
  const trimEnd = () => {
    if (settled || !stage.isConnected) return;
    if (video.currentTime >= 4) {
      finish();
      return;
    }
    requestAnimationFrame(trimEnd);
  };
  video.addEventListener("ended", finish, { once: true });
  video.addEventListener("error", () => window.setTimeout(finish, 1000), { once: true });
  window.setTimeout(finish, 5000);
  const started = video.play();
  const arm = () => {
    video.playbackRate = 2;
    requestAnimationFrame(trimEnd);
  };
  if (started && typeof started.then === "function") started.then(arm).catch(() => window.setTimeout(finish, 1000));
  else arm();
}

function crackSparks(stage, burst) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return;
  const seams = [
    (t) => [0.514, 0.24 + t * 0.66],
    (t) => [0.16 + t * 0.7, 0.24],
    (t) => [0.1 + t * 0.82, 0.62],
  ];
  const count = burst ? 28 : 14;
  for (let index = 0; index < count; index += 1) {
    const [x, y] = seams[index % seams.length](Math.random());
    const spark = document.createElement("i");
    const angle = burst ? Math.random() * 360 : (Math.random() < 0.5 ? -1 : 1) * (68 + Math.random() * 36);
    spark.className = "tear-spark is-hot";
    spark.style.left = `${x * 100}%`;
    spark.style.top = `${y * 100}%`;
    spark.style.setProperty("--rot", `${angle}deg`);
    spark.style.setProperty("--dist", burst ? `${48 + Math.random() * 120}px` : `${5 + Math.random() * 14}px`);
    spark.style.setProperty("--len", `${8 + Math.random() * 14}px`);
    spark.style.animationDuration = burst ? `${0.16 + Math.random() * 0.18}s` : `${0.07 + Math.random() * 0.08}s`;
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
    stack.appendChild(spark);
  }
}

function rumblePieces(stage) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticks = 0;
  const timer = window.setInterval(() => {
    if (!stage.isConnected) {
      window.clearInterval(timer);
      return;
    }
    crackSparks(stage, false);
    ticks += 1;
    if (ticks < 11) return;
    window.clearInterval(timer);
    crackSparks(stage, true);
    window.setTimeout(() => {
      if (stage.isConnected) crackSparks(stage, true);
    }, 80);
  }, 50);
}

function armFloatCard(fly) {
  if (!fly || fly.dataset.float) return;
  fly.dataset.float = "1";
  let originX = 0;
  let originYaw = 22;
  let span = 196;
  let lastShine = 22;
  const shine = () => {
    const prism = fly.querySelector(".prism");
    if (!prism) return;
    prism.classList.remove("is-shine");
    void prism.offsetWidth;
    prism.classList.add("is-shine");
  };
  const turn = (clientX) => {
    const yaw = originYaw + ((clientX - originX) / span) * 360;
    fly.style.setProperty("--spin-y", `${yaw}deg`);
    if (Math.abs(yaw - lastShine) > 40) {
      shine();
      lastShine = yaw;
    }
  };
  fly.addEventListener("pointerdown", (event) => {
    if (!fly.classList.contains("is-front")) return;
    try { fly.setPointerCapture(event.pointerId); } catch (error) { /* 합성 이벤트 */ }
    const current = parseFloat(fly.style.getPropertyValue("--spin-y"));
    originYaw = Number.isFinite(current) ? current : 22;
    originX = event.clientX;
    span = fly.getBoundingClientRect().width || fly.offsetWidth || 196;
    fly.classList.add("is-float", "is-nudge", "is-spun");
    lastShine = originYaw;
    shine();
  });
  fly.addEventListener("pointermove", (event) => {
    if (!fly.classList.contains("is-nudge")) return;
    turn(event.clientX);
  });
  const release = () => fly.classList.remove("is-nudge");
  fly.addEventListener("pointerup", release);
  fly.addEventListener("pointercancel", release);
}

function launchCard(stage) {
  const stack = stage.querySelector(".open-stack");
  const fly = stage.querySelector(".fly-card");
  stack?.classList.add(TEAR_METHOD === 1 ? "is-shell" : "is-scatter");
  if (TEAR_METHOD !== 1) {
    stage.dataset.sparkStop = "1";
    stage.querySelectorAll(".tear-spark").forEach((spark) => spark.remove());
    rumblePieces(stage);
  }
  const scatter = Boolean(stack?.classList.contains("is-scatter"));
  let started = false;
  const beginVideo = () => {
    if (started) return;
    started = true;
    playBurst(stage, () => {
      if (!stage.isConnected) return;
      finishOpen();
    });
  };
  if (scatter) playFireworks(stage);
  else {
    window.setTimeout(() => {
      if (!started && stage.isConnected) beginVideo();
    }, 4200);
  }
  if (!fly || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fly?.classList.add("is-front");
    if (scatter) {
      stage.classList.add("is-ready");
      if (fly) armFloatCard(fly);
    } else {
      window.setTimeout(() => {
        if (!stage.isConnected) return;
        finishOpen();
      }, 1000);
    }
    return;
  }
  fly.addEventListener("animationend", (event) => {
    if (event.animationName === "card-hang") fly.classList.add("is-float");
    if (event.animationName !== "card-rise" && event.animationName !== "card-from-pack") return;
    fly.classList.remove("is-rise");
    fly.classList.add("is-front");
    if (scatter) {
      armFloatCard(fly);
      stage.classList.add("is-ready");
    }
    else {
      window.setTimeout(() => {
        if (stage.isConnected) beginVideo();
      }, 1000);
    }
  });
  if (stack?.classList.contains("is-scatter")) {
    const stageBox = stage.getBoundingClientRect();
    const stackBox = stack.getBoundingClientRect();
    const cardH = fly.offsetHeight;
    const top = stackBox.top - stageBox.top + stackBox.height / 2 - cardH / 2;
    fly.style.setProperty("--back-top", `${top}px`);
  }
  fly.classList.add("is-rise");
}

function runOpenCut(stage, startFrame) {
  const last = stage.querySelectorAll(".open-over").length;
  const from = Math.max(0, Math.min(last, startFrame));
  if (from >= last) {
    keepTearSparks(stage);
    launchCard(stage);
    return;
  }
  const started = performance.now();
  let shown = from;
  keepTearSparks(stage);
  const frame = (now) => {
    if (!stage.isConnected) return;
    const cut = openEase(now - started, OPEN_CUT.cut[0], OPEN_CUT.cut[1]);
    const next = from + Math.round((last - from) * cut);
    showOpenFrame(stage, next);
    if (next > shown) {
      tearSparks(stage, next);
      shown = next;
    }
    if (cut < 1) {
      requestAnimationFrame(frame);
      return;
    }
    launchCard(stage);
  };
  requestAnimationFrame(frame);
}

const PACK_FACE = { left: 77 / 659, top: 63 / 1024, right: 579 / 659, bottom: 992 / 1024 };
const PACK_REACH = 0.5;
const TEAR_EDGE = 0.05;

function packBox(stage) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return null;
  const box = stack.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  return box;
}

function inPack(box, clientX, clientY, reach) {
  const x = (clientX - box.left) / box.width;
  const y = (clientY - box.top) / box.height;
  const padX = (PACK_FACE.right - PACK_FACE.left) * reach;
  const padY = (PACK_FACE.bottom - PACK_FACE.top) * reach;
  return x >= PACK_FACE.left - padX && x <= PACK_FACE.right + padX
    && y >= PACK_FACE.top - padY && y <= PACK_FACE.bottom + padY;
}

function tearBand() {
  const span = PACK_FACE.bottom - PACK_FACE.top;
  return {
    top: PACK_FACE.top + span * TEAR_EDGE,
    bottom: PACK_FACE.bottom - span * TEAR_EDGE,
  };
}

function inTearBand(box, clientY) {
  const y = (clientY - box.top) / box.height;
  const band = tearBand();
  return y >= band.top && y <= band.bottom;
}

function tearFromEdge(box, clientX, clientY, vertical) {
  const reach = 0.28;
  if (vertical) {
    const band = tearBand();
    const y = (clientY - box.top) / box.height;
    const edge = (band.bottom - band.top) * reach;
    return y <= band.top + edge || y >= band.bottom - edge;
  }
  const x = (clientX - box.left) / box.width;
  const face = PACK_FACE.right - PACK_FACE.left;
  const edge = face * reach;
  return x <= PACK_FACE.left + edge || x >= PACK_FACE.right - edge;
}

function placeTear(stage, clientX, clientY) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return;
  const box = stack.getBoundingClientRect();
  const anchor = 85 / 259;
  const band = tearBand();
  const mid = stage.classList.contains("is-mid");
  if (stage.classList.contains("is-vert")) {
    const span = PACK_FACE.right - PACK_FACE.left;
    const minX = box.width * (PACK_FACE.left + span * TEAR_EDGE);
    const maxX = box.width * (PACK_FACE.right - span * TEAR_EDGE);
    const x = Math.max(minX, Math.min(maxX, clientX - box.left));
    const long = box.height;
    const thick = long * (259 / 985);
    stack.style.setProperty("--tear-left", `${x}px`);
    stack.style.setProperty("--tear-long", `${long}px`);
    stack.style.setProperty("--tear-thick", `${thick}px`);
    if (!mid) {
      const top = stage.classList.contains("is-up") ? box.height - anchor * thick : -anchor * thick;
      stack.style.setProperty("--tear-top", `${top}px`);
      stage.dataset.tearY = String((clientY - box.top) / box.height);
      return;
    }
    const minY = box.height * band.top;
    const maxY = box.height * band.bottom;
    const originY = Math.max(minY, Math.min(maxY, clientY - box.top));
    stack.style.setProperty("--tear-top", `${originY - anchor * thick}px`);
    stack.style.setProperty("--tear-origin-y", `${originY}px`);
    stack.style.setProperty("--tear-span", "0px");
    stage.dataset.tearY = String(originY / box.height);
    return;
  }
  const stripH = box.width * (259 / 985);
  const minY = box.height * band.top;
  const maxY = box.height * band.bottom;
  const local = Math.max(minY, Math.min(maxY, clientY - box.top));
  stack.style.setProperty("--tear-top", `${local - stripH * anchor}px`);
  stage.dataset.tearY = String(local / box.height);
  if (!mid) return;
  const originX = Math.max(box.width * PACK_FACE.left, Math.min(box.width * PACK_FACE.right, clientX - box.left));
  stack.style.setProperty("--tear-origin-x", `${originX}px`);
  stack.style.setProperty("--tear-span", "0px");
}

function growTear(stage, clientX, clientY) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return;
  const box = stack.getBoundingClientRect();
  if (!box.width || !box.height) return;
  let span = parseFloat(stack.style.getPropertyValue("--tear-span")) || 0;
  if (stage.classList.contains("is-vert")) {
    const originY = parseFloat(stack.style.getPropertyValue("--tear-origin-y")) || 0;
    const y = clientY - box.top;
    const up = stage.classList.contains("is-up");
    const band = tearBand();
    const travel = up ? originY - y : y - originY;
    const limit = up ? originY - box.height * band.top : box.height * band.bottom - originY;
    span = Math.max(span, Math.min(Math.max(0, limit), Math.max(0, travel)));
  } else {
    const originX = parseFloat(stack.style.getPropertyValue("--tear-origin-x")) || 0;
    const x = clientX - box.left;
    const faceMin = box.width * PACK_FACE.left;
    const faceMax = box.width * PACK_FACE.right;
    const rtl = stage.classList.contains("is-rtl");
    const travel = rtl ? originX - x : x - originX;
    const limit = rtl ? originX - faceMin : faceMax - originX;
    span = Math.max(span, Math.min(Math.max(0, limit), Math.max(0, travel)));
  }
  stack.style.setProperty("--tear-span", `${span}px`);
}

let openCutListen = null;

function armOpenCut() {
  const stage = document.querySelector("[data-open-stage]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  openCutListen?.abort();
  openCutListen = new AbortController();
  const signal = openCutListen.signal;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let pending = false;
  const beginTear = (event, box) => {
    pending = false;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
    if (TEAR_METHOD === 2) {
      stage.classList.remove("is-rtl", "is-vert", "is-up", "is-mid");
      delete stage.dataset.tearAxis;
      placeTear(stage, event.clientX, event.clientY);
    } else {
      stage.classList.toggle("is-rtl", event.clientX >= box.left + box.width / 2);
      delete stage.dataset.tearY;
    }
    const origin = packBox(stage);
    if (origin) {
      stage.dataset.fingerX = String((event.clientX - origin.left) / origin.width);
      stage.dataset.fingerY = String((event.clientY - origin.top) / origin.height);
    }
    stage.classList.add("is-touching");
    keepTearSparks(stage);
  };
  const listen = (type, handler) => document.addEventListener(type, handler, { signal });
  listen("pointerdown", (event) => {
    if (!stage.isConnected || state.openCut !== "idle") return;
    // 헤더(←)처럼 무대 밖에서 시작한 터치는 잡지 않는다. 포인터를 잡으면 버튼 클릭이 사라진다.
    if (!stage.contains(event.target)) return;
    const box = packBox(stage);
    if (!box) return;
    if (TEAR_METHOD === 1) {
      beginTear(event, box);
      return;
    }
    try { stage.setPointerCapture(event.pointerId); } catch (error) { /* 합성 이벤트 */ }
    if (inPack(box, event.clientX, event.clientY, PACK_REACH) && inTearBand(box, event.clientY)) {
      beginTear(event, box);
      return;
    }
    pending = true;
  });
  listen("pointermove", (event) => {
    if (pending && !tracking && state.openCut === "idle") {
      const box = packBox(stage);
      if (box && inPack(box, event.clientX, event.clientY, 0) && inTearBand(box, event.clientY)) beginTear(event, box);
    }
    if (!tracking || state.openCut !== "idle") return;
    const box = packBox(stage);
    if (box) {
      stage.dataset.fingerX = String((event.clientX - box.left) / box.width);
      stage.dataset.fingerY = String((event.clientY - box.top) / box.height);
    }
    if (TEAR_METHOD === 2) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!stage.dataset.tearAxis && dragSpan(dx, dy) >= 10) {
        const vertical = Math.abs(dy) > Math.abs(dx);
        const fromEdge = box ? tearFromEdge(box, startX, startY, vertical) : false;
        stage.dataset.tearAxis = vertical ? "v" : "h";
        stage.classList.toggle("is-vert", vertical);
        stage.classList.toggle("is-up", vertical && dy < 0);
        stage.classList.toggle("is-mid", !fromEdge);
        stage.classList.toggle("is-rtl", !vertical && (fromEdge ? startX >= box.left + box.width / 2 : dx < 0));
        placeTear(stage, startX, startY);
      }
      if (stage.dataset.tearAxis && stage.classList.contains("is-mid")) growTear(stage, event.clientX, event.clientY);
    }
    const frame = TEAR_METHOD === 2 && !stage.dataset.tearAxis
      ? 0
      : dragFrame(stage, dragSpan(event.clientX - startX, event.clientY - startY));
    showOpenFrame(stage, frame);
  });
  listen("pointerup", (event) => {
    if (pending && !tracking) pending = false;
    if (!tracking || state.openCut !== "idle") return;
    tracking = false;
    stage.classList.remove("is-touching");
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const span = dragSpan(dx, dy);
    if (span < OPEN_CUT.minDistance) {
      showOpenFrame(stage, 0);
      stage.classList.remove("is-rtl", "is-vert", "is-up", "is-mid");
      delete stage.dataset.tearAxis;
      stage.querySelectorAll(".tear-spark").forEach((spark) => spark.remove());
      return;
    }
    const shown = dragFrame(stage, span);
    state.openCut = "cutting";
    stage.classList.add("is-opening");
    openHaptic("light");
    runOpenCut(stage, shown);
  });
  listen("pointercancel", () => {
    pending = false;
    tracking = false;
    stage.classList.remove("is-touching");
    if (state.openCut === "idle") {
      showOpenFrame(stage, 0);
      stage.classList.remove("is-rtl", "is-vert", "is-up", "is-mid");
      delete stage.dataset.tearAxis;
    }
  });
}

function armMotion() {
  if (state.openPhase !== "motion") {
    state.motionArmed = false;
    return;
  }
  if (state.motionArmed) return;
  state.motionArmed = true;
  window.setTimeout(() => {
    state.motionArmed = false;
    if (state.openPhase !== "motion") return;
    state.openPhase = "card";
    state.screen = "result";
    render();
  }, 4300);
}

function guideSection(title, item, key) {
  const lines = linesOf(item.guides?.[key], GUIDES[key]);
  return `
        <details class="guide">
          <summary>${title}<span class="guide-icon" aria-hidden="true"><span class="plus">${icon("plus")}</span><span class="minus">${icon("minus")}</span></span></summary>
          <ul>${lines.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
        </details>`;
}

function midBanners() {
  const mid = liveBanners("mid");
  if (mid?.length) {
    return mid.map((banner) => {
      const lines = bannerLines(banner.packId, banner.line1, banner.line2);
      return { open: banner.packId, image: banner.image, alt: lines.line1, ...lines };
    });
  }
  // 기본 중간 배너는 홈의 이용 방법 안내 배너(guideBanner)가 대신한다.
  return [];
}

function midSlide(banner) {
  const action = banner.nav ? `data-nav="${banner.nav}"` : `data-open="${esc(banner.open)}"`;
  const copy = banner.line1
    ? `<span class="mid-copy"><strong>${esc(banner.line1)}</strong><span>${esc(banner.line2)}</span></span>`
    : "";
  const photo = banner.line1 ? " is-photo" : "";
  return `<button type="button" class="mid-slide${photo}" ${action} aria-label="${esc(banner.alt)}"><img src="${banner.image}" alt="${esc(banner.alt)}" />${copy}</button>`;
}

function midTransform(index) {
  return `translateX(calc(44px - ${index} * (100cqi - 80px)))`;
}

function midBanner() {
  const banners = midBanners();
  if (!banners.length) return "";
  const loop = banners.length > 1;
  const slides = banners.map(midSlide).join("");
  const track = loop ? `${midSlide(banners.at(-1))}${slides}${midSlide(banners[0])}` : slides;
  const index = loop ? state.midIndex + 1 : 0;
  return `
    <div class="mid-banner">
      <div class="mid-viewport${loop ? "" : " is-single"}">
        <div class="mid-track" style="transform:${midTransform(index)}">${track}</div>
      </div>
    </div>`;
}

function bannerTransform(index) {
  return `translateX(calc(28px - ${index} * (100cqi - 48px)))`;
}

function placeBanner(index, animate) {
  const track = document.querySelector(".banner-track");
  if (!track) return;
  if (!animate) track.style.transition = "none";
  track.style.transform = bannerTransform(index);
  if (!animate) {
    track.offsetHeight;
    track.style.transition = "";
  }
}

function paintBannerDots() {
  document.querySelectorAll("[data-dot]").forEach((dot) => {
    dot.classList.toggle("on", Number(dot.dataset.dot) === state.bannerIndex);
  });
}

function moveBanner(index) {
  const count = eventBanners().length;
  if (count < 2) {
    state.bannerIndex = 0;
    placeBanner(0, true);
    paintBannerDots();
    return;
  }
  const next = (index + count) % count;
  const forwardWrap = state.bannerIndex === count - 1 && next === 0 && index > state.bannerIndex;
  const backWrap = state.bannerIndex === 0 && next === count - 1 && index < state.bannerIndex;
  state.bannerIndex = next;
  paintBannerDots();
  if (forwardWrap) {
    placeBanner(count + 1, true);
    const track = document.querySelector(".banner-track");
    track?.addEventListener("transitionend", () => placeBanner(1, false), { once: true });
    return;
  }
  if (backWrap) {
    placeBanner(0, true);
    const track = document.querySelector(".banner-track");
    track?.addEventListener("transitionend", () => placeBanner(count, false), { once: true });
    return;
  }
  placeBanner(next + 1, true);
}

function startBanner() {
  clearInterval(bannerTimer);
  const track = document.querySelector(".banner-track");
  if (!track || eventBanners().length < 2) return;
  const viewport = track.parentElement;
  viewport.onpointerdown = (event) => {
    bannerDrag = event.clientX;
  };
  viewport.onpointerup = (event) => {
    const delta = event.clientX - bannerDrag;
    if (Math.abs(delta) < 36) return;
    event.preventDefault();
    state.bannerSuppress = true;
    moveBanner(state.bannerIndex + (delta < 0 ? 1 : -1));
  };
  bannerTimer = setInterval(() => moveBanner(state.bannerIndex + 1), 3500);
}

function placeMid(index, animate) {
  const track = document.querySelector(".mid-track");
  if (!track) return;
  if (!animate) track.style.transition = "none";
  track.style.transform = midTransform(index);
  if (!animate) {
    track.offsetHeight;
    track.style.transition = "";
  }
}

function moveMid(index) {
  const count = midBanners().length;
  if (count < 2) {
    state.midIndex = 0;
    placeMid(0, true);
    return;
  }
  const next = (index + count) % count;
  const forwardWrap = state.midIndex === count - 1 && next === 0 && index > state.midIndex;
  const backWrap = state.midIndex === 0 && next === count - 1 && index < state.midIndex;
  state.midIndex = next;
  if (forwardWrap) {
    placeMid(count + 1, true);
    document.querySelector(".mid-track")?.addEventListener("transitionend", () => placeMid(1, false), { once: true });
    return;
  }
  if (backWrap) {
    placeMid(0, true);
    document.querySelector(".mid-track")?.addEventListener("transitionend", () => placeMid(count, false), { once: true });
    return;
  }
  placeMid(next + 1, true);
}

function startMidBanner() {
  clearInterval(midTimer);
  const track = document.querySelector(".mid-track");
  if (!track || midBanners().length < 2) return;
  const viewport = track.parentElement;
  viewport.onpointerdown = (event) => {
    midDrag = event.clientX;
  };
  viewport.onpointerup = (event) => {
    const delta = event.clientX - midDrag;
    if (Math.abs(delta) < 36) return;
    event.preventDefault();
    state.midSuppress = true;
    moveMid(state.midIndex + (delta < 0 ? 1 : -1));
  };
  midTimer = setInterval(() => moveMid(state.midIndex + 1), 3500);
}

function paintBoard() {
  const id = currentScene();
  document.querySelectorAll("[data-board]").forEach((button) => {
    button.classList.toggle("on", button.dataset.board === state.board);
  });
  document.querySelectorAll("[data-board-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.boardPanel !== state.board;
  });
  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.classList.toggle("on", button.dataset.scene === id);
  });
  const notes = document.querySelector("#notes");
  if (notes) {
    notes.innerHTML = NOTES[id] || "";
    notes.hidden = !notes.textContent.trim();
  }
}

function adminCanvas() {
  let node = document.querySelector("#admin-canvas");
  if (!node) {
    node = document.createElement("div");
    node.id = "admin-canvas";
    document.querySelector("#stage").append(node);
  }
  return node;
}

function adminRows(pairs) {
  return pairs.map(([label, value]) => `<div class="admin-row"><dt>${label}</dt><dd>${value}</dd></div>`).join("");
}

function paintAdmin() {
  const id = state.adminScene;
  const sale = { "sale-on": "on", "sale-out": "out", "sale-soon": "soon", "sale-draft": "draft" }[id];
  adminCanvas().innerHTML = sale ? adminSaleScreen(sale) : adminShipScreen(id.replace("ship-", ""));
}

function adminSaleScreen(sale) {
  const item = product("blackpink-jump");
  const titles = { on: "판매중", out: "품절", soon: "입고예정", draft: "등록중" };
  const listed = sale !== "draft";
  const badge = sale === "out" ? "품절" : sale === "soon" ? "입고예정" : "";
  const preview = listed
    ? `<div class="shelf">
        <div class="admin-tile tile">
          ${productThumbnail(item.cover, badge ? `<span class="sale-mark ${sale}">${badge}</span>` : "")}
          <span class="tile-who">${artistMark(item)}</span>
          <span class="tile-name">${esc(setTitle(item))}</span>
          <span class="tile-line">${esc(lineup(item.cards.length))}</span>
          <span class="tile-price">${tott(item.price)}</span>
        </div>
      </div>`
    : `<p class="admin-missing">NEW, ALL, 가수 상품에<br />이 상품이 없어요.</p>`;
  return `
    <section class="admin-screen">
      <p class="admin-kicker">고객 화면</p>
      <h2>${titles[sale]}</h2>
      ${preview}
    </section>`;
}

function adminShipScreen(status) {
  const view = {
    requested: ["배송 요청 완료", "없음", "출고 준비"],
    preparing: ["출고 준비", "", "배송 중"],
    shipped: ["배송 중", "등록됨", "수령"],
    delivered: ["수령", "등록됨", ""],
  }[status];
  const [title, tracking, action] = view;
  const trackingCell = status === "preparing"
    ? `<input type="text" placeholder="등록된 번호만" aria-label="송장번호" />`
    : esc(tracking);
  const button = action ? `<button class="primary" type="button">${action}</button>` : "";
  return `
    <section class="admin-screen">
      <p class="admin-kicker">배송 상태</p>
      <h2>${title}</h2>
      <section class="admin-order">
        <h3>SH_1</h3>
        <dl>
          ${adminRows([
            ["상태", title],
            ["국가", "대한민국"],
            ["수량", "3장"],
            ["배송비", "미정"],
            ["송장번호", trackingCell],
          ])}
        </dl>
        ${button}
        <table>
          <thead><tr><th>디자인</th><th>수량</th></tr></thead>
          <tbody>
            <tr><td>LE SSERAFIM EASY 01</td><td>1</td></tr>
            <tr><td>LE SSERAFIM EASY 02</td><td>1</td></tr>
            <tr><td>LE SSERAFIM EASY 03</td><td>1</td></tr>
          </tbody>
        </table>
      </section>
    </section>`;
}

let toastTimer = 0;

function toast(message) {
  state.toast = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 1600);
}

// ---- 포인트 교환 (슬라이드 19~21, mock) ----
// 교환은 토마톡 지갑에서 하기로 결정돼(2026-10-23) 앱 안에는 진입점이 없다. 화면 코드는 참고용으로 남긴다.

function pad2(value) {
  return String(value).padStart(2, "0");
}

function clockText(date = new Date()) {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function exchangeWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getFullYear()).slice(2)}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function tottText(amount) {
  const value = Number(amount) || 0;
  return Number.isInteger(value) ? value.toLocaleString("ko-KR") : value.toLocaleString("ko-KR", { maximumFractionDigits: 6 });
}

function tpText(amount) {
  return Math.round(Number(amount) || 0).toLocaleString("ko-KR");
}

function currentWallet() {
  return WALLETS[state.exWallet] || WALLETS[0];
}

// 1 TOTT = tottKrw 원 = tottKrw TP (TP는 원화 1:1)
function tpPerTott() {
  const value = Number(rates().tottKrw);
  return value > 0 ? value : 1;
}

function tottToTp(tott) {
  return Math.round((Number(tott) || 0) * tpPerTott());
}

function tpToTott(tp) {
  return (Number(tp) || 0) / tpPerTott();
}

function usdText(krw) {
  const { usdKrw } = rates();
  return `$${((Number(krw) || 0) / usdKrw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function wonText(krw) {
  return `₩${Math.round(Number(krw) || 0).toLocaleString("ko-KR")}`;
}

// 지갑 거래 내역: 교환, 포토카드 결제(TP 사용), mock 보내기·받기
function walletLedger() {
  const rows = [];
  state.exchanges.forEach((entry) => {
    rows.push({ kind: "exchange", at: entry.at, label: "교환", tott: -entry.tott, tp: entry.tp, status: "완료" });
  });
  readOrderStore().filter((order) => order.kind === "purchase").forEach((order) => {
    const price = Number(order.price);
    if (!Number.isFinite(price)) return;
    const at = /^\d{4}-\d{2}-\d{2}T/.test(String(order.purchasedOn)) ? order.purchasedOn : `${String(order.purchasedOn || "").slice(0, 10)}T12:00:00`;
    rows.push({ kind: "use", at, label: `사용 · ${order.productName || "포토카드"}`, tp: -price, status: "완료" });
  });
  rows.push(
    { kind: "receive", at: isoDate(7) + "T14:00:00", label: "받기", tott: 14.51136, status: "검증완료" },
    { kind: "send", at: isoDate(9) + "T14:00:00", label: "보내기", tott: -14.51136, status: "성공" },
  );
  return rows.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

function ledgerRow(row) {
  const glyph = row.kind === "exchange" ? "swap" : row.kind === "use" ? "coins" : row.kind === "receive" ? "arrowDown" : "arrowUp";
  const amounts = [];
  if (row.tott) amounts.push(`<strong class="${row.tott < 0 ? "minus" : "plus"}">${row.tott < 0 ? "- " : "+ "}${tottText(Math.abs(row.tott))} <small>TOTT</small></strong>`);
  if (row.tp) amounts.push(`<strong class="${row.tp < 0 ? "minus" : "plus"}">${row.tp < 0 ? "- " : "+ "}${tpText(Math.abs(row.tp))} <small>TP</small></strong>`);
  return `
    <article class="ledger-row">
      <span class="ledger-icon" aria-hidden="true">${icon(glyph)}</span>
      <span class="ledger-body">
        <strong>${esc(row.label)}</strong>
        <small>${esc(exchangeWhen(row.at))}</small>
      </span>
      <span class="ledger-amount">
        ${amounts.join("")}
        <em class="ledger-badge ${row.kind}">${esc(row.status)}</em>
      </span>
    </article>`;
}

function walletBack() {
  return state.walletReturn ? "wallet-return" : "home";
}

// 토마톡 지갑 mock. 캡처한 지갑 화면 구성 그대로에 TP 줄과 [교환하기]를 더했다.
function wallet() {
  const w = currentWallet();
  const krw = state.balance * tpPerTott();
  const usd = state.walletCurrency === "USD";
  const options = WALLETS.map((item, index) => `<option value="${index}"${index === state.exWallet ? " selected" : ""}>${esc(item.short)}</option>`).join("");
  const ledger = walletLedger().slice(0, 5);
  const price = rates();
  const tottUsdt = (price.tottKrw / price.usdKrw).toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  const link = state.walletReturn
    ? `<div class="buy light-buy"><button class="primary" type="button" data-wallet-link>이 지갑 연결하고 결제로 돌아가기</button></div>`
    : "";
  return `
    <header class="bar light-bar">
      <button data-back="${walletBack()}" aria-label="뒤로">←</button>
      <h1>지갑</h1>
      <span class="bar-tools"><span class="wallet-mock-tag">토마톡 mock</span>${menuButton()}</span>
    </header>
    <div class="scroll light">
      <section class="wallet-hero">
        <div class="wallet-top">
          <time data-clock>${clockText()}</time>
          <button type="button" data-ex-refresh aria-label="새로고침">${icon("refresh")}</button>
        </div>
        <div class="wallet-card">
          <div class="wallet-addr">
            <span class="wallet-logo" aria-hidden="true">P</span>
            <select data-ex-wallet aria-label="지갑 주소">${options}</select>
            <button type="button" data-wallet-copy="${esc(w.full)}" aria-label="주소 복사">${icon("copy")}</button>
            <button type="button" data-soon="QR" aria-label="QR">${icon("qr")}</button>
            <button type="button" data-soon="익스플로러" aria-label="익스플로러에서 보기">${icon("external")}</button>
          </div>
          <div class="wallet-sum">
            <p class="wallet-coin"><span class="coin-mark" aria-hidden="true">T</span>토마톡(TOTT)</p>
            <strong class="wallet-amount">${tottText(state.balance)}</strong>
            <div class="wallet-approx">
              <span>≈ ${usd ? usdText(krw) : wonText(krw)} ${icon("info")}</span>
              <span class="wallet-toggle" role="group" aria-label="통화">
                <button type="button" data-wallet-currency="USD" class="${usd ? "on" : ""}">USD</button>
                <button type="button" data-wallet-currency="KRW" class="${usd ? "" : "on"}">KRW</button>
              </span>
            </div>
          </div>
          <div class="wallet-tp">
            <p class="wallet-coin"><span class="coin-mark tp" aria-hidden="true">TP</span>포인트(TP)</p>
            <strong>${tpText(state.tp)} <small>TP</small></strong>
            <button type="button" class="wallet-exchange" data-nav="exchange-form">교환하기 ${icon("caretRight")}</button>
          </div>
          <div class="wallet-actions">
            <button type="button" data-soon="보내기">${icon("arrowUp")}<span>보내기</span></button>
            <button type="button" data-soon="받기">${icon("arrowDown")}<span>받기</span></button>
            <button type="button" data-soon="채우기(LBank에서 TOTT 구매)">${icon("coins")}<span>채우기</span></button>
            <button type="button" data-nav="exchange-history">${icon("receipt")}<span>거래보기</span></button>
          </div>
        </div>
      </section>
      <section class="wallet-section">
        <div class="wallet-head"><h2>보유 NFT <small>3개</small></h2><span><button type="button" data-soon="NFT 연결 관리">연결 관리</button></span></div>
        <div class="nft-row">
          <span class="nft-box"><b>토마톡 링</b></span>
          <span class="nft-box"><b>스테이킹</b></span>
          <span class="nft-box add">+<small>NFT 지갑 연결</small></span>
        </div>
      </section>
      <section class="wallet-section">
        <div class="wallet-head"><h2>토큰 정보</h2></div>
        <div class="token-row">
          <div class="token-card">
            <p><b>TOTT</b> <small>USDT</small></p>
            <div><span>현재가</span><strong>${tottUsdt}</strong></div>
            <div class="up"><span>전일 대비</span><strong>0.567890<br>+ 5.67%</strong></div>
          </div>
          <div class="token-card">
            <p><b>Solana</b> <small>USDT</small></p>
            <div><span>현재가</span><strong>200.96</strong></div>
            <div class="down"><span>전일 대비</span><strong>- 0.98<br>- 0.49%</strong></div>
          </div>
        </div>
      </section>
      <section class="wallet-section">
        <div class="wallet-head"><h2>거래 내역</h2><span><button type="button" data-nav="exchange-history">전체 보기 +</button></span></div>
        <div class="ledger">${ledger.length ? ledger.map(ledgerRow).join("") : `<p class="empty">거래 내역이 없어요.</p>`}</div>
      </section>
      <p class="wallet-foot">토마톡 지갑 화면의 mock이에요. 실제 지갑과 연동되면 이 화면 대신 토마톡 지갑이 열려요.</p>
    </div>
    ${link}
  `;
}

function exchangeHistory() {
  const day = state.exDate;
  const kind = state.ledgerFilter;
  const rows = walletLedger()
    .filter((row) => kind === "all" || (kind === "move" ? row.kind === "send" || row.kind === "receive" : row.kind === kind))
    .filter((row) => !day || String(row.at || "").slice(0, 10) === day);
  const chips = [["all", "전체"], ["exchange", "교환"], ["use", "사용"], ["move", "보내기·받기"]]
    .map(([id, label]) => `<button type="button" class="${id === kind ? "on" : ""}" data-ledger-filter="${id}">${label}</button>`).join("");
  const body = rows.length
    ? `<div class="ledger">${rows.map(ledgerRow).join("")}</div>`
    : `<p class="empty">${day ? "이 날짜의 거래 내역이 없어요." : "거래 내역이 없어요."}</p>`;
  return `
    <header class="bar light-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>거래 내역</h1>
      ${menuButton()}
    </header>
    <div class="artist-tabs light-tabs">${chips}</div>
    <div class="ex-filter light-filter">
      <label>지정된 날짜만 보기
        <input type="date" data-field="exDate" value="${esc(day)}" />
      </label>
      <button type="button" data-ex-date-clear ${day ? "" : "disabled"}>전체</button>
    </div>
    <div class="scroll light">${body}</div>
  `;
}

function exchangeAmounts() {
  const tott = Number(String(state.exTott).replace(/,/g, ""));
  const safe = Number.isFinite(tott) ? Math.max(0, tott) : 0;
  return { tott: safe, tp: tottToTp(safe) };
}

function exchangeReady() {
  const { tott } = exchangeAmounts();
  return tott >= EXCHANGE_MIN && tott <= state.balance;
}

function exchangeHint() {
  const { tott } = exchangeAmounts();
  if (!tott) return `최소 ${EXCHANGE_MIN} TOTT부터 교환할 수 있어요.`;
  if (tott < EXCHANGE_MIN) return `최소 ${EXCHANGE_MIN} TOTT부터 교환할 수 있어요.`;
  if (tott > state.balance) return "보유한 TOTT보다 많아요. 채우기에서 TOTT를 구매해요.";
  return "";
}

function exchangeRateLine() {
  const { at } = rates();
  const when = at ? `${clockText(new Date(at)).slice(11)} 기준` : "기본 환율";
  return `현재 환율 1 TOTT ≈ ${tpText(tpPerTott())} TP · ${when}`;
}

// TOTT · TP 교환 (토마톡 지갑의 교환 페이지 구성 + 버튼 비활성·환율·받을 TP·라벨·유의사항 보완)
function exchangeForm() {
  const w = currentWallet();
  const { tott, tp } = exchangeAmounts();
  const ready = exchangeReady();
  const hint = exchangeHint();
  const tpValue = state.exTp !== "" ? state.exTp : (tp ? tpText(tp) : "");
  return `
    <header class="bar light-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>TOTT · TP 교환</h1>
      ${menuButton()}
    </header>
    <div class="scroll light ex-form">
      <section class="ex-card">
        <div class="ex-line"><span>연결 지갑</span><strong><span class="wallet-logo small" aria-hidden="true">P</span>${esc(w.short)}</strong></div>
        <div class="ex-line top"><span>보유 TOTT</span><strong><em class="red">${tottText(state.balance)}</em> TOTT<small>≈ ${tpText(tottToTp(state.balance))} TP</small><button type="button" class="ex-chip-btn" data-soon="LBank에서 TOTT 구매">LBank에서 TOTT 구매 <b>L</b></button></strong></div>
        <div class="ex-line"><span>보유 TP</span><strong>${tpText(state.tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
      </section>
      <div class="ex-head-row"><h2>교환할 금액 입력</h2><small>원하는 기준 중에 입력하면 자동으로 계산됩니다.</small></div>
      <section class="ex-card ex-box">
        <label class="ex-field">
          <span>TOTT 기준 입력</span>
          <span class="ex-input">
            <input data-field="exTott" inputmode="decimal" placeholder="0" value="${esc(state.exTott)}" />
            <b>TOTT</b>
          </span>
        </label>
        <div class="ex-chips">
          ${[10, 25, 50, 75].map((pct) => `<button type="button" data-ex-pct="${pct}">${pct}%</button>`).join("")}
          <button type="button" data-ex-pct="100">최대</button>
        </div>
        <span class="ex-swap" aria-hidden="true">${icon("swap")}</span>
        <label class="ex-field">
          <span>TP(원) 기준 입력 <small>1 TP = ₩1</small></span>
          <span class="ex-input">
            <input data-field="exTp" inputmode="numeric" placeholder="0" value="${esc(tpValue)}" />
            <b>TP</b>
          </span>
        </label>
        <p class="ex-warn">${icon("info")} TOTT 가격 변동으로 실제 지급 TP 수량이 달라질 수 있습니다.</p>
        <div class="ex-chips">
          ${[1000, 10000, 100000, 1000000].map((amount) => `<button type="button" data-ex-add="${amount}">${amount === 1000 ? "1천원" : amount === 10000 ? "1만원" : amount === 100000 ? "10만원" : "100만원"}</button>`).join("")}
          <button type="button" data-ex-pct="100">최대</button>
        </div>
        <p class="ex-rate" data-ex-rate>${esc(exchangeRateLine())} <button type="button" data-ex-refresh aria-label="환율 새로고침">${icon("refresh")}</button></p>
        <p class="ex-hint" data-ex-hint>${esc(hint)}</p>
      </section>
      <section class="ex-card ex-preview">
        <div class="ex-line"><span>받을 TP</span><strong class="green" data-ex-get>+ ${tpText(tp)} TP</strong></div>
        <div class="ex-line"><span>예상 교환 후 TP 보유량</span><strong data-ex-after-tp>${tpText(state.tp + tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
        <div class="ex-line"><span>예상 교환 후 남은 TOTT</span><strong data-ex-after-tott>${tottText(Math.max(0, state.balance - tott))} <small>TOTT</small></strong></div>
      </section>
      <button class="primary ex-confirm" type="button" data-ex-confirm ${ready ? "" : "disabled"}>TP로 교환</button>
      <section class="ex-notice">
        <h3>${icon("info")} 교환시 유의사항</h3>
        <ol>
          <li>교환된 TP는 취소 및 환불이 불가합니다.</li>
          <li>교환 비율은 운영 정책에 따라 변경될 수 있습니다.</li>
          <li>팬텀 지갑의 TOTT 잔액 범위 내에서만 교환 가능합니다.</li>
          <li>교환된 TP는 포토카드 등 토마톡 서비스 결제에만 사용 가능합니다.</li>
          <li>최소 교환 수량은 ${EXCHANGE_MIN} TOTT이며, 지갑별 TOTT·TP 잔액이 다르니 지갑을 확인하세요.</li>
          <li>지갑에 보유한 TP는 다른 지갑으로 이동할 수 없습니다.</li>
        </ol>
      </section>
    </div>
  `;
}

// 입력 중에는 전체 render 없이 반대쪽 칸·미리보기·버튼만 갱신한다(포커스 유지).
function syncExchangeForm(changed) {
  const tottInput = app.querySelector("[data-field=exTott]");
  const tpInput = app.querySelector("[data-field=exTp]");
  if (changed === "tott") {
    const { tp } = exchangeAmounts();
    state.exTp = tp ? tpText(tp) : "";
    if (tpInput) tpInput.value = state.exTp;
  } else {
    const tp = Number(String(state.exTp).replace(/,/g, ""));
    const safe = Number.isFinite(tp) && tp > 0 ? tp : 0;
    state.exTott = safe ? String(Number(tpToTott(safe).toFixed(6))) : "";
    if (tottInput) tottInput.value = state.exTott;
  }
  const { tott, tp } = exchangeAmounts();
  const button = app.querySelector("[data-ex-confirm]");
  if (button) button.disabled = !exchangeReady();
  const hint = app.querySelector("[data-ex-hint]");
  if (hint) hint.textContent = exchangeHint();
  const get = app.querySelector("[data-ex-get]");
  if (get) get.textContent = `+ ${tpText(tp)} TP`;
  const afterTp = app.querySelector("[data-ex-after-tp]");
  if (afterTp) afterTp.firstChild.textContent = `${tpText(state.tp + tp)} `;
  const afterTott = app.querySelector("[data-ex-after-tott]");
  if (afterTott) afterTott.firstChild.textContent = `${tottText(Math.max(0, state.balance - tott))} `;
}

function setExchangeTott(amount) {
  const value = Math.max(0, Math.min(state.balance, Number(amount) || 0));
  state.exTott = value ? String(Number(value.toFixed(6))) : "";
  state.exTp = value ? tpText(tottToTp(value)) : "";
}

function runExchange() {
  if (!exchangeReady()) return false;
  const { tott, tp } = exchangeAmounts();
  state.balance = Number((state.balance - tott).toFixed(6));
  state.tp += tp;
  state.exchanges.unshift({
    id: `EX_${Date.now()}`,
    at: new Date().toISOString(),
    wallet: currentWallet().id,
    tott,
    tp,
    tpAfter: state.tp,
  });
  persistWallet();
  state.exTott = "";
  state.exTp = "";
  return true;
}

// 지갑·교환에서 결제 시트로 돌아간다(슬라이드 18 "연결 후 현재 결제 화면으로 돌아옵니다").
function returnToSheet() {
  const back = state.walletReturn;
  state.walletReturn = null;
  if (!back) {
    state.screen = "wallet";
    return;
  }
  state.productId = back.productId;
  state.sheet = back.sheet;
  state.screen = "detail";
  state.tab = "home";
}

let clockTimer = 0;

function armClock() {
  window.clearInterval(clockTimer);
  if (!document.querySelector("[data-clock]")) return;
  clockTimer = window.setInterval(() => {
    const node = document.querySelector("[data-clock]");
    if (!node) {
      window.clearInterval(clockTimer);
      return;
    }
    node.textContent = clockText();
  }, 1000);
}

// ---- 이용 가이드 (슬라이드 25) ----

// 이용 가이드 4장. 그림 대신 실제 화면 요소(타일·결제 시트·포장·보유 카드 격자)를 CSS로 움직인다.
const GUIDE_PAGES = [
  {
    demo: "pick",
    title: "상품을 고르고 뽑기",
    body: "홈에서 아티스트와 상품을 고른 뒤 1장 뽑기 또는 5장 연속 뽑기를 눌러요.",
  },
  {
    demo: "pay",
    title: "TP로 결제하기",
    body: "토마톡 지갑에서 TOTT를 TP로 바꾼 뒤, 지갑을 연결하고 TP로 결제해요.",
  },
  {
    demo: "open",
    title: "포장을 밀어 열기",
    body: "포장을 손가락으로 밀어 열고, 나온 카드를 드래그해 앞뒤를 확인해요.",
  },
  {
    demo: "album",
    title: "보유 카드에 보관",
    body: "뽑은 카드는 보유 카드에서 언제든 볼 수 있어요. 같은 카드는 장수로 표시돼요.",
  },
];

function fingerIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8h8.5a1.5 1.5 0 0 1 0 3h-7.5"></path><path d="M13.5 11h2a1.5 1.5 0 0 1 0 3h-2.5"></path><path d="M14.5 14a1.5 1.5 0 0 1 0 3h-1.5"></path><path d="M13.5 17a1.5 1.5 0 1 1 0 3h-4.5a6 6 0 0 1 -6 -6v-2v.208a6 6 0 0 1 2.7 -5.012l.3 -.196q .718 -.468 5.728 -3.286a1.5 1.5 0 0 1 2.022 .536c.44 .734 .325 1.674 -.28 2.28l-1.47 1.47"></path></svg>`;
}

function demoScene(kind) {
  const finger = `<span class="demo-finger" aria-hidden="true">${fingerIcon()}</span>`;
  if (kind === "pick") {
    return `
      <div class="demo demo-pick" aria-hidden="true">
        <div class="demo-tiles">
          <span class="demo-tile t1"><img src="../assets/covers/jump.jpg" alt="" /><b>JUMP</b><small>2,500 TP</small></span>
          <span class="demo-tile t2"><img src="../assets/covers/crazy.jpg" alt="" /><b>CRAZY</b><small>2,500 TP</small></span>
        </div>
        <span class="demo-btn">1장 뽑기</span>
        ${finger}
      </div>`;
  }
  if (kind === "pay") {
    return `
      <div class="demo demo-pay" aria-hidden="true">
        <img class="demo-bg" src="../assets/covers/jump.jpg" alt="" />
        <div class="demo-sheet">
          <i class="demo-grab"></i>
          <div><span>현재가격</span><b>2,500 TP</b></div>
          <div><span>보유</span><b>50,000 TP</b></div>
          <div><span>차감 후 남은 잔액</span><b>47,500 TP</b></div>
          <span class="demo-btn">결제하기</span>
        </div>
        ${finger}
      </div>`;
  }
  if (kind === "open") {
    const overs = [1, 2, 3, 4].map((index) => `<img class="demo-over o${index}" src="tears/method-1/over-${index}.png?v=1" alt="" />`).join("");
    return `
      <div class="demo demo-open" aria-hidden="true">
        <div class="demo-pack">
          <img class="demo-base" src="${OPEN_BASE}" alt="" />
          ${overs}
          <img class="demo-shell" src="tears/over-5.png?v=3" alt="" />
        </div>
        <span class="demo-card"><img src="${photo("67.jpg")}" alt="" /><span class="prism"></span></span>
        ${finger}
      </div>`;
  }
  const fronts = ["67.jpg", "69.jpg", "71.jpg", "01.jpg", "10.jpg", "20.jpg"];
  return `
    <div class="demo demo-album" aria-hidden="true">
      <div class="demo-chips"><b>전체</b><span>BLACKPINK</span><span>LE SSERAFIM</span></div>
      <div class="demo-grid">
        ${fronts.map((file, index) => `<span style="--d:${index * 0.3}s"><img src="${photo(file)}" alt="" />${index === 0 ? `<i>2장</i>` : ""}</span>`).join("")}
      </div>
    </div>`;
}

function guidePages() {
  return `
    <div class="guide-rail" data-guide-rail>
      ${GUIDE_PAGES.map((page, index) => `
        <section class="guide-page" data-guide-page="${index}">
          <span class="guide-step">${index + 1} / ${GUIDE_PAGES.length}</span>
          ${demoScene(page.demo)}
          <h2>${esc(page.title)}</h2>
          <p>${esc(page.body)}</p>
        </section>`).join("")}
    </div>
    <div class="guide-dots" data-guide-dots>${GUIDE_PAGES.map((_, index) => `<i class="${index === state.guidePage ? "on" : ""}"></i>`).join("")}</div>`;
}

// 첫 진입에서는 마지막 장까지 봐야 '시작하기'가 켜지고 건너뛸 수 없다. 다시 볼 때는 언제든 닫는다.
function guide(firstRun) {
  const last = state.guidePage >= GUIDE_PAGES.length - 1;
  const action = firstRun
    ? (state.guideSeen
      ? `<button class="primary" type="button" data-guide-start>시작하기</button>`
      : `<button class="primary" type="button" data-guide-next>다음</button>`)
    : (last
      ? `<button class="primary" type="button" data-guide-close>확인</button>`
      : `<button class="primary" type="button" data-guide-next>다음</button>`);
  const note = firstRun && !state.guideSeen
    ? `<p class="guide-note">가이드를 끝까지 확인해야 서비스를 이용할 수 있어요.</p>`
    : "";
  const header = firstRun
    ? `<header class="bar"><h1>포토카드 이용 가이드</h1></header>`
    : `
      <header class="bar">
        <button data-back="${esc(state.guideFrom)}" aria-label="뒤로">←</button>
        <h1>포토카드 이용 가이드</h1>
        ${menuButton()}
      </header>`;
  return `
    ${header}
    <div class="guide-body">
      ${guidePages()}
    </div>
    <div class="buy guide-foot">
      ${note}
      ${action}
    </div>
  `;
}

function armGuide() {
  const rail = document.querySelector("[data-guide-rail]");
  if (!rail || rail.dataset.bound) return;
  rail.dataset.bound = "1";
  const width = () => rail.clientWidth || 1;
  if (state.guidePage > 0) rail.scrollLeft = width() * state.guidePage;
  let timer = 0;
  rail.addEventListener("scroll", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const index = Math.max(0, Math.min(GUIDE_PAGES.length - 1, Math.round(rail.scrollLeft / width())));
      const reachedEnd = index === GUIDE_PAGES.length - 1;
      const changed = index !== state.guidePage || (reachedEnd && !state.guideSeen);
      state.guidePage = index;
      if (reachedEnd) state.guideSeen = true;
      if (changed) render();
    }, 60);
  }, { passive: true });
}

function nextGuidePage() {
  const rail = document.querySelector("[data-guide-rail]");
  const next = Math.min(GUIDE_PAGES.length - 1, state.guidePage + 1);
  if (!rail) {
    state.guidePage = next;
    if (next === GUIDE_PAGES.length - 1) state.guideSeen = true;
    render();
    return;
  }
  rail.scrollTo({ left: rail.clientWidth * next, behavior: "smooth" });
}

// ---- 첫 진입 (슬라이드 3~6) ----

const SPLASH_IMAGES = ["../assets/covers/jump.jpg", "../assets/covers/crazy.jpg", "../assets/covers/ive-empathy.jpg"];

function splash() {
  return `
    <div class="splash">
      <div class="splash-rail" data-splash-rail>
        ${SPLASH_IMAGES.map((src, index) => `
          <figure class="splash-slide">
            <img src="${src}" alt="" draggable="false" />
            <figcaption><strong>포토카드</strong><span>TOMATOK ${index + 1} / ${SPLASH_IMAGES.length}</span></figcaption>
          </figure>`).join("")}
      </div>
      <button type="button" class="splash-arrow prev" data-splash-move="-1" aria-label="이전 이미지" disabled>‹</button>
      <button type="button" class="splash-arrow next" data-splash-move="1" aria-label="다음 이미지">›</button>
      <div class="splash-dots" data-splash-dots>${SPLASH_IMAGES.map((_, index) => `<button type="button" class="${index === 0 ? "on" : ""}" data-splash-to="${index}" aria-label="${index + 1}번째 이미지"></button>`).join("")}</div>
      <button class="primary splash-go" type="button" data-boot-next="push">시작하기</button>
      <p class="splash-foot">ⓒ Copyright, ${new Date().getFullYear()}</p>
    </div>`;
}

function consentWhen(iso) {
  const date = iso ? new Date(iso) : new Date();
  return `${date.getFullYear()}년 ${pad2(date.getMonth() + 1)}월 ${pad2(date.getDate())}일 ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// 첫 진입 팝업(슬라이드 4~6)은 토마톡 기본 모달과 같은 바텀시트로 띄운다.
function bootSheet({ kicker, iconName, badge, title, body, primary, secondary, extra = "" }) {
  const mark = badge
    ? `<span class="boot-badge ${badge === "x" ? "no" : "ok"}" aria-hidden="true">${icon(badge)}</span>`
    : "";
  return `
    <div class="sheet-bg boot-bg">
      <div class="sheet boot-sheet">
        <span class="sheet-grab"></span>
        <p class="boot-kicker">${esc(kicker)}</p>
        <span class="boot-icon" aria-hidden="true">${icon(iconName)}${mark}</span>
        <h2 class="boot-title">${title}</h2>
        ${body ? `<p class="boot-copy">${body}</p>` : ""}
        ${extra}
        ${primary}
        ${secondary}
      </div>
    </div>`;
}

function bootModal() {
  const saved = loadOnboard();
  if (state.boot === "push") {
    return bootSheet({
      kicker: "PUSH 알림",
      iconName: "bell",
      title: "‘토마톡’에서<br>PUSH 알림을 보내고자 합니다.",
      body: "새 상품과 뽑기 소식을 알려드려요.",
      primary: `<button type="button" class="primary" data-push="yes">허용</button>`,
      secondary: `<button type="button" class="boot-link" data-push="no">허용 안 함</button>`,
    });
  }
  if (state.boot === "marketing") {
    return bootSheet({
      kicker: "마케팅 수신 동의",
      iconName: "megaphone",
      title: "‘TOMATOK’ 마케팅 수신<br>동의를 하시겠습니까?",
      body: "이벤트와 혜택 안내를 받아요.",
      primary: `<button type="button" class="primary" data-marketing="yes">허용</button>`,
      secondary: `<button type="button" class="boot-link" data-marketing="no">허용 안 함</button>`,
    });
  }
  if (state.boot === "consent") {
    const agreed = Boolean(saved.marketing);
    return bootSheet({
      kicker: "마케팅 Push 알림 동의 안내",
      iconName: "bell",
      badge: agreed ? "check" : "x",
      title: agreed ? "마케팅 Push 수신이 완료됐어요." : "마케팅 Push 거부 처리가 완료됐어요.",
      body: "Push 알림 동의 상태는 하단 메뉴<br>마이 페이지 &gt; 내 기본정보 설정에서<br>변경 하실 수 있습니다.",
      extra: `
        <dl class="boot-facts boot-consent">
          <div><dt>전송자</dt><dd>TOMATOK</dd></div>
          <div><dt>처리 일시</dt><dd>${esc(consentWhen(saved.decidedAt))}</dd></div>
          <div><dt>처리 내용</dt><dd>${agreed ? "수신 완료" : "거부 처리 완료"}</dd></div>
        </dl>`,
      primary: `<button type="button" class="primary" data-boot-next="guide">확인</button>`,
      secondary: "",
    });
  }
  return "";
}

function bootView() {
  if (state.boot === "guide") return guide(true);
  return splash() + bootModal();
}

function armSplash() {
  const rail = document.querySelector("[data-splash-rail]");
  if (!rail || rail.dataset.bound) return;
  rail.dataset.bound = "1";
  const dots = [...document.querySelectorAll("[data-splash-dots] button")];
  const prev = document.querySelector("[data-splash-move='-1']");
  const next = document.querySelector("[data-splash-move='1']");
  const paint = () => {
    const index = splashIndex(rail);
    dots.forEach((dot, i) => dot.classList.toggle("on", i === index));
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= SPLASH_IMAGES.length - 1;
  };
  rail.addEventListener("scroll", paint, { passive: true });
  paint();
}

function splashIndex(rail) {
  return Math.max(0, Math.min(SPLASH_IMAGES.length - 1, Math.round(rail.scrollLeft / (rail.clientWidth || 1))));
}

// 스플래시 화살표·점: 마우스로도 넘길 수 있게 레일을 한 장씩 스크롤한다.
function moveSplash(target) {
  const rail = document.querySelector("[data-splash-rail]");
  if (!rail) return;
  const index = Math.max(0, Math.min(SPLASH_IMAGES.length - 1, target));
  rail.scrollTo({ left: rail.clientWidth * index, behavior: "smooth" });
}

function render() {
  const item = product(state.productId);
  let view = home();
  if (state.boot !== "done") view = bootView();
  else if (state.screen === "detail" && item) view = detail(item);
  else if (state.screen === "card") view = ownedDetail();
  else if (state.screen === "open" && state.openPhase === "deck") view = cardDeck();
  else if (state.screen === "open" && state.openPhase === "pack") view = sealedPack();
  else if (state.screen === "open" && state.openPhase === "spread") view = cardSpread();
  else if (state.screen === "open" && state.openPhase === "motion") view = openMotion();
  else if (state.screen === "result" || state.screen === "open") view = result();
  else if (state.screen === "wished") view = wished();
  else if (state.screen === "purchases") view = purchases();
  else if (state.screen === "guide") view = guide(false);
  else if (state.screen === "wallet") view = wallet();
  else if (state.screen === "exchange-history") view = exchangeHistory();
  else if (state.screen === "exchange-form") view = exchangeForm();
  else if (state.tab === "track" || state.screen === "track") view = state.shipmentId ? shipmentDetail() : tracking();
  else if (state.tab === "album") view = album();
  else if (state.tab === "ship" || state.screen === "ship") view = ship();
  else if (state.screen === "artists") view = artistsPage();
  else if (state.screen === "artist") view = artistPage();
  else if (state.screen === "notice") view = notices();
  else if (state.tab === "mypage" || state.screen === "mypage") view = mypage();
  app.innerHTML = view + drawer() + sheet() + walletModal() + cartModal() + resultBoxModal() + (state.toast ? `<p class="toast">${esc(state.toast)}</p>` : "");
  blurFronts();
  protectFronts();
  startBanner();
  startMidBanner();
  paintBoard();
  mountPostcode();
  armMotion();
  armDeck();
  armOpenCut();
  armSpread();
  armResultCarousel();
  armClock();
  armGuide();
  armSplash();
}

app.addEventListener("click", (event) => {
  const open = event.target.closest("[data-open]");
  const back = event.target.closest("[data-back]");
  const tab = event.target.closest("[data-tab]");
  const buy = event.target.closest("[data-buy]");
  const pay = event.target.closest("[data-pay]");
  const unseal = event.target.closest("[data-unseal]");
  const next = event.target.closest("[data-next]");
  const again = event.target.closest("[data-again]");
  const openOk = event.target.closest("[data-open-ok]");
  const resultBoxAdd = event.target.closest("[data-result-box]");
  const resultBoxGo = event.target.closest("[data-result-box-go]");
  const resultBoxStay = event.target.closest("[data-result-box-stay]");
  const cart = event.target.closest("[data-cart]");
  const cartGo = event.target.closest("[data-cart-go]");
  const cartMore = event.target.closest("[data-cart-more]");
  const uncart = event.target.closest("[data-uncart]");
  const request = event.target.closest("[data-request]");
  const artist = event.target.closest("[data-artist]");
  const dot = event.target.closest("[data-dot]");
  const receive = event.target.closest("[data-receive]");
  const addressNew = event.target.closest("[data-address-new]");
  const addressDefault = event.target.closest("[data-address-default]");
  const addressSave = event.target.closest("[data-address-save]");
  const addressPick = event.target.closest("[data-address]");
  const region = event.target.closest("[data-region]");
  const postcodeClose = event.target.closest("[data-postcode-close]");
  const postcode = event.target.closest("[data-postcode]");
  const cardHit = event.target.closest("[data-card]");
  const walletConnect = event.target.closest("[data-wallet-connect]");
  const walletClose = event.target.closest("[data-wallet-close]");
  const sheetClose = event.target.closest("[data-sheet-close]");
  const walletBackdrop = event.target.classList.contains("modal-bg");
  const profile = event.target.closest("[data-profile]");
  const catalogSearch = event.target.closest("[data-catalog-search]");
  const catalogSearchClose = event.target.closest("[data-catalog-search-close]");
  const catalogChip = event.target.closest("[data-catalog]");
  const excludeSold = event.target.closest("[data-exclude-sold]");
  const drawerOpen = event.target.closest("[data-drawer]");
  const drawerClose = event.target.closest("[data-drawer-close]");
  const menuGroupHit = event.target.closest("[data-menu-group]");
  const nav = event.target.closest("[data-nav]");
  const navArtist = event.target.closest("[data-nav-artist]");
  const searchOpenBtn = event.target.closest("[data-search]");
  const searchClose = event.target.closest("[data-search-close]");
  const wish = event.target.closest("[data-wish]");
  const share = event.target.closest("[data-share]");
  const menu = event.target.closest("[data-menu]");
  const shipmentHit = event.target.closest("[data-shipment]");
  const trackCopy = event.target.closest("[data-track-copy]");
  const trackStatus = event.target.closest("[data-track-status]");
  const openSkip = event.target.closest("[data-open-skip]");
  const resultClose = event.target.closest("[data-result-close]");
  const soon = event.target.closest("[data-soon]");
  const bootNext = event.target.closest("[data-boot-next]");
  const pushPick = event.target.closest("[data-push]");
  const marketingPick = event.target.closest("[data-marketing]");
  const guideNext = event.target.closest("[data-guide-next]");
  const guideStart = event.target.closest("[data-guide-start]");
  const guideClose = event.target.closest("[data-guide-close]");
  const exPct = event.target.closest("[data-ex-pct]");
  const exAdd = event.target.closest("[data-ex-add]");
  const exConfirm = event.target.closest("[data-ex-confirm]");
  const exRefresh = event.target.closest("[data-ex-refresh]");
  const exDateClear = event.target.closest("[data-ex-date-clear]");
  const goExchange = event.target.closest("[data-go-exchange]");
  const walletLink = event.target.closest("[data-wallet-link]");
  const walletCopy = event.target.closest("[data-wallet-copy]");
  const walletCurrency = event.target.closest("[data-wallet-currency]");
  const ledgerFilter = event.target.closest("[data-ledger-filter]");
  if (openOk) {
    finishOpen();
  } else if (openSkip) {
    // SKIP과 개봉 화면의 ←: 남은 연출을 모두 건너뛰고 결과로 간다(Q12·Q13 기본값).
    if (state.screen !== "open") return;
    state.revealIndex = 0;
    finishOpen();
  } else if (resultClose) {
    // 닫기: 그 상품의 구매 화면(상세)으로 돌아간다(Q15 기본값).
    state.sheet = null;
    state.screen = "detail";
    state.tab = "home";
  } else if (soon) {
    state.menuOpen = false;
    toast(`${soon.dataset.soon} 기능은 준비 중이에요.`);
  } else if (event.target.closest("[data-splash-move]")) {
    const rail = document.querySelector("[data-splash-rail]");
    if (rail) moveSplash(splashIndex(rail) + Number(event.target.closest("[data-splash-move]").dataset.splashMove));
    return;
  } else if (event.target.closest("[data-splash-to]")) {
    moveSplash(Number(event.target.closest("[data-splash-to]").dataset.splashTo));
    return;
  } else if (bootNext) {
    state.boot = bootNext.dataset.bootNext;
    if (state.boot === "guide") {
      state.guidePage = 0;
      state.guideSeen = false;
    }
  } else if (pushPick) {
    saveOnboard({ push: pushPick.dataset.push === "yes", decidedAt: new Date().toISOString() });
    state.boot = "marketing";
  } else if (marketingPick) {
    saveOnboard({ marketing: marketingPick.dataset.marketing === "yes", decidedAt: new Date().toISOString() });
    state.boot = "consent";
  } else if (guideNext) {
    nextGuidePage();
    return;
  } else if (guideStart) {
    if (!state.guideSeen) return;
    saveOnboard({ done: true, guideSeenAt: new Date().toISOString() });
    state.boot = "done";
    state.screen = "home";
    state.tab = "home";
  } else if (guideClose) {
    const to = state.guideFrom;
    state.screen = to === "mypage" ? "mypage" : "home";
    state.tab = to === "mypage" ? "mypage" : "home";
  } else if (goExchange) {
    // 결제 시트 → 지갑 교환 페이지 → 교환 뒤 시트로 복귀
    state.walletReturn = { productId: state.productId, sheet: state.sheet };
    state.sheet = null;
    state.exTott = "";
    state.exTp = "";
    state.screen = "exchange-form";
  } else if (walletLink) {
    state.walletConnected = true;
    returnToSheet();
  } else if (walletCopy) {
    if (navigator.clipboard) navigator.clipboard.writeText(walletCopy.dataset.walletCopy).catch(() => {});
    toast("지갑 주소를 복사했어요.");
  } else if (walletCurrency) {
    state.walletCurrency = walletCurrency.dataset.walletCurrency;
  } else if (ledgerFilter) {
    state.ledgerFilter = ledgerFilter.dataset.ledgerFilter;
  } else if (exPct) {
    setExchangeTott(state.balance * (Number(exPct.dataset.exPct) / 100));
  } else if (exAdd) {
    const { tp } = exchangeAmounts();
    setExchangeTott(tpToTott(tp + Number(exAdd.dataset.exAdd)));
  } else if (exConfirm) {
    if (exConfirm.disabled || !runExchange()) return;
    toast("교환이 완료됐어요.");
    returnToSheet();
  } else if (exRefresh) {
    fetchRates().then((ok) => {
      if (!ok) return;
      const line = app.querySelector("[data-ex-rate]");
      if (line) line.firstChild.textContent = `${exchangeRateLine()} `;
    });
    toast("시세를 새로 불러왔어요.");
  } else if (exDateClear) {
    state.exDate = "";
  } else if (drawerOpen) {
    state.menuOpen = true;
  } else if (drawerClose) {
    state.menuOpen = false;
    state.menuGroups = { mypage: false, artist: false };
  } else if (menuGroupHit) {
    const id = menuGroupHit.dataset.menuGroup;
    state.menuGroups[id] = !state.menuGroups[id];
  } else if (nav) {
    if (state.midSuppress && nav.closest(".mid-slide")) {
      state.midSuppress = false;
      return;
    }
    const name = nav.dataset.nav;
    state.menuOpen = false;
    state.sheet = null;
    state.shipmentId = "";
    state.pickMode = false;
    state.picked = [];
    state.albumArtist = "all";
    closeAdmin();
    if (name === "admin") {
      state.screen = "admin";
      openAdmin();
      paintBoard();
      return;
    }
    if (name === "home") {
      state.tab = "home";
      state.screen = "home";
      state.profile = "";
      state.searchOpen = false;
      state.query = "";
    } else if (name === "products") {
      // 탭바 '상품'과 결과의 '다른 상품 보기'는 전체 아티스트로 간다(Q1 기본값).
      resetCatalog();
      state.profile = "";
      state.tab = "home";
      state.screen = "artists";
      state.searchOpen = false;
      state.query = "";
    } else if (name === "wallet" || name === "exchange-form" || name === "exchange-history") {
      state.tab = "home";
      state.screen = name;
      if (name === "wallet") state.walletReturn = null;
      if (name === "exchange-form") {
        state.exTott = "";
        state.exTp = "";
      }
      if (name === "exchange-history") {
        state.exDate = "";
        state.ledgerFilter = "all";
      }
    } else if (name === "guide") {
      state.guideFrom = "home";
      state.guidePage = 0;
      state.guideSeen = false;
      state.tab = state.guideFrom;
      state.screen = "guide";
    } else if (name === "purchases") {
      state.tab = "mypage";
      state.screen = "purchases";
    } else if (name === "album") {
      state.tab = "album";
      state.screen = "album";
      state.focusStatus = null;
    } else if (name === "mypage") {
      state.tab = "mypage";
      state.screen = "mypage";
    } else if (name === "wished") {
      state.tab = "mypage";
      state.screen = "wished";
    } else if (name === "ship") {
      state.tab = "mypage";
      state.screen = "ship";
      state.region = "";
      state.postcodeOpen = false;
    } else if (name === "track") {
      state.tab = "mypage";
      state.screen = "track";
      state.focusTrack = "all";
    } else if (name === "notice") {
      state.tab = "home";
      state.screen = "notice";
    } else if (name === "artists") {
      resetCatalog();
      state.profile = "";
      state.tab = "home";
      state.screen = "artists";
      state.searchOpen = false;
      state.query = "";
    }
  } else if (navArtist) {
    resetCatalog();
    state.profile = navArtist.dataset.navArtist;
    state.profileFrom = "";
    state.menuOpen = false;
    state.tab = "home";
    state.screen = state.profile ? "artist" : "home";
    state.searchOpen = false;
    state.query = "";
  } else if (open) {
    if (state.bannerSuppress || (state.midSuppress && open.closest(".mid-slide"))) {
      state.bannerSuppress = false;
      state.midSuppress = false;
      return;
    }
    state.productId = open.dataset.open;
    state.productFrom = state.screen;
    state.screen = "detail";
    state.tab = "home";
    state.sheet = null;
  } else if (back) {
    const to = back.dataset.back;
    state.sheet = null;
    state.postcodeOpen = false;
    if (to === "exit") {
      history.back();
      return;
    } else if (to === "track-list") {
      state.shipmentId = "";
      state.screen = "track";
      state.tab = "mypage";
    } else if (to === "artists") {
      state.screen = "artists";
      state.tab = "home";
      state.profile = "";
    } else if (to === "artist" && state.profile) {
      state.screen = "artist";
      state.tab = "home";
    } else if (to === "album" || to === "ship" || to === "track" || to === "mypage") {
      state.screen = to;
      state.tab = to === "album" ? "album" : "mypage";
    } else if (to === "wallet") {
      state.screen = "wallet";
      state.tab = "home";
    } else if (to === "wallet-return") {
      returnToSheet();
    } else {
      state.screen = "home";
      state.tab = "home";
    }
  } else if (tab) {
    const name = tab.dataset.tab;
    if (name === "ship" || name === "track") {
      state.tab = "mypage";
      state.screen = name;
    } else {
      state.tab = name;
      state.screen = name;
    }
    state.sheet = null;
    state.focusStatus = null;
    state.albumArtist = "all";
    state.pickMode = false;
    state.picked = [];
  } else if (buy) {
    const buying = product(state.productId);
    const count = Number(buy.dataset.buy);
    if (saleWord(buying)) return;
    if (count === 5 && !canDrawFive(buying)) return;
    state.sheet = count;
  } else if (pay) {
    const buying = product(state.productId);
    const count = Number(pay.dataset.pay);
    if (saleWord(buying)) return;
    if (count === 5 && !canDrawFive(buying)) return;
    if (!state.walletConnected) return;
    if (state.tp < buying.price * count) {
      toast("TP가 부족해요. 토마톡 지갑에서 TOTT를 TP로 교환해 주세요.");
      render();
      return;
    }
    draw(buying, count);
  } else if (unseal) {
    state.openPhase = "motion";
    state.motionArmed = false;
    state.screen = "open";
  } else if (next) {
    state.revealIndex += 1;
    beginOpen();
  } else if (again) {
    state.resultBox = false;
    state.sheet = Number(again.dataset.again);
    state.screen = "detail";
  } else if (resultBoxAdd) {
    const card = state.reveal[state.revealIndex];
    if (card && card.status !== "shipping_cart" && moveOne(card.id, "shipping_cart")) state.resultBox = true;
    else if (card && card.status !== "shipping_cart") {
      state.toast = `배송박스는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    }
  } else if (resultBoxGo) {
    state.resultBox = false;
    state.region = "";
    state.postcodeOpen = false;
    state.tab = "mypage";
    state.screen = "ship";
  } else if (resultBoxStay || (state.resultBox && walletBackdrop)) {
    state.resultBox = false;
  } else if (event.target.closest("[data-ship-add]")) {
    state.shipPick = !state.shipPick;
    state.picked = [];
  } else if (event.target.closest("[data-ship-add-confirm]")) {
    if (!state.picked.length) return;
    if (!moveStored(state.picked)) {
      state.toast = `배송바구니는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    } else {
      state.picked = [];
      state.shipPick = false;
    }
  } else if (event.target.closest("[data-pick]")) {
    state.pickMode = !state.pickMode;
    state.picked = [];
  } else if (event.target.closest("[data-pick-card]")) {
    const id = event.target.closest("[data-pick-card]").dataset.pickCard;
    state.picked = state.picked.includes(id) ? state.picked.filter((item) => item !== id) : [...state.picked, id];
  } else if (event.target.closest("[data-pick-add]")) {
    if (!moveStored(state.picked)) {
      state.toast = `배송바구니는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    } else {
      state.picked = [];
      state.cartModal = true;
    }
  } else if (event.target.closest("[data-qty]")) {
    const card = ownedCard();
    const max = card ? storedCopies(card).length : 1;
    state.shipQty = Math.min(max, Math.max(1, state.shipQty + Number(event.target.closest("[data-qty]").dataset.qty)));
  } else if (event.target.closest("[data-cart-many]")) {
    const card = ownedCard();
    if (!card) return;
    const copies = storedCopies(card);
    const ordered = [card, ...copies.filter((item) => item.id !== card.id)];
    const ids = ordered.slice(0, Math.max(state.shipQty, 1)).map((item) => item.id);
    if (moveStored(ids)) {
      state.shipQty = 1;
      state.cartModal = true;
    } else {
      state.toast = `배송바구니는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    }
  } else if (cart) {
    if (moveOne(cart.dataset.cart, "shipping_cart")) state.cartModal = true;
  } else if (uncart) {
    moveOne(uncart.dataset.uncart, "stored");
  } else if (cartGo) {
    state.cartModal = false;
    state.region = "";
    state.postcodeOpen = false;
    state.tab = "mypage";
    state.screen = "ship";
  } else if (cartMore) {
    state.cartModal = false;
  } else if (receive) {
    state.region = "";
    state.postcodeOpen = false;
    state.tab = "mypage";
    state.screen = "ship";
  } else if (addressNew) {
    blankAddressFields();
  } else if (addressDefault) {
    setDefaultAddress(addressDefault.dataset.addressDefault);
  } else if (addressSave) {
    if (!addressSave.disabled && saveCurrentAddress()) {
      state.toast = "배송지를 저장했어요.";
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    }
  } else if (addressPick) {
    const found = addresses.find((item) => item.id === addressPick.dataset.address);
    if (found) fillAddress(found);
  } else if (region) {
    state.region = region.dataset.region;
    state.postcodeOpen = false;
    state.postcodeError = false;
    if (state.region) applyDefaultAddress();
  } else if (postcodeClose) {
    state.postcodeOpen = false;
  } else if (postcode) {
    state.postcodeOpen = true;
    state.postcodeError = false;
  } else if (cardHit) {
    state.shipQty = 1;
    if (state.screen !== "card") {
      state.cardFrom = state.screen === "ship" ? "ship" : state.screen === "track" ? "track" : "album";
    }
    state.cardId = cardHit.dataset.card;
    state.screen = "card";
    state.tab = state.cardFrom === "album" ? "album" : "mypage";
  } else if (trackCopy) {
    const number = trackCopy.dataset.trackCopy;
    if (navigator.clipboard && number) {
      navigator.clipboard.writeText(number).then(() => {
        state.toast = "송장번호를 복사했어요";
        render();
        window.setTimeout(() => {
          state.toast = "";
          render();
        }, 1600);
      });
    }
    return;
  } else if (shipmentHit) {
    state.shipmentId = shipmentHit.dataset.shipment;
    state.tab = "mypage";
    state.screen = "track";
  } else if (trackStatus) {
    state.focusTrack = trackStatus.dataset.trackStatus;
    state.shipmentId = "";
    state.tab = "mypage";
    state.screen = "track";
  } else if (dot) {
    moveBanner(Number(dot.dataset.dot));
  } else if (artist) {
    state.albumArtist = artist.dataset.artist;
    state.picked = [];
  } else if (request && !request.disabled) {
    saveCurrentAddress();
    const cardIds = [];
    state.owned.forEach((card) => {
      if (card.status !== "shipping_cart") return;
      card.status = "shipping_requested";
      cardIds.push(card.id);
    });
    const place = state.region === "domestic" ? "대한민국" : state.country;
    const quote = shippingQuote(cardIds.length, place);
    const address = state.region === "domestic"
      ? [state.postcode, state.address, state.addressDetail].filter(Boolean).join(" ")
      : [state.address, state.addressDetail, [state.city, state.province].filter(Boolean).join(" "), state.postcode].filter(Boolean).join(", ");
    state.shipments.unshift({
      id: `SH_${state.shipments.length + 1}`,
      status: "shipping_requested",
      place,
      feeText: quote.feeText,
      method: quote.method,
      receiver: state.receiver,
      phone: state.phone.trim(),
      email: state.email.trim(),
      postcode: state.postcode.trim(),
      address,
      tracking: "",
      requestedOn: isoDate(),
      cardIds,
      cards: orderCards(cardIds),
    });
    persistOrders();
    state.focusTrack = "shipping_requested";
    state.shipmentId = state.shipments[0].id;
    state.tab = "mypage";
    state.screen = "track";
  } else if (catalogSearchClose) {
    state.catalogSearch = false;
    state.catalogQuery = "";
  } else if (catalogSearch) {
    state.catalogSearch = true;
  } else if (excludeSold) {
    state.excludeSold = !state.excludeSold;
  } else if (catalogChip) {
    if (state.screen === "artist") state.catalogFilter = catalogChip.dataset.catalog;
    else state.catalogKind = catalogChip.dataset.catalog;
  } else if (profile) {
    const fromArtists = state.screen === "artists";
    state.tab = "home";
    state.searchOpen = false;
    state.query = "";
    resetCatalog();
    if (profile.dataset.profile === "all") {
      state.profile = "";
      state.profileFrom = "";
      state.screen = "artists";
    } else {
      state.profileFrom = fromArtists ? "artists" : "";
      state.profile = profile.dataset.profile;
      state.screen = "artist";
    }
  } else if (searchOpenBtn) {
    state.searchOpen = true;
    state.tab = "home";
    state.screen = "home";
  } else if (searchClose) {
    state.searchOpen = false;
    state.query = "";
  } else if (wish) {
    const id = wish.dataset.wish;
    state.wished = state.wished.includes(id) ? state.wished.filter((item) => item !== id) : [...state.wished, id];
  } else if (share) {
    const item = product(share.dataset.share);
    const text = `${item.artist} ${productName(item)}`;
    if (navigator.share) {
      navigator.share({ title: productName(item), text, url: location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${location.href}`).then(() => {
        state.toast = "링크를 복사했어요";
        render();
        window.setTimeout(() => {
          state.toast = "";
          render();
        }, 1600);
      });
    }
    return;
  } else if (menu) {
    state.tab = "mypage";
    state.screen = menu.dataset.menu;
    state.shipmentId = "";
    if (menu.dataset.menu === "track") state.focusTrack = "all";
  } else if (walletConnect) {
    // 슬라이드 18: 지갑페이지로 이동, 연결 후 결제 시트로 돌아온다.
    state.walletModal = false;
    state.walletReturn = { productId: state.productId, sheet: state.sheet };
    state.sheet = null;
    state.screen = "wallet";
    state.tab = "home";
  } else if (walletClose || (state.walletModal && walletBackdrop)) {
    state.walletModal = false;
  } else if (state.cartModal && walletBackdrop) {
    state.cartModal = false;
  } else if (sheetClose || event.target.classList.contains("sheet-bg")) {
    state.sheet = null;
    state.walletModal = false;
  } else {
    return;
  }
  const focusSearch = Boolean(searchOpenBtn);
  const focusCatalog = Boolean(catalogSearch);
  render();
  if (cardHit) app.querySelector(".scroll")?.scrollTo(0, 0);
  if (focusSearch) app.querySelector("[data-field=query]")?.focus();
  if (focusCatalog) app.querySelector("[data-field=catalogQuery]")?.focus();
});

app.addEventListener("change", (event) => {
  if (event.target.matches("[data-country]")) {
    state.country = event.target.value;
    render();
    return;
  }
  if (event.target.matches("select[data-ex-wallet]")) {
    state.exWallet = Number(event.target.value) || 0;
    persistWallet();
    render();
    return;
  }
  if (event.target.matches("[data-field=exDate]")) {
    state.exDate = event.target.value;
    render();
    return;
  }
  if (event.target.matches("select[data-album-status]")) {
    const next = event.target.value;
    state.focusStatus = next === "all" ? null : next;
    state.picked = [];
    render();
  }
});

app.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (!field) return;
  state[field] = event.target.value;
  if (field === "exTott" || field === "exTp") {
    syncExchangeForm(field === "exTott" ? "tott" : "tp");
    return;
  }
  if (field === "exDate") return; // change 이벤트에서 다시 그린다.
  if (field === "query" || field === "catalogQuery") {
    const caret = event.target.selectionStart;
    render();
    const input = app.querySelector(`[data-field=${field}]`);
    if (input) {
      input.focus();
      input.setSelectionRange(caret, caret);
    }
    return;
  }
  const ready = shipReady();
  const button = app.querySelector("[data-request]");
  const save = app.querySelector("[data-address-save]");
  if (button) button.disabled = !ready;
  if (save) save.disabled = !ready;
});

document.addEventListener("click", (event) => {
  const board = event.target.closest("[data-board]");
  if (board) {
    if (board.dataset.board === state.board) return;
    applyScene(board.dataset.board === "admin" ? (ADMIN_PAGES[state.adminScene] ? state.adminScene : "admin-dash") : "home");
    return;
  }
  const scene = event.target.closest("[data-scene]");
  if (!scene) return;
  applyScene(scene.dataset.scene);
});

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest("#app") && !event.target.closest("input, textarea")) event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  if (event.target.closest("#app img, #app video, #app .fly-card")) event.preventDefault();
});

document.addEventListener("visibilitychange", () => {
  shieldFronts(document.hidden);
});

document.addEventListener("keyup", (event) => {
  if (event.key !== "PrintScreen") return;
  shieldFronts(true);
  setTimeout(() => shieldFronts(false), 1200);
});

ensurePurchases();
render();
startRates();
