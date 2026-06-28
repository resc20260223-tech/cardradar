import { useState, useEffect, useRef, useCallback } from "react";

/* ===================== 定数 ===================== */
const GAMES = [
  { id: "pokemon",  label: "ポケモンカード",   emoji: "⚡", color: "#FFD700" },
  { id: "onepiece", label: "ワンピースカード", emoji: "☠️", color: "#E8352A" },
];
const PRICE_RANGES = [
  { label: "すべて",         min: 0,     max: Infinity },
  { label: "〜500円",       min: 0,     max: 500 },
  { label: "500〜2,000円",  min: 500,   max: 2000 },
  { label: "2,000〜1万円",  min: 2000,  max: 10000 },
  { label: "1万円〜",       min: 10000, max: Infinity },
];
const REGIONS = [
  { id: "hokkaido", label: "北海道・東北", prefs: ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県"] },
  { id: "kanto",   label: "関東",         prefs: ["東京都","神奈川県","埼玉県","千葉県","茨城県","栃木県","群馬県"] },
  { id: "chubu",   label: "中部・甲信越", prefs: ["愛知県","静岡県","岐阜県","三重県","長野県","山梨県","新潟県","富山県","石川県","福井県"] },
  { id: "kansai",  label: "近畿",         prefs: ["大阪府","兵庫県","京都府","奈良県","滋賀県","和歌山県"] },
  { id: "chugoku", label: "中国・四国",   prefs: ["広島県","岡山県","山口県","鳥取県","島根県","愛媛県","香川県","高知県","徳島県"] },
  { id: "kyushu",  label: "九州・沖縄",   prefs: ["福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"] },
];
// 店舗タイプ定義
const SHOP_TYPES = {
  tcg:       { label:"カードショップ", icon:"🃏", color:"#FFD700" },
  electronics:{ label:"家電量販店",    icon:"🏪", color:"#00BFFF" },
  convenience:{ label:"コンビニ",      icon:"🏬", color:"#FF8C00" },
  used:      { label:"リユースショップ",icon:"♻️", color:"#00FF88" },
  supermarket:{ label:"スーパー",      icon:"🛒", color:"#AA88FF" },
  toy:       { label:"おもちゃ店",     icon:"🧸", color:"#FF69B4" },
};

const LOCATIONS = [
  // ── カードショップ ──
  { id:1,  name:"カードラッシュ 秋葉原店",   address:"東京都千代田区外神田",      pref:"東京都",   city:"千代田区",   type:"tcg" },
  { id:2,  name:"遊々亭 池袋本店",           address:"東京都豊島区東池袋",        pref:"東京都",   city:"豊島区",     type:"tcg" },
  { id:3,  name:"トレトレ 新宿店",           address:"東京都新宿区新宿",          pref:"東京都",   city:"新宿区",     type:"tcg" },
  { id:4,  name:"カードショップ 渋谷",       address:"東京都渋谷区道玄坂",        pref:"東京都",   city:"渋谷区",     type:"tcg" },
  { id:5,  name:"ドラゴンスター 上野",       address:"東京都台東区上野",          pref:"東京都",   city:"台東区",     type:"tcg" },
  { id:6,  name:"カードキングダム 横浜",     address:"神奈川県横浜市西区",        pref:"神奈川県", city:"横浜市",     type:"tcg" },
  { id:7,  name:"TCG Station 川崎",          address:"神奈川県川崎市川崎区",      pref:"神奈川県", city:"川崎市",     type:"tcg" },
  { id:8,  name:"ポケカ倉庫 大宮",           address:"埼玉県さいたま市大宮区",    pref:"埼玉県",   city:"さいたま市", type:"tcg" },
  { id:9,  name:"カードラッシュ 梅田店",     address:"大阪府大阪市北区",          pref:"大阪府",   city:"大阪市",     type:"tcg" },
  { id:10, name:"トレカパーク 難波",         address:"大阪府大阪市中央区",        pref:"大阪府",   city:"大阪市",     type:"tcg" },
  { id:11, name:"カードボックス 名古屋",     address:"愛知県名古屋市中村区",      pref:"愛知県",   city:"名古屋市",   type:"tcg" },
  { id:12, name:"TCG天国 博多",              address:"福岡県福岡市博多区",        pref:"福岡県",   city:"福岡市",     type:"tcg" },
  { id:13, name:"カードショップ 札幌",       address:"北海道札幌市中央区",        pref:"北海道",   city:"札幌市",     type:"tcg" },
  { id:14, name:"仙台カードセンター",        address:"宮城県仙台市青葉区",        pref:"宮城県",   city:"仙台市",     type:"tcg" },
  // ── 家電量販店 ──
  { id:15, name:"ヨドバシカメラ 秋葉原",     address:"東京都千代田区外神田",      pref:"東京都",   city:"千代田区",   type:"electronics" },
  { id:16, name:"ビックカメラ 有楽町店",     address:"東京都千代田区有楽町",      pref:"東京都",   city:"千代田区",   type:"electronics" },
  { id:17, name:"ヨドバシカメラ 新宿",       address:"東京都新宿区西新宿",        pref:"東京都",   city:"新宿区",     type:"electronics" },
  { id:18, name:"ビックカメラ 池袋東口",     address:"東京都豊島区東池袋",        pref:"東京都",   city:"豊島区",     type:"electronics" },
  { id:19, name:"ヨドバシカメラ 横浜",       address:"神奈川県横浜市西区高島",    pref:"神奈川県", city:"横浜市",     type:"electronics" },
  { id:20, name:"ヨドバシカメラ 梅田",       address:"大阪府大阪市北区大深町",    pref:"大阪府",   city:"大阪市",     type:"electronics" },
  { id:21, name:"ビックカメラ 名古屋",       address:"愛知県名古屋市中村区名駅",  pref:"愛知県",   city:"名古屋市",   type:"electronics" },
  { id:22, name:"ヨドバシカメラ 札幌",       address:"北海道札幌市北区北六条西",  pref:"北海道",   city:"札幌市",     type:"electronics" },
  { id:23, name:"ビックカメラ 福岡天神",     address:"福岡県福岡市中央区天神",    pref:"福岡県",   city:"福岡市",     type:"electronics" },
  // ── コンビニ ──
  { id:24, name:"セブン-イレブン 秋葉原",    address:"東京都千代田区外神田",      pref:"東京都",   city:"千代田区",   type:"convenience" },
  { id:25, name:"ローソン 新宿歌舞伎町",     address:"東京都新宿区歌舞伎町",      pref:"東京都",   city:"新宿区",     type:"convenience" },
  { id:26, name:"ファミリーマート 渋谷",     address:"東京都渋谷区道玄坂",        pref:"東京都",   city:"渋谷区",     type:"convenience" },
  { id:27, name:"セブン-イレブン 梅田",      address:"大阪府大阪市北区梅田",      pref:"大阪府",   city:"大阪市",     type:"convenience" },
  { id:28, name:"ローソン 名古屋栄",         address:"愛知県名古屋市中区栄",      pref:"愛知県",   city:"名古屋市",   type:"convenience" },
  { id:29, name:"ファミリーマート 博多",     address:"福岡県福岡市博多区博多駅前", pref:"福岡県",  city:"福岡市",     type:"convenience" },
  { id:30, name:"セブン-イレブン 札幌駅前",  address:"北海道札幌市北区北六条西",  pref:"北海道",   city:"札幌市",     type:"convenience" },
  // ── リユース・中古 ──
  { id:31, name:"ゲオ 秋葉原店",             address:"東京都千代田区外神田",      pref:"東京都",   city:"千代田区",   type:"used" },
  { id:32, name:"ブックオフ 新宿店",         address:"東京都新宿区新宿",          pref:"東京都",   city:"新宿区",     type:"used" },
  { id:33, name:"ゲオ 横浜店",               address:"神奈川県横浜市西区",        pref:"神奈川県", city:"横浜市",     type:"used" },
  { id:34, name:"ブックオフ 大阪梅田",       address:"大阪府大阪市北区梅田",      pref:"大阪府",   city:"大阪市",     type:"used" },
  { id:35, name:"ゲオ 名古屋大須",           address:"愛知県名古屋市中区大須",    pref:"愛知県",   city:"名古屋市",   type:"used" },
  { id:36, name:"ブックオフ 福岡天神",       address:"福岡県福岡市中央区天神",    pref:"福岡県",   city:"福岡市",     type:"used" },
  // ── スーパー・総合 ──
  { id:37, name:"イオン 幕張店",             address:"千葉県千葉市美浜区",        pref:"千葉県",   city:"千葉市",     type:"supermarket" },
  { id:38, name:"イオン 川口店",             address:"埼玉県川口市",              pref:"埼玉県",   city:"川口市",     type:"supermarket" },
  { id:39, name:"イトーヨーカドー 津田沼",   address:"千葉県船橋市前原西",        pref:"千葉県",   city:"船橋市",     type:"supermarket" },
  { id:40, name:"ドン・キホーテ 秋葉原",     address:"東京都千代田区外神田",      pref:"東京都",   city:"千代田区",   type:"supermarket" },
  { id:41, name:"ドン・キホーテ 難波",       address:"大阪府大阪市中央区宗右衛門町",pref:"大阪府", city:"大阪市",     type:"supermarket" },
  // ── おもちゃ・ホビー ──
  { id:42, name:"トイザらス 秋葉原",         address:"東京都千代田区外神田",      pref:"東京都",   city:"千代田区",   type:"toy" },
  { id:43, name:"アニメイト 池袋本店",       address:"東京都豊島区東池袋",        pref:"東京都",   city:"豊島区",     type:"toy" },
  { id:44, name:"トイザらス 横浜",           address:"神奈川県横浜市港北区",      pref:"神奈川県", city:"横浜市",     type:"toy" },
  { id:45, name:"アニメイト 大阪日本橋",     address:"大阪府大阪市浪速区",        pref:"大阪府",   city:"大阪市",     type:"toy" },
];
const PACK_PRODUCTS = [
  { id:"sv8a", game:"pokemon",  name:"ロストアビス",         type:"BOX", image:"📦" },
  { id:"sv9",  game:"pokemon",  name:"黒炎の支配者",         type:"BOX", image:"📦" },
  { id:"sv9a", game:"pokemon",  name:"シャイニートレジャーex",type:"BOX", image:"✨" },
  { id:"sv10", game:"pokemon",  name:"ワイルドフォース",      type:"BOX", image:"🌿" },
  { id:"sv11", game:"pokemon",  name:"ステラミラクル",        type:"BOX", image:"⭐" },
  { id:"op01", game:"onepiece", name:"ROMANCE DAWN",          type:"BOX", image:"🌅" },
  { id:"op06", game:"onepiece", name:"双璧の覇者",            type:"BOX", image:"⚔️" },
  { id:"op08", game:"onepiece", name:"二つの伝説",            type:"BOX", image:"📜" },
  { id:"op09", game:"onepiece", name:"黄金の伝説",            type:"BOX", image:"🏆" },
  { id:"op10", game:"onepiece", name:"燃え上がれ！！",        type:"BOX", image:"🔥" },
];
const SIGNAL_TYPES = {
  confirmed:{ label:"入荷確定", color:"#00FF88", bg:"rgba(0,255,136,0.12)", icon:"✅" },
  high:     { label:"入荷濃厚", color:"#FFD700", bg:"rgba(255,215,0,0.12)",  icon:"🔥" },
  medium:   { label:"入荷予測", color:"#FF8C00", bg:"rgba(255,140,0,0.10)",  icon:"📡" },
  restock:  { label:"再入荷",   color:"#00BFFF", bg:"rgba(0,191,255,0.10)",  icon:"🔄" },
  rumor:    { label:"噂・情報", color:"#AA88FF", bg:"rgba(170,136,255,0.10)",icon:"💬" },
};
const MOCK_LISTINGS = [
  { id:1,  game:"pokemon",  title:"リザードン ex SAR",   seller:"カードラッシュ秋葉原", price:8500,  condition:"美品", locationId:1,  postedAt:new Date(Date.now()-1000*60*5),   image:"🔥", rarity:"SAR"  },
  { id:2,  game:"onepiece", title:"ロロノア・ゾロ SP",   seller:"遊々亭池袋",           price:12000, condition:"新品", locationId:2,  postedAt:new Date(Date.now()-1000*60*12),  image:"⚔️", rarity:"SP"   },
  { id:3,  game:"pokemon",  title:"ピカチュウex RR",     seller:"トレトレ新宿",         price:1800,  condition:"良品", locationId:3,  postedAt:new Date(Date.now()-1000*60*20),  image:"⚡", rarity:"RR"   },
  { id:4,  game:"onepiece", title:"モンキー・D・ルフィ L",seller:"カードショップ渋谷",  price:3200,  condition:"美品", locationId:4,  postedAt:new Date(Date.now()-1000*60*35),  image:"👒", rarity:"L"    },
  { id:5,  game:"pokemon",  title:"ガブリアス ex SAR",   seller:"ドラゴンスター上野",   price:5400,  condition:"新品", locationId:5,  postedAt:new Date(Date.now()-1000*60*48),  image:"🐉", rarity:"SAR"  },
  { id:6,  game:"pokemon",  title:"ミュウツー ex UR",    seller:"カードラッシュ秋葉原", price:22000, condition:"新品", locationId:1,  postedAt:new Date(Date.now()-1000*60*2),   image:"🧬", rarity:"UR"   },
  { id:7,  game:"onepiece", title:"サンジ SR+",           seller:"遊々亭池袋",           price:980,   condition:"良品", locationId:2,  postedAt:new Date(Date.now()-1000*60*60),  image:"🍳", rarity:"SR+"  },
  { id:8,  game:"pokemon",  title:"イーブイ プロモ",     seller:"トレトレ新宿",         price:450,   condition:"美品", locationId:3,  postedAt:new Date(Date.now()-1000*60*90),  image:"🦊", rarity:"プロモ"},
];
const MOCK_SIGNALS = [
  { id:101, game:"pokemon",  productId:"sv11", locationId:1,  signalType:"confirmed", stock:12,   source:"店舗公式Twitter",    message:"ステラミラクルBOX 本日10時より12個限定！お一人様1点まで",       detectedAt:new Date(Date.now()-1000*60*8),   confidence:99 },
  { id:102, game:"onepiece", productId:"op10", locationId:2,  signalType:"restock",   stock:6,    source:"遊々亭 入荷情報ページ",message:"燃え上がれ！！BOX 再入荷あり、残り6BOX",                       detectedAt:new Date(Date.now()-1000*60*23),  confidence:97 },
  { id:103, game:"pokemon",  productId:"sv9a", locationId:3,  signalType:"high",      stock:null, source:"店員情報（匿名）",    message:"シャイニートレジャーex 明日朝イチ入荷見込み。数量未確認",     detectedAt:new Date(Date.now()-1000*60*41),  confidence:78 },
  { id:104, game:"onepiece", productId:"op09", locationId:4,  signalType:"medium",    stock:null, source:"入荷パターン分析",    message:"黄金の伝説BOX 過去サイクルから今週末入荷の可能性が高い",     detectedAt:new Date(Date.now()-1000*60*75),  confidence:62 },
  { id:105, game:"pokemon",  productId:"sv10", locationId:5,  signalType:"rumor",     stock:null, source:"掲示板情報",          message:"ワイルドフォースBOX 上野近辺で入荷したという目撃情報",        detectedAt:new Date(Date.now()-1000*60*120), confidence:35 },
  { id:106, game:"pokemon",  productId:"sv11", locationId:2,  signalType:"confirmed", stock:8,    source:"店舗公式LINE",        message:"ステラミラクルBOX 8個入荷！明日9時開店より販売",               detectedAt:new Date(Date.now()-1000*60*3),   confidence:99 },
  { id:107, game:"pokemon",  productId:"sv9",  locationId:6,  signalType:"confirmed", stock:5,    source:"店舗公式Twitter",    message:"黒炎の支配者BOX 横浜店に5BOX入荷！本日より販売",               detectedAt:new Date(Date.now()-1000*60*15),  confidence:99 },
  { id:108, game:"onepiece", productId:"op08", locationId:9,  signalType:"restock",   stock:10,   source:"店舗公式Instagram",  message:"二つの伝説BOX 梅田店に再入荷！10BOX限定。整理券配布あり",     detectedAt:new Date(Date.now()-1000*60*32),  confidence:95 },
  { id:109, game:"pokemon",  productId:"sv11", locationId:11, signalType:"high",      stock:null, source:"問い合わせ急増検知",  message:"名古屋店でステラミラクルBOX入荷の問い合わせ急増中。入荷濃厚", detectedAt:new Date(Date.now()-1000*60*55),  confidence:74 },
  { id:110, game:"onepiece", productId:"op10", locationId:12, signalType:"medium",    stock:null, source:"入荷パターン分析",    message:"燃え上がれ！！ 博多店の入荷サイクルから今週中の入荷を予測",   detectedAt:new Date(Date.now()-1000*60*90),  confidence:58 },
  { id:111, game:"pokemon",  productId:"sv9a", locationId:13, signalType:"rumor",     stock:null, source:"SNS目撃情報",         message:"札幌市内某店でシャイニートレジャーex目撃情報あり",             detectedAt:new Date(Date.now()-1000*60*110), confidence:28 },
  { id:112, game:"onepiece", productId:"op06", locationId:14, signalType:"confirmed", stock:3,    source:"店舗公式Twitter",    message:"仙台店に双璧の覇者BOX 3個入荷！先着順で本日販売",               detectedAt:new Date(Date.now()-1000*60*6),   confidence:99 },
  { id:113, game:"pokemon",  productId:"sv10", locationId:7,  signalType:"restock",   stock:4,    source:"公式サイト更新",      message:"川崎店 ワイルドフォースBOX 4個再入荷。オンライン予約可能",     detectedAt:new Date(Date.now()-1000*60*44),  confidence:93 },
  { id:114, game:"onepiece", productId:"op09", locationId:10, signalType:"high",      stock:null, source:"入荷予告投稿",        message:"難波店から黄金の伝説入荷予告。明後日AM10時より販売予定",       detectedAt:new Date(Date.now()-1000*60*18),  confidence:82 },
];

/* ===================== ユーティリティ ===================== */
function timeAgo(date) {
  const d = Math.floor((Date.now() - date.getTime()) / 1000);
  if (d < 60) return `${d}秒前`;
  if (d < 3600) return `${Math.floor(d/60)}分前`;
  if (d < 86400) return `${Math.floor(d/3600)}時間前`;
  return `${Math.floor(d/86400)}日前`;
}

/* ===================== 小コンポーネント ===================== */
function RarityBadge({ rarity }) {
  const c = {
    UR:"linear-gradient(135deg,#FFD700,#FF8C00)", SAR:"linear-gradient(135deg,#C0C0C0,#9370DB)",
    SR:"linear-gradient(135deg,#4169E1,#00CED1)", "SR+":"linear-gradient(135deg,#4169E1,#7B68EE)",
    RR:"linear-gradient(135deg,#228B22,#32CD32)", SP:"linear-gradient(135deg,#DC143C,#FF6347)",
    L:"linear-gradient(135deg,#8B0000,#FF4500)", プロモ:"linear-gradient(135deg,#696969,#A9A9A9)",
  };
  return <span style={{ background:c[rarity]||c["プロモ"], color:"#fff", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, letterSpacing:"0.05em", textShadow:"0 1px 2px rgba(0,0,0,0.5)", whiteSpace:"nowrap" }}>{rarity}</span>;
}

function ConfidenceMeter({ value }) {
  const col = value>=90?"#00FF88":value>=60?"#FFD700":value>=35?"#FF8C00":"#AA88FF";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:col, borderRadius:2 }} />
      </div>
      <span style={{ color:col, fontSize:11, fontWeight:700, minWidth:30 }}>{value}%</span>
    </div>
  );
}

function AlertBanner({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
      {alerts.map((a,i) => (
        <div key={i} style={{ background:"rgba(0,200,100,0.1)", border:"1px solid rgba(0,200,100,0.3)", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14 }}>🔔</span>
          <span style={{ color:"#00FF88", fontSize:12, flex:1, lineHeight:1.4 }}>{a}</span>
          <button onClick={()=>onDismiss(i)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:18, lineHeight:1, padding:"0 2px", flexShrink:0 }}>×</button>
        </div>
      ))}
    </div>
  );
}

/* ===================== 検索タブ ===================== */
function SearchTab({ listings, newIds, selectedGames, toggleGame }) {
  const [keyword, setKeyword] = useState("");
  const [priceIdx, setPriceIdx] = useState(0);
  const [sortBy, setSortBy] = useState("new");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = listings
    .filter(l => selectedGames.includes(l.game))
    .filter(l => { const r=PRICE_RANGES[priceIdx]; return l.price>=r.min&&l.price<=r.max; })
    .filter(l => !keyword || l.title.includes(keyword) || l.seller.includes(keyword))
    .sort((a,b) => sortBy==="new"?b.postedAt-a.postedAt:sortBy==="price_asc"?a.price-b.price:b.price-a.price);

  return (
    <div>
      {/* 検索バー */}
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        <input
          value={keyword} onChange={e=>setKeyword(e.target.value)}
          placeholder="カード名・店舗名で検索..."
          style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:10, color:"#E0E0E0", padding:"12px 14px", fontSize:15, outline:"none", WebkitAppearance:"none" }}
        />
        <button onClick={()=>setShowFilters(f=>!f)} style={{
          background: showFilters?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.06)",
          border:`1px solid ${showFilters?"rgba(255,215,0,0.5)":"rgba(255,255,255,0.1)"}`,
          borderRadius:10, padding:"0 14px", color:showFilters?"#FFD700":"#888", fontSize:18, cursor:"pointer", flexShrink:0
        }}>⚙</button>
      </div>

      {/* フィルター（展開） */}
      {showFilters && (
        <div style={{ background:"rgba(15,15,28,0.9)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:14, marginBottom:12 }}>
          {/* ゲーム */}
          <div style={{ marginBottom:12 }}>
            <div style={{ color:"#555", fontSize:11, marginBottom:6 }}>ゲーム</div>
            <div style={{ display:"flex", gap:8 }}>
              {GAMES.map(g => (
                <button key={g.id} onClick={()=>toggleGame(g.id)} style={{
                  flex:1, background:selectedGames.includes(g.id)?`${g.color}22`:"rgba(255,255,255,0.03)",
                  border:`1px solid ${selectedGames.includes(g.id)?g.color+"66":"rgba(255,255,255,0.08)"}`,
                  borderRadius:8, padding:"8px 6px", cursor:"pointer",
                  color:selectedGames.includes(g.id)?g.color:"#555",
                  fontWeight:selectedGames.includes(g.id)?700:400, fontSize:12,
                }}>{g.emoji} {g.label.replace("カード","")}</button>
              ))}
            </div>
          </div>
          {/* 価格 */}
          <div style={{ marginBottom:12 }}>
            <div style={{ color:"#555", fontSize:11, marginBottom:6 }}>価格帯</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {PRICE_RANGES.map((r,i) => (
                <button key={i} onClick={()=>setPriceIdx(i)} style={{
                  background:priceIdx===i?"rgba(255,215,0,0.12)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${priceIdx===i?"rgba(255,215,0,0.4)":"rgba(255,255,255,0.07)"}`,
                  borderRadius:6, padding:"6px 10px", cursor:"pointer",
                  color:priceIdx===i?"#FFD700":"#666", fontSize:12,
                }}>{r.label}</button>
              ))}
            </div>
          </div>
          {/* ソート */}
          <div>
            <div style={{ color:"#555", fontSize:11, marginBottom:6 }}>並べ替え</div>
            <div style={{ display:"flex", gap:6 }}>
              {[{v:"new",l:"新着順"},{v:"price_asc",l:"安い順"},{v:"price_desc",l:"高い順"}].map(s => (
                <button key={s.v} onClick={()=>setSortBy(s.v)} style={{
                  flex:1, background:sortBy===s.v?"rgba(255,215,0,0.1)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${sortBy===s.v?"rgba(255,215,0,0.3)":"rgba(255,255,255,0.06)"}`,
                  borderRadius:6, padding:"6px 4px", cursor:"pointer",
                  color:sortBy===s.v?"#FFD700":"#555", fontSize:12,
                }}>{s.l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ color:"#555", fontSize:12, marginBottom:10 }}>
        <span style={{ color:"#FFD700", fontWeight:700 }}>{filtered.length}</span>件 · <span style={{ fontSize:11 }}>15秒ごとに更新</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 20px", color:"#444" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
          <div style={{ fontSize:14 }}>該当する情報がありません</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(l => <CardItem key={l.id} listing={l} isNew={newIds.has(l.id)} />)}
        </div>
      )}
    </div>
  );
}

function CardItem({ listing, isNew }) {
  const game = GAMES.find(g=>g.id===listing.game);
  return (
    <div style={{
      background:"rgba(20,20,35,0.9)", border:`1px solid ${isNew?"rgba(0,200,100,0.4)":"rgba(255,255,255,0.07)"}`,
      borderRadius:12, padding:"12px 14px", display:"flex", gap:12, alignItems:"flex-start",
      position:"relative", WebkitTapHighlightColor:"transparent",
    }}>
      {isNew && <span style={{ position:"absolute", top:8, right:8, background:"linear-gradient(135deg,#00C864,#00FF88)", color:"#000", fontSize:9, fontWeight:800, padding:"2px 5px", borderRadius:3 }}>NEW</span>}
      <div style={{ width:44, height:44, borderRadius:8, background:`linear-gradient(135deg,${game.color}22,${game.color}44)`, border:`1px solid ${game.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{listing.image}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ color:"#F0F0F0", fontWeight:700, fontSize:14 }}>{listing.title}</span>
          <RarityBadge rarity={listing.rarity} />
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ color:"#777", fontSize:11 }}>{listing.seller}</span>
          <span style={{ color:"#444", fontSize:10 }}>·</span>
          <span style={{ color:"#666", fontSize:11 }}>{listing.condition}</span>
          <span style={{ color:"#444", fontSize:10 }}>·</span>
          <span style={{ color:"#444", fontSize:10 }}>{timeAgo(listing.postedAt)}</span>
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ color:"#FFD700", fontWeight:800, fontSize:15 }}>¥{listing.price.toLocaleString()}</div>
        <div style={{ color:game.color, fontSize:10, fontWeight:600, marginTop:1, opacity:0.8 }}>{game.emoji}</div>
      </div>
    </div>
  );
}

/* ===================== 入荷レーダータブ ===================== */
function RadarTab({ signals, selectedGames, newSignalIds, onDismissSignal }) {
  const [filterType, setFilterType] = useState("all");
  const [shopType, setShopType]     = useState("all");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedPref, setSelectedPref]     = useState(null);
  const [selectedCity, setSelectedCity]     = useState(null);
  const [areaOpen, setAreaOpen]             = useState(false);

  const areaFiltered = signals.filter(s => {
    const loc = LOCATIONS.find(l=>l.id===s.locationId);
    if (!loc) return false;
    if (shopType !== "all" && loc.type !== shopType) return false;
    if (!selectedRegion) return true;
    const reg = REGIONS.find(r=>r.id===selectedRegion);
    if (!reg?.prefs.includes(loc.pref)) return false;
    if (selectedPref && loc.pref!==selectedPref) return false;
    if (selectedCity && loc.city!==selectedCity) return false;
    return true;
  });

  const filtered = areaFiltered
    .filter(s=>selectedGames.includes(s.game))
    .filter(s=>filterType==="all"||s.signalType===filterType)
    .sort((a,b)=>b.detectedAt-a.detectedAt);

  const counts = Object.fromEntries(
    Object.keys(SIGNAL_TYPES).map(k=>[k, areaFiltered.filter(s=>s.signalType===k&&selectedGames.includes(s.game)).length])
  );

  const prefList = selectedRegion
    ? REGIONS.find(r=>r.id===selectedRegion)?.prefs.filter(p=>LOCATIONS.some(l=>l.pref===p)) || []
    : [];
  const cityList = selectedPref ? [...new Set(LOCATIONS.filter(l=>l.pref===selectedPref).map(l=>l.city))] : [];

  const areaLabel = selectedCity ? `${selectedPref} ${selectedCity}`
    : selectedPref ? selectedPref
    : selectedRegion ? REGIONS.find(r=>r.id===selectedRegion)?.label
    : "エリア指定なし（全国）";

  const resetArea = () => { setSelectedRegion(null); setSelectedPref(null); setSelectedCity(null); };

  return (
    <div>
      {/* 店舗タイプフィルター */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
        <button onClick={()=>setShopType("all")} style={{ background:shopType==="all"?"rgba(255,215,0,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${shopType==="all"?"rgba(255,215,0,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:6, padding:"5px 10px", cursor:"pointer", color:shopType==="all"?"#FFD700":"#666", fontSize:11 }}>すべての店舗</button>
        {Object.entries(SHOP_TYPES).map(([key,st]) => (
          <button key={key} onClick={()=>setShopType(shopType===key?"all":key)} style={{ background:shopType===key?`${st.color}22`:"rgba(255,255,255,0.03)", border:`1px solid ${shopType===key?st.color+"55":"rgba(255,255,255,0.07)"}`, borderRadius:6, padding:"5px 10px", cursor:"pointer", color:shopType===key?st.color:"#666", fontSize:11 }}>{st.icon} {st.label}</button>
        ))}
      </div>

      {/* エリア検索トグル */}
      <div style={{ marginBottom:12 }}>
        <button onClick={()=>setAreaOpen(o=>!o)} style={{
          width:"100%", background:areaOpen||selectedRegion?"rgba(255,215,0,0.1)":"rgba(20,20,35,0.9)",
          border:`1px solid ${areaOpen||selectedRegion?"rgba(255,215,0,0.4)":"rgba(255,255,255,0.1)"}`,
          borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>🗾</span>
            <span style={{ color:selectedRegion?"#E0E0E0":"#666", fontSize:13, fontWeight:selectedRegion?600:400 }}>{areaLabel}</span>
            {selectedRegion && <span style={{ background:"rgba(255,215,0,0.15)", color:"#FFD700", fontSize:10, padding:"1px 6px", borderRadius:4, fontWeight:700 }}>絞込中</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {selectedRegion && (
              <span onClick={e=>{e.stopPropagation();resetArea();}} style={{ color:"#555", fontSize:11, padding:"2px 6px", borderRadius:4, background:"rgba(255,255,255,0.05)" }}>✕</span>
            )}
            <span style={{ color:"#555", fontSize:12 }}>{areaOpen?"▲":"▼"}</span>
          </div>
        </button>

        {areaOpen && (
          <div style={{ background:"rgba(10,10,20,0.98)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:12, padding:14, marginTop:6 }}>
            {/* 地方 */}
            <div style={{ color:"#555", fontSize:11, marginBottom:8 }}>① 地方</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
              {REGIONS.map(r => {
                const active = LOCATIONS.some(l=>r.prefs.includes(l.pref));
                return (
                  <button key={r.id} onClick={()=>{setSelectedRegion(r.id);setSelectedPref(null);setSelectedCity(null);}} disabled={!active}
                    style={{ background:selectedRegion===r.id?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${selectedRegion===r.id?"rgba(255,215,0,0.5)":"rgba(255,255,255,0.07)"}`, borderRadius:8, padding:"10px 8px", cursor:active?"pointer":"default", color:selectedRegion===r.id?"#FFD700":active?"#AAA":"#333", fontSize:12, fontWeight:selectedRegion===r.id?700:400, textAlign:"center" }}>
                    {r.label}
                  </button>
                );
              })}
            </div>
            {/* 都道府県 */}
            {selectedRegion && (
              <>
                <div style={{ color:"#555", fontSize:11, marginBottom:8 }}>② 都道府県</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                  {prefList.map(p => (
                    <button key={p} onClick={()=>{setSelectedPref(p);setSelectedCity(null);}}
                      style={{ background:selectedPref===p?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${selectedPref===p?"rgba(255,215,0,0.5)":"rgba(255,255,255,0.07)"}`, borderRadius:7, padding:"7px 12px", cursor:"pointer", color:selectedPref===p?"#FFD700":"#AAA", fontSize:13, fontWeight:selectedPref===p?700:400 }}>{p}</button>
                  ))}
                </div>
              </>
            )}
            {/* 区市町村 */}
            {selectedPref && cityList.length > 0 && (
              <>
                <div style={{ color:"#555", fontSize:11, marginBottom:8 }}>③ 区・市町村</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                  {cityList.map(c => (
                    <button key={c} onClick={()=>setSelectedCity(selectedCity===c?null:c)}
                      style={{ background:selectedCity===c?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${selectedCity===c?"rgba(255,215,0,0.5)":"rgba(255,255,255,0.07)"}`, borderRadius:7, padding:"7px 12px", cursor:"pointer", color:selectedCity===c?"#FFD700":"#AAA", fontSize:13, fontWeight:selectedCity===c?700:400 }}>{c}</button>
                  ))}
                </div>
              </>
            )}
            <button onClick={()=>setAreaOpen(false)} style={{ width:"100%", background:"linear-gradient(135deg,#FFD700,#FF8C00)", border:"none", borderRadius:8, padding:"10px", color:"#000", fontWeight:800, fontSize:13, cursor:"pointer" }}>
              {selectedRegion?"このエリアで絞り込む":"閉じる"}
            </button>
          </div>
        )}
      </div>

      {/* 地方別サマリー（未選択時） */}
      {!selectedRegion && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:14 }}>
          {REGIONS.map(r => {
            const cnt = signals.filter(s => { const loc=LOCATIONS.find(l=>l.id===s.locationId); return loc&&r.prefs.includes(loc.pref)&&selectedGames.includes(s.game); }).length;
            return (
              <div key={r.id} onClick={()=>{if(cnt>0){setSelectedRegion(r.id);setSelectedPref(null);setSelectedCity(null);}}}
                style={{ background:cnt>0?`rgba(255,215,0,${Math.min(0.03+cnt*0.04,0.18)})`:"rgba(255,255,255,0.02)", border:`1px solid ${cnt>0?"rgba(255,215,0,0.18)":"rgba(255,255,255,0.04)"}`, borderRadius:8, padding:"10px 8px", cursor:cnt>0?"pointer":"default", textAlign:"center" }}>
                <div style={{ color:cnt>0?"#FFD700":"#333", fontWeight:800, fontSize:20 }}>{cnt}</div>
                <div style={{ color:"#555", fontSize:9, marginTop:2, lineHeight:1.3 }}>{r.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* シグナルタイプ別サマリー */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginBottom:12 }}>
        {Object.entries(SIGNAL_TYPES).map(([key,st]) => (
          <div key={key} onClick={()=>setFilterType(filterType===key?"all":key)} style={{ background:counts[key]>0?st.bg:"rgba(15,15,25,0.8)", border:`1px solid ${filterType===key?st.color+"77":counts[key]>0?st.color+"33":"rgba(255,255,255,0.05)"}`, borderRadius:8, padding:"8px 4px", cursor:"pointer", opacity:counts[key]===0?0.3:1, textAlign:"center" }}>
            <div style={{ fontSize:14 }}>{st.icon}</div>
            <div style={{ color:st.color, fontWeight:800, fontSize:16 }}>{counts[key]}</div>
            <div style={{ color:"#555", fontSize:8, marginTop:1, lineHeight:1.2 }}>{st.label}</div>
          </div>
        ))}
      </div>

      <div style={{ color:"#555", fontSize:12, marginBottom:10 }}>
        <span style={{ color:"#FFD700", fontWeight:700 }}>{filtered.length}</span>件
        {selectedRegion && <span style={{ color:"#777" }}> — {areaLabel}</span>}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 20px", color:"#444" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📡</div>
          <div>{selectedRegion?"このエリアのシグナルはありません":"入荷シグナルを探知中..."}</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(s => <SignalCard key={s.id} signal={s} isNew={newSignalIds.has(s.id)} onDismiss={onDismissSignal} />)}
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, isNew, onDismiss }) {
  const [exp, setExp] = useState(false);
  const product  = PACK_PRODUCTS.find(p=>p.id===signal.productId);
  const location = LOCATIONS.find(l=>l.id===signal.locationId);
  const game     = GAMES.find(g=>g.id===signal.game);
  const stype    = SIGNAL_TYPES[signal.signalType];
  return (
    <div style={{ background:"rgba(15,15,28,0.92)", border:`1px solid ${isNew?stype.color+"66":"rgba(255,255,255,0.07)"}`, borderRadius:12, overflow:"hidden", position:"relative" }}>
      {isNew && <span style={{ position:"absolute", top:8, right:36, background:"linear-gradient(135deg,#00C864,#00FF88)", color:"#000", fontSize:9, fontWeight:800, padding:"2px 5px", borderRadius:3 }}>NEW</span>}
      <button onClick={()=>onDismiss(signal.id)} style={{ position:"absolute", top:8, right:8, background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:16 }}>×</button>

      <div onClick={()=>setExp(e=>!e)} style={{ padding:"12px 14px", cursor:"pointer" }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <div style={{ width:44, height:44, borderRadius:9, flexShrink:0, background:`linear-gradient(135deg,${game.color}22,${game.color}44)`, border:`1px solid ${game.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{product?.image||"📦"}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ background:stype.bg, border:`1px solid ${stype.color}44`, color:stype.color, fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4 }}>{stype.icon} {stype.label}</span>
              <span style={{ color:"#E0E0E0", fontWeight:700, fontSize:14 }}>{product?.name}</span>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              {location && <span style={{ background:`${SHOP_TYPES[location.type]?.color}22`, color:SHOP_TYPES[location.type]?.color, fontSize:10, padding:"1px 5px", borderRadius:3, fontWeight:700 }}>{SHOP_TYPES[location.type]?.icon} {SHOP_TYPES[location.type]?.label}</span>}
              <span style={{ color:"#666", fontSize:11 }}>📍 {location?.name}</span>
              {signal.stock!=null && <span style={{ background:"rgba(0,255,136,0.1)", color:"#00FF88", fontSize:11, padding:"1px 6px", borderRadius:4, fontWeight:700 }}>残{signal.stock}個</span>}
              <span style={{ color:"#333", fontSize:10, marginLeft:"auto" }}>{timeAgo(signal.detectedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {exp && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 14px", background:"rgba(0,0,0,0.2)" }}>
          <p style={{ color:"#AAA", fontSize:12, margin:"0 0 8px", lineHeight:1.55 }}>{signal.message}</p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:"#444", fontSize:11 }}>🔗 {signal.source}</span>
            <div style={{ flex:1 }} />
            <span style={{ color:"#444", fontSize:10 }}>信頼度</span>
            <ConfidenceMeter value={signal.confidence} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== マップタブ ===================== */
function MapTab({ listings }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const byLoc = {};
  listings.forEach(l=>{ byLoc[l.locationId]=(byLoc[l.locationId]||0)+1; });

  const filtered = LOCATIONS.filter(loc => typeFilter === "all" || loc.type === typeFilter);

  return (
    <div>
      {/* 店舗タイプフィルター */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
        <button onClick={()=>setTypeFilter("all")} style={{ background:typeFilter==="all"?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${typeFilter==="all"?"rgba(255,215,0,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:7, padding:"6px 10px", cursor:"pointer", color:typeFilter==="all"?"#FFD700":"#888", fontSize:12, fontWeight:typeFilter==="all"?700:400 }}>
          🗺 すべて ({LOCATIONS.length})
        </button>
        {Object.entries(SHOP_TYPES).map(([key, st]) => {
          const cnt = LOCATIONS.filter(l=>l.type===key).length;
          return (
            <button key={key} onClick={()=>setTypeFilter(typeFilter===key?"all":key)} style={{ background:typeFilter===key?`${st.color}22`:"rgba(255,255,255,0.04)", border:`1px solid ${typeFilter===key?st.color+"66":"rgba(255,255,255,0.08)"}`, borderRadius:7, padding:"6px 10px", cursor:"pointer", color:typeFilter===key?st.color:"#888", fontSize:12, fontWeight:typeFilter===key?700:400 }}>
              {st.icon} {st.label} ({cnt})
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map(loc => {
          const cnt = byLoc[loc.id]||0;
          const st = SHOP_TYPES[loc.type];
          return (
            <div key={loc.id} style={{ background:"rgba(20,20,35,0.9)", border:`1px solid ${cnt>0?"rgba(255,215,0,0.2)":"rgba(255,255,255,0.06)"}`, borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:cnt>0?"linear-gradient(135deg,#FFD700,#FF8C00)":`${st.color}22`, border:`2px solid ${cnt>0?"rgba(255,215,0,0.4)":st.color+"44"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:cnt>0?16:18, fontWeight:800, color:cnt>0?"#000":"#fff", boxShadow:cnt>0?"0 0 10px rgba(255,215,0,0.3)":"none" }}>{cnt>0?cnt:st.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ background:`${st.color}22`, color:st.color, fontSize:9, padding:"1px 5px", borderRadius:3, fontWeight:700 }}>{st.label}</span>
                </div>
                <div style={{ color:"#E0E0E0", fontWeight:700, fontSize:13 }}>{loc.name}</div>
                <div style={{ color:"#555", fontSize:11, marginTop:1 }}>{loc.address}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== ウォッチタブ ===================== */
function WatchTab({ watchlist, setWatchlist, alerts, setAlerts }) {
  const [input, setInput] = useState("");
  const add = () => {
    if (input.trim() && !watchlist.includes(input.trim())) {
      setWatchlist(p=>[...p, input.trim()]);
      setInput("");
    }
  };
  return (
    <div>
      <div style={{ background:"rgba(20,20,35,0.9)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:12, padding:16, marginBottom:14 }}>
        <div style={{ color:"#FFD700", fontWeight:700, fontSize:14, marginBottom:8 }}>🔔 ウォッチキーワード</div>
        <p style={{ color:"#666", fontSize:12, margin:"0 0 12px", lineHeight:1.6 }}>一致する新着情報が出たとき即座にアラートを表示します。</p>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="例：リザードン、ルフィ、SAR..." style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:8, color:"#E0E0E0", padding:"10px 12px", fontSize:14, outline:"none", WebkitAppearance:"none" }} />
          <button onClick={add} style={{ background:"linear-gradient(135deg,#FFD700,#FF8C00)", border:"none", borderRadius:8, padding:"10px 16px", color:"#000", fontWeight:800, fontSize:14, cursor:"pointer", flexShrink:0 }}>追加</button>
        </div>
      </div>
      {watchlist.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#444" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🔔</div>
          <div style={{ fontSize:13 }}>ウォッチキーワードを登録すると<br />新着情報をすぐにお知らせします</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {watchlist.map((w,i) => (
            <div key={i} style={{ background:"rgba(20,20,35,0.9)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#00FF88", boxShadow:"0 0 6px #00FF88", flexShrink:0 }} />
              <span style={{ color:"#E0E0E0", fontWeight:600, flex:1, fontSize:14 }}>{w}</span>
              <button onClick={()=>setWatchlist(p=>p.filter((_,j)=>j!==i))} style={{ background:"rgba(255,50,50,0.1)", border:"1px solid rgba(255,50,50,0.2)", borderRadius:6, padding:"4px 10px", color:"#FF6666", fontSize:12, cursor:"pointer" }}>削除</button>
            </div>
          ))}
        </div>
      )}
      {alerts.length>0 && (
        <>
          <div style={{ color:"#444", fontSize:11, letterSpacing:"0.1em", marginBottom:8 }}>最近のアラート</div>
          <AlertBanner alerts={alerts} onDismiss={i=>setAlerts(p=>p.filter((_,j)=>j!==i))} />
        </>
      )}
    </div>
  );
}

/* ===================== メインアプリ ===================== */
export default function App() {
  const [activeTab, setActiveTab]       = useState("search");
  const [listings, setListings]         = useState(MOCK_LISTINGS);
  const [newIds, setNewIds]             = useState(new Set());
  const [stockSignals, setStockSignals] = useState(MOCK_SIGNALS);
  const [newSignalIds, setNewSignalIds] = useState(new Set());
  const [alerts, setAlerts]             = useState([]);
  const [watchlist, setWatchlist]       = useState([]);
  const [selectedGames, setSelectedGames] = useState(["pokemon","onepiece"]);
  const alertRef = useRef(0);

  const toggleGame = id =>
    setSelectedGames(p => p.includes(id) ? (p.length>1?p.filter(g=>g!==id):p) : [...p,id]);

  // 新着カード自動生成
  const addListing = useCallback(() => {
    const items = [
      {title:"エースバーン ex SAR",image:"🐰",rarity:"SAR",game:"pokemon"},
      {title:"ナミ SP",image:"🌊",rarity:"SP",game:"onepiece"},
      {title:"ゲンガー ex UR",image:"👻",rarity:"UR",game:"pokemon"},
      {title:"チョッパー L",image:"🦌",rarity:"L",game:"onepiece"},
    ];
    const it = items[Math.floor(Math.random()*items.length)];
    const locId = Math.floor(Math.random()*LOCATIONS.length)+1;
    const entry = { id:Date.now(), game:it.game, title:it.title, seller:LOCATIONS[locId-1].name, price:Math.floor(Math.random()*20000+500), condition:["新品","美品","良品"][Math.floor(Math.random()*3)], locationId:locId, postedAt:new Date(), image:it.image, rarity:it.rarity };
    setListings(p=>[entry,...p.slice(0,19)]);
    setNewIds(p=>new Set([...p,entry.id]));
    setTimeout(()=>setNewIds(p=>{const s=new Set(p);s.delete(entry.id);return s;}),30000);
    if (watchlist.some(w=>it.title.includes(w)||w.includes(it.game==="pokemon"?"ポケモン":"ワンピース"))) {
      setAlerts(p=>[`🔔 「${it.title}」が${LOCATIONS[locId-1].name}で ¥${entry.price.toLocaleString()} で入荷！`,...p.slice(0,4)]);
    }
  },[watchlist]);

  // 新着シグナル自動生成
  const addSignal = useCallback(() => {
    if (Math.random()>0.45) return;
    const pool = [
      {game:"pokemon",productId:"sv11",message:"ステラミラクルBOX 問い合わせ殺到、入荷の可能性あり",signalType:"medium",confidence:55},
      {game:"onepiece",productId:"op10",message:"燃え上がれ！！ 明日追加入荷確定との店舗情報",signalType:"confirmed",confidence:98,stock:4},
      {game:"pokemon",productId:"sv9a",message:"シャイニートレジャー 近隣店舗で入荷目撃情報",signalType:"rumor",confidence:30},
      {game:"onepiece",productId:"op08",message:"二つの伝説BOX 再入荷リスト掲載確認",signalType:"restock",confidence:90,stock:3},
    ];
    const src = pool[Math.floor(Math.random()*pool.length)];
    const locId = Math.floor(Math.random()*LOCATIONS.length)+1;
    const product = PACK_PRODUCTS.find(p=>p.id===src.productId);
    const sig = {id:Date.now(),locationId:locId,source:"自動探知",sourceUrl:"#",detectedAt:new Date(),...src};
    setStockSignals(p=>[sig,...p.slice(0,19)]);
    setNewSignalIds(p=>new Set([...p,sig.id]));
    setTimeout(()=>setNewSignalIds(p=>{const s=new Set(p);s.delete(sig.id);return s;}),30000);
    if (sig.signalType==="confirmed"||sig.signalType==="restock") {
      setAlerts(p=>[`📦 【入荷${sig.signalType==="restock"?"再":""}確定】${product?.name} が${LOCATIONS[locId-1].name}で入荷予定！`,...p.slice(0,4)]);
    }
  },[]);

  useEffect(()=>{
    const t1=setInterval(addListing,15000);
    const t2=setInterval(addSignal,20000);
    return ()=>{clearInterval(t1);clearInterval(t2);};
  },[addListing,addSignal]);

  const TABS = [
    { id:"search", icon:"🔍", label:"検索" },
    { id:"radar",  icon:"📡", label:"入荷" },
    { id:"map",    icon:"📍", label:"マップ" },
    { id:"watch",  icon:"🔔", label:`ウォッチ${watchlist.length>0?` ${watchlist.length}`:""}` },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0A0A1A 0%,#0F0F25 50%,#0A0A18 100%)", fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif", color:"#E0E0E0", paddingBottom:72 }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input,button{font-family:inherit;}
        ::-webkit-scrollbar{display:none;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ヘッダー */}
      <div style={{ background:"rgba(5,5,15,0.95)", borderBottom:"1px solid rgba(255,215,0,0.15)", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:600, margin:"0 auto", padding:"0 14px", display:"flex", alignItems:"center", justifyContent:"space-between", height:52 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:7, background:"linear-gradient(135deg,#FFD700,#FF8C00)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🃏</div>
            <div>
              <div style={{ color:"#FFD700", fontWeight:800, fontSize:16, lineHeight:1 }}>CardRadar</div>
              <div style={{ color:"#444", fontSize:9, letterSpacing:"0.08em" }}>トレカ販売情報トラッカー</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {alerts.length>0 && (
              <button onClick={()=>setActiveTab("watch")} style={{ background:"linear-gradient(135deg,#00C864,#00FF88)", color:"#000", fontWeight:800, fontSize:11, padding:"3px 8px", borderRadius:10, border:"none", cursor:"pointer", animation:"pulse 2s infinite" }}>🔔 {alerts.length}</button>
            )}
            <div style={{ background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)", borderRadius:6, padding:"3px 8px", color:"#00FF88", fontSize:11, fontWeight:700 }}>● LIVE</div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth:600, margin:"0 auto", padding:"14px 14px 0" }}>
        <AlertBanner alerts={alerts} onDismiss={i=>setAlerts(p=>p.filter((_,j)=>j!==i))} />

        {activeTab==="search" && <SearchTab listings={listings} newIds={newIds} selectedGames={selectedGames} toggleGame={toggleGame} />}
        {activeTab==="radar"  && <RadarTab signals={stockSignals} selectedGames={selectedGames} newSignalIds={newSignalIds} onDismissSignal={id=>setStockSignals(p=>p.filter(s=>s.id!==id))} />}
        {activeTab==="map"    && <MapTab listings={listings} />}
        {activeTab==="watch"  && <WatchTab watchlist={watchlist} setWatchlist={setWatchlist} alerts={alerts} setAlerts={setAlerts} />}
      </div>

      {/* ボトムナビ */}
      <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(5,5,15,0.97)", borderTop:"1px solid rgba(255,215,0,0.12)", backdropFilter:"blur(16px)", zIndex:200, paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
        <div style={{ maxWidth:600, margin:"0 auto", display:"flex" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              flex:1, background:"none", border:"none", cursor:"pointer",
              padding:"10px 4px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              borderTop:`2px solid ${activeTab===tab.id?"#FFD700":"transparent"}`,
              transition:"all 0.15s",
            }}>
              <span style={{ fontSize:20, lineHeight:1 }}>{tab.icon}</span>
              <span style={{ fontSize:10, color:activeTab===tab.id?"#FFD700":"#555", fontWeight:activeTab===tab.id?700:400, letterSpacing:"0.02em" }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
