const STORAGE_KEY = "photocard-register-v5";
const LEGACY_KEY = "photocard-register-v4";
const STATUS = [
  ["draft", "등록중"],
  ["on", "판매중"],
  ["out", "품절"],
  ["soon", "입고예정"],
];

let packs = [];
let banners = [];
let artistEmblems = {};
let orders = [];
let orderId = "";
let currentId = "";
let query = "";
let screen = "dash";
let packView = "list";
let packTab = "info";
let statusFilter = "all";
let kindFilter = "all";
let packSort = "recent";
let draft = null;
let cardKey = "";
let cardView = "list";
let orderFilter = "all";
let regionFilter = "all";
let countryFilter = "";
let dateFrom = "";
let dateTo = "";
let selectedOrderIds = new Set();
let selectedTrashIds = new Set();
let shipPanel = false;
let bulkCarrier = "";
let bulkTracks = {};
let uploadPreview = null;
let noticeId = "";
let categories = [];
let categoryId = "";
let cardArtistId = "";
let cardAlbum = "";
let cardEvent = "";

const ORDERS_KEY = "photocard-orders-v1";
const ORDER_STATUS = [
  ["shipping_requested", "신규 주문"],
  ["preparing", "준비중"],
  ["ready", "발송대기"],
  ["shipped", "배송중"],
  ["delivered", "배송완료"],
];
const ORDER_FILTERS = [
  ["all", "전체"],
  ...ORDER_STATUS,
  ["problem", "취소 / 문제 주문"],
];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && Array.isArray(saved.packs) && saved.packs.length) return saved;
  } catch (error) {
    console.warn(error);
  }
  const fresh = { packs: structuredClone(SEED), banners: [], artistEmblems: {} };
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    if (legacy?.banners) fresh.banners = legacy.banners;
    if (legacy?.artistEmblems) fresh.artistEmblems = legacy.artistEmblems;
  } catch (error) {
    console.warn(error);
  }
  return fresh;
}

function prepare(data) {
  data.packs.forEach((item, index) => {
    if (item.sort == null) item.sort = index;
    if (item.home == null) item.home = false;
    item.eventNameKo = item.eventNameKo != null ? item.eventNameKo : "";
    item.eventNameEn = item.eventNameEn != null ? item.eventNameEn : (item.eventName || "");
    item.artistName = artistName(item.artistId);
    item.guides = item.guides || {};
    item.facts = item.facts || {};
    item.perks = item.perks || ["", "", ""];
    item.sheetNotes = item.sheetNotes || ["", "", ""];
    item.displayName = item.displayName || "";
    item.summary = item.summary || "";
  });
  data.banners = data.banners || [];
  data.artistEmblems = data.artistEmblems || {};
  attachCategories(data);
  return data;
}

function seedCategories(packList) {
  const albums = new Map();
  (packList || []).forEach((pack) => {
    const name = String(pack.album || "").trim();
    if (!pack.artistId || !name) return;
    const list = albums.get(pack.artistId) || [];
    if (!list.includes(name)) list.push(name);
    albums.set(pack.artistId, list);
  });
  return ARTISTS.map((artist) => ({
    id: artist.id,
    name: artist.name,
    profileName: artist.name,
    profileImage: "",
    kind: artist.kind,
    members: [...(artist.members || [])],
    albums: albums.get(artist.id) || [],
    groupId: artist.groupId || "",
  }));
}

function attachCategories(data) {
  if (!Array.isArray(data.categories) || !data.categories.length) data.categories = seedCategories(data.packs);
  data.categories.forEach((category) => {
    category.members = Array.isArray(category.members) ? category.members : [];
    category.albums = normalizeAlbums(category.albums);
    category.groupId = category.groupId || "";
    const seed = artistSeed(category.id);
    if (!("nameKo" in category)) category.nameKo = seed.ko || "";
    if (!("nameEn" in category)) category.nameEn = seed.en || "";
    if (!("aliases" in category)) category.aliases = seed.aliases || "";
    category.profileName = localizedName(category.nameKo, category.nameEn, category.profileName || category.name);
    category.profileImage = category.profileImage || data.artistEmblems?.[category.id] || "";
    if (category.profileImage) data.artistEmblems[category.id] = category.profileImage;
  });
  data.packs.forEach((pack) => {
    const category = data.categories.find((item) => item.id === pack.artistId);
    const name = String(pack.album || "").trim();
    if (!category || !name) return;
    let album = category.albums.find((item) => item.name === name);
    if (!album) {
      album = { name, cover: pack.cover || "" };
      category.albums.push(album);
    } else if (!album.cover && pack.cover) album.cover = pack.cover;
    if (album.cover) pack.cover = album.cover;
  });
}

function localizedName(ko, en, fallback) {
  const korean = (document.documentElement.lang || "ko").toLowerCase().startsWith("ko");
  const first = korean ? ko : en;
  const second = korean ? en : ko;
  return String(first || second || fallback || "").trim();
}

function aliasTokens(value) {
  return String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

function artistSeed(id) {
  return (typeof ARTIST_I18N !== "undefined" && ARTIST_I18N[id]) || {};
}

function artistName(id) {
  if (id === HOLDING_ID) return "미분류";
  const category = categories.find((item) => item.id === id);
  const seed = artistSeed(id);
  const ko = category && "nameKo" in category ? category.nameKo : seed.ko;
  const en = category && "nameEn" in category ? category.nameEn : seed.en;
  const named = localizedName(ko, en, category?.profileName || category?.name);
  if (named) return named;
  return ARTISTS.find((artist) => artist.id === id)?.name || "미분류";
}

function categoryLabel(artistId, list = categories) {
  const found = (list || []).find((item) => item.id === artistId);
  if (found?.name) return found.name;
  return artistName(artistId);
}

function managementCode(item, card, list) {
  const category = String(categoryLabel(item.artistId, list) || "미분류").replace(/\s+/g, "");
  const album = String(item.album || "NONE").replace(/\s+/g, "") || "NONE";
  const digits = String(card.no || "").replace(/\D/g, "");
  const seq = (digits || "0").padStart(4, "0");
  return `${category}-${album}-${seq}`;
}

function assignCardCodes(packList, list = categories) {
  const used = new Set();
  packList.forEach((item) => item.cards.forEach((card) => {
    if (card.code) used.add(card.code);
  }));
  packList.forEach((item) => item.cards.forEach((card) => {
    if (card.code) return;
    let code = managementCode(item, card, list);
    let extra = 2;
    while (used.has(code)) {
      code = `${managementCode(item, card, list)}-${extra}`;
      extra += 1;
    }
    card.code = code;
    used.add(code);
  }));
}

function artistById(id) {
  return categories.find((artist) => artist.id === id) || ARTISTS.find((artist) => artist.id === id);
}

function listedNames(values) {
  return (values || []).map((value) => {
    if (value && typeof value === "object") return String(value.name || "").trim();
    return String(value || "").trim();
  }).filter(Boolean);
}

function albumRecord(value) {
  if (value && typeof value === "object") {
    const name = String(value.name || "").trim();
    const nameKo = value.nameKo != null ? String(value.nameKo) : "";
    const nameEn = value.nameEn != null ? String(value.nameEn) : name;
    return { name: name || nameEn || nameKo.trim(), nameKo, nameEn, cover: value.cover || "" };
  }
  const name = String(value || "").trim();
  return { name, nameKo: "", nameEn: name, cover: "" };
}

function normalizeAlbums(values) {
  const records = [];
  (values || []).forEach((value) => {
    const album = albumRecord(value);
    if (!album.name && !album.cover) return;
    const found = records.find((item) => item.name === album.name);
    if (found) {
      if (!found.cover) found.cover = album.cover;
      if (!found.nameKo && album.nameKo) found.nameKo = album.nameKo;
      if (!found.nameEn && album.nameEn) found.nameEn = album.nameEn;
    } else records.push(album);
  });
  return records;
}

function membersOf(artistId) {
  const artist = artistById(artistId);
  if (!artist) return [""];
  const names = listedNames(artist.members);
  if (artist.kind === "solo") return ["", ...names];
  return ["", "단체", ...names];
}

function albumText(album) {
  if (!album) return "";
  return localizedName(album.nameKo, album.nameEn, album.name);
}

function eventText(item) {
  return localizedName(item?.eventNameKo, item?.eventNameEn, item?.eventName);
}

function albumsOf(artistId) {
  return listedNames(artistById(artistId)?.albums);
}

function categoryChoices() {
  const named = categories.filter((item) => String(item.profileName || item.name || "").trim());
  return named.length ? named : categories;
}

function artistsOf(kind) {
  const source = categories.length ? categories : ARTISTS;
  return source.filter((artist) => artist.kind === kind && artist.name);
}

function albumSelect(item) {
  const albums = albumsOf(item.artistId);
  const missing = item.album && !albums.includes(item.album);
  const options = albums
    .map((name) => `<option value="${escapeAttr(name)}" ${name === item.album ? "selected" : ""}>${escapeAttr(name)}</option>`)
    .join("");
  const extra = missing ? `<option value="${escapeAttr(item.album)}" selected>${escapeAttr(item.album)}</option>` : "";
  const empty = !albums.length && !missing ? `<option value="">앨범 없음</option>` : "";
  return `<select data-field="album" ${albums.length || missing ? "" : "disabled"}>${empty}${options}${extra}</select>`;
}

function labelOf(list, id) {
  return list.find((item) => item.id === id)?.label || id;
}

function setListed(item, on) {
  item.home = on;
}

function setSale(item, value) {
  if (value === "on" && blockers(item).length) return;
  item.status = value;
}

function blockers(item) {
  const gaps = [];
  if (item.artistId === HOLDING_ID) gaps.push("가수명이 없다");
  if (!item.album.trim()) gaps.push("앨범명이 없다");
  if (!item.cover) gaps.push("상품 이미지가 없다");
  if (!item.cards.length) gaps.push("카드가 없다");
  if (item.cards.some((card) => card.version === "unset")) {
    gaps.push("버전이 미정인 카드가 있다. 실물에 적힌 판만 고른다");
  }
  item.cards.forEach((card) => {
    if (!card.member) gaps.push(`${card.no} 멤버가 없다`);
    if (!card.front || !card.back) gaps.push(`${card.no} 앞면 또는 뒷면이 없다`);
    if (card.stock === "") gaps.push(`${card.no} 재고가 없다`);
  });
  if (!item.cards.some((card) => Number(card.stock) > 0)) gaps.push("재고가 있는 카드가 없다");
  return gaps;
}

function searchKeys(item) {
  const artist = artistById(item.artistId);
  const keys = [item.album, item.eventName, item.eventNameKo, item.eventNameEn];
  const album = (artist?.albums || []).find((entry) => entry.name === item.album);
  if (album) keys.push(album.nameKo, album.nameEn);
  if (!artist) return keys;
  const group = artist.kind === "group" ? artist : artistById(artist.groupId);
  keys.push(artist.name, artist.nameKo, artist.nameEn, ...aliasTokens(artist.aliases), ...(ALIASES[artist.id] || []), ...artist.members);
  if (artist.kind === "group") {
    ARTISTS.filter((solo) => solo.groupId === artist.id).forEach((solo) => {
      keys.push(solo.name, ...(ALIASES[solo.id] || []));
    });
  }
  if (group && artist.kind === "solo") keys.push(group.name, ...(ALIASES[group.id] || []));
  return keys;
}

function activePacks() {
  return packs.filter((pack) => !pack.deletedAt);
}

function trashedPacks() {
  return packs
    .filter((pack) => pack.deletedAt)
    .sort((a, b) => String(b.deletedAt).localeCompare(String(a.deletedAt)));
}

function dayLabel(value) {
  const [year, month, day] = String(value || "").split("-");
  if (!day) return "없음";
  return `${year}. ${month}. ${day}.`;
}

function saveRegister() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ packs, banners, artistEmblems, categories }));
}

function sortedPacks() {
  return activePacks().sort((a, b) => a.sort - b.sort);
}

function sortedBanners() {
  return [...banners].sort((a, b) => a.sort - b.sort);
}

function moveItem(list, id, direction) {
  const ordered = [...list].sort((a, b) => a.sort - b.sort);
  const index = ordered.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ordered.length) return;
  const sort = ordered[index].sort;
  ordered[index].sort = ordered[target].sort;
  ordered[target].sort = sort;
}

function packLabel(item) {
  const artist = artistName(item.artistId);
  const album = item.album || "앨범 미정";
  const which = item.eventName ? `${album} ${item.eventName}` : `${artist} ${album}`;
  return `${which} - 포토 세트`;
}

function packVisible(item) {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  return searchKeys(item).some((key) => String(key || "").toLowerCase().includes(text));
}

function saleLabel(status) {
  return { draft: "등록중", on: "판매중", out: "품절", stop: "판매중지", soon: "입고예정" }[status] || status;
}

function packMatches(item) {
  if (statusFilter !== "all" && item.status !== statusFilter) return false;
  if (kindFilter !== "all" && (item.kind || "unknown") !== kindFilter) return false;
  return true;
}

function stockSum(item) {
  const filled = item.cards.filter((card) => card.stock !== "" && card.stock != null);
  if (!filled.length) return null;
  return filled.reduce((sum, card) => sum + Number(card.stock), 0);
}

function stockLabel(item) {
  const total = stockSum(item);
  return total == null ? "미입력" : `${total}장`;
}

function productTitle(item) {
  return item.album || "앨범 미정";
}

function appNameParts(item) {
  const album = String(item.album || "").trim() || "앨범명";
  const eventName = String(item.eventName || "").trim();
  return eventName ? `${album} ${eventName}` : album;
}

function appDetailTitle(item) {
  const named = String(item.displayName || "").trim();
  return named || `${appNameParts(item)} Photocard`;
}

function appListTitle(item) {
  const named = String(item.displayName || "").trim();
  return named || `${appNameParts(item)} Random Photocard`;
}

function comparePacks(a, b) {
  if (packSort === "listed") {
    if (a.home !== b.home) return a.home ? -1 : 1;
    return a.sort - b.sort;
  }
  if (packSort === "stock") {
    const left = stockSum(a);
    const right = stockSum(b);
    if (left == null && right == null) return a.sort - b.sort;
    if (left == null) return 1;
    if (right == null) return -1;
    return left - right;
  }
  const left = a.created || "";
  const right = b.created || "";
  if (left !== right) return right.localeCompare(left);
  return a.sort - b.sort;
}

function listedPacks() {
  return activePacks().filter(packVisible).filter(packMatches).sort(comparePacks);
}

function kindWord(kind) {
  if (kind === "solo") return "개인";
  if (kind === "group") return "그룹";
  return "미분류";
}

function blankPack() {
  return {
    id: crypto.randomUUID(),
    artistId: artistsOf("group")[0]?.id || HOLDING_ID,
    album: albumsOf(artistsOf("group")[0]?.id)[0] || "",
    cover: "",
    price: 25,
    status: "draft",
    eventType: "album",
    eventName: "",
    kind: "group",
    home: false,
    cards: [],
    displayName: "",
    summary: "",
    perks: ["", "", ""],
    facts: {},
    guides: {},
    sheetNotes: ["", "", ""],
    created: new Date().toISOString().slice(0, 10),
    sort: packs.length,
    saved: false,
  };
}

function faceThumb(src) {
  if (!src) return `<span class="thumb empty-face"></span>`;
  return `<img class="thumb" alt="" src="${src}" />`;
}

function packRows() {
  const rows = listedPacks();
  if (!rows.length) return `<tr><td class="empty" colspan="13">찾는 상품이 없어요.</td></tr>`;
  return rows
    .map((item) => {
      const image = item.cover ? `<img class="mini-cover" alt="" src="${item.cover}" />` : `<span class="mini-cover"></span>`;
      return `<tr data-open-pack="${item.id}">
        <td>${image}</td>
        <td>${escapeAttr(productTitle(item))}</td>
        <td>${escapeAttr(artistName(item.artistId))}</td>
        <td>${kindWord(item.kind)}</td>
        <td>${escapeAttr(item.album || "—")}</td>
        <td>${escapeAttr(item.eventName || "—")}</td>
        <td>${item.cards.length}종</td>
        <td>${stockLabel(item)}</td>
        <td>${item.price} TP</td>
        <td>${saleLabel(item.status)}</td>
        <td>${item.home ? "ON" : "OFF"}</td>
        <td>${escapeAttr(item.created || "—")}</td>
        <td><button class="text-btn" type="button" data-trash-pack="${escapeAttr(item.id)}">삭제</button></td>
      </tr>`;
    })
    .join("");
}

function paintPackRows() {
  const body = document.getElementById("pack-rows");
  if (body) body.innerHTML = packRows();
}

function renderPackList() {
  const statusFilters = [
    ["all", "전체"],
    ["on", "판매중"],
    ["out", "품절"],
    ["draft", "등록중"],
    ["stop", "판매중지"],
  ];
  const kindFilters = [
    ["all", "전체"],
    ["group", "그룹"],
    ["solo", "개인"],
  ];
  document.getElementById("main").innerHTML = `
    <div class="form-head">
      <h2>상품목록</h2>
      <div class="actions">
        <button class="text-btn" id="open-trash" type="button">삭제목록 ${trashedPacks().length}</button>
        <button class="text-btn" id="reset" type="button">처음 목록</button>
        <button class="save" id="save" type="button">이 브라우저에 저장</button>
        <button class="save" id="add-pack" type="button">+ 새 상품 등록</button>
      </div>
    </div>
    <div class="list-tools">
      <label class="search">검색
        <input id="pack-query" type="search" placeholder="가수명, 앨범명, 행사명" value="${escapeAttr(query)}" />
      </label>
      <div class="tool">판매 상태
        <div class="filters">${statusFilters
        .map(([id, label]) => `<button type="button" data-status-filter="${id}" class="${id === statusFilter ? "on" : ""}">${label}</button>`)
        .join("")}</div>
      </div>
      <div class="tool">활동
        <div class="filters">${kindFilters
        .map(([id, label]) => `<button type="button" data-kind-filter="${id}" class="${id === kindFilter ? "on" : ""}">${label}</button>`)
        .join("")}</div>
      </div>
      <label>정렬
        <select id="pack-sort">
          <option value="recent" ${packSort === "recent" ? "selected" : ""}>최근 등록순</option>
          <option value="listed" ${packSort === "listed" ? "selected" : ""}>노출순</option>
          <option value="stock" ${packSort === "stock" ? "selected" : ""}>재고 적은순</option>
        </select>
      </label>
    </div>
    <div class="table-wrap">
      <table class="product-table">
        <thead>
          <tr>
            <th>이미지</th><th>상품명</th><th>가수</th><th>활동</th><th>앨범명</th><th>행사명</th><th>카드</th><th>재고</th><th>가격</th><th>상태</th><th>노출</th><th>등록일</th><th></th>
          </tr>
        </thead>
        <tbody id="pack-rows">${packRows()}</tbody>
      </table>
    </div>`;
}

function renderSidebar() {
  const search = document.querySelector(".search");
  const list = document.getElementById("pack-list");
  if (!search || !list) return;
  const showSearch = screen === "orders" || screen === "ship" || screen === "track" || screen === "notice" || screen === "category" || (screen === "cards" && cardView === "edit");
  search.hidden = !showSearch;
  if (screen === "category") renderCategorySidebar();
  else if (screen === "cards" && cardView === "edit") renderCardSidebar();
  else if (screen === "orders" || screen === "ship" || screen === "track") renderOrderSidebar();
  else if (screen === "notice") renderNoticeSidebar();
  else list.innerHTML = "";
}

function memberOptions(artistId, selected) {
  return membersOf(artistId)
    .map((member) => {
      const label = member || "미확인";
      return `<option value="${member}" ${member === selected ? "selected" : ""}>${label}</option>`;
    })
    .join("");
}

function activePack() {
  if (packView === "create" && draft) return draft;
  return packs.find((pack) => pack.id === currentId);
}

function packTabs(item) {
  const tabs = [
    ["info", "기본정보"],
    ["cards", "포토카드 구성"],
    ["copy", "안내 문구"],
    ["sale", "판매/노출 설정"],
  ];
  return `
    <button class="text-btn" id="back-list" type="button">← 상품목록</button>
    <div class="form-head">
      <div>
        <p class="kicker">${escapeAttr(artistName(item.artistId))}</p>
        <h2>${escapeAttr(productTitle(item))}</h2>
      </div>
      <div class="actions">
        <button class="text-btn" type="button" data-trash-pack="${escapeAttr(item.id)}">삭제</button>
        <button class="save" id="save" type="button">이 브라우저에 저장</button>
      </div>
    </div>
    <div class="pack-tabs">
      ${tabs.map(([id, label]) => `<button type="button" data-pack-tab="${id}" class="${packTab === id ? "on" : ""}">${label}</button>`).join("")}
    </div>`;
}

function renderPackInfo(item) {
  const coverStyle = item.cover ? ` style="background-image:url('${item.cover}')"` : "";
  const category = categories.find((entry) => entry.id === item.artistId);
  const emblem = profileSrc(item.artistId, category?.profileImage || "");
  const choices = categoryChoices();
  return `
    ${packTabs(item)}
    <p class="hint">가수의 사진, 이름, 앨범 목록은 카테고리에 있어요. 여기서는 그 상품만 적어요.</p>
    <section class="app-sheet" aria-label="앱 상품 화면">
      <div class="app-cover">
        <div class="app-shot${item.cover ? " has" : ""}"${coverStyle}>${item.cover ? "" : "앨범 자켓"}</div>
        <div class="app-tools">
          <span class="app-where">이 사진이 상품 썸네일이에요</span>
          <label class="upload">앨범 자켓 올리기
            <input id="cover-file" type="file" accept="image/*" />
          </label>
          <button class="text-btn" id="clear-cover" type="button" ${item.cover ? "" : "disabled"}>이미지 빼기</button>
        </div>
      </div>
      <div class="app-body">
        <div class="app-artist">
          ${profileFace(emblem, artistName(item.artistId))}
          <label>카테고리
            <select data-field="artistId">
              ${choices.map((artist) => `<option value="${artist.id}" ${artist.id === item.artistId ? "selected" : ""}>${escapeAttr(artist.profileName || artist.name)}</option>`).join("")}
            </select>
            <span class="app-where">프로필은 카테고리 것을 그대로 써요</span>
          </label>
        </div>
        <label class="app-title">상품명
          <input data-field="displayName" value="${escapeAttr(item.displayName || "")}" placeholder="비우면 앨범명으로 나와요" />
        </label>
        <p class="app-map">상세 제목 · ${escapeAttr(appDetailTitle(item))}</p>
        <p class="app-map">목록 제목 · ${escapeAttr(appListTitle(item))}</p>
        <label class="app-summary">한줄 설명
          <input data-field="summary" value="${escapeAttr(item.summary || "")}" placeholder="공식 실물 포토카드 랜덤팩" />
          <span class="app-where">상세 제목 아래</span>
        </label>
        <div class="app-offer">
          <p class="app-lineup">${item.cards.length}종 중 랜덤 1장<span>포토카드 구성 수</span></p>
          <label>가격
            <span class="app-price"><input data-field="price" type="number" min="1" value="${item.price}" /><em>TP</em></span>
            <span class="app-where">상세 오른쪽, 목록 가격</span>
          </label>
        </div>
        <div class="app-source">
          <p class="app-where">상품명을 비우면 앨범명과 행사명이 위 제목에 들어가요. 행사명은 검색에도 써요.</p>
          <label>앨범명
            ${albumSelect(item)}
            <span class="app-where">카테고리에 등록된 앨범만 나와요</span>
          </label>
          <div class="app-event">
            <label>행사 종류
              <select data-field="eventType">
                ${EVENT_TYPES.map((event) => `<option value="${event.id}" ${event.id === item.eventType ? "selected" : ""}>${event.label}</option>`).join("")}
              </select>
            </label>
            <label>행사명
              <input data-field="eventName" value="${escapeAttr(item.eventName)}" placeholder="없으면 비움" />
            </label>
          </div>
        </div>
      </div>
    </section>`;
}

function renderPackCards(item) {
  const rows = item.cards
    .map(
      (card, index) => `<tr>
        <td>${escapeAttr(card.code || card.no)}</td>
        <td class="faces">${faceThumb(card.front)}${faceThumb(card.back)}</td>
        <td><select data-card="${index}" data-card-field="member">${memberOptions(item.artistId, card.member)}</select></td>
        <td><select data-card="${index}" data-card-field="rarity">${RARITIES.map((rarity) => `<option ${rarity === card.rarity ? "selected" : ""}>${rarity}</option>`).join("")}</select></td>
        <td><input data-card="${index}" data-card-field="stock" type="number" min="0" value="${escapeAttr(String(card.stock))}" placeholder="수량" /></td>
        <td><button class="text-btn" type="button" data-remove-card="${index}">빼기</button></td>
      </tr>`,
    )
    .join("");
  return `
    ${packTabs(item)}
    <div class="card-head">
      <h3>포토카드 구성 ${item.cards.length}종</h3>
      <button class="save" id="add-card" type="button">+ 카드 등록</button>
    </div>
    <p class="hint">이 상품에 들어가는 카드예요. 재고를 비워 두면 아직 수량을 안 넣은 것이고, 0이면 추첨에서 빠져요. 남은 재고 합계는 숫자를 넣은 카드만 더해요.</p>
    <table class="compose-table">
      <thead>
        <tr><th>관리번호</th><th>면</th><th>멤버</th><th>등급</th><th>재고</th><th></th></tr>
      </thead>
      <tbody>${rows || `<tr><td class="empty" colspan="6">등록된 카드가 없어요.</td></tr>`}</tbody>
    </table>`;
}

function copyLines(lines) {
  return lines.join("\n");
}

function renderPackCopy(item) {
  item.facts = item.facts || {};
  item.guides = item.guides || {};
  item.perks = item.perks || ["", "", ""];
  item.sheetNotes = item.sheetNotes || ["", "", ""];
  const fact = (key, label, placeholder) => `
    <label>${label}
      <input data-fact="${key}" value="${escapeAttr(item.facts[key] || "")}" placeholder="${escapeAttr(placeholder)}" />
    </label>`;
  const guide = (key, label, lines) => `
    <label>${label}
      <textarea data-guide="${key}" placeholder="${escapeAttr(copyLines(lines))}">${escapeAttr(item.guides[key] || "")}</textarea>
    </label>`;
  return `
    ${packTabs(item)}
    <p class="hint">앱 상품 상세와 결제 화면에 나오는 문구예요. 비워 두면 지금 앱에 있는 기본 문구가 그대로 나와요. 고친 뒤에는 이 브라우저에 저장해야 앱에 반영돼요.</p>
    <div class="grid cols-3">
      ${fact("size", "사이즈", "55 × 85 mm")}
      ${fact("type", "상품 유형", "Official MD")}
      ${fact("state", "상품 상태", "미사용 공식 MD")}
    </div>
    <div class="grid cols-3">
      ${["실물 카드", "보관 가능"].map((placeholder, index) => `
        <label>혜택 ${index + 1}
          <input data-perk="${index}" value="${escapeAttr(item.perks[index] || "")}" placeholder="${escapeAttr(placeholder)}" />
        </label>`).join("")}
    </div>
    ${guide("random", "랜덤 상품 안내", ["상품마다 구성된 포토카드 중 1장이 랜덤으로 제공돼요.", "동일한 카드가 다시 나올 수 있어요."])}
    ${guide("photocard", "포토카드 안내", ["뽑은 포토카드는 보유카드에서 확인이 가능해요.", "배송 기능은 추후 업데이트 될 예정이에요.(국내, 해외)", "한 줄에 하나씩 적어요."])}
    <div class="grid cols-3">
      ${["뽑은 카드는 보유 카드에 보관됩니다.", "동일 카드가 중복으로 뽑힐 수 있습니다."].map((placeholder, index) => `
        <label>결제 안내 ${index + 1}
          <input data-sheet-note="${index}" value="${escapeAttr(item.sheetNotes[index] || "")}" placeholder="${escapeAttr(placeholder)}" />
        </label>`).join("")}
    </div>`;
}

function renderPackSale(item) {
  const gaps = blockers(item);
  const sellable = gaps.length === 0;
  return `
    ${packTabs(item)}
    <div class="grid">
      <label>메인 노출
        <select data-field="listed">
          <option value="1" ${item.home ? "selected" : ""}>노출</option>
          <option value="0" ${item.home ? "" : "selected"}>미노출</option>
        </select>
        <span class="field-help">노출이면 홈과 가수 상품에 나와요.</span>
      </label>
      <label>판매 상태
        <select data-field="selling">
          <option value="draft" ${item.status === "draft" ? "selected" : ""}>등록중</option>
          <option value="on" ${item.status === "on" ? "selected" : ""} ${sellable || item.status === "on" ? "" : "disabled"}>판매중</option>
          <option value="out" ${item.status === "out" ? "selected" : ""}>품절</option>
          <option value="stop" ${item.status === "stop" ? "selected" : ""}>판매중지</option>
          ${item.status === "soon" ? `<option value="soon" selected>입고예정</option>` : ""}
        </select>
        <span class="field-help">판매중은 상품 정보, 카드, 재고가 있을 때만 바꿀 수 있어요.</span>
      </label>
    </div>
    <p class="hint">노출로 두고 품절이면 앱에 품절, 입고예정이면 입고예정으로 나와요. 미노출이면 목록에서 빠져요.</p>
    <div class="home-row">
      <span class="hint">노출 순서 ${sortedPacks().findIndex((pack) => pack.id === item.id) + 1}</span>
      <button class="text-btn" data-move="pack" data-dir="-1" type="button">위로</button>
      <button class="text-btn" data-move="pack" data-dir="1" type="button">아래로</button>
    </div>
    <div class="blockers ${sellable ? "ok" : ""}">
      <h3>${sellable ? "판매로 올릴 수 있다" : "판매로 올리기 전에 채울 것"}</h3>
      <ul>${(sellable ? ["고정 항목이 다 찼다"] : gaps).map((gap) => `<li>${gap}</li>`).join("")}</ul>
    </div>`;
}

function erasePacks(ids) {
  const list = packs.filter((pack) => ids.includes(pack.id) && pack.deletedAt);
  if (!list.length) return;
  const ask = list.length === 1
    ? `${productTitle(list[0])} 상품을 완전히 삭제할까요? 되돌릴 수 없어요.`
    : `${list.length}개 상품을 완전히 삭제할까요? 되돌릴 수 없어요.`;
  if (!window.confirm(ask)) return;
  const gone = new Set(list.map((pack) => pack.id));
  packs = packs.filter((pack) => !gone.has(pack.id));
  banners.forEach((banner) => {
    if (gone.has(banner.packId)) banner.packId = "";
  });
  gone.forEach((id) => selectedTrashIds.delete(id));
  if (gone.has(currentId)) currentId = activePacks()[0]?.id || "";
  saveRegister();
  toast(list.length === 1 ? "상품을 삭제했다" : `${list.length}개 상품을 삭제했다`);
  render();
}

function renderPackTrash() {
  const rows = trashedPacks();
  const visible = new Set(rows.map((item) => item.id));
  selectedTrashIds.forEach((id) => {
    if (!visible.has(id)) selectedTrashIds.delete(id);
  });
  const picked = rows.filter((item) => selectedTrashIds.has(item.id));
  const allOn = rows.length > 0 && picked.length === rows.length;
  const body = rows.length
    ? rows.map((item) => {
        const image = item.cover ? `<img class="mini-cover" alt="" src="${item.cover}" />` : `<span class="mini-cover"></span>`;
        const on = selectedTrashIds.has(item.id);
        return `<tr class="${on ? "is-selected" : ""}">
          <td><input type="checkbox" data-trash-check="${escapeAttr(item.id)}" ${on ? "checked" : ""} /></td>
          <td>${image}</td>
          <td>${escapeAttr(productTitle(item))}</td>
          <td>${escapeAttr(artistName(item.artistId))}</td>
          <td>${escapeAttr(item.album || "—")}</td>
          <td>${escapeAttr(item.eventName || "—")}</td>
          <td>${escapeAttr(dayLabel(item.deletedAt))}</td>
          <td><button class="text-btn" type="button" data-erase-pack="${escapeAttr(item.id)}">삭제</button></td>
        </tr>`;
      }).join("")
    : `<tr><td class="empty" colspan="8">삭제목록이 비어 있어요.</td></tr>`;
  document.getElementById("main").innerHTML = `
    <button class="text-btn" id="back-list" type="button">← 상품목록</button>
    <div class="form-head">
      <h2>삭제목록</h2>
      <div class="actions">
        <button class="save" id="erase-selected" type="button" ${picked.length ? "" : "disabled"}>선택 ${picked.length}건 삭제</button>
      </div>
    </div>
    <p class="hint">상품관리에서 삭제한 상품이 여기 쌓여요. 여러 개를 고른 뒤 한 번에 지우거나, 한 줄에서 바로 지울 수 있어요. 여기서 삭제하면 상품이 사라져요.</p>
    <div class="table-wrap">
      <table class="product-table trash-table">
        <thead>
          <tr>
            <th><input id="trash-all" type="checkbox" ${allOn ? "checked" : ""} ${rows.length ? "" : "disabled"} /></th>
            <th>이미지</th><th>상품명</th><th>가수</th><th>앨범명</th><th>행사명</th><th>삭제한 날</th><th></th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  const all = document.getElementById("trash-all");
  if (all) all.indeterminate = picked.length > 0 && !allOn;
}

function renderPackDetail() {
  const item = activePacks().find((pack) => pack.id === currentId) || activePacks()[0];
  if (!item) {
    document.getElementById("main").innerHTML = `<p class="empty">등록된 상품이 없어요.</p>`;
    return;
  }
  currentId = item.id;
  const body = packTab === "cards"
    ? renderPackCards(item)
    : packTab === "sale"
      ? renderPackSale(item)
      : packTab === "copy"
        ? renderPackCopy(item)
        : renderPackInfo(item);
  document.getElementById("main").innerHTML = body;
}

function renderPackCreate() {
  const item = draft || blankPack();
  draft = item;
  const choices = categoryChoices();
  const coverStyle = item.cover ? ` style="background-image:url('${item.cover}')"` : "";
  const next = item.saved
    ? `<button class="save" id="go-cards" type="button">포토카드 등록하기</button>`
    : `<button class="save" id="save-new" type="button">저장</button>`;
  document.getElementById("main").innerHTML = `
    <button class="text-btn" id="back-list" type="button">← 상품목록</button>
    <div class="form-head">
      <div>
        <p class="kicker">새 상품</p>
        <h2>상품 등록</h2>
      </div>
    </div>
    <p class="hint">카테고리에서 가수를 고르고, 앨범 자켓과 가격을 저장한 다음 포토카드를 등록해요.</p>
    <div class="grid">
      <label>1. 카테고리
        <select data-field="artistId">
          ${choices.map((artist) => `<option value="${artist.id}" ${artist.id === item.artistId ? "selected" : ""}>${escapeAttr(artist.profileName || artist.name)} · ${kindWord(artist.kind)}</option>`).join("")}
        </select>
        <span class="field-help">이름, 그룹/개인, 앨범 목록은 카테고리에 있어요.</span>
      </label>
      <label>2. 앨범명
        ${albumSelect(item)}
        <span class="field-help">카테고리에 적어 둔 앨범만 고를 수 있어요.</span>
      </label>
      <label>3. 행사명
        <select data-field="eventType">
          ${EVENT_TYPES.map((event) => `<option value="${event.id}" ${event.id === item.eventType ? "selected" : ""}>${event.label}</option>`).join("")}
        </select>
        <input data-field="eventName" value="${escapeAttr(item.eventName)}" placeholder="없으면 비움" />
        <span class="field-help">같은 앨범이라도 행사가 다르면 상품을 나눠요.</span>
      </label>
    </div>
    <h3 class="field-title">4. 앨범 자켓</h3>
    <div class="cover">
      <div class="cover-slot${item.cover ? " has" : ""}"${coverStyle}>${item.cover ? "" : "자켓 없음"}</div>
      <div class="cover-copy">
        <p class="hint">앨범 자켓을 올리면 그 사진이 상품 썸네일이 돼요. 목록과 상세에 이 사진이 나와요.</p>
        ${profileFace(profileSrc(item.artistId), artistName(item.artistId))}
        <label class="upload">앨범 자켓 올리기
          <input id="cover-file" type="file" accept="image/*" />
        </label>
        <button class="text-btn" id="clear-cover" type="button" ${item.cover ? "" : "disabled"}>이미지 빼기</button>
      </div>
    </div>
    <div class="price-save">
      <label>5. 가격
        <span class="app-price"><input data-field="price" type="number" min="1" value="${item.price}" /><em>TP</em></span>
      </label>
      <div class="actions">${next}</div>
    </div>`;
}

function renderMain() {
  if (packView === "create") renderPackCreate();
  else if (packView === "detail") renderPackDetail();
  else if (packView === "trash") renderPackTrash();
  else renderPackList();
}


function bannerCard(banner) {
  const mid = banner.place === "mid";
  const shot = banner.image
    ? `<img src="${escapeAttr(banner.image)}" alt="" />`
    : `<span class="banner-empty">이미지 없음</span>`;
  return `<div class="banner-row">
    <div class="banner-shot${mid ? " is-mid" : " is-top"}${banner.image ? " has" : ""}">
      ${shot}
      <span class="banner-copy">
        <strong>${escapeAttr(banner.line1 || "문구 1")}</strong>
        <span>${escapeAttr(banner.line2 || "문구 2")}</span>
      </span>
    </div>
    <div class="stack">
      <label class="upload">배너 이미지 올리기
        <input data-banner-file="${banner.id}" type="file" accept="image/*" />
      </label>
      <label>배너 문구 1
        <input data-banner-line1="${banner.id}" value="${escapeAttr(banner.line1 || "")}" placeholder="큰 글자" />
      </label>
      <label>배너 문구 2
        <input data-banner-line2="${banner.id}" value="${escapeAttr(banner.line2 || "")}" placeholder="작은 글자" />
      </label>
      <label>누르면 열리는 상품
        <select data-banner-pack="${banner.id}">
          ${sortedPacks()
            .map((item) => `<option value="${item.id}" ${item.id === banner.packId ? "selected" : ""}>${packLabel(item)}</option>`)
            .join("")}
        </select>
      </label>
      <label class="check">배너 노출
        <input data-banner-on="${banner.id}" type="checkbox" ${banner.on ? "checked" : ""} />
      </label>
      <label>링크
        <select data-banner-link="${banner.id}">
          ${[["product", "상품 상세"], ["artist", "가수 페이지"], ["all", "전체 상품"], ["album", "마이앨범"], ["notice", "공지사항"], ["url", "외부 링크"], ["none", "없음"]].map(([id, label]) => `<option value="${id}" ${(banner.link || "product") === id ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <div class="date-row">
        <label>노출 시작<input data-banner-start="${banner.id}" type="date" value="${escapeAttr(banner.start || "")}" /></label>
        <label>노출 종료<input data-banner-end="${banner.id}" type="date" value="${escapeAttr(banner.end || "")}" /></label>
      </div>
      <div class="actions">
        <button class="text-btn" data-banner-move="${banner.id}" data-dir="-1" type="button">위로</button>
        <button class="text-btn" data-banner-move="${banner.id}" data-dir="1" type="button">아래로</button>
        <button class="text-btn" data-banner-delete="${banner.id}" type="button">삭제</button>
      </div>
    </div>
  </div>`;
}

function renderDisplay() {
  const top = sortedBanners().filter((banner) => banner.place !== "mid");
  const mid = sortedBanners().filter((banner) => banner.place === "mid");
  document.getElementById("main").innerHTML = `
    <div class="form-head">
      <h2>배너</h2>
      <div class="actions">
        <button class="text-btn" id="reset" type="button">처음 목록</button>
        <button class="save" id="save" type="button">이 브라우저에 저장</button>
      </div>
    </div>
    <section class="banner-block">
      <div class="form-head">
        <h3>상단 배너</h3>
        <button class="text-btn" id="add-banner" type="button">상단 배너 추가</button>
      </div>
      <p class="hint">메인 상단 가로 슬라이드예요. 썸네일 비율은 2.05:1이에요.</p>
      ${top.map(bannerCard).join("") || `<p class="empty">상단 배너가 없어요.</p>`}
    </section>
    <section class="banner-block">
      <div class="form-head">
        <h3>중간 배너</h3>
        <button class="text-btn" id="add-mid-banner" type="button">중간 배너 추가</button>
      </div>
      <p class="hint">NEW 아래 가로 배너예요. 썸네일 비율은 1024:191이에요.</p>
      ${mid.map(bannerCard).join("") || `<p class="empty">중간 배너가 없어요.</p>`}
    </section>`;
}

function profileSrc(artistId, uploaded = "") {
  if (uploaded) return uploaded;
  if (artistEmblems[artistId]) return artistEmblems[artistId];
  if (PROFILE_PHOTOS[artistId]) return PROFILE_PHOTOS[artistId];
  return activePacks().find((pack) => pack.artistId === artistId && pack.cover)?.cover || "";
}

function profileFace(src, name) {
  const face = src
    ? `<img class="profile-face" alt="" src="${escapeAttr(src)}" />`
    : `<span class="profile-face"></span>`;
  return `<span class="profile-chip">${face}<strong>${escapeAttr(name || "프로필명 없음")}</strong></span>`;
}

function applyProfileName(category) {
  const name = artistName(category.id) || "미분류";
  category.profileName = name;
  packs.forEach((pack) => {
    if (pack.artistId === category.id) pack.artistName = name;
  });
  if (draft?.artistId === category.id) draft.artistName = name;
}

function coverThumb(item) {
  if (!item.cover) return `<span class="row-thumb is-empty">없음</span>`;
  return `<img class="row-thumb" src="${escapeAttr(item.cover)}" alt="" />`;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function renderModes() {
  document.getElementById("mode-pack").classList.toggle("on", screen === "pack");
  document.getElementById("mode-display").classList.toggle("on", screen === "display");
  document.getElementById("mode-orders").classList.toggle("on", screen === "orders");
}

function orderStatusLabel(status) {
  return ORDER_STATUS.find(([id]) => id === status)?.[1] || status;
}

function purchaseDetail(order) {
  const lines = orderLines(order);
  const cards = lines.map((card) => `
    <tr>
      <td>${escapeAttr(card.ids.join(", "))}</td>
      <td>${escapeAttr(card.artist)} ${escapeAttr(card.album)} ${escapeAttr(card.no)}</td>
      <td>${escapeAttr(card.member || "없음")}</td>
      <td>${card.count}</td>
    </tr>`).join("");
  const amount = Number.isFinite(order.price) ? `${order.price}TP` : "—";
  return `
    <section class="sale-detail">
      <h3>${escapeAttr(order.id)} · ${escapeAttr(order.productName || order.album || "상품")}</h3>
      <p>랜덤팩 구매</p>
      <dl>
        <div><dt>구매일</dt><dd>${escapeAttr(order.purchasedOn || "없음")}</dd></div>
        <div><dt>장수</dt><dd>${order.count || lines.reduce((sum, card) => sum + card.count, 0)}장</dd></div>
        <div><dt>금액</dt><dd>${amount}</dd></div>
      </dl>
      <table>
        <thead><tr><th>보유 번호</th><th>디자인</th><th>멤버</th><th>수량</th></tr></thead>
        <tbody>${cards}</tbody>
      </table>
    </section>
  `;
}

function orderLines(order) {
  const groups = new Map();
  (order.cards || []).forEach((card) => {
    const key = [card.artist, card.album, card.no, card.member].join("|");
    const found = groups.get(key);
    if (found) {
      found.count += 1;
      found.ids.push(card.id);
    } else groups.set(key, { ...card, count: 1, ids: [card.id] });
  });
  return [...groups.values()];
}

function saveOrders() {
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders }));
}

function loadOrderStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "null");
    if (Array.isArray(saved?.orders)) return saved.orders;
  } catch (error) {
    console.warn(error);
  }
  return [];
}

function orderDate(value) {
  if (!value) return "없음";
  const [year, month, day] = String(value).split("-");
  if (!day) return value;
  return `${year}. ${month}. ${day}.`;
}

function orderAmount(order) {
  if (order.kind === "purchase") return Number.isFinite(order.price) ? `${order.price} TP` : "—";
  return order.feeText || "미정";
}

const SHIP_STATUSES = ["shipping_requested", "preparing", "ready"];
const TRACK_STATUSES = ["shipped", "delivered"];

function orderScope(order) {
  if (screen === "ship") return SHIP_STATUSES.includes(order.status);
  if (screen === "track") return TRACK_STATUSES.includes(order.status);
  return true;
}

function orderMatchesFilter(order, id) {
  if (id === "all") return true;
  if (id === "purchase") return order.kind === "purchase";
  if (id === "ship") return order.kind !== "purchase";
  if (id === "problem") return order.kind !== "purchase" && Boolean(order.problem);
  if (id === "delay") return order.kind !== "purchase" && order.exception === "delay";
  if (id === "return") return order.kind !== "purchase" && order.exception === "return";
  return order.kind !== "purchase" && order.status === id;
}

function orderVisible(order) {
  if (!orderScope(order)) return false;
  const text = query.trim().toLowerCase();
  if (text) {
    const hay = [order.id, order.receiver, order.phone, order.email, order.tracking, order.place].join(" ").toLowerCase();
    if (!hay.includes(text)) return false;
  }
  if (screen === "orders") {
    const overseas = Boolean(order.place) && order.place !== "대한민국";
    if (regionFilter === "domestic" && (order.kind === "purchase" || overseas)) return false;
    if (regionFilter === "overseas" && (order.kind === "purchase" || !overseas)) return false;
    if (countryFilter && order.place !== countryFilter) return false;
    const day = order.kind === "purchase" ? order.purchasedOn : order.requestedOn;
    if (dateFrom && (!day || day < dateFrom)) return false;
    if (dateTo && (!day || day > dateTo)) return false;
  }
  return orderMatchesFilter(order, orderFilter);
}

function orderFilters() {
  if (screen === "ship") return [["all", "출고 대상"], ...ORDER_STATUS.filter(([id]) => SHIP_STATUSES.includes(id))];
  if (screen === "track") {
    return [
      ["all", "보낸 주문"],
      ["shipped", "배송중"],
      ["delivered", "배송완료"],
      ["delay", "배송지연"],
      ["return", "반송"],
      ["problem", "문제배송"],
    ];
  }
  return [
    ["all", "전체"],
    ["purchase", "랜덤팩 구매"],
    ["ship", "배송 요청"],
    ...ORDER_STATUS,
    ["problem", "취소 / 문제 주문"],
  ];
}

function renderOrderSidebar() {
  const pool = orders.filter(orderScope);
  document.getElementById("pack-list").innerHTML = `<div class="status-nav">${orderFilters()
    .map(([id, label]) => {
      const count = pool.filter((order) => orderMatchesFilter(order, id)).length;
      return `<button type="button" data-order-filter="${id}" class="${id === orderFilter ? "on" : ""}"><span>${label}</span><b>${count}</b></button>`;
    })
    .join("")}</div>`;
}

function isShipOrder(order) {
  return order.kind !== "purchase";
}

function cardCount(order) {
  return (order.cards || order.cardIds || []).length;
}

function orderBadge(order) {
  if (order.kind === "purchase") return "랜덤팩 구매";
  if (order.exception === "delay") return "배송지연";
  if (order.exception === "return") return "반송";
  if (order.problem) return "문제 주문";
  return orderStatusLabel(order.status);
}

function shipOrdersIn(list) {
  return list.filter(isShipOrder);
}

function captureBulkDraft() {
  const carrier = document.getElementById("bulk-carrier");
  if (carrier) bulkCarrier = carrier.value;
  document.querySelectorAll("[data-bulk-track]").forEach((input) => {
    bulkTracks[input.dataset.bulkTrack] = input.value;
  });
}

function xmlCell(value) {
  return `<Cell><Data ss:Type="String">${escapeAttr(value ?? "")}</Data></Cell>`;
}

function xmlRow(values) {
  return `<Row>${values.map(xmlCell).join("")}</Row>`;
}

function cardEventName(card) {
  const pack = packs.find((item) => artistName(item.artistId) === card.artist && item.album === card.album);
  return pack?.eventName || "";
}

function excelWorkbook(list) {
  const ordersSheet = [
    ["주문번호", "날짜", "회원ID", "받는사람", "전화번호", "이메일", "국가", "우편번호", "주소", "상세주소", "카드수", screen === "orders" ? "금액" : "배송비", "상태", "택배사", "송장번호"],
    ...list.map((order) => [
      order.id,
      order.kind === "purchase" ? (order.purchasedOn || "") : (order.requestedOn || ""),
      "",
      order.kind === "purchase" ? "" : (order.receiver || ""),
      order.kind === "purchase" ? "" : (order.phone || ""),
      order.kind === "purchase" ? "" : (order.email || ""),
      order.kind === "purchase" ? "" : (order.place || ""),
      order.kind === "purchase" ? "" : (order.postcode || ""),
      order.kind === "purchase" ? "" : (order.address || ""),
      order.kind === "purchase" ? "" : (order.addressDetail || ""),
      String(order.kind === "purchase" ? (order.count || cardCount(order)) : cardCount(order)),
      orderAmount(order),
      orderBadge(order),
      order.carrier === "기타" ? (order.carrierName || "기타") : (order.carrier || ""),
      order.tracking || "",
    ]),
  ];
  const cardSheet = [["주문번호", "userCardId", "아티스트", "앨범", "행사", "카드번호", "멤버", "수량", "획득일"]];
  list.forEach((order) => {
    (order.cards || []).forEach((card) => {
      cardSheet.push([
        order.id,
        card.id || "",
        card.artist || "",
        card.album || "",
        cardEventName(card),
        card.no || "",
        card.member || "",
        "1",
        card.purchasedOn || "",
      ]);
    });
  });
  const sheet = (name, rows) => `<Worksheet ss:Name="${escapeAttr(name)}"><Table>${rows.map(xmlRow).join("")}</Table></Worksheet>`;
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${sheet("주문목록", ordersSheet)}
${sheet("카드상세", cardSheet)}
</Workbook>`;
}

function downloadText(filename, mime, text) {
  const blob = new Blob([text], { type: mime });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadOrdersExcel(list) {
  if (!list.length) {
    toast("다운로드할 배송 주문이 없어요");
    return;
  }
  downloadText("photocard-orders.xls", "application/vnd.ms-excel", excelWorkbook(list));
}

function trackingCsv(list) {
  const lines = ["주문번호,택배사,송장번호"];
  list.forEach((order) => {
    const carrier = order.carrier === "기타" ? (order.carrierName || "") : (order.carrier || "");
    lines.push([order.id, carrier, order.tracking || ""].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","));
  });
  return `\uFEFF${lines.join("\n")}`;
}

function parseTrackingText(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() && !line.startsWith("<?xml"));
  const split = (line) => {
    const cells = [];
    let current = "";
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') {
        quoted = !quoted;
        continue;
      }
      if (!quoted && (ch === "," || ch === "\t")) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  };
  const rows = lines.map(split);
  const head = rows[0].map((cell) => cell.replace(/\s/g, ""));
  const column = (name) => head.findIndex((cell) => cell.includes(name));
  const idCol = column("주문번호");
  if (idCol < 0) {
    return rows.filter((row) => row.some(Boolean)).map((row) => ({ id: row[0] || "", carrier: row[1] || "", tracking: row[2] || "" }));
  }
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) => ({
    id: row[idCol] || "",
    carrier: row[column("택배")] || "",
    tracking: row[column("송장")] || "",
  }));
}

function reviewTracking(rows) {
  const seen = new Set();
  const ok = [];
  const bad = [];
  rows.forEach((row) => {
    const order = orders.find((item) => item.id === row.id && isShipOrder(item));
    let reason = "";
    if (!row.id || !order) reason = "존재하지 않는 주문번호";
    else if (seen.has(row.id)) reason = "중복 주문번호";
    else if (!row.tracking) reason = "송장번호 없음";
    else if (!row.carrier) reason = "택배사 없음";
    else if (order.status === "shipped" || order.status === "delivered") reason = "이미 발송된 주문";
    else if (order.problem) reason = "문제 주문";
    else if (!SHIP_STATUSES.includes(order.status)) reason = "발송할 수 없는 상태";
    seen.add(row.id);
    if (reason) bad.push({ ...row, reason });
    else ok.push(row);
  });
  return { ok, bad };
}

function applyTrackingRows(rows) {
  rows.forEach((row) => {
    const order = orders.find((item) => item.id === row.id);
    if (!order) return;
    order.carrier = row.carrier;
    order.carrierName = "";
    order.tracking = row.tracking;
    order.status = "shipped";
    order.shippedOn = new Date().toISOString().slice(0, 10);
  });
  saveOrders();
}

function renderOrders() {
  captureBulkDraft();
  const rows = orders.filter(orderVisible);
  if (!rows.some((order) => order.id === orderId)) orderId = rows[0]?.id || "";
  const shipRows = shipOrdersIn(rows);
  const picked = shipRows.filter((order) => selectedOrderIds.has(order.id));
  const places = [...new Set(orders.filter(isShipOrder).map((order) => order.place).filter(Boolean))];
  const tools = screen === "orders" ? `
    <div class="order-tools">
      <label>국내/해외
        <select id="region-filter">
          <option value="all" ${regionFilter === "all" ? "selected" : ""}>전체</option>
          <option value="domestic" ${regionFilter === "domestic" ? "selected" : ""}>국내</option>
          <option value="overseas" ${regionFilter === "overseas" ? "selected" : ""}>해외</option>
        </select>
      </label>
      <label>국가
        <select id="country-filter">
          <option value="">전체</option>
          ${places.map((place) => `<option value="${escapeAttr(place)}" ${place === countryFilter ? "selected" : ""}>${escapeAttr(place)}</option>`).join("")}
        </select>
      </label>
      <label>기간
        <span class="date-pair"><input id="date-from" type="date" value="${escapeAttr(dateFrom)}" /><input id="date-to" type="date" value="${escapeAttr(dateTo)}" /></span>
      </label>
    </div>` : "";
  const excelActions = screen === "orders" ? `
    <button class="text-btn" id="excel-selected" type="button">선택 ${picked.length}건 엑셀</button>
    <button class="text-btn" id="excel-visible" type="button">검색결과 엑셀</button>` : "";
  const shipActions = screen === "ship" ? `
    <button class="text-btn" id="pick-all" type="button">전체선택</button>
    <button class="text-btn" id="bulk-prepare" type="button">준비중 일괄처리</button>
    <button class="save" id="open-ship-panel" type="button">선택 주문 발송처리</button>
    <button class="text-btn" id="tracking-download" type="button">송장 엑셀 다운로드</button>
    <label class="upload">송장 엑셀 업로드
      <input id="tracking-upload" type="file" accept=".csv,.txt,.xls,text/csv" />
    </label>` : "";
  const head = screen === "ship"
    ? ["", "주문번호", "받는사람", "국가", "카드수", "요청일", "현재상태"]
    : screen === "track"
      ? ["주문번호", "받는사람", "국가", "택배사", "송장번호", "발송일", "상태"]
      : ["", "구분", "번호", "날짜", "내용", "장수", "금액", "상태"];
  const body = rows.map((order) => {
    const purchase = order.kind === "purchase";
    const on = order.id === orderId ? " on" : "";
    const check = purchase ? "" : `<input type="checkbox" data-pick-order="${escapeAttr(order.id)}" ${selectedOrderIds.has(order.id) ? "checked" : ""} />`;
    if (screen === "ship") {
      return `<tr class="${on}" data-order="${escapeAttr(order.id)}"><td>${check}</td><td>${escapeAttr(order.id)}</td><td>${escapeAttr(order.receiver || "없음")}</td><td>${escapeAttr(order.place || "없음")}</td><td>${cardCount(order)}</td><td>${escapeAttr(order.requestedOn || "없음")}</td><td>${escapeAttr(orderBadge(order))}</td></tr>`;
    }
    if (screen === "track") {
      const carrier = order.carrier === "기타" ? (order.carrierName || "기타") : (order.carrier || "없음");
      return `<tr class="${on}" data-order="${escapeAttr(order.id)}"><td>${escapeAttr(order.id)}</td><td>${escapeAttr(order.receiver || "없음")}</td><td>${escapeAttr(order.place || "없음")}</td><td>${escapeAttr(carrier)}</td><td>${escapeAttr(order.tracking || "없음")}</td><td>${escapeAttr(order.shippedOn || "없음")}</td><td>${escapeAttr(orderBadge(order))}</td></tr>`;
    }
    const summary = purchase
      ? (order.productName || order.album || "상품")
      : ([order.receiver, order.place].filter(Boolean).join(" · ") || "배송지 없음");
    const count = purchase ? (order.count || cardCount(order)) : cardCount(order);
    return `<tr class="${on}" data-order="${escapeAttr(order.id)}"><td>${check}</td><td>${purchase ? "구매" : "배송"}</td><td>${escapeAttr(order.id)}</td><td>${escapeAttr(orderDate(purchase ? order.purchasedOn : order.requestedOn))}</td><td>${escapeAttr(summary)}</td><td>${count}</td><td>${escapeAttr(orderAmount(order))}</td><td>${escapeAttr(orderBadge(order))}</td></tr>`;
  }).join("");
  const panel = screen === "ship" && shipPanel ? `
    <section class="policy-block">
      <h3>선택 주문 발송처리</h3>
      <label>배송회사
        <select id="bulk-carrier">
          <option value="">선택</option>
          ${["CJ대한통운", "우체국", "DHL", "FedEx", "UPS", "EMS", "기타"].map((name) => `<option ${bulkCarrier === name ? "selected" : ""}>${name}</option>`).join("")}
        </select>
      </label>
      ${picked.map((order) => `<label>${escapeAttr(order.id)} 송장번호<input data-bulk-track="${escapeAttr(order.id)}" value="${escapeAttr(bulkTracks[order.id] ?? order.tracking ?? "")}" placeholder="등록된 번호만" /></label>`).join("") || `<p class="hint">왼쪽 체크한 주문이 없어요.</p>`}
      <button class="save" id="apply-ship" type="button">선택 주문 발송처리</button>
    </section>` : "";
  const review = uploadPreview ? `
    <section class="policy-block">
      <h3>업로드 결과</h3>
      <p>정상 ${uploadPreview.ok.length}건 · 오류 ${uploadPreview.bad.length}건</p>
      ${uploadPreview.bad.length ? `<ul class="upload-errors">${uploadPreview.bad.map((row) => `<li>${escapeAttr(row.id || "번호 없음")} ${escapeAttr(row.reason)}</li>`).join("")}</ul>` : ""}
      <div class="actions">
        <button class="save" id="apply-upload" type="button" ${uploadPreview.ok.length ? "" : "disabled"}>정상 ${uploadPreview.ok.length}건 발송처리</button>
        <button class="text-btn" id="close-upload" type="button">닫기</button>
      </div>
    </section>` : "";
  const hint = screen === "ship"
    ? "보내기 전 주문을 여러 건 골라 준비중으로 바꾸거나 송장을 넣어요."
    : screen === "track"
      ? "보낸 뒤 상태만 봐요. 배송지연과 반송은 여기서 표시해요."
      : "구매는 뽑기 결제(TP)이고, 배송은 실물 요청이에요. 배송비는 정책에 금액이 있을 때만 나오고, 없으면 미정이에요.";
  document.getElementById("main").innerHTML = `
    <div class="form-head">
      <h2>${screen === "ship" ? "배송처리" : screen === "track" ? "배송현황" : "주문내역"}</h2>
      <div class="actions">${excelActions}${shipActions}</div>
    </div>
    <p class="hint">${hint}</p>
    ${tools}
    ${panel}
    ${review}
    <div class="table-wrap">
      <table class="order-table">
        <thead><tr>${head.map((label) => `<th>${label}</th>`).join("")}</tr></thead>
        <tbody>${body || `<tr><td class="empty" colspan="${head.length}">이 조건의 주문이 없어요.</td></tr>`}</tbody>
      </table>
    </div>`;
  const selected = orders.find((order) => order.id === orderId);
  document.getElementById("detail").innerHTML = selected ? orderDetail(selected) : `<p class="empty">주문을 고르면 상세가 나와요.</p>`;
}

function orderDetail(order) {
  if (order.kind === "purchase") return purchaseDetail(order);
  const lines = orderLines(order);
  const cards = lines.map((card) => `
    <tr>
      <td>${escapeAttr(card.ids.join(", "))}</td>
      <td>${escapeAttr(card.artist)} ${escapeAttr(card.album)} ${escapeAttr(card.no)}</td>
      <td>${escapeAttr(card.member || "없음")}</td>
      <td>${card.count}</td>
    </tr>`).join("");
  const overseas = order.place && order.place !== "대한민국";
  const carriers = overseas ? ["DHL", "FedEx", "UPS", "EMS", "기타"] : ["CJ대한통운", "우체국", "기타"];
  const shipFields = order.status === "ready"
    ? `<label>배송회사
        <select id="carrier-input">
          <option value="">선택</option>
          ${carriers.map((name) => `<option ${order.carrier === name ? "selected" : ""}>${name}</option>`).join("")}
        </select>
      </label>
      <label>배송회사명
        <input id="carrier-name" value="${escapeAttr(order.carrierName || "")}" placeholder="기타일 때만" />
      </label>
      <label>송장번호
        <input id="tracking-input" value="${escapeAttr(order.tracking || "")}" placeholder="등록된 번호만" />
      </label>
      <button class="save" type="button" data-order-status="shipped">발송처리</button>`
    : "";
  const next = order.status === "shipping_requested"
    ? `<button class="save" type="button" data-order-status="preparing">준비중으로 변경</button>`
    : order.status === "preparing"
      ? `<button class="save" type="button" data-order-status="ready">발송대기로 변경</button>`
      : order.status === "ready"
        ? shipFields
        : order.status === "shipped"
          ? `<button class="save" type="button" data-order-status="delivered">배송완료</button>`
          : "";
  return `
    <section class="sale-detail">
      <h3>${escapeAttr(order.id)}</h3>
      <p>${escapeAttr(orderStatusLabel(order.status))}</p>
      <dl>
        <div><dt>요청일</dt><dd>${escapeAttr(order.requestedOn || "없음")}</dd></div>
        <div><dt>국가</dt><dd>${escapeAttr(order.place || "없음")}</dd></div>
        <div><dt>받는 사람</dt><dd>${escapeAttr(order.receiver || "없음")}</dd></div>
        <div><dt>전화번호</dt><dd>${escapeAttr(order.phone || "없음")}</dd></div>
        <div><dt>이메일</dt><dd>${escapeAttr(order.email || "없음")}</dd></div>
        <div><dt>주소</dt><dd>${escapeAttr(order.address || "없음")}</dd></div>
        <div><dt>배송비</dt><dd>${escapeAttr(order.feeText || "미정")}</dd></div>
        <div><dt>구분</dt><dd>${overseas ? "해외" : "국내"}</dd></div>
        <div><dt>송장번호</dt><dd>${escapeAttr(order.tracking || "없음")}</dd></div>
        <div><dt>배송회사</dt><dd>${escapeAttr(order.carrier === "기타" ? (order.carrierName || "기타") : (order.carrier || "없음"))}</dd></div>
      </dl>
      <label>관리자 메모
        <input id="order-memo" value="${escapeAttr(order.memo || "")}" placeholder="고객에게는 보이지 않아요" />
      </label>
      <button class="text-btn" type="button" data-order-problem="${order.problem ? "0" : "1"}">${order.problem ? "문제 주문 해제" : "문제 주문"}</button>
      <div class="order-actions">${next}</div>
      ${(order.status === "shipped" || order.status === "delivered") ? `<div class="order-actions">
        <button class="text-btn" type="button" data-order-exception="delay">배송지연</button>
        <button class="text-btn" type="button" data-order-exception="return">반송</button>
        <button class="text-btn" type="button" data-order-exception="">예외 해제</button>
      </div>` : ""}
      <table>
        <thead><tr><th>보유 번호</th><th>디자인</th><th>멤버</th><th>수량</th></tr></thead>
        <tbody>${cards}</tbody>
      </table>
    </section>
  `;
}

const POLICY_KEY = "photocard-shipping-policy-v1";
// 앱의 시세·환율 설정. API가 정해지기 전에는 기본값으로 보조 표기를 만든다.
const RATES_CONFIG_KEY = "photocard-rates-config-v1";

function loadRatesConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(RATES_CONFIG_KEY) || "null") || {};
    return { api: saved.api || "", tottKrw: saved.tottKrw || "", usdKrw: saved.usdKrw || "" };
  } catch (error) {
    return { api: "", tottKrw: "", usdKrw: "" };
  }
}

function saveRatesConfig() {
  const config = {
    api: String(document.getElementById("rates-api")?.value || "").trim(),
    tottKrw: String(document.getElementById("rates-tott")?.value || "").trim(),
    usdKrw: String(document.getElementById("rates-usd")?.value || "").trim(),
  };
  localStorage.setItem(RATES_CONFIG_KEY, JSON.stringify(config));
}
const NOTICE_KEY = "photocard-notices-v1";
let policy = loadPolicy();
let notices = loadNotices();

function blankZone(partial = {}) {
  return { country: "", zone: "", method: "", track: false, w100: "", w250: "", w500: "", days: "", ...partial };
}

function defaultPolicy() {
  return {
    maxCards: 50,
    cardWeight: "",
    packBands: [
      { label: "1~10장", from: 1, to: 10, weight: "" },
      { label: "11~30장", from: 11, to: 30, weight: "" },
      { label: "31~50장", from: 31, to: 50, weight: "" },
    ],
    keepDays: "",
    zones: [
      blankZone({ country: "대한민국" }),
      blankZone({ country: "일본", zone: "A" }),
      blankZone({ country: "미국", zone: "B" }),
    ],
  };
}

function loadPolicy() {
  const base = defaultPolicy();
  try {
    const saved = JSON.parse(localStorage.getItem(POLICY_KEY) || "null");
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
        weight: saved.packBands?.[index]?.weight ?? "",
      })),
      zones: (Array.isArray(saved.zones) && saved.zones.length ? saved.zones : base.zones).map((zone) => blankZone(zone)),
    };
  } catch (error) {
    console.warn(error);
    return base;
  }
}

function loadNotices() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTICE_KEY) || "null");
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn(error);
  }
  return [];
}

function savePolicy() {
  localStorage.setItem(POLICY_KEY, JSON.stringify(policy));
}

function saveNotices() {
  localStorage.setItem(NOTICE_KEY, JSON.stringify(notices));
}

function stockShortCount() {
  return packs.reduce((sum, item) => sum + item.cards.filter((card) => card.stock !== "" && Number(card.stock) === 0).length, 0);
}

function categoryById(id) {
  return categories.find((item) => item.id === id);
}

function renderCategorySidebar() {
  const text = query.trim().toLowerCase();
  const rows = categories.filter((item) => {
    if (!text) return true;
    return [item.name, item.nameKo, item.nameEn, item.aliases, item.profileName, ...listedNames(item.members), ...listedNames(item.albums), ...(item.albums || []).flatMap((album) => [album.nameKo, album.nameEn])].join(" ").toLowerCase().includes(text);
  });
  if (!categoryId || !categories.some((item) => item.id === categoryId)) categoryId = rows[0]?.id || "";
  document.getElementById("pack-list").innerHTML = `
    <button class="text-btn" id="add-category" type="button">카테고리 추가</button>
    ${rows.map((item) => `
      <button class="pack-btn profile-side ${item.id === categoryId ? "on" : ""}" type="button" data-category="${item.id}">
        ${profileSrc(item.id, item.profileImage) ? `<img class="profile-face" alt="" src="${escapeAttr(profileSrc(item.id, item.profileImage))}" />` : `<span class="profile-face"></span>`}
        <strong>${escapeAttr(item.profileName || item.nameKo || item.nameEn || item.name || "이름 없음")}</strong>
        <span class="badge">${kindWord(item.kind)}</span>
      </button>`).join("")
      || `<p class="empty">카테고리가 없어요.</p>`}`;
}

function lineRows(values, field) {
  return values.map((name, index) => `
    <div class="line-row">
      <input data-${field}-name="${index}" value="${escapeAttr(name)}" placeholder="${field === "member" ? "가수명" : "앨범명"}" />
      <button class="text-btn" type="button" data-${field}-remove="${index}">빼기</button>
    </div>`).join("");
}

function renderCategory() {
  const item = categoryById(categoryId) || categories[0];
  if (!item) {
    document.getElementById("main").innerHTML = `<p class="empty">왼쪽에서 카테고리를 추가해요.</p>`;
    return;
  }
  categoryId = item.id;
  const productCount = packs.filter((pack) => pack.artistId === item.id).length;
  const members = item.kind === "group"
    ? `<section class="policy-block kind-width">
        <h3>그룹 멤버</h3>
        <p class="hint">이 그룹 안에 있는 가수를 적어요. 카드의 멤버는 여기 있는 이름만 고를 수 있어요.</p>
        <div class="line-list">${lineRows(item.members.length ? item.members : [""], "member")}</div>
        <button class="text-btn" id="add-member" type="button">멤버 추가</button>
      </section>`
    : `<p class="hint">개인 카테고리는 가수명이 멤버예요. 카드를 등록할 때 이 이름만 나와요.</p>`;
  document.getElementById("main").innerHTML = `
    <div class="form-head">
      <div>
        <p class="kicker">${kindWord(item.kind)}</p>
        <h2>${escapeAttr(item.name || "새 카테고리")}</h2>
      </div>
      <div class="actions">
        <button class="text-btn" id="delete-category" type="button">삭제</button>
        <button class="save" id="save" type="button">이 브라우저에 저장</button>
      </div>
    </div>
    <p class="hint">가수를 등록할 때 앨범 이름과 자켓도 같이 올려요. 이 가수 상품 ${productCount}개.</p>
    <section class="policy-block">
      <h3>프로필</h3>
      <div class="profile-edit">
        <div class="profile-pick">
          <label aria-label="프로필 사진 바꾸기">
            ${profileSrc(item.id, item.profileImage) ? `<img class="profile-face" alt="" src="${escapeAttr(profileSrc(item.id, item.profileImage))}" />` : `<span class="profile-face"></span>`}
            ${cameraMark()}
            <input id="category-profile" type="file" accept="image/*" />
          </label>
          ${item.profileImage ? `<button class="profile-clear" id="clear-profile" type="button" aria-label="사진 빼기">×</button>` : ""}
        </div>
        <div class="artist-names">
          <label class="kind-field">활동
            <select data-category-field="kind">
              <option value="group" ${item.kind === "group" ? "selected" : ""}>그룹</option>
              <option value="solo" ${item.kind === "solo" ? "selected" : ""}>개인</option>
            </select>
            <span class="field-help">그룹이면 멤버를 적고, 개인이면 가수명이 멤버예요.</span>
          </label>
          <span></span>
          <label>아티스트명 KO
            <input data-category-field="nameKo" value="${escapeAttr(item.nameKo || "")}" placeholder="블랙핑크" />
            <span class="field-help">한국어 화면에서 이 이름을 써요.</span>
          </label>
          <label>아티스트명 EN
            <input data-category-field="nameEn" value="${escapeAttr(item.nameEn || "")}" placeholder="BLACKPINK" />
            <span class="field-help">그 외 언어에서는 이 이름을 써요.</span>
          </label>
          <label class="span-2">검색 별칭
            <input data-category-field="aliases" value="${escapeAttr(item.aliases || "")}" placeholder="로제, rose, rosé" />
            <span class="field-help">쉼표로 구분해 적어요. 검색에만 써요.</span>
          </label>
        </div>
      </div>
    </section>
    ${members}
    <section class="policy-block kind-width">
      <p class="hint">이 가수의 앨범 이름과 자켓이에요. 카드는 이 앨범을 고른 뒤에 행사명을 적어요.</p>
      ${albumRows(item)}
      <button class="text-btn" id="add-album" type="button">앨범 추가</button>
    </section>`;
}

function cameraMark() {
  return `<span class="profile-cam" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3.2l1.6-2h6.4l1.6 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"></path><circle cx="12" cy="13" r="3"></circle></svg></span>`;
}

function albumRows(artist) {
  const albums = artist.albums || [];
  if (!albums.length) return `<p class="empty">등록된 앨범이 없어요.</p>`;
  return albums.map((album, index) => {
    const cover = album.cover ? ` style="background-image:url('${album.cover}')"` : "";
    return `<div class="album-row">
      <label class="jacket-pick" aria-label="자켓 바꾸기">
        <div class="cover-slot${album.cover ? " has" : ""}"${cover}>${album.cover ? "" : "자켓"}</div>
        ${cameraMark()}
        <input data-album-file="${index}" type="file" accept="image/*" />
      </label>
      <label>앨범명 KO
        <input data-album-ko="${index}" value="${escapeAttr(album.nameKo || "")}" placeholder="없으면 영문명을 써요" />
      </label>
      <label>앨범명 EN
        <input data-album-en="${index}" value="${escapeAttr(album.nameEn || album.name || "")}" placeholder="JUMP" />
      </label>
      <button class="text-btn" type="button" data-album-remove="${index}">빼기</button>
    </div>`;
  }).join("");
}

function renameCategoryValue(category, listName, index, next, apply) {
  const prev = String(category[listName][index] || "");
  category[listName][index] = next;
  const before = prev.trim();
  const after = String(next || "").trim();
  if (!before || before === after) return;
  apply(before, after);
}

function renderDash() {
  const count = (status) => activePacks().filter((item) => item.status === status).length;
  const ordersOf = (status) => orders.filter((order) => order.status === status).length;
  const outbound = orders.filter((order) => SHIP_STATUSES.includes(order.status)).length;
  const stats = [
    ["신규 주문", ordersOf("shipping_requested")],
    ["출고 대기", outbound],
    ["배송중", ordersOf("shipped")],
    ["품절 상품", count("out")],
    ["재고 부족 카드", stockShortCount()],
    ["문제 주문", orders.filter((order) => order.problem).length],
  ];
  document.getElementById("main").innerHTML = `
    <p class="hint">오늘 처리할 운영만 모았어요. 숫자는 지금 등록된 주문과 상품이에요.</p>
    <div class="stats">${stats.map(([label, value]) => `<div class="stat"><span>${label}</span><b>${value}</b></div>`).join("")}</div>
    <div class="shortcuts">
      <button class="text-btn" type="button" data-menu="category">가수 등록</button>
      <button class="text-btn" type="button" data-menu="cards">카드 등록</button>
      <button class="text-btn" type="button" data-menu="orders">신규 주문 확인</button>
      <button class="text-btn" type="button" data-menu="ship">출고 대기 확인</button>
      <button class="text-btn" type="button" data-menu="banner">배너 등록</button>
      <button class="text-btn" type="button" data-menu="notice">공지 등록</button>
    </div>`;
}

function allCards() {
  return activePacks().flatMap((item) => item.cards.map((card, index) => ({ item, card, index, key: `${item.id}:${index}` })));
}

function cardVisible(entry) {
  const text = query.trim().toLowerCase();
  if (text) {
    const hay = [artistName(entry.item.artistId), entry.item.album, entry.item.eventName, entry.card.member, entry.card.no].join(" ").toLowerCase();
    if (!hay.includes(text)) return false;
  }
  return true;
}

function renderCardSidebar() {
  const item = packs.find((pack) => pack.id === currentId);
  const rows = item ? item.cards.map((card, index) => ({ item, card, index, key: `${item.id}:${index}` })) : [];
  if (item && !rows.some((entry) => entry.key === cardKey)) cardKey = rows[0]?.key || "";
  document.getElementById("pack-list").innerHTML = `
    <button class="text-btn" id="back-card-list" type="button">← 카드</button>
    ${rows.length
      ? rows.map((entry) => `
      <button class="pack-btn card-side ${entry.key === cardKey ? "on" : ""}" type="button" data-card-key="${entry.key}">
        ${entry.card.front ? `<img class="mini-face" alt="" src="${escapeAttr(entry.card.front)}" />` : `<span class="mini-face"></span>`}
        <strong>${escapeAttr(entry.card.code || entry.card.no)}</strong>
        <span class="badge">${escapeAttr(entry.card.member || "멤버 없음")} · ${escapeAttr(String(entry.card.stock === "" ? "재고 없음" : entry.card.stock))}</span>
      </button>`).join("")
      : `<p class="empty">카드가 없어요.</p>`}`;
}

function cardStrip(item) {
  const faces = item.cards.slice(0, 6).map((card) => (
    card.front ? `<img class="strip-face" alt="" src="${escapeAttr(card.front)}" />` : `<span class="strip-face"></span>`
  )).join("");
  const more = item.cards.length > 6 ? `<span class="strip-more">+${item.cards.length - 6}</span>` : "";
  return `<span class="card-strip">${faces}${more}</span>`;
}

function ensureCardPick() {
  if (!categories.some((item) => item.id === cardArtistId)) cardArtistId = categories[0]?.id || "";
  const names = albumsOf(cardArtistId);
  if (!names.includes(cardAlbum)) cardAlbum = names[0] || "";
  const events = activePacks().filter((pack) => pack.artistId === cardArtistId && pack.album === cardAlbum);
  if (cardEvent && !events.some((pack) => (pack.eventName || "") === cardEvent) && !events.length) return;
}

function eventPacks() {
  return activePacks().filter((pack) => pack.artistId === cardArtistId && pack.album === cardAlbum);
}

function albumCoverOf(artistId, name) {
  const album = (categoryById(artistId)?.albums || []).find((item) => item.name === name);
  return album?.cover || "";
}

function openEventPack() {
  ensureCardPick();
  if (!cardAlbum) {
    toast("앨범을 먼저 등록해 주세요.");
    return;
  }
  const ko = document.getElementById("card-event-ko")?.value.trim() || "";
  const en = document.getElementById("card-event-en")?.value.trim() || "";
  let pack = eventPacks().find((item) => (item.eventName || "") === cardEvent) || null;
  if (!pack) {
    const key = en || ko;
    pack = eventPacks().find((item) => (item.eventName || "") === key) || null;
    if (!pack) {
      pack = blankPack();
      pack.artistId = cardArtistId;
      pack.album = cardAlbum;
      pack.eventName = key;
      pack.eventType = key ? "pob" : "album";
      pack.cover = albumCoverOf(cardArtistId, cardAlbum);
      pack.kind = categoryById(cardArtistId)?.kind || pack.kind;
      pack.saved = true;
      pack.cards = [];
      packs.push(pack);
    }
  }
  pack.eventNameKo = ko;
  pack.eventNameEn = en;
  if (!pack.eventName) pack.eventName = en || ko;
  pack.cover = albumCoverOf(cardArtistId, cardAlbum) || pack.cover;
  currentId = pack.id;
  cardEvent = pack.eventName || "";
  cardView = "list";
  render();
}

function renderCardList() {
  ensureCardPick();
  const names = albumsOf(cardArtistId);
  const cover = albumCoverOf(cardArtistId, cardAlbum);
  const events = eventPacks();
  if (!events.some((pack) => (pack.eventName || "") === cardEvent)) cardEvent = events[0] ? (events[0].eventName || "") : cardEvent;
  const pack = events.find((item) => (item.eventName || "") === cardEvent) || null;
  if (pack) currentId = pack.id;
  const coverStyle = cover ? ` style="background-image:url('${cover}')"` : "";
  const eventButtons = events.map((item) => {
    const label = eventText(item) || "행사 없음";
    const on = pack && item.id === pack.id ? "on" : "";
    return `<button type="button" class="${on}" data-pick-event="${escapeAttr(item.eventName || "")}">${escapeAttr(label)}</button>`;
  }).join("");
  const cards = pack ? pack.cards.map((card, index) => `<tr>
        <td>${escapeAttr(card.code || card.no)}</td>
        <td class="faces">${faceThumb(card.front)}${faceThumb(card.back)}</td>
        <td><select data-card="${index}" data-card-field="member">${memberOptions(pack.artistId, card.member)}</select></td>
        <td><select data-card="${index}" data-card-field="rarity">${RARITIES.map((rarity) => `<option ${rarity === card.rarity ? "selected" : ""}>${rarity}</option>`).join("")}</select></td>
        <td><input data-card="${index}" data-card-field="stock" type="number" min="0" value="${escapeAttr(String(card.stock))}" placeholder="수량" /></td>
        <td><button class="text-btn" type="button" data-remove-card="${index}">빼기</button></td>
      </tr>`).join("") : "";
  const sale = pack ? `
    <div class="grid fields">
      <label>뽑기 가격
        <span class="app-price"><input data-field="price" type="number" min="1" value="${pack.price}" /><em>TP</em></span>
        <span class="field-help">이 행사를 한 장 뽑는 값이에요. 안의 카드는 같은 값으로 나와요.</span>
      </label>
      <label>노출
        <select data-field="listed">
          <option value="1" ${pack.home ? "selected" : ""}>노출</option>
          <option value="0" ${pack.home ? "" : "selected"}>미노출</option>
        </select>
      </label>
      <label>판매
        <select data-field="selling">
          <option value="draft" ${pack.status === "draft" ? "selected" : ""}>등록중</option>
          <option value="on" ${pack.status === "on" ? "selected" : ""}>판매중</option>
          <option value="out" ${pack.status === "out" ? "selected" : ""}>품절</option>
          <option value="stop" ${pack.status === "stop" ? "selected" : ""}>판매중지</option>
        </select>
      </label>
    </div>` : "";
  document.getElementById("main").innerHTML = `
    <div class="form-head">
      <h2>카드</h2>
      <div class="actions">
        <button class="save" id="save" type="button">이 브라우저에 저장</button>
      </div>
    </div>
    <p class="hint">가수 등록에 올려 둔 앨범을 고르고, 행사명을 적어서 등록해요.</p>
    <div class="grid fields">
      <label>가수
        <select id="card-artist">
          ${categories.map((item) => `<option value="${item.id}" ${item.id === cardArtistId ? "selected" : ""}>${escapeAttr(item.profileName || item.name || "이름 없음")}</option>`).join("")}
        </select>
      </label>
      <label>앨범
        <select id="card-album" ${names.length ? "" : "disabled"}>
          ${names.map((name) => `<option value="${escapeAttr(name)}" ${name === cardAlbum ? "selected" : ""}>${escapeAttr(albumText((artistById(cardArtistId)?.albums || []).find((album) => album.name === name)) || name)}</option>`).join("") || `<option value="">앨범 없음</option>`}
        </select>
      </label>
    </div>
    <div class="album-row">
      <div class="cover-slot${cover ? " has" : ""}"${coverStyle}>${cover ? "" : "자켓 없음"}</div>
      <p class="hint">${cardAlbum ? `${escapeAttr(cardAlbum)} 자켓은 가수 등록의 사진이에요.` : "가수 등록에서 앨범과 자켓을 먼저 올려요."}</p>
    </div>
    <section class="policy-block">
      <h3>행사</h3>
      <div class="filters">${eventButtons}</div>
      <div class="album-row">
        <label>행사명 KO
          <input id="card-event-ko" value="${escapeAttr(pack?.eventNameKo || "")}" placeholder="없으면 비움" />
        </label>
        <label>행사명 EN
          <input id="card-event-en" value="${escapeAttr(pack?.eventNameEn || pack?.eventName || "")}" placeholder="MAKESTAR" />
        </label>
        <button class="save" id="open-event" type="button">등록</button>
      </div>
    </section>
    ${pack ? `
      ${sale}
      <div class="card-head">
        <h3>포토카드 ${pack.cards.length}종</h3>
        <button class="save" id="add-card" type="button">+ 카드 등록</button>
      </div>
      <table class="compose-table">
        <thead><tr><th>관리번호</th><th>면</th><th>멤버</th><th>등급</th><th>재고</th><th></th></tr></thead>
        <tbody>${cards || `<tr><td class="empty" colspan="6">등록된 카드가 없어요.</td></tr>`}</tbody>
      </table>` : `<p class="empty">행사를 열면 카드를 등록할 수 있어요.</p>`}`;
}

function renderCards() {
  if (cardView === "list") {
    renderCardList();
    return;
  }
  const entry = allCards().find((item) => item.key === cardKey) || allCards().find((item) => item.item.id === currentId);
  if (!entry) {
    document.getElementById("main").innerHTML = `<p class="empty">등록된 카드가 없어요.</p>`;
    return;
  }
  cardKey = entry.key;
  currentId = entry.item.id;
  const card = entry.card;
  document.getElementById("main").innerHTML = `
    <div class="form-head">
      <div>
        <p class="kicker">구성 카드</p>
        <h2>${escapeAttr(card.code || card.no)}</h2>
      </div>
    </div>
    <p class="hint">카드는 따로 팔지 않아요. 랜덤 상품 안의 구성이에요. 재고는 수량만 적고, 뽑힐 때 보유 카드가 생겨요.</p>
    <div class="grid">
      <label class="span-2">연결 상품
        <select data-card-move="${entry.index}">
          ${activePacks().map((item) => `<option value="${item.id}" ${item.id === entry.item.id ? "selected" : ""}>${escapeAttr(artistName(item.artistId))} ${escapeAttr(item.album)} ${escapeAttr(item.eventName || "")}</option>`).join("")}
        </select>
      </label>
      <label>카테고리
        <input value="${escapeAttr(categoryLabel(entry.item.artistId))}" readonly />
      </label>
      <label>관리번호
        <input data-card="${entry.index}" data-card-field="code" value="${escapeAttr(card.code || "")}" />
        <span class="field-help">카테고리와 앨범이 붙은 고유 번호예요. 앱에 보이는 짧은 카드 번호와는 달라요.</span>
      </label>
      <label>카드 번호
        <input data-card="${entry.index}" data-card-field="no" value="${escapeAttr(card.no)}" />
        <span class="field-help">앱 앨범에 나오는 짧은 번호예요.</span>
      </label>
      <label>멤버
        <select data-card="${entry.index}" data-card-field="member">${memberOptions(entry.item.artistId, card.member)}</select>
        <span class="field-help">그룹 상품은 그 그룹 멤버, 개인 상품은 그 가수를 골라요.</span>
      </label>
      <label>버전
        <select data-card="${entry.index}" data-card-field="version">${VERSIONS.map((version) => `<option value="${version.id}" ${version.id === card.version ? "selected" : ""}>${version.label}</option>`).join("")}</select>
      </label>
      <label>희귀도
        <select data-card="${entry.index}" data-card-field="rarity">${RARITIES.map((rarity) => `<option ${rarity === card.rarity ? "selected" : ""}>${rarity}</option>`).join("")}</select>
        <span class="field-help">실물 마감이 아니라 서비스 안 분류예요.</span>
      </label>
      <label>재고
        <input data-card="${entry.index}" data-card-field="stock" type="number" min="0" value="${escapeAttr(String(card.stock))}" />
        <span class="field-help">0이면 추첨에서 빠져요. 수량은 확률에 쓰지 않아요.</span>
      </label>
      <label>가중치
        <input data-card="${entry.index}" data-card-field="weight" type="number" min="1" value="${card.weight}" />
        <span class="field-help">전부 1이면 재고가 남은 카드가 같은 확률이에요.</span>
      </label>
    </div>
    <div class="cover">
      <img class="thumb" alt="" src="${card.front || ""}" />
      <div class="cover-copy">
        <p class="hint">앞면은 구매 전에 목록에 나오지 않아요. 결과, 마이 앨범, 주문 상세에서만 써요.</p>
        <label class="upload">앞면 올리기
          <input data-face="front" data-face-index="${entry.index}" type="file" accept="image/*" />
        </label>
      </div>
    </div>
    <div class="cover">
      <img class="thumb" alt="" src="${card.back || ""}" />
      <div class="cover-copy">
        <p class="hint">뒷면은 상품 상세 구성에 쓸 수 있어요.</p>
        <label class="upload">뒷면 올리기
          <input data-face="back" data-face-index="${entry.index}" type="file" accept="image/*" />
        </label>
      </div>
    </div>`;
}

function renderPolicy() {
  const ratesConfig = loadRatesConfig();
  const zones = policy.zones.map((zone, index) => `
    <tr>
      <td><input data-zone="${index}" data-zone-field="country" value="${escapeAttr(zone.country)}" placeholder="국가" /></td>
      <td><input data-zone="${index}" data-zone-field="zone" value="${escapeAttr(zone.zone)}" placeholder="Zone" /></td>
      <td><input data-zone="${index}" data-zone-field="method" value="${escapeAttr(zone.method || "")}" placeholder="Tracking" /></td>
      <td><input data-zone-track="${index}" type="checkbox" ${zone.track ? "checked" : ""} aria-label="추적 가능" /></td>
      <td><input data-zone="${index}" data-zone-field="w100" value="${escapeAttr(zone.w100)}" placeholder="원" /></td>
      <td><input data-zone="${index}" data-zone-field="w250" value="${escapeAttr(zone.w250)}" placeholder="원" /></td>
      <td><input data-zone="${index}" data-zone-field="w500" value="${escapeAttr(zone.w500)}" placeholder="원" /></td>
      <td><input data-zone="${index}" data-zone-field="days" value="${escapeAttr(zone.days)}" placeholder="기간" /></td>
      <td><button class="text-btn" type="button" data-zone-remove="${index}">빼기</button></td>
    </tr>`).join("");
  document.getElementById("main").innerHTML = `
    <p class="hint">총무게는 카드 수 × 카드 공통무게 + 포장 무게예요. 국가와 그 무게구간의 배송비를 적어요. 비어 있으면 앱에는 미정으로 나와요. 관세와 현지 세금은 배송비에 넣지 않아요.</p>
    <div class="grid cols-3">
      <label>최대 합배송 카드 수
        <input id="policy-max" type="number" min="1" value="${policy.maxCards}" />
      </label>
      <label>포토카드 1장 무게
        <input id="policy-weight" value="${escapeAttr(policy.cardWeight)}" placeholder="g" />
      </label>
      <label>보관 기간
        <input id="policy-keep" value="${escapeAttr(policy.keepDays)}" placeholder="정해지면 입력" />
      </label>
    </div>
    <section class="policy-block">
      <h3>포장 무게</h3>
      <p class="hint">장수 구간에 포장재 무게만 적어요. 카드 무게와 더해서 배송비를 찾아요.</p>
      <div class="grid cols-3">
        ${policy.packBands.map((band, index) => `<label>${band.label}<input data-band-weight="${index}" value="${escapeAttr(band.weight || "")}" placeholder="g" /></label>`).join("")}
      </div>
    </section>
    <section class="policy-block">
      <h3>국가별 무게구간 배송비</h3>
      <p class="hint">100g, 250g, 500g 이하 요금을 적어요. 배송방법과 추적 가능 여부도 나라마다 바꿔요.</p>
      <table class="zone-table">
        <thead><tr><th>국가</th><th>Zone</th><th>배송방법</th><th>추적</th><th>100g 이하</th><th>250g 이하</th><th>500g 이하</th><th>예상 배송일</th><th></th></tr></thead>
        <tbody>${zones}</tbody>
      </table>
      <button class="text-btn" id="add-zone" type="button">국가 추가</button>
    </section>
    <button class="save" id="save-policy" type="button">이 브라우저에 저장</button>
    <section class="policy-block">
      <h3>시세·환율</h3>
      <p class="hint">상품 가격은 TP(원화 1:1)로 고정이에요. 여기 값은 앱의 "≈ ₩ · $" 보조 표기와 TOTT 참고 환율에만 써요. API 주소를 넣으면 앱이 5분마다 받아오고, 비어 있으면 아래 기본값을 써요. 응답 형식: {"tottKrw": 60.39, "usdKrw": 1400, "at": "ISO 시각"}</p>
      <div class="grid cols-3">
        <label>시세 API 주소
          <input id="rates-api" value="${escapeAttr(ratesConfig.api)}" placeholder="https://…/rates" />
        </label>
        <label>1 TOTT = 원 (기본값)
          <input id="rates-tott" type="number" min="0" step="any" value="${escapeAttr(ratesConfig.tottKrw)}" placeholder="1" />
        </label>
        <label>1 USD = 원 (기본값)
          <input id="rates-usd" type="number" min="0" step="any" value="${escapeAttr(ratesConfig.usdKrw)}" placeholder="1400" />
        </label>
      </div>
      <button class="save" id="save-rates" type="button">시세 설정 저장</button>
    </section>`;
}

function noticeCategories() {
  return ["전체", "TomaTok", "포토카드", "배송", "입고", "점검", "결제", "기타"];
}

function renderNoticeSidebar() {
  const rows = notices.filter((item) => {
    const text = query.trim().toLowerCase();
    if (!text) return true;
    return `${item.title} ${item.body}`.toLowerCase().includes(text);
  });
  document.getElementById("pack-list").innerHTML = `
    <button class="text-btn" id="add-notice" type="button">공지 추가</button>
    ${rows.map((item) => `<button class="pack-btn ${item.id === noticeId ? "on" : ""}" type="button" data-notice="${item.id}"><strong>${escapeAttr(item.title || "제목 없음")}</strong><span class="badge">${escapeAttr(item.category || "포토카드")}</span></button>`).join("")
      || `<p class="empty">등록된 공지가 없어요.</p>`}`;
}

function renderNotice() {
  const item = notices.find((notice) => notice.id === noticeId);
  if (!item) {
    document.getElementById("main").innerHTML = `<p class="empty">왼쪽에서 공지를 추가해요. 포토카드 공지는 별도 시스템을 만들지 않고 이 목록에 둬요.</p>`;
    return;
  }
  document.getElementById("main").innerHTML = `
    <div class="grid">
      <label>공지 범위
        <select data-notice-field="scope">
          ${["포토카드", "TomaTok"].map((scope) => `<option ${item.scope === scope ? "selected" : ""}>${scope}</option>`).join("")}
        </select>
      </label>
      <label>카테고리
        <select data-notice-field="category">
          ${noticeCategories().map((category) => `<option ${item.category === category ? "selected" : ""}>${category}</option>`).join("")}
        </select>
      </label>
      <label>제목<input data-notice-field="title" value="${escapeAttr(item.title)}" /></label>
      <label>연결 상품
        <select data-notice-field="packId">
          <option value="">없음</option>
          ${packs.map((pack) => `<option value="${pack.id}" ${pack.id === item.packId ? "selected" : ""}>${escapeAttr(pack.album)} ${escapeAttr(pack.eventName || "")}</option>`).join("")}
        </select>
      </label>
      <div class="date-row">
        <label>노출 시작<input data-notice-field="start" type="date" value="${escapeAttr(item.start || "")}" /></label>
        <label>노출 종료<input data-notice-field="end" type="date" value="${escapeAttr(item.end || "")}" /></label>
      </div>
    </div>
    <label>내용<textarea data-notice-field="body">${escapeAttr(item.body || "")}</textarea></label>
    <label>영어<textarea data-notice-field="en">${escapeAttr(item.en || "")}</textarea></label>
    <div class="checks">
      <label class="check">상단 고정<input data-notice-flag="pin" type="checkbox" ${item.pin ? "checked" : ""} /></label>
      <label class="check">팝업<input data-notice-flag="popup" type="checkbox" ${item.popup ? "checked" : ""} /></label>
    </div>
    <button class="text-btn" id="delete-notice" type="button">삭제</button>`;
}

function paintHeader() {
  const title = document.querySelector("#page-title");
  const example = document.querySelector("#reg-example");
  const names = {
    dash: "대시보드",
    category: "가수",
    cards: "카드관리",
    banner: "배너관리",
    orders: "주문관리",
    ship: "출고관리",
    track: "배송현황",
    policy: "배송정책",
    notice: "공지관리",
  };
  if (title) title.textContent = names[screen] || "포토카드 관리자";
  const showExample = screen === "pack" && (packView === "create" || (packView === "detail" && packTab === "info"));
  if (example) example.hidden = !showExample;
}

function paintNav() {
  document.querySelectorAll("[data-menu]").forEach((button) => {
    button.classList.toggle("on", button.dataset.menu === screen);
  });
  const layout = document.getElementById("layout");
  const orderScreen = screen === "orders" || screen === "ship" || screen === "track";
  layout.classList.toggle("is-wide", screen === "dash" || screen === "policy" || screen === "banner" || screen === "pack" || (screen === "cards" && cardView === "list"));
  layout.classList.toggle("is-orders", orderScreen);
  const detail = document.getElementById("detail");
  detail.hidden = !orderScreen;
  if (!orderScreen) detail.innerHTML = "";
}

function render() {
  assignCardCodes(packs, categories);
  paintHeader();
  paintNav();
  renderSidebar();
  if (screen === "dash") renderDash();
  else if (screen === "banner") renderDisplay();
  else if (screen === "orders" || screen === "ship" || screen === "track") renderOrders();
  else if (screen === "category") renderCategory();
  else if (screen === "cards") renderCards();
  else if (screen === "policy") renderPolicy();
  else if (screen === "notice") renderNotice();
  else renderMain();
}

function toast(message) {
  const node = document.createElement("p");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 2200);
}

document.body.addEventListener("input", (event) => {
  if (event.target.id === "query") {
    query = event.target.value;
    renderSidebar();
    return;
  }
  if (event.target.id === "pack-query") {
    query = event.target.value;
    paintPackRows();
  }
});

document.addEventListener("contextmenu", (event) => {
  if (!event.target.closest("input, textarea")) event.preventDefault();
});
document.addEventListener("dragstart", (event) => {
  if (event.target.closest("img, video")) event.preventDefault();
});

document.body.addEventListener("click", (event) => {
  const menu = event.target.closest("[data-menu]");
  if (menu) {
    screen = menu.dataset.menu;
    if (screen === "album") screen = "category";
    if (screen === "pack" || screen === "cards") {
      if (screen === "pack") screen = "cards";
      cardView = "list";
    }
    if (screen === "orders" || screen === "ship" || screen === "track") {
      orderFilter = "all";
      shipPanel = false;
      uploadPreview = null;
    }
    query = "";
    const input = document.getElementById("query");
    if (input) input.value = "";
    render();
    return;
  }
  const statusButton = event.target.closest("[data-status-filter]");
  if (statusButton) {
    statusFilter = statusButton.dataset.statusFilter;
    render();
    return;
  }
  const kindButton = event.target.closest("[data-kind-filter]");
  if (kindButton) {
    kindFilter = kindButton.dataset.kindFilter;
    render();
    return;
  }
  const packTabButton = event.target.closest("[data-pack-tab]");
  if (packTabButton) {
    packTab = packTabButton.dataset.packTab;
    packView = "detail";
    render();
    return;
  }
  const openPack = event.target.closest("[data-open-pack]");
  if (openPack && !event.target.closest("button, a, input, select")) {
    currentId = openPack.dataset.openPack;
    packView = "detail";
    packTab = "info";
    render();
    return;
  }
  if (event.target.id === "add-pack") {
    draft = blankPack();
    packView = "create";
    render();
    return;
  }
  if (event.target.id === "back-list") {
    packView = "list";
    draft = null;
    render();
    return;
  }
  if (event.target.id === "open-trash") {
    packView = "trash";
    draft = null;
    render();
    return;
  }
  const trashPack = event.target.closest("[data-trash-pack]");
  if (trashPack) {
    const item = packs.find((pack) => pack.id === trashPack.dataset.trashPack);
    if (!item || item.deletedAt) return;
    item.deletedAt = new Date().toISOString().slice(0, 10);
    item.home = false;
    if (currentId === item.id) packView = "list";
    saveRegister();
    toast("삭제목록으로 옮겼다");
    render();
    return;
  }
  if (event.target.id === "erase-selected") {
    erasePacks([...selectedTrashIds]);
    return;
  }
  const erasePack = event.target.closest("[data-erase-pack]");
  if (erasePack) {
    erasePacks([erasePack.dataset.erasePack]);
    return;
  }
  if (event.target.id === "save-new") {
    if (!draft) return;
    draft.saved = true;
    if (!packs.some((pack) => pack.id === draft.id)) packs.push(draft);
    currentId = draft.id;
    render();
    return;
  }
  if (event.target.id === "go-cards") {
    currentId = draft?.id || currentId;
    packView = "detail";
    packTab = "cards";
    draft = null;
    render();
    return;
  }
  if (event.target.id === "open-event") {
    openEventPack();
    return;
  }
  const pickEvent = event.target.closest("[data-pick-event]");
  if (pickEvent) {
    cardEvent = pickEvent.dataset.pickEvent || "";
    render();
    return;
  }
  if (event.target.id === "add-card") {
    const item = packs.find((pack) => pack.id === currentId);
    if (!item) return;
    item.cards.push({
      no: String(item.cards.length + 1).padStart(2, "0"),
      member: "",
      front: "",
      back: "",
      version: "unset",
      rarity: "NORMAL",
      stock: "",
      weight: 1,
    });
    packTab = "cards";
    render();
    return;
  }
  const removeCard = event.target.closest("[data-remove-card]");
  if (removeCard) {
    const item = packs.find((pack) => pack.id === currentId);
    item?.cards.splice(Number(removeCard.dataset.removeCard), 1);
    render();
    return;
  }
  const orderFilterButton = event.target.closest("[data-order-filter]");
  if (orderFilterButton) {
    orderFilter = orderFilterButton.dataset.orderFilter;
    render();
    return;
  }
  const openCards = event.target.closest("[data-open-cards]");
  if (openCards) {
    currentId = openCards.dataset.openCards;
    const item = packs.find((pack) => pack.id === currentId);
    cardKey = item?.cards.length ? `${item.id}:0` : "";
    cardView = "edit";
    render();
    return;
  }
  if (event.target.id === "back-card-list") {
    cardView = "list";
    render();
    return;
  }
  const cardButton = event.target.closest("[data-card-key]");
  if (cardButton) {
    cardKey = cardButton.dataset.cardKey;
    render();
    return;
  }
  const noticeButton = event.target.closest("[data-notice]");
  if (noticeButton) {
    noticeId = noticeButton.dataset.notice;
    render();
    return;
  }
  if (event.target.id === "add-notice") {
    const item = { id: crypto.randomUUID(), scope: "포토카드", category: "포토카드", title: "", body: "", en: "", start: "", end: "", pin: false, popup: false, packId: "" };
    notices.unshift(item);
    noticeId = item.id;
    saveNotices();
    render();
    return;
  }
  if (event.target.id === "delete-notice") {
    notices = notices.filter((item) => item.id !== noticeId);
    noticeId = notices[0]?.id || "";
    saveNotices();
    render();
    return;
  }
  if (event.target.id === "add-zone") {
    policy.zones.push(blankZone());
    render();
    return;
  }
  const removeZone = event.target.closest("[data-zone-remove]");
  if (removeZone) {
    policy.zones.splice(Number(removeZone.dataset.zoneRemove), 1);
    render();
    return;
  }
  if (event.target.id === "save-policy") {
    savePolicy();
    toast("배송정책을 이 브라우저에 저장했다");
    return;
  }
  if (event.target.id === "save-rates") {
    saveRatesConfig();
    toast("시세 설정을 이 브라우저에 저장했다");
    return;
  }
  const problem = event.target.closest("[data-order-problem]");
  if (problem) {
    const order = orders.find((item) => item.id === orderId);
    if (order) order.problem = problem.dataset.orderProblem === "1";
    saveOrders();
    render();
    return;
  }
  const packButton = event.target.closest("[data-id]");
  if (packButton) {
    currentId = packButton.dataset.id;
    render();
    return;
  }
  const orderButton = event.target.closest("[data-order]");
  if (orderButton && (screen === "orders" || screen === "ship" || screen === "track") && !event.target.closest("input, button, a, label")) {
    orderId = orderButton.dataset.order;
    render();
    return;
  }
  if (event.target.id === "excel-selected") {
    downloadOrdersExcel(orders.filter((order) => isShipOrder(order) && selectedOrderIds.has(order.id)));
    return;
  }
  if (event.target.id === "excel-visible") {
    downloadOrdersExcel(shipOrdersIn(orders.filter(orderVisible)));
    return;
  }
  if (event.target.id === "pick-all") {
    const visible = shipOrdersIn(orders.filter(orderVisible));
    const allOn = visible.every((order) => selectedOrderIds.has(order.id));
    visible.forEach((order) => {
      if (allOn) selectedOrderIds.delete(order.id);
      else selectedOrderIds.add(order.id);
    });
    render();
    return;
  }
  if (event.target.id === "bulk-prepare") {
    const picked = orders.filter((order) => selectedOrderIds.has(order.id) && isShipOrder(order));
    const ready = picked.filter((order) => order.status === "shipping_requested");
    ready.forEach((order) => {
      order.status = "preparing";
    });
    saveOrders();
    toast(ready.length ? `${ready.length}건을 준비중으로 바꿨어요` : "배송 요청 상태인 주문만 준비중으로 바꿔요");
    render();
    return;
  }
  if (event.target.id === "open-ship-panel") {
    shipPanel = true;
    render();
    return;
  }
  if (event.target.id === "tracking-download") {
    const picked = orders.filter((order) => selectedOrderIds.has(order.id) && isShipOrder(order) && SHIP_STATUSES.includes(order.status));
    const list = picked.length ? picked : orders.filter((order) => isShipOrder(order) && orderScope(order) && SHIP_STATUSES.includes(order.status));
    if (!list.length) {
      toast("송장을 넣을 주문이 없어요");
      return;
    }
    downloadText("photocard-tracking.csv", "text/csv", trackingCsv(list));
    return;
  }
  if (event.target.id === "apply-ship") {
    captureBulkDraft();
    if (!bulkCarrier) {
      toast("배송회사를 고른 뒤에 발송처리해요");
      return;
    }
    const picked = orders.filter((order) => selectedOrderIds.has(order.id) && isShipOrder(order) && (order.status === "preparing" || order.status === "ready"));
    const missing = picked.filter((order) => !(bulkTracks[order.id] || "").trim());
    if (!picked.length || missing.length) {
      toast(picked.length ? "송장번호가 비어 있는 주문이 있어요" : "준비중이나 발송대기 주문을 골라요");
      return;
    }
    picked.forEach((order) => {
      order.carrier = bulkCarrier;
      order.carrierName = "";
      order.tracking = bulkTracks[order.id].trim();
      order.status = "shipped";
      order.shippedOn = new Date().toISOString().slice(0, 10);
    });
    saveOrders();
    shipPanel = false;
    toast(`${picked.length}건을 발송처리했어요`);
    render();
    return;
  }
  if (event.target.id === "apply-upload") {
    const rows = uploadPreview?.ok || [];
    applyTrackingRows(rows);
    uploadPreview = null;
    toast(`${rows.length}건을 발송처리했어요`);
    render();
    return;
  }
  if (event.target.id === "close-upload") {
    uploadPreview = null;
    render();
    return;
  }
  const exception = event.target.closest("[data-order-exception]");
  if (exception) {
    const order = orders.find((item) => item.id === orderId);
    if (order) order.exception = exception.dataset.orderException;
    saveOrders();
    render();
    return;
  }
  if (event.target.dataset.orderStatus) {
    const order = orders.find((item) => item.id === orderId);
    const next = event.target.dataset.orderStatus;
    if (order && next === "shipped") {
      const tracking = document.getElementById("tracking-input")?.value.trim() || "";
      const carrier = document.getElementById("carrier-input")?.value || "";
      const carrierName = document.getElementById("carrier-name")?.value.trim() || "";
      if (!carrier || (carrier === "기타" && !carrierName) || !tracking) {
        toast("배송회사와 송장번호를 적은 뒤에 발송처리한다");
        return;
      }
      order.carrier = carrier;
      order.carrierName = carrierName;
      order.tracking = tracking;
      order.shippedOn = new Date().toISOString().slice(0, 10);
    }
    if (order) order.status = next;
    saveOrders();
    render();
    return;
  }
  const move = event.target.closest("[data-move]");
  if (move) {
    const id = move.dataset.target || currentId;
    const item = packs.find((pack) => pack.id === id);
    const pool = item.home ? activePacks().filter((pack) => pack.home) : activePacks();
    moveItem(pool, id, Number(move.dataset.dir));
    render();
    return;
  }
  const bannerMove = event.target.closest("[data-banner-move]");
  if (bannerMove) {
    const banner = banners.find((item) => item.id === bannerMove.dataset.bannerMove);
    const same = banners.filter((item) => (item.place === "mid") === (banner?.place === "mid"));
    moveItem(same, bannerMove.dataset.bannerMove, Number(bannerMove.dataset.dir));
    render();
    return;
  }
  if (event.target.dataset.bannerDelete) {
    banners = banners.filter((banner) => banner.id !== event.target.dataset.bannerDelete);
    render();
    return;
  }
  if (event.target.dataset.home) {
    const item = packs.find((pack) => pack.id === event.target.dataset.home);
    setListed(item, event.target.dataset.homeOn === "1");
    render();
    return;
  }
  if (event.target.id === "add-banner" || event.target.id === "add-mid-banner") {
    banners.push({
      id: crypto.randomUUID(),
      image: "",
      line1: "",
      line2: "",
      packId: packs[0].id,
      on: false,
      sort: banners.length,
      link: "product",
      place: event.target.id === "add-mid-banner" ? "mid" : "top",
      start: "",
      end: "",
    });
    render();
    return;
  }
  if (event.target.id === "add-category") {
    const item = { id: crypto.randomUUID(), name: "", nameKo: "", nameEn: "", aliases: "", profileName: "", profileImage: "", kind: "group", members: [""], albums: [], groupId: "" };
    categories.push(item);
    categoryId = item.id;
    render();
    return;
  }
  if (event.target.id === "add-member") {
    const category = categoryById(categoryId);
    if (!category) return;
    category.members.push("");
    render();
    return;
  }
  if (event.target.id === "add-album") {
    const category = categoryById(categoryId);
    if (!category) return;
    category.albums.push({ name: "", cover: "" });
    render();
    return;
  }
  if (event.target.dataset.memberRemove != null) {
    const category = categoryById(categoryId);
    if (!category) return;
    const index = Number(event.target.dataset.memberRemove);
    const name = String(category.members[index] || "").trim();
    const used = packs.some((pack) => pack.artistId === category.id && pack.cards.some((card) => card.member === name));
    if (name && used) {
      toast("이 멤버를 쓰는 카드가 있어요");
      return;
    }
    category.members.splice(index, 1);
    if (!category.members.length) category.members.push("");
    render();
    return;
  }
  if (event.target.dataset.albumRemove != null) {
    const category = categoryById(categoryId);
    if (!category) return;
    const index = Number(event.target.dataset.albumRemove);
    const name = category.albums[index]?.name || "";
    if (name && packs.some((pack) => pack.artistId === category.id && pack.album === name)) {
      toast("이 앨범의 행사를 삭제한 뒤에 다시 와 주세요.");
      return;
    }
    category.albums.splice(index, 1);
    render();
    return;
  }
  if (event.target.id === "delete-category") {
    const category = categoryById(categoryId);
    if (!category) return;
    if (packs.some((pack) => pack.artistId === category.id)) {
      toast("하위 상품을 삭제한 뒤에 다시 와 주세요.");
      return;
    }
    if (listedNames(category.albums).length) {
      toast("앨범을 삭제한 뒤에 다시 와 주세요.");
      return;
    }
    categories = categories.filter((item) => item.id !== category.id);
    categoryId = categories[0]?.id || "";
    render();
    return;
  }
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    categoryId = categoryButton.dataset.category;
    render();
    return;
  }
  if (event.target.id === "save") {
    saveRegister();
    toast("이 브라우저에 저장했다");
  }
  if (event.target.id === "reset") {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = prepare(load());
    packs = fresh.packs;
    banners = fresh.banners;
    artistEmblems = fresh.artistEmblems || {};
    categories = fresh.categories;
    categoryId = categories[0]?.id || "";
    currentId = packs[0].id;
    screen = "cards";
    packView = "list";
    draft = null;
    render();
  }
  if (event.target.id === "clear-profile") {
    const category = categoryById(categoryId);
    if (category) {
      category.profileImage = "";
      delete artistEmblems[category.id];
    }
    render();
    return;
  }
  if (event.target.id === "clear-emblem") {
    const item = packs.find((pack) => pack.id === currentId);
    if (item?.artistId) delete artistEmblems[item.artistId];
    render();
    return;
  }
  if (event.target.id === "clear-cover") {
    const item = activePack();
    if (!item) return;
    item.cover = "";
    render();
  }
});

function readCover(file, max = 640) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("cover"));
    };
    image.src = url;
  });
}

document.body.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.pickOrder) {
    if (target.checked) selectedOrderIds.add(target.dataset.pickOrder);
    else selectedOrderIds.delete(target.dataset.pickOrder);
    render();
    return;
  }
  if (target.id === "trash-all") {
    trashedPacks().forEach((item) => {
      if (target.checked) selectedTrashIds.add(item.id);
      else selectedTrashIds.delete(item.id);
    });
    render();
    return;
  }
  if (target.dataset.trashCheck) {
    if (target.checked) selectedTrashIds.add(target.dataset.trashCheck);
    else selectedTrashIds.delete(target.dataset.trashCheck);
    render();
    return;
  }
  if (target.id === "region-filter") {
    regionFilter = target.value;
    render();
    return;
  }
  if (target.id === "country-filter") {
    countryFilter = target.value;
    render();
    return;
  }
  if (target.id === "date-from" || target.id === "date-to") {
    if (target.id === "date-from") dateFrom = target.value;
    else dateTo = target.value;
    render();
    return;
  }
  if (target.id === "tracking-upload" && target.files?.[0]) {
    const file = target.files[0];
    file.text().then((text) => {
      uploadPreview = reviewTracking(parseTrackingText(text));
      shipPanel = false;
      render();
    });
    return;
  }
  if (target.id === "pack-sort") {
    packSort = target.value;
    render();
    return;
  }
  const item = activePack();
  if (target.id === "category-profile" && target.files[0]) {
    const category = categoryById(categoryId);
    if (!category) return;
    readCover(target.files[0], 480).then((image) => {
      category.profileImage = image;
      artistEmblems[category.id] = image;
      render();
    });
    return;
  }
  if (target.id === "emblem-file" && target.files[0]) {
    const pack = packs.find((entry) => entry.id === currentId);
    if (!pack?.artistId || pack.artistId === HOLDING_ID) return;
    readCover(target.files[0], 480).then((image) => {
      artistEmblems[pack.artistId] = image;
      render();
    });
    return;
  }
  if (target.id === "card-artist") {
    cardArtistId = target.value;
    cardAlbum = "";
    cardEvent = "";
    render();
    return;
  }
  if (target.id === "card-album") {
    cardAlbum = target.value;
    cardEvent = "";
    render();
    return;
  }
  if (target.dataset.albumFile && target.files[0]) {
    const category = categoryById(categoryId);
    const album = category?.albums[Number(target.dataset.albumFile)];
    if (!album) return;
    readCover(target.files[0]).then((cover) => {
      album.cover = cover;
      packs.forEach((pack) => {
        if (pack.artistId === category.id && pack.album === album.name) pack.cover = cover;
      });
      render();
    });
    return;
  }
  if (target.id === "cover-file" && target.files[0]) {
    const pack = activePack();
    if (!pack) return;
    readCover(target.files[0]).then((cover) => {
      pack.cover = cover;
      render();
    });
    return;
  }
  if (target.dataset.bannerFile && target.files[0]) {
    const banner = banners.find((entry) => entry.id === target.dataset.bannerFile);
    readCover(target.files[0], 1200).then((image) => {
      banner.image = image;
      render();
    });
    return;
  }
  if (target.dataset.bannerLine1 || target.dataset.bannerLine2) {
    const id = target.dataset.bannerLine1 || target.dataset.bannerLine2;
    const banner = banners.find((entry) => entry.id === id);
    if (target.dataset.bannerLine1) banner.line1 = target.value;
    else banner.line2 = target.value;
    render();
    return;
  }
  if (target.dataset.bannerPack) {
    banners.find((entry) => entry.id === target.dataset.bannerPack).packId = target.value;
    render();
    return;
  }
  if (target.dataset.bannerOn) {
    banners.find((entry) => entry.id === target.dataset.bannerOn).on = target.checked;
    render();
    return;
  }
  if (target.dataset.bannerLink || target.dataset.bannerPlace || target.dataset.bannerStart || target.dataset.bannerEnd) {
    const id = target.dataset.bannerLink || target.dataset.bannerPlace || target.dataset.bannerStart || target.dataset.bannerEnd;
    const banner = banners.find((entry) => entry.id === id);
    if (target.dataset.bannerLink) banner.link = target.value;
    if (target.dataset.bannerPlace) banner.place = target.value;
    if (target.dataset.bannerStart) banner.start = target.value;
    if (target.dataset.bannerEnd) banner.end = target.value;
    render();
    return;
  }
  if (target.dataset.cardMove) {
    const from = packs.find((pack) => pack.id === currentId);
    const index = Number(target.dataset.cardMove);
    const dest = packs.find((pack) => pack.id === target.value);
    const moving = from?.cards[index];
    if (from && dest && moving && from.id !== dest.id) {
      from.cards.splice(index, 1);
      dest.cards.push(moving);
      cardKey = `${dest.id}:${dest.cards.length - 1}`;
      currentId = dest.id;
    }
    render();
    return;
  }
  if (target.dataset.face && target.files?.[0]) {
    const pack = packs.find((entry) => entry.id === currentId);
    const card = pack?.cards[Number(target.dataset.faceIndex)];
    if (!card) return;
    readCover(target.files[0]).then((image) => {
      card[target.dataset.face] = image;
      render();
    });
    return;
  }
  if (target.id === "order-memo") {
    const order = orders.find((item) => item.id === orderId);
    if (order) {
      order.memo = target.value;
      saveOrders();
    }
    return;
  }
  if (target.id === "policy-max") policy.maxCards = Number(target.value) || policy.maxCards;
  if (target.id === "policy-weight") policy.cardWeight = target.value;
  if (target.id === "policy-keep") policy.keepDays = target.value;
  if (target.dataset.bandWeight != null) policy.packBands[Number(target.dataset.bandWeight)].weight = target.value;
  if (target.dataset.zoneTrack != null) policy.zones[Number(target.dataset.zoneTrack)].track = target.checked;
  if (target.dataset.zoneField) {
    policy.zones[Number(target.dataset.zone)][target.dataset.zoneField] = target.value;
    return;
  }
  if (target.dataset.noticeField || target.dataset.noticeFlag) {
    const notice = notices.find((item) => item.id === noticeId);
    if (!notice) return;
    if (target.dataset.noticeFlag) notice[target.dataset.noticeFlag] = target.checked;
    else notice[target.dataset.noticeField] = target.value;
    saveNotices();
    if (target.dataset.noticeField === "title" || target.dataset.noticeField === "category") renderSidebar();
    return;
  }
  if (target.dataset.albumKo != null || target.dataset.albumEn != null) {
    const category = categoryById(categoryId);
    const index = Number(target.dataset.albumKo != null ? target.dataset.albumKo : target.dataset.albumEn);
    const album = category?.albums[index];
    if (!album) return;
    if (target.dataset.albumKo != null) album.nameKo = target.value;
    else album.nameEn = target.value;
    render();
    return;
  }
  if (target.dataset.categoryField || target.dataset.memberName != null) {
    const category = categoryById(categoryId);
    if (!category) return;
    if (target.dataset.categoryField === "nameKo" || target.dataset.categoryField === "nameEn" || target.dataset.categoryField === "aliases") {
      category[target.dataset.categoryField] = target.value;
      category.profileName = localizedName(category.nameKo, category.nameEn, category.name);
      if (category.kind === "solo" && target.dataset.categoryField !== "aliases") {
        category.members = [category.profileName].filter(Boolean);
      }
      applyProfileName(category);
    }
    if (target.dataset.categoryField === "kind") {
      category.kind = target.value;
      const shown = localizedName(category.nameKo, category.nameEn, category.name);
      if (category.kind === "solo") category.members = [shown].filter(Boolean);
      else if (!category.members.length) category.members = [""];
      packs.forEach((pack) => {
        if (pack.artistId === category.id) pack.kind = category.kind;
      });
    }
    if (target.dataset.memberName != null) {
      renameCategoryValue(category, "members", Number(target.dataset.memberName), target.value, (before, after) => {
        packs.forEach((pack) => {
          if (pack.artistId !== category.id) return;
          pack.cards.forEach((card) => {
            if (card.member === before) card.member = after;
          });
        });
      });
    }
    render();
    return;
  }
  if (target.dataset.field) {
    if (!item) return;
    const field = target.dataset.field;
    if (field === "listed") setListed(item, target.value === "1");
    else if (field === "selling") setSale(item, target.value);
    else if (field === "home") item.home = target.checked;
    else item[field] = field === "price" ? Number(target.value) : target.value;
    if (field === "artistId") {
      const category = categories.find((entry) => entry.id === item.artistId);
      if (category?.kind) item.kind = category.kind;
    }
    item.artistName = artistName(item.artistId);
    if (field === "artistId" || field === "kind") {
      const albums = albumsOf(item.artistId);
      if (item.album && !albums.includes(item.album)) item.album = albums[0] || "";
      if (!item.album && albums[0]) item.album = albums[0];
      const allowed = new Set(membersOf(item.artistId));
      item.cards.forEach((card) => {
        if (!allowed.has(card.member)) card.member = "";
      });
    }
    render();
    return;
  }
  if (target.dataset.guide) {
    if (!item) return;
    item.guides = item.guides || {};
    item.guides[target.dataset.guide] = target.value;
    return;
  }
  if (target.dataset.fact) {
    if (!item) return;
    item.facts = item.facts || {};
    item.facts[target.dataset.fact] = target.value;
    return;
  }
  if (target.dataset.perk) {
    if (!item) return;
    item.perks = item.perks || ["", "", ""];
    item.perks[Number(target.dataset.perk)] = target.value;
    return;
  }
  if (target.dataset.sheetNote) {
    if (!item) return;
    item.sheetNotes = item.sheetNotes || ["", "", ""];
    item.sheetNotes[Number(target.dataset.sheetNote)] = target.value;
    return;
  }
  if (target.dataset.cardField) {
    if (!item) return;
    const card = item.cards[Number(target.dataset.card)];
    const field = target.dataset.cardField;
    card[field] = field === "weight" ? Number(target.value) : target.value;
    if (field === "stock") card.stock = target.value === "" ? "" : Number(target.value);
    render();
  }
});

const stored = prepare(load());
packs = stored.packs;
banners = stored.banners;
artistEmblems = stored.artistEmblems || {};
categories = stored.categories;
packs.forEach((pack) => {
  pack.artistName = artistName(pack.artistId);
});
categoryId = categories[0]?.id || "";
orders = loadOrderStore();
currentId = packs[0].id;

const adminMenus = ["dash", "category", "pack", "cards", "banner", "orders", "ship", "track", "policy", "notice"];
const askedMenu = new URLSearchParams(location.search).get("menu");
if (askedMenu === "pack" || askedMenu === "album") screen = askedMenu === "album" ? "category" : "cards";
else if (adminMenus.includes(askedMenu)) screen = askedMenu;
window.addEventListener("message", (event) => {
  let next = event.data && event.data.source === "photocard-preview" ? event.data.screen : "";
  if (next === "album") next = "category";
  if (!adminMenus.includes(next) || next === screen) return;
  screen = next;
  if (screen === "pack") {
    packView = "list";
    draft = null;
  }
  query = "";
  render();
});

render();
