// 단어 콘텐츠 — 앱의 자산이므로 프로젝트 파일에 둡니다. (PROMPT.md 8.1)
//
// ⚠ 이 파일은 손으로 고치지 마세요. scripts/fill-words.mjs 가 만들어 냅니다.
//    단어를 더하거나 빼려면 scripts/seed.mjs 를 고친 뒤 다시 실행하세요.
//      node --env-file=.env.local scripts/fill-words.mjs
//
// 뜻(meaning)과 출처(sourceUrl)는 국립국어원 표준국어대사전에서 그대로 받아온
// 값입니다. 사람이 고쳐 쓰지 않습니다. (PROMPT.md 6.1)
// 학습용 예문(example)은 우리가 새로 씁니다. 비어 있으면 그 자리는 사용자가 쓴
// 문장이 채웁니다. (6.2 · 5.3)
//
// 만든 시각 기준 단어 118개 + 샘플 8개

export const BOOKS = [
  {
    "slug": "ningen",
    "book": "인간실격",
    "author": "다자이 오사무",
    "featured": false,
    "featuredNote": null,
    "sections": [
      {
        "name": "서문",
        "words": [
          {
            "id": "ningen-1-위선",
            "word": "위선",
            "hanja": "僞善",
            "meaning": "겉으로만 착한 체함. 또는 그런 짓이나 일.",
            "example": "웃는 얼굴 뒤에 감춘 {{위선}}이 들킬까 봐 그는 더 크게 웃었다.",
            "dictExample": "양반들의 위선을 풍자한 소설.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=466180"
          },
          {
            "id": "ningen-1-경멸",
            "word": "경멸",
            "hanja": "輕蔑",
            "meaning": "깔보아 업신여김.",
            "example": "그 눈빛에는 미움보다 {{경멸}}이 짙었다.",
            "dictExample": "경멸이 가득한 표정.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=392903"
          },
          {
            "id": "ningen-1-익살",
            "word": "익살",
            "hanja": null,
            "meaning": "남을 웃기려고 일부러 하는 말이나 몸짓.",
            "example": "그는 {{익살}}로 사람들을 웃겼지만 속으로는 늘 겁에 질려 있었다.",
            "dictExample": "익살 섞인 웃음.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=472661"
          },
          {
            "id": "ningen-1-비굴",
            "word": "비굴",
            "hanja": "卑屈",
            "meaning": "용기나 줏대가 없이 남에게 굽히기 쉬움.",
            "example": "미움받지 않으려는 마음이 {{비굴}}로 굳어 갔다.",
            "dictExample": "그의 태도는 거의 비굴에 가까운 겸손이었다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=436892"
          },
          {
            "id": "ningen-1-처세",
            "word": "처세",
            "hanja": "處世",
            "meaning": "사람들과 사귀며 살아감. 또는 그런 일.",
            "example": "",
            "dictExample": "처세에 능하다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=487786"
          },
          {
            "id": "ningen-1-환멸",
            "word": "환멸",
            "hanja": "幻滅",
            "meaning": "꿈이나 기대나 환상이 깨어짐. 또는 그때 느끼는 괴롭고도 속절없는 마음.",
            "example": "익살도 위선도 소용없다는 걸 알았을 때 남은 건 {{환멸}}뿐이었다.",
            "dictExample": "그는 기업 경영에 환멸을 느껴 결국 입산하고 말았다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=375132"
          },
          {
            "id": "ningen-1-냉소",
            "word": "냉소",
            "hanja": "冷笑",
            "meaning": "쌀쌀한 태도로 비웃음. 또는 그런 웃음.",
            "example": "",
            "dictExample": "냉소를 머금다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=64423"
          },
          {
            "id": "ningen-1-자조",
            "word": "자조",
            "hanja": "自嘲",
            "meaning": "자기를 비웃음.",
            "example": "돌아서고 나서야 {{자조}}가 천천히 올라왔다.",
            "dictExample": "자조 섞인 미소.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=276893"
          },
          {
            "id": "ningen-1-허영",
            "word": "허영",
            "hanja": "虛榮",
            "meaning": "자기 분수에 넘치고 실속이 없이 겉모습뿐인 영화(榮華). 또는 필요 이상의 겉치레.",
            "example": "",
            "dictExample": "허영에 들뜬 마음.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=370688"
          }
        ]
      },
      {
        "name": "첫 번째 수기",
        "words": [
          {
            "id": "ningen-2-고독",
            "word": "고독",
            "hanja": "孤獨",
            "meaning": "세상에 홀로 떨어져 있는 듯이 매우 외롭고 쓸쓸함.",
            "example": "사람들 한가운데에서 그는 가장 깊은 {{고독}}을 느꼈다.",
            "dictExample": "고독을 느끼다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=23543"
          },
          {
            "id": "ningen-2-절망",
            "word": "절망",
            "hanja": "絶望",
            "meaning": "바라볼 것이 없게 되어 모든 희망을 끊어 버림. 또는 그런 상태.",
            "example": "",
            "dictExample": "절망에 빠지다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=478120"
          },
          {
            "id": "ningen-2-기만",
            "word": "기만",
            "hanja": "欺瞞",
            "meaning": "남을 속여 넘김.",
            "example": "그가 평생 배운 기술은 남을 웃기는 {{기만}}뿐이었다.",
            "dictExample": "기만 술책.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=50596"
          },
          {
            "id": "ningen-2-굴종",
            "word": "굴종",
            "hanja": "屈從",
            "meaning": "제 뜻을 굽혀 남에게 복종함.",
            "example": "",
            "dictExample": "억압과 굴종으로 얼룩진 역사.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=39864"
          },
          {
            "id": "ningen-2-방종",
            "word": "방종",
            "hanja": "放縱",
            "meaning": "제멋대로 행동하여 거리낌이 없음.",
            "example": "",
            "dictExample": "책임과 의무가 따르지 않는 자유는 자칫 방종에 빠지기 쉽다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=429701"
          },
          {
            "id": "ningen-2-위악",
            "word": "위악",
            "hanja": "僞惡",
            "meaning": "짐짓 악한 체함.",
            "example": "착해 보이기가 두려워 일부러 {{위악}}을 부렸다.",
            "dictExample": "위악을 부리다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=468871"
          },
          {
            "id": "ningen-2-염세",
            "word": "염세",
            "hanja": "厭世",
            "meaning": "세상을 괴롭고 귀찮은 것으로 여겨 비관함.",
            "example": "",
            "dictExample": "탈세 사건으로 집안이 뒤숭숭한 며칠 동안 면회를 거를 수밖에 없었고 그동안 그가 지독한 염세에 빠지거나 몸이 불편해 사람이 만나기 싫을 가능성도 얼마든지 있었다. ≪박완서, 도시의 흉년≫",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=462850"
          },
          {
            "id": "ningen-2-전락",
            "word": "전락",
            "hanja": "轉落",
            "meaning": "아래로 굴러떨어짐.",
            "example": "한 계절 만에 그는 스스로도 놀랄 만큼 {{전락}}해 있었다.",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=482007"
          },
          {
            "id": "ningen-2-허무",
            "word": "허무",
            "hanja": "虛無",
            "meaning": "아무것도 없이 텅 빔.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=505778"
          },
          {
            "id": "ningen-2-체념",
            "word": "체념",
            "hanja": "諦念",
            "meaning": "희망을 버리고 아주 단념함.",
            "example": "",
            "dictExample": "체념 상태.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=330522"
          }
        ]
      },
      {
        "name": "두 번째 수기",
        "words": [
          {
            "id": "ningen-3-방탕",
            "word": "방탕",
            "hanja": "放蕩",
            "meaning": "주색잡기에 빠져 행실이 좋지 못함.",
            "example": "술과 밤으로 채운 {{방탕}}은 아무것도 덮어 주지 못했다.",
            "dictExample": "방탕에 빠지다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=137201"
          },
          {
            "id": "ningen-3-나태",
            "word": "나태",
            "hanja": "懶怠",
            "meaning": "행동, 성격 따위가 느리고 게으름.",
            "example": "",
            "dictExample": "나태에 빠지다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=60713"
          },
          {
            "id": "ningen-3-회의",
            "word": "회의",
            "hanja": "懷疑",
            "meaning": "의심을 품음. 또는 마음속에 품고 있는 의심.",
            "example": "믿어 보려 할수록 {{회의}}가 먼저 자랐다.",
            "dictExample": "회의가 생기다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=378561"
          },
          {
            "id": "ningen-3-오만",
            "word": "오만",
            "hanja": "傲慢",
            "meaning": "태도나 행동이 건방지거나 거만함. 또는 그 태도나 행동.",
            "example": "",
            "dictExample": "일부러 초라한 옷을 입고 나타난 그는 심한 편견과 오만에 악의까지 갖고, 진실은 덮어 버린 채 우리를 죄인으로 몰아붙였다. ≪조세희, 내 그물로 오는 가시고기≫",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=246052"
          },
          {
            "id": "ningen-3-비참",
            "word": "비참",
            "hanja": "悲慘",
            "meaning": "더할 수 없이 슬프고 끔찍함.",
            "example": "",
            "dictExample": "전후의 비참을 겪다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=437474"
          },
          {
            "id": "ningen-3-유약",
            "word": "유약",
            "hanja": "柔弱",
            "meaning": "‘유약하다’의 어근.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=259077"
          },
          {
            "id": "ningen-3-참회",
            "word": "참회",
            "hanja": "懺悔",
            "meaning": "자기의 잘못에 대하여 깨닫고 깊이 뉘우침.",
            "example": "{{참회}}라 부르기엔 그의 뉘우침이 너무 얕았다.",
            "dictExample": "참회의 눈물.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=487300"
          },
          {
            "id": "ningen-3-타락",
            "word": "타락",
            "hanja": "墮落",
            "meaning": "올바른 길에서 벗어나 잘못된 길로 빠지는 일.",
            "example": "",
            "dictExample": "타락의 길.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=497431"
          },
          {
            "id": "ningen-3-번민",
            "word": "번민",
            "hanja": "煩悶",
            "meaning": "마음이 번거롭고 답답하여 괴로워함.",
            "example": "",
            "dictExample": "진로에 대한 번민.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=433499"
          },
          {
            "id": "ningen-3-자멸",
            "word": "자멸",
            "hanja": "自滅",
            "meaning": "스스로 자신을 망치거나 멸망함.",
            "example": "",
            "dictExample": "군비 경쟁은 인류의 자멸을 가져올 뿐이다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=474647"
          }
        ]
      },
      {
        "name": "세 번째 수기",
        "words": [
          {
            "id": "ningen-4-파멸",
            "word": "파멸",
            "hanja": "破滅",
            "meaning": "파괴되어 없어짐.",
            "example": "그는 {{파멸}}이 다가오는 것을 보면서도 발을 떼지 않았다.",
            "dictExample": "전쟁은 적군과 아군 모두를 파멸로 몰아갔다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=497694"
          },
          {
            "id": "ningen-4-광기",
            "word": "광기",
            "hanja": "狂氣",
            "meaning": "미친 듯한 기미.",
            "example": "",
            "dictExample": "광기가 서리다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=33407"
          },
          {
            "id": "ningen-4-무기력",
            "word": "무기력",
            "hanja": "無氣力",
            "meaning": "어떠한 일을 감당할 수 있는 기운과 힘이 없음.",
            "example": "",
            "dictExample": "무기력 속으로 빠져들다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=117696"
          },
          {
            "id": "ningen-4-자학",
            "word": "자학",
            "hanja": "自虐",
            "meaning": "자기를 스스로 학대함.",
            "example": "스스로를 벌하는 {{자학}}이 그의 유일한 성실이었다.",
            "dictExample": "자학에 빠지다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=479099"
          },
          {
            "id": "ningen-4-도피",
            "word": "도피",
            "hanja": "逃避",
            "meaning": "도망하여 몸을 피함.",
            "example": "",
            "dictExample": "그는 해외로 도피 여행을 떠났다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=86527"
          },
          {
            "id": "ningen-4-결핍",
            "word": "결핍",
            "hanja": "缺乏",
            "meaning": "있어야 할 것이 없어지거나 모자람.",
            "example": "",
            "dictExample": "사랑의 결핍.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=18622"
          },
          {
            "id": "ningen-4-참담",
            "word": "참담",
            "hanja": "慘澹",
            "meaning": "끔찍하고 절망적임.",
            "example": "",
            "dictExample": "그에게는 과거도, 미래도 없었다. 침통과 우울과 참담과 공포가 있을 뿐이었다. ≪최서해, 큰물 진 뒤≫",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=490224"
          },
          {
            "id": "ningen-4-몰락",
            "word": "몰락",
            "hanja": "沒落",
            "meaning": "재물이나 세력 따위가 쇠하여 보잘것없이 됨.",
            "example": "",
            "dictExample": "경제적 몰락.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=119899"
          },
          {
            "id": "ningen-4-고립",
            "word": "고립",
            "hanja": "孤立",
            "meaning": "다른 사람과 어울리어 사귀지 아니하거나 다른 사람의 도움을 받지 못하여 외따로 떨어짐.",
            "example": "",
            "dictExample": "고립 상태에 빠지다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=391856"
          },
          {
            "id": "ningen-4-연민",
            "word": "연민",
            "hanja": "憐憫",
            "meaning": "불쌍하고 가련하게 여김.",
            "example": "미움이 다 닳고 나서야 희미한 {{연민}}이 남았다.",
            "dictExample": "연민의 정.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=459874"
          }
        ]
      },
      {
        "name": "후기",
        "words": [
          {
            "id": "ningen-5-회한",
            "word": "회한",
            "hanja": "悔恨",
            "meaning": "뉘우치고 한탄함.",
            "example": "다 지나간 뒤에 오는 {{회한}}은 언제나 늦다.",
            "dictExample": "회한이 서린 목소리.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=507213"
          },
          {
            "id": "ningen-5-애수",
            "word": "애수",
            "hanja": "哀愁",
            "meaning": "마음을 서글프게 하는 슬픈 시름.",
            "example": "",
            "dictExample": "애수를 자아내다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=220030"
          },
          {
            "id": "ningen-5-적막",
            "word": "적막",
            "hanja": "寂寞",
            "meaning": "고요하고 쓸쓸함.",
            "example": "",
            "dictExample": "적막 산중.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=478072"
          },
          {
            "id": "ningen-5-허탈",
            "word": "허탈",
            "hanja": "虛脫",
            "meaning": "몸에 기운이 빠지고 정신이 멍함. 또는 그런 상태.",
            "example": "",
            "dictExample": "그는 실업으로 허탈과 실의에 빠졌다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=506585"
          },
          {
            "id": "ningen-5-관조",
            "word": "관조",
            "hanja": "觀照",
            "meaning": "고요한 마음으로 사물이나 현상을 관찰하거나 비추어 봄.",
            "example": "이제 그는 자기 삶을 남의 일처럼 {{관조}}했다.",
            "dictExample": "관조는 하되 비판하지 말고, 분석은 하되 조급한 예언은 피해야 하는 거다. ≪이병주, 지리산≫",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=399413"
          },
          {
            "id": "ningen-5-초연",
            "word": "초연",
            "hanja": "超然",
            "meaning": "‘초연하다’의 어근.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=489538"
          },
          {
            "id": "ningen-5-무상",
            "word": "무상",
            "hanja": "無常",
            "meaning": "모든 것이 덧없음.",
            "example": "",
            "dictExample": "인생의 허무와 무상을 오늘같이 느낀 일이 없습니다. ≪염상섭, 취우≫",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=426227"
          }
        ]
      }
    ]
  },
  {
    "slug": "demian",
    "book": "데미안",
    "author": "헤르만 헤세",
    "featured": true,
    "featuredNote": "자기 안의 목소리를 따라가는 이야기. 관념을 가리키는 말이 많이 나옵니다.",
    "sections": [
      {
        "name": "두 세계",
        "words": [
          {
            "id": "demian-1-이중성",
            "word": "이중성",
            "hanja": "二重性",
            "meaning": "하나의 사물에 겹쳐 있는 서로 다른 두 가지의 성질.",
            "example": "밝은 집과 어두운 골목, 그 {{이중성}} 사이에서 아이는 자랐다.",
            "dictExample": "속 다르고 겉 다른 이중성.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=473410"
          },
          {
            "id": "demian-1-죄의식",
            "word": "죄의식",
            "hanja": "罪意識",
            "meaning": "저지른 죄과나 잘못에 대하여 스스로 느끼고 깨닫는 것.",
            "example": "",
            "dictExample": "죄의식에 사로잡히다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=480062"
          },
          {
            "id": "demian-1-순수",
            "word": "순수",
            "hanja": "純粹",
            "meaning": "전혀 다른 것의 섞임이 없음.",
            "example": "",
            "dictExample": "순수 성분.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=200621"
          },
          {
            "id": "demian-1-불안",
            "word": "불안",
            "hanja": "不安",
            "meaning": "마음이 편하지 아니하고 조마조마함.",
            "example": "",
            "dictExample": "불안에 싸이다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=436072"
          },
          {
            "id": "demian-1-동경",
            "word": "동경",
            "hanja": "憧憬",
            "meaning": "어떤 것을 간절히 그리워하여 그것만을 생각함.",
            "example": "그가 가진 것을 갖고 싶다는 {{동경}}이 오래 남았다.",
            "dictExample": "동경의 대상.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=89518"
          },
          {
            "id": "demian-1-경계",
            "word": "경계",
            "hanja": "境界",
            "meaning": "사물이 어떠한 기준에 의하여 분간되는 한계.",
            "example": "",
            "dictExample": "경계를 넘는 공연 예술.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=392924"
          },
          {
            "id": "demian-1-은밀",
            "word": "은밀",
            "hanja": "隱密",
            "meaning": "‘은밀하다’의 어근.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=255936"
          },
          {
            "id": "demian-1-협박",
            "word": "협박",
            "hanja": "脅迫",
            "meaning": "겁을 주며 압력을 가하여 남에게 억지로 어떤 일을 하도록 함.",
            "example": "",
            "dictExample": "협박 편지.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=505813"
          }
        ]
      },
      {
        "name": "카인",
        "words": [
          {
            "id": "demian-2-각성",
            "word": "각성",
            "hanja": "覺醒",
            "meaning": "깨어 정신을 차림.",
            "example": "남들이 옳다고 한 말을 처음 의심한 날이 그의 {{각성}}이었다.",
            "dictExample": "카페인의 각성 효과.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=3877"
          },
          {
            "id": "demian-2-성찰",
            "word": "성찰",
            "hanja": "省察",
            "meaning": "자기의 마음을 반성하고 살핌.",
            "example": "",
            "dictExample": "수도자는 자신의 내면적인 성찰과 자각을 게을리하지 않아야 한다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=185074"
          },
          {
            "id": "demian-2-내면",
            "word": "내면",
            "hanja": "內面",
            "meaning": "물건의 안쪽.",
            "example": "",
            "dictExample": "동물의 두개골 내면은 뇌의 표면 주름에 대응하는 요철면을 이루고 있다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=403473"
          },
          {
            "id": "demian-2-고뇌",
            "word": "고뇌",
            "hanja": "苦惱",
            "meaning": "괴로워하고 번뇌함.",
            "example": "",
            "dictExample": "고뇌 속에서 보낸 세월.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=23272"
          },
          {
            "id": "demian-2-방황",
            "word": "방황",
            "hanja": "彷徨",
            "meaning": "이리저리 헤매어 돌아다님.",
            "example": "",
            "dictExample": "잘 곳을 정하지 못해 거리에서 방황을 계속하였다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=434213"
          },
          {
            "id": "demian-2-예감",
            "word": "예감",
            "hanja": "豫感",
            "meaning": "어떤 일이 일어나기 전에 암시적으로 또는 본능적으로 미리 느낌.",
            "example": "",
            "dictExample": "불길한 예감.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=233463"
          },
          {
            "id": "demian-2-통찰",
            "word": "통찰",
            "hanja": "洞察",
            "meaning": "예리한 관찰력으로 사물을 꿰뚫어 봄.",
            "example": "설명 대신 짧은 한마디가 더 깊은 {{통찰}}을 남겼다.",
            "dictExample": "새로운 변화를 읽어 내는 통찰이 필요하다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=495465"
          },
          {
            "id": "demian-2-표식",
            "word": "표식",
            "hanja": "標式",
            "meaning": "하나의 형식을 정확히 나타낼 수 있는 전형적인 유적이나 유물.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=357193"
          }
        ]
      },
      {
        "name": "새는 알에서 나오려고 싸운다",
        "words": [
          {
            "id": "demian-3-초월",
            "word": "초월",
            "hanja": "超越",
            "meaning": "어떠한 한계나 표준을 뛰어넘음.",
            "example": "낡은 세계를 부수는 일이 곧 {{초월}}의 시작이었다.",
            "dictExample": "국경 초월.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=494872"
          },
          {
            "id": "demian-3-결단",
            "word": "결단",
            "hanja": "決斷",
            "meaning": "결정적인 판단을 하거나 단정을 내림. 또는 그런 판단이나 단정.",
            "example": "",
            "dictExample": "결단을 내리다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=392260"
          },
          {
            "id": "demian-3-신념",
            "word": "신념",
            "hanja": "信念",
            "meaning": "굳게 믿는 마음.",
            "example": "",
            "dictExample": "신념을 지키다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=204161"
          },
          {
            "id": "demian-3-저항",
            "word": "저항",
            "hanja": "抵抗",
            "meaning": "어떤 힘이나 조건에 굽히지 아니하고 거역하거나 버팀.",
            "example": "",
            "dictExample": "저항 세력.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=476378"
          },
          {
            "id": "demian-3-파괴",
            "word": "파괴",
            "hanja": "破壞",
            "meaning": "때려 부수거나 깨뜨려 헐어 버림.",
            "example": "",
            "dictExample": "파괴 본능.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=498143"
          },
          {
            "id": "demian-3-탄생",
            "word": "탄생",
            "hanja": "誕生",
            "meaning": "사람이 태어남. 예전에는 성인(聖人) 또는 귀인이 태어남을 높여 이르는 말이었으나, 현재는 주로 이와 같이 쓰고 있다.",
            "example": "",
            "dictExample": "공자의 탄생.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=494004"
          },
          {
            "id": "demian-3-숙명",
            "word": "숙명",
            "hanja": "宿命",
            "meaning": "날 때부터 타고난 정해진 운명. 또는 피할 수 없는 운명.",
            "example": "피하려 애쓸수록 그것은 더 {{숙명}}처럼 다가왔다.",
            "dictExample": "숙명의 대결.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=198968"
          },
          {
            "id": "demian-3-고양",
            "word": "고양",
            "hanja": "高揚",
            "meaning": "높이 쳐들어 올림.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=24827"
          }
        ]
      },
      {
        "name": "야곱의 싸움",
        "words": [
          {
            "id": "demian-4-시련",
            "word": "시련",
            "hanja": "試鍊",
            "meaning": "겪기 어려운 단련이나 고비.",
            "example": "",
            "dictExample": "시련에 부딪치다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=451187"
          },
          {
            "id": "demian-4-인내",
            "word": "인내",
            "hanja": "忍耐",
            "meaning": "괴로움이나 어려움을 참고 견딤.",
            "example": "",
            "dictExample": "인내로 역경을 극복하다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=271711"
          },
          {
            "id": "demian-4-극복",
            "word": "극복",
            "hanja": "克服",
            "meaning": "악조건이나 고생 따위를 이겨 냄.",
            "example": "",
            "dictExample": "가뭄 극복.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=400538"
          },
          {
            "id": "demian-4-승화",
            "word": "승화",
            "hanja": "昇華",
            "meaning": "어떤 현상이 더 높은 상태로 발전하는 일.",
            "example": "견딘 시간이 미움 대신 다른 것으로 {{승화}}되었다.",
            "dictExample": "은사님은 꾸준히 봉사를 하면서 인격의 승화를 느끼게 되었다고 하셨다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=451856"
          },
          {
            "id": "demian-4-계시",
            "word": "계시",
            "hanja": "啓示",
            "meaning": "깨우쳐 보여 줌.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=395233"
          },
          {
            "id": "demian-4-화해",
            "word": "화해",
            "hanja": "和解",
            "meaning": "싸움하던 것을 멈추고 서로 가지고 있던 안 좋은 감정을 풀어 없앰.",
            "example": "",
            "dictExample": "화해의 노력.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=504700"
          },
          {
            "id": "demian-4-성숙",
            "word": "성숙",
            "hanja": "成熟",
            "meaning": "생물의 발육이 완전히 이루어짐.",
            "example": "",
            "dictExample": "따뜻한 기후로 채소의 성숙이 빨라졌다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=187492"
          },
          {
            "id": "demian-4-합일",
            "word": "합일",
            "hanja": "合一",
            "meaning": "둘 이상이 합하여 하나가 됨. 또는 그렇게 만듦.",
            "example": "",
            "dictExample": "국론의 합일.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=502637"
          }
        ]
      }
    ]
  },
  {
    "slug": "etranger",
    "book": "이방인",
    "author": "알베르 카뮈",
    "featured": true,
    "featuredNote": "무심함이라는 태도를 끝까지 밀고 간 소설. 감정을 가리키는 말이 촘촘합니다.",
    "sections": [
      {
        "name": "오늘 엄마가 죽었다",
        "words": [
          {
            "id": "etranger-1-무심",
            "word": "무심",
            "hanja": "無心",
            "meaning": "다른 종류의 털로 속을 박지 않은 붓.",
            "example": "슬퍼야 할 자리에서 그는 이상하리만치 {{무심}}했다.",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=121856"
          },
          {
            "id": "etranger-1-권태",
            "word": "권태",
            "hanja": "倦怠",
            "meaning": "어떤 일이나 상태에 시들해져서 생기는 게으름이나 싫증.",
            "example": "",
            "dictExample": "단조로운 생활에서 오는 권태.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=397262"
          },
          {
            "id": "etranger-1-담담",
            "word": "담담",
            "hanja": "淡淡",
            "meaning": "‘담담하다’의 어근.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=76369"
          },
          {
            "id": "etranger-1-초조",
            "word": "초조",
            "hanja": "焦燥",
            "meaning": "애가 타서 마음이 조마조마함.",
            "example": "",
            "dictExample": "초조의 빛을 띠다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=489031"
          },
          {
            "id": "etranger-1-공허",
            "word": "공허",
            "hanja": "空虛",
            "meaning": "아무것도 없이 텅 빔.",
            "example": "울고 나서도 채워지지 않는 {{공허}}가 남았다.",
            "dictExample": "조반상을 물리고 멍하니 앉은 그의 가슴속에는 일시에 공허 그 자체가 몰려들었다. ≪김성한, 방황≫",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=30266"
          },
          {
            "id": "etranger-1-무관심",
            "word": "무관심",
            "hanja": "無關心",
            "meaning": "관심이나 흥미가 없음.",
            "example": "",
            "dictExample": "가정에 대한 남편의 무관심.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=426222"
          },
          {
            "id": "etranger-1-냉담",
            "word": "냉담",
            "hanja": "冷淡",
            "meaning": "태도나 마음씨가 동정심 없이 차가움.",
            "example": "",
            "dictExample": "적선정 마님의 간섭이 싫었던 것만치나 어머니의 냉담과 무관심이 서운해서 여봐란듯이 그러고 있는지도 몰랐다. ≪박완서, 미망≫",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=407463"
          },
          {
            "id": "etranger-1-부조리",
            "word": "부조리",
            "hanja": "不條理",
            "meaning": "이치에 맞지 아니하거나 도리에 어긋남. 또는 그런 일.",
            "example": "설명이 되지 않는 일들이 {{부조리}}라는 이름으로 쌓였다.",
            "dictExample": "조직의 부조리.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=439134"
          }
        ]
      },
      {
        "name": "재판",
        "words": [
          {
            "id": "etranger-2-심문",
            "word": "심문",
            "hanja": "審問",
            "meaning": "자세히 따져서 물음.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=453019"
          },
          {
            "id": "etranger-2-변론",
            "word": "변론",
            "hanja": "辯論",
            "meaning": "사리를 밝혀 옳고 그름을 따짐.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=145695"
          },
          {
            "id": "etranger-2-편견",
            "word": "편견",
            "hanja": "偏見",
            "meaning": "공정하지 못하고 한쪽으로 치우친 생각.",
            "example": "그를 심판한 것은 사실이 아니라 {{편견}}이었다.",
            "dictExample": "편견을 가지다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=499921"
          },
          {
            "id": "etranger-2-단죄",
            "word": "단죄",
            "hanja": "斷罪",
            "meaning": "죄를 처단함.",
            "example": "",
            "dictExample": "단죄의 대상.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=410282"
          },
          {
            "id": "etranger-2-항변",
            "word": "항변",
            "hanja": "抗辯",
            "meaning": "대항하여 변론함. 또는 그런 변론.",
            "example": "",
            "dictExample": "전적으로 내가 옳다는 항변이 아니라 어디까지나 내 입장을 밝힌 것이다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=365160"
          },
          {
            "id": "etranger-2-위증",
            "word": "위증",
            "hanja": "僞證",
            "meaning": "거짓으로 증명함. 또는 그런 증거.",
            "example": "",
            "dictExample": null,
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=251815"
          },
          {
            "id": "etranger-2-규탄",
            "word": "규탄",
            "hanja": "糾彈",
            "meaning": "잘못이나 옳지 못한 일을 잡아내어 따지고 나무람.",
            "example": "",
            "dictExample": "규탄 운동.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=401621"
          },
          {
            "id": "etranger-2-방청",
            "word": "방청",
            "hanja": "傍聽",
            "meaning": "정식 성원이 아니거나 직접적인 관계가 없는 사람이 회의, 토론, 연설, 공판(公判), 공개 방송 따위에 참석하여 들음.",
            "example": "",
            "dictExample": "공판은 비공개로 방청 없이 비밀리에 며칠씩 계속되다가…. ≪허준, 속 습작실에서≫",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=134703"
          }
        ]
      },
      {
        "name": "마지막 밤",
        "words": [
          {
            "id": "etranger-3-각오",
            "word": "각오",
            "hanja": "覺悟",
            "meaning": "앞으로 해야 할 일이나 겪을 일에 대한 마음의 준비.",
            "example": "",
            "dictExample": "비장한 각오.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=4934"
          },
          {
            "id": "etranger-3-해방",
            "word": "해방",
            "hanja": "解放",
            "meaning": "구속이나 억압, 부담 따위에서 벗어나게 함.",
            "example": "",
            "dictExample": "노예 해방.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=502909"
          },
          {
            "id": "etranger-3-직시",
            "word": "직시",
            "hanja": "直視",
            "meaning": "정신을 집중하여 어떤 대상을 똑바로 봄.",
            "example": "끝을 알고 나서야 비로소 삶을 {{직시}}하게 되었다.",
            "dictExample": null,
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=487845"
          },
          {
            "id": "etranger-3-응시",
            "word": "응시",
            "hanja": "凝視",
            "meaning": "눈길을 모아 한곳을 똑바로 바라봄.",
            "example": "",
            "dictExample": "그녀는 한참 동안 천장의 한곳을 응시만 하고 있었다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=261328"
          },
          {
            "id": "etranger-3-확신",
            "word": "확신",
            "hanja": "確信",
            "meaning": "굳게 믿음. 또는 그런 마음.",
            "example": "",
            "dictExample": "확신이 서다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=505462"
          },
          {
            "id": "etranger-3-평온",
            "word": "평온",
            "hanja": "平穩",
            "meaning": "조용하고 평안함.",
            "example": "",
            "dictExample": "평온을 유지하다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=353293"
          },
          {
            "id": "etranger-3-저주",
            "word": "저주",
            "hanja": "詛呪",
            "meaning": "남에게 재앙이나 불행이 일어나도록 빌고 바람. 또는 그렇게 하여서 일어난 재앙이나 불행.",
            "example": "",
            "dictExample": "저주를 내리다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=286694"
          },
          {
            "id": "etranger-3-고백",
            "word": "고백",
            "hanja": "告白",
            "meaning": "마음속에 생각하고 있는 것이나 감추어 둔 것을 사실대로 숨김없이 말함.",
            "example": "",
            "dictExample": "솔직한 고백.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=396538"
          }
        ]
      }
    ]
  },
  {
    "slug": "sonagi",
    "book": "소나기",
    "author": "황순원",
    "featured": true,
    "featuredNote": "짧고 맑은 이야기. 한자어가 아니라 순우리말 감각어가 많이 나옵니다.",
    "sections": [
      {
        "name": "개울가에서",
        "words": [
          {
            "id": "sonagi-1-서먹하다",
            "word": "서먹하다",
            "hanja": null,
            "meaning": "낯이 설거나 친하지 아니하여 어색하다.",
            "example": "며칠 만에 다시 만나자 공기가 {{서먹했다}}.",
            "dictExample": "나는 처음이라 이 분위기가 서먹하다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=447772"
          },
          {
            "id": "sonagi-1-수줍다",
            "word": "수줍다",
            "hanja": null,
            "meaning": "숫기가 없어 다른 사람 앞에서 말이나 행동을 하는 것이 어렵거나 부끄럽다. 또는 그런 태도가 있다.",
            "example": "",
            "dictExample": "바위틈에 숨어서 수줍게 핀 진달래.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=446787"
          },
          {
            "id": "sonagi-1-망설이다",
            "word": "망설이다",
            "hanja": null,
            "meaning": "이리저리 생각만 하고 태도를 결정하지 못하다.",
            "example": "",
            "dictExample": "대답을 망설이다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=112369"
          },
          {
            "id": "sonagi-1-설레다",
            "word": "설레다",
            "hanja": null,
            "meaning": "마음이 가라앉지 아니하고 들떠서 두근거리다.",
            "example": "",
            "dictExample": "내일 배낭여행을 떠난다는 생각에 마음이 설레어서 잠이 오지 않는다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=443099"
          },
          {
            "id": "sonagi-1-물끄러미",
            "word": "물끄러미",
            "hanja": null,
            "meaning": "우두커니 한곳만 바라보는 모양.",
            "example": "그 애는 한참을 {{물끄러미}} 물속을 들여다보았다.",
            "dictExample": "물끄러미 바라보다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=425111"
          },
          {
            "id": "sonagi-1-재잘거리다",
            "word": "재잘거리다",
            "hanja": null,
            "meaning": "낮고 빠른 목소리로 자꾸 재깔이다.",
            "example": "",
            "dictExample": "계집아이들은 끼리끼리 모여 재잘거렸다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=474315"
          },
          {
            "id": "sonagi-1-어림잡다",
            "word": "어림잡다",
            "hanja": null,
            "meaning": "대강 짐작으로 헤아려 보다.",
            "example": "",
            "dictExample": "모인 사람의 수효를 어림잡다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=232089"
          },
          {
            "id": "sonagi-1-아리땁다",
            "word": "아리땁다",
            "hanja": null,
            "meaning": "마음이나 몸가짐 따위가 맵시 있고 곱다.",
            "example": "",
            "dictExample": "아리따운 처녀.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=454643"
          }
        ]
      },
      {
        "name": "소나기",
        "words": [
          {
            "id": "sonagi-2-흠뻑",
            "word": "흠뻑",
            "hanja": null,
            "meaning": "분량이 차고도 남도록 아주 넉넉하게.",
            "example": "",
            "dictExample": "정이 흠뻑 들다.",
            "synonyms": [],
            "level": 1,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=508989"
          },
          {
            "id": "sonagi-2-자욱하다",
            "word": "자욱하다",
            "hanja": null,
            "meaning": "연기나 안개 따위가 잔뜩 끼어 흐릿하다.",
            "example": "비 갠 들판에 안개가 {{자욱했다}}.",
            "dictExample": "방 안에 담배 연기가 자욱하다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=275009"
          },
          {
            "id": "sonagi-2-오슬오슬",
            "word": "오슬오슬",
            "hanja": null,
            "meaning": "몹시 무섭거나 추워서 자꾸 몸이 움츠러들거나 소름이 끼치는 모양. ‘오싹오싹’보다 여린 느낌을 준다.",
            "example": "",
            "dictExample": "몸살이 났는지 몸이 오슬오슬 떨린다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=239432"
          },
          {
            "id": "sonagi-2-애처롭다",
            "word": "애처롭다",
            "hanja": null,
            "meaning": "가엾고 불쌍하여 마음이 슬프다.",
            "example": "",
            "dictExample": "애처롭게 울다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=222813"
          },
          {
            "id": "sonagi-2-소복하다",
            "word": "소복하다",
            "hanja": null,
            "meaning": "쌓이거나 담긴 물건이 볼록하게 많다.",
            "example": "",
            "dictExample": "사발에 밥을 소복하게 담다.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=185653"
          },
          {
            "id": "sonagi-2-아릿하다",
            "word": "아릿하다",
            "hanja": null,
            "meaning": "눈앞에 어려 오는 것이 아렴풋하다.",
            "example": "이름을 떠올릴 때마다 가슴이 {{아릿했다}}.",
            "dictExample": "아릿한 정적.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=213104"
          },
          {
            "id": "sonagi-2-그윽하다",
            "word": "그윽하다",
            "hanja": null,
            "meaning": "깊숙하여 아늑하고 고요하다.",
            "example": "",
            "dictExample": "아무도 찾지 않는 산사의 겨울밤은 그윽하기만 하다.",
            "synonyms": [],
            "level": 2,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=45754"
          },
          {
            "id": "sonagi-2-고즈넉하다",
            "word": "고즈넉하다",
            "hanja": null,
            "meaning": "고요하고 아늑하다.",
            "example": "",
            "dictExample": "고즈넉한 산사.",
            "synonyms": [],
            "level": 3,
            "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=24955"
          }
        ]
      }
    ]
  }
];

export const DAILY = [
  {
    "id": "daily-1",
    "word": "무료",
    "hanja": "無聊",
    "meaning": "흥미 있는 일이 없어 심심하고 지루함.",
    "example": "",
    "dictExample": "무료를 달래 줄 재미있는 일을 찾다.",
    "synonyms": [],
    "level": 2,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=122087"
  },
  {
    "id": "daily-2",
    "word": "사무치다",
    "hanja": null,
    "meaning": "깊이 스며들거나 멀리까지 미치다.",
    "example": "",
    "dictExample": "가슴에 사무치다.",
    "synonyms": [],
    "level": 2,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=443502"
  },
  {
    "id": "daily-3",
    "word": "아득하다",
    "hanja": null,
    "meaning": "보이는 것이나 들리는 것이 희미하고 매우 멀다.",
    "example": "",
    "dictExample": "아득한 수평선.",
    "synonyms": [],
    "level": 1,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=454803"
  },
  {
    "id": "daily-4",
    "word": "부질없다",
    "hanja": null,
    "meaning": "대수롭지 아니하거나 쓸모가 없다.",
    "example": "",
    "dictExample": "부질없는 생각.",
    "synonyms": [],
    "level": 2,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=433219"
  },
  {
    "id": "daily-5",
    "word": "머쓱하다",
    "hanja": null,
    "meaning": "어울리지 않게 키가 크다.",
    "example": "",
    "dictExample": "키만 머쓱하게 큰 사람.",
    "synonyms": [],
    "level": 2,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=113901"
  },
  {
    "id": "daily-6",
    "word": "겸연쩍다",
    "hanja": null,
    "meaning": "쑥스럽거나 미안하여 어색하다.",
    "example": "",
    "dictExample": "그는 자기의 실수가 겸연쩍은지 씩 멋쩍은 웃음을 보였다.",
    "synonyms": [],
    "level": 3,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=19647"
  },
  {
    "id": "daily-7",
    "word": "성기다",
    "hanja": null,
    "meaning": "물건의 사이가 뜨다.",
    "example": "",
    "dictExample": "잎이 거의 다 떨어진 탱자나무의 성긴 가지 사이로 서너 명의 코흘리개들 모습이 얼비쳐 보였다. ≪조정래, 태백산맥≫",
    "synonyms": [],
    "level": 3,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=445209"
  },
  {
    "id": "daily-8",
    "word": "아련하다",
    "hanja": null,
    "meaning": "똑똑히 분간하기 힘들게 아렴풋하다.",
    "example": "",
    "dictExample": "그때 그 시절의 추억이 아련하다.",
    "synonyms": [],
    "level": 2,
    "sourceUrl": "https://stdict.korean.go.kr/search/searchView.do?word_no=455584"
  }
];

// 모든 단어를 한 줄로 펼칩니다.
export function allWords() {
  return [...BOOKS.flatMap((b) => b.sections.flatMap((s) => s.words)), ...DAILY];
}

export function findWord(id) {
  return allWords().find((w) => w.id === id) ?? null;
}
