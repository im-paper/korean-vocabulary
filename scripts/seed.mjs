// 어휘 씨앗 목록 — 어떤 단어를 넣을지만 정합니다.
//
// 뜻(meaning) · 사전 예문(dictExample) · 출처(sourceUrl)는 여기 적지 않습니다.
// scripts/fill-words.mjs 가 국립국어원 표준국어대사전에 실제로 조회해서 채웁니다.
// 기억에 의존해 뜻을 적으면 원문과 미묘하게 달라지고, 그 순간 사전을 표방하면서
// 사전이 아닌 것이 됩니다. (PROMPT.md 6.1)
//
// 여기서 우리가 정하는 것
//   word     표제어. 사전에 이 형태로 실려 있어야 합니다.
//   hanja    한자. 없으면 null
//   level    난이도 1~3 (PROMPT.md 6.4)
//   example  학습용 예문. 우리가 새로 씁니다. {{...}}가 퀴즈 빈칸입니다.
//            번역본 문장을 옮기지 않고 책의 상황과 분위기만 반영합니다. (6.2)
//            비워 두면 그 자리는 사용자가 쓴 문장이 채웁니다.

export const SEED = [
  {
    slug: "ningen",
    book: "인간실격",
    author: "다자이 오사무",
    sections: [
      {
        name: "서문",
        words: [
          { word: "위선", hanja: "僞善", level: 1, example: "웃는 얼굴 뒤에 감춘 {{위선}}이 들킬까 봐 그는 더 크게 웃었다." },
          { word: "경멸", hanja: "輕蔑", level: 1, example: "그 눈빛에는 미움보다 {{경멸}}이 짙었다." },
          { word: "익살", hanja: null, level: 2, example: "그는 {{익살}}로 사람들을 웃겼지만 속으로는 늘 겁에 질려 있었다." },
          { word: "비굴", hanja: "卑屈", level: 2, example: "미움받지 않으려는 마음이 {{비굴}}로 굳어 갔다." },
          { word: "처세", hanja: "處世", level: 2 },
          { word: "환멸", hanja: "幻滅", level: 2, example: "익살도 위선도 소용없다는 걸 알았을 때 남은 건 {{환멸}}뿐이었다." },
          { word: "냉소", hanja: "冷笑", level: 2 },
          { word: "자조", hanja: "自嘲", level: 3, example: "돌아서고 나서야 {{자조}}가 천천히 올라왔다." },
          { word: "허영", hanja: "虛榮", level: 2 },
        ],
      },
      {
        name: "첫 번째 수기",
        words: [
          { word: "고독", hanja: "孤獨", level: 1, example: "사람들 한가운데에서 그는 가장 깊은 {{고독}}을 느꼈다." },
          { word: "절망", hanja: "絶望", level: 1 },
          { word: "기만", hanja: "欺瞞", level: 3, example: "그가 평생 배운 기술은 남을 웃기는 {{기만}}뿐이었다." },
          { word: "굴종", hanja: "屈從", level: 3 },
          { word: "방종", hanja: "放縱", level: 3 },
          { word: "위악", hanja: "僞惡", level: 3, example: "착해 보이기가 두려워 일부러 {{위악}}을 부렸다." },
          { word: "염세", hanja: "厭世", level: 3 },
          { word: "전락", hanja: "轉落", level: 3, example: "한 계절 만에 그는 스스로도 놀랄 만큼 {{전락}}해 있었다." },
          { word: "허무", hanja: "虛無", level: 2 },
          { word: "체념", hanja: "諦念", level: 2 },
        ],
      },
      {
        name: "두 번째 수기",
        words: [
          { word: "방탕", hanja: "放蕩", level: 2, example: "술과 밤으로 채운 {{방탕}}은 아무것도 덮어 주지 못했다." },
          { word: "나태", hanja: "懶怠", level: 2 },
          { word: "회의", hanja: "懷疑", level: 2, example: "믿어 보려 할수록 {{회의}}가 먼저 자랐다." },
          { word: "오만", hanja: "傲慢", level: 2 },
          { word: "비참", hanja: "悲慘", level: 1 },
          { word: "유약", hanja: "柔弱", level: 3 },
          { word: "참회", hanja: "懺悔", level: 3, example: "{{참회}}라 부르기엔 그의 뉘우침이 너무 얕았다." },
          { word: "타락", hanja: "墮落", level: 2 },
          { word: "번민", hanja: "煩悶", level: 3 },
          { word: "자멸", hanja: "自滅", level: 3 },
        ],
      },
      {
        name: "세 번째 수기",
        words: [
          { word: "파멸", hanja: "破滅", level: 2, example: "그는 {{파멸}}이 다가오는 것을 보면서도 발을 떼지 않았다." },
          { word: "광기", hanja: "狂氣", level: 2 },
          { word: "무기력", hanja: "無氣力", level: 1 },
          { word: "자학", hanja: "自虐", level: 3, example: "스스로를 벌하는 {{자학}}이 그의 유일한 성실이었다." },
          { word: "도피", hanja: "逃避", level: 2 },
          { word: "결핍", hanja: "缺乏", level: 2 },
          { word: "참담", hanja: "慘澹", level: 3 },
          { word: "몰락", hanja: "沒落", level: 2 },
          { word: "고립", hanja: "孤立", level: 1 },
          { word: "연민", hanja: "憐憫", level: 2, example: "미움이 다 닳고 나서야 희미한 {{연민}}이 남았다." },
        ],
      },
      {
        name: "후기",
        words: [
          { word: "회한", hanja: "悔恨", level: 3, example: "다 지나간 뒤에 오는 {{회한}}은 언제나 늦다." },
          { word: "애수", hanja: "哀愁", level: 3 },
          { word: "적막", hanja: "寂寞", level: 2 },
          { word: "허탈", hanja: "虛脫", level: 2 },
          { word: "관조", hanja: "觀照", level: 3, example: "이제 그는 자기 삶을 남의 일처럼 {{관조}}했다." },
          { word: "초연", hanja: "超然", level: 3 },
          { word: "무상", hanja: "無常", level: 3 },
        ],
      },
    ],
  },

  // 이달의 책 — 읽어볼 만한 책을 권합니다. '이달의 어휘 30선'이 아닙니다.
  // 남이 고른 단어 리스트를 주는 것과, 읽을 책을 권하는 것은 다릅니다. (PROMPT.md 11)
  {
    slug: "demian",
    book: "데미안",
    author: "헤르만 헤세",
    featured: true,
    featuredNote: "자기 안의 목소리를 따라가는 이야기. 관념을 가리키는 말이 많이 나옵니다.",
    sections: [
      {
        name: "두 세계",
        words: [
          { word: "이중성", hanja: "二重性", level: 2, example: "밝은 집과 어두운 골목, 그 {{이중성}} 사이에서 아이는 자랐다." },
          { word: "죄의식", hanja: "罪意識", level: 2 },
          { word: "순수", hanja: "純粹", level: 1 },
          { word: "불안", hanja: "不安", level: 1 },
          { word: "동경", hanja: "憧憬", level: 2, example: "그가 가진 것을 갖고 싶다는 {{동경}}이 오래 남았다." },
          { word: "경계", hanja: "境界", level: 2 },
          { word: "은밀", hanja: "隱密", level: 2 },
          { word: "협박", hanja: "脅迫", level: 1 },
        ],
      },
      {
        name: "카인",
        words: [
          { word: "각성", hanja: "覺醒", level: 2, example: "남들이 옳다고 한 말을 처음 의심한 날이 그의 {{각성}}이었다." },
          { word: "성찰", hanja: "省察", level: 2 },
          { word: "내면", hanja: "內面", level: 1 },
          { word: "고뇌", hanja: "苦惱", level: 2 },
          { word: "방황", hanja: "彷徨", level: 1 },
          { word: "예감", hanja: "豫感", level: 1 },
          { word: "통찰", hanja: "洞察", level: 3, example: "설명 대신 짧은 한마디가 더 깊은 {{통찰}}을 남겼다." },
          { word: "표식", hanja: "標式", level: 3 },
        ],
      },
      {
        name: "새는 알에서 나오려고 싸운다",
        words: [
          { word: "초월", hanja: "超越", level: 3, example: "낡은 세계를 부수는 일이 곧 {{초월}}의 시작이었다." },
          { word: "결단", hanja: "決斷", level: 2 },
          { word: "신념", hanja: "信念", level: 2 },
          { word: "저항", hanja: "抵抗", level: 1 },
          { word: "파괴", hanja: "破壞", level: 1 },
          { word: "탄생", hanja: "誕生", level: 1 },
          { word: "숙명", hanja: "宿命", level: 3, example: "피하려 애쓸수록 그것은 더 {{숙명}}처럼 다가왔다." },
          { word: "고양", hanja: "高揚", level: 3 },
        ],
      },
      {
        name: "야곱의 싸움",
        words: [
          { word: "시련", hanja: "試鍊", level: 1 },
          { word: "인내", hanja: "忍耐", level: 1 },
          { word: "극복", hanja: "克服", level: 1 },
          { word: "승화", hanja: "昇華", level: 3, example: "견딘 시간이 미움 대신 다른 것으로 {{승화}}되었다." },
          { word: "계시", hanja: "啓示", level: 3 },
          { word: "화해", hanja: "和解", level: 1 },
          { word: "성숙", hanja: "成熟", level: 1 },
          { word: "합일", hanja: "合一", level: 3 },
        ],
      },
    ],
  },
  {
    slug: "etranger",
    book: "이방인",
    author: "알베르 카뮈",
    featured: true,
    featuredNote:
      "무심함이라는 태도를 끝까지 밀고 간 소설. 감정을 가리키는 말이 촘촘합니다.",
    sections: [
      {
        name: "오늘 엄마가 죽었다",
        words: [
          { word: "무심", hanja: "無心", level: 2, example: "슬퍼야 할 자리에서 그는 이상하리만치 {{무심}}했다." },
          { word: "권태", hanja: "倦怠", level: 2 },
          { word: "담담", hanja: "淡淡", level: 2 },
          { word: "초조", hanja: "焦燥", level: 1 },
          { word: "공허", hanja: "空虛", level: 2, example: "울고 나서도 채워지지 않는 {{공허}}가 남았다." },
          { word: "무관심", hanja: "無關心", level: 1 },
          { word: "냉담", hanja: "冷淡", level: 2 },
          { word: "부조리", hanja: "不條理", level: 3, example: "설명이 되지 않는 일들이 {{부조리}}라는 이름으로 쌓였다." },
        ],
      },
      {
        name: "재판",
        words: [
          { word: "심문", hanja: "審問", level: 2 },
          { word: "변론", hanja: "辯論", level: 2 },
          { word: "편견", hanja: "偏見", level: 1, example: "그를 심판한 것은 사실이 아니라 {{편견}}이었다." },
          { word: "단죄", hanja: "斷罪", level: 3 },
          { word: "항변", hanja: "抗辯", level: 3 },
          { word: "위증", hanja: "僞證", level: 3 },
          { word: "규탄", hanja: "糾彈", level: 2 },
          { word: "방청", hanja: "傍聽", level: 2 },
        ],
      },
      {
        name: "마지막 밤",
        words: [
          { word: "각오", hanja: "覺悟", level: 1 },
          { word: "해방", hanja: "解放", level: 1 },
          { word: "직시", hanja: "直視", level: 2, example: "끝을 알고 나서야 비로소 삶을 {{직시}}하게 되었다." },
          { word: "응시", hanja: "凝視", level: 2 },
          { word: "확신", hanja: "確信", level: 1 },
          { word: "평온", hanja: "平穩", level: 1 },
          { word: "저주", hanja: "詛呪", level: 2 },
          { word: "고백", hanja: "告白", level: 1 },
        ],
      },
    ],
  },

  {
    slug: "sonagi",
    book: "소나기",
    author: "황순원",
    featured: true,
    featuredNote: "짧고 맑은 이야기. 한자어가 아니라 순우리말 감각어가 많이 나옵니다.",
    sections: [
      {
        name: "개울가에서",
        words: [
          { word: "서먹하다", hanja: null, level: 2, example: "며칠 만에 다시 만나자 공기가 {{서먹했다}}." },
          { word: "수줍다", hanja: null, level: 1 },
          { word: "망설이다", hanja: null, level: 1 },
          { word: "설레다", hanja: null, level: 1 },
          { word: "물끄러미", hanja: null, level: 2, example: "그 애는 한참을 {{물끄러미}} 물속을 들여다보았다." },
          { word: "재잘거리다", hanja: null, level: 2 },
          { word: "어림잡다", hanja: null, level: 2 },
          { word: "아리땁다", hanja: null, level: 3 },
        ],
      },
      {
        name: "소나기",
        words: [
          { word: "흠뻑", hanja: null, level: 1 },
          { word: "자욱하다", hanja: null, level: 2, example: "비 갠 들판에 안개가 {{자욱했다}}." },
          { word: "오슬오슬", hanja: null, level: 2 },
          { word: "애처롭다", hanja: null, level: 2 },
          { word: "소복하다", hanja: null, level: 3 },
          { word: "아릿하다", hanja: null, level: 3, example: "이름을 떠올릴 때마다 가슴이 {{아릿했다}}." },
          { word: "그윽하다", hanja: null, level: 2 },
          { word: "고즈넉하다", hanja: null, level: 3 },
        ],
      },
    ],
  },
];

// 책을 안 읽는 날을 위한 샘플. 늘리지 않습니다. (PROMPT.md 11)
export const DAILY_SEED = [
  { word: "무료", hanja: "無聊", level: 2 },
  { word: "사무치다", hanja: null, level: 2 },
  { word: "아득하다", hanja: null, level: 1 },
  { word: "부질없다", hanja: null, level: 2 },
  { word: "머쓱하다", hanja: null, level: 2 },
  { word: "겸연쩍다", hanja: null, level: 3 },
  { word: "성기다", hanja: null, level: 3 },
  { word: "아련하다", hanja: null, level: 2 },
];
