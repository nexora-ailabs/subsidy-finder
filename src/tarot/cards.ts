// 메이저 아르카나 22장. 그림은 쓰지 않고 앱 고유의 심볼·색으로 카드를 그린다.

export interface TarotCard {
  id: number;
  numeral: string;
  nameKo: string;
  nameEn: string;
  symbol: string;
  keywords: string[];
  upright: {
    general: string;
    love: string;
    work: string;
    money: string;
  };
  reversed: string;
  advice: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    numeral: "0",
    nameKo: "바보",
    nameEn: "The Fool",
    symbol: "✦",
    keywords: ["새 출발", "자유", "가능성"],
    upright: {
      general: "아무것도 정해지지 않았기에 무엇이든 될 수 있는 때예요. 가볍게 첫걸음을 떼어 보세요.",
      love: "계산 없이 마음이 끌리는 새로운 만남이 시작될 수 있어요.",
      work: "익숙하지 않은 분야에 도전하기 좋은 흐름이에요.",
      money: "즉흥적인 지출은 조심하되, 새로운 수입 아이디어는 메모해 두세요.",
    },
    reversed: "준비 없이 뛰어들면 길을 잃기 쉬워요. 한 번만 더 확인하고 움직이세요.",
    advice: "완벽하게 준비될 때를 기다리기보다 작게 시작해 보세요.",
  },
  {
    id: 1,
    numeral: "I",
    nameKo: "마법사",
    nameEn: "The Magician",
    symbol: "∞",
    keywords: ["실행력", "재능", "집중"],
    upright: {
      general: "필요한 재료는 이미 다 손에 있어요. 이제 꺼내 쓰기만 하면 돼요.",
      love: "적극적으로 표현할수록 상대가 마음을 열어요.",
      work: "내 능력을 보여줄 기회가 와요. 발표·제안에 특히 좋아요.",
      money: "기술이나 재능이 수입으로 이어질 수 있는 시기예요.",
    },
    reversed: "말만 앞서고 실행이 따라오지 않을 수 있어요. 약속을 줄이고 하나에 집중하세요.",
    advice: "가진 것을 과소평가하지 마세요. 오늘 하나라도 직접 해보세요.",
  },
  {
    id: 2,
    numeral: "II",
    nameKo: "여사제",
    nameEn: "The High Priestess",
    symbol: "☾",
    keywords: ["직관", "비밀", "내면"],
    upright: {
      general: "겉으로 드러나지 않은 정보가 있어요. 서두르지 말고 직감을 믿어 보세요.",
      love: "말보다 눈빛과 분위기로 통하는 관계예요. 조용히 마음을 살펴보세요.",
      work: "공부와 연구, 기획처럼 깊이 생각하는 일에 좋은 때예요.",
      money: "큰 결정보다 정보를 모으는 데 집중하세요.",
    },
    reversed: "감정을 너무 숨기면 오해가 쌓여요. 믿을 만한 사람에게 털어놓아 보세요.",
    advice: "답은 이미 마음속에 있어요. 혼자 생각할 시간을 가져 보세요.",
  },
  {
    id: 3,
    numeral: "III",
    nameKo: "여황제",
    nameEn: "The Empress",
    symbol: "♀",
    keywords: ["풍요", "사랑", "돌봄"],
    upright: {
      general: "따뜻하고 넉넉한 기운이 감싸는 때예요. 나를 아끼는 만큼 좋은 일이 돌아와요.",
      love: "사랑받고 사랑하는 기운이 가득해요. 관계가 한층 깊어져요.",
      work: "창작·디자인·돌봄과 관련된 일에서 성과가 나요.",
      money: "수입이 안정되고 여유가 생기는 흐름이에요.",
    },
    reversed: "남을 챙기느라 나를 놓치고 있진 않나요? 오늘은 나를 먼저 돌봐 주세요.",
    advice: "맛있는 식사와 충분한 휴식으로 나를 채워 주세요.",
  },
  {
    id: 4,
    numeral: "IV",
    nameKo: "황제",
    nameEn: "The Emperor",
    symbol: "♔",
    keywords: ["안정", "리더십", "책임"],
    upright: {
      general: "원칙을 세우고 주도권을 잡으면 일이 정리돼요.",
      love: "믿음직하고 든든한 관계예요. 약속을 지키는 모습이 신뢰를 줘요.",
      work: "리더 역할을 맡거나 체계를 세우기 좋은 때예요.",
      money: "계획적인 관리가 빛을 봐요. 예산을 세워 보세요.",
    },
    reversed: "고집이 지나치면 주변이 지칠 수 있어요. 한발 물러서 들어 주세요.",
    advice: "오늘 할 일을 세 가지로 정리하고 하나씩 끝내 보세요.",
  },
  {
    id: 5,
    numeral: "V",
    nameKo: "교황",
    nameEn: "The Hierophant",
    symbol: "△",
    keywords: ["조언", "전통", "배움"],
    upright: {
      general: "경험 많은 사람의 조언이 길잡이가 돼요. 기본에 충실하세요.",
      love: "진지하고 안정적인 관계로 발전할 수 있어요.",
      work: "배움과 자격 준비에 좋은 흐름이에요. 멘토를 찾아보세요.",
      money: "검증된 방식이 가장 안전해요. 유행에 휩쓸리지 마세요.",
    },
    reversed: "틀에 박힌 방식이 답답하게 느껴질 수 있어요. 나만의 방법도 괜찮아요.",
    advice: "믿을 수 있는 선배나 친구에게 의견을 물어보세요.",
  },
  {
    id: 6,
    numeral: "VI",
    nameKo: "연인",
    nameEn: "The Lovers",
    symbol: "♡",
    keywords: ["선택", "조화", "끌림"],
    upright: {
      general: "마음이 가는 쪽을 선택해야 하는 순간이에요. 진심을 따르세요.",
      love: "서로에게 강하게 끌리는 시기예요. 고백·관계 발전에 좋아요.",
      work: "좋은 파트너와 손잡으면 결과가 배가 돼요.",
      money: "함께하는 투자나 공동 계획은 조건을 꼼꼼히 맞추세요.",
    },
    reversed: "마음이 두 갈래로 나뉘어 있어요. 무엇이 진짜 중요한지 먼저 정하세요.",
    advice: "머리보다 마음이 가리키는 쪽을 한 번 믿어 보세요.",
  },
  {
    id: 7,
    numeral: "VII",
    nameKo: "전차",
    nameEn: "The Chariot",
    symbol: "⇡",
    keywords: ["전진", "의지", "승리"],
    upright: {
      general: "목표를 향해 힘차게 나아가는 때예요. 속도를 내도 좋아요.",
      love: "적극적으로 다가가면 관계가 빠르게 진전돼요.",
      work: "경쟁에서 앞서 나가요. 밀어붙인 일이 결실을 맺어요.",
      money: "목표 금액을 정하고 달리면 이룰 수 있어요.",
    },
    reversed: "방향 없이 달리면 지치기만 해요. 잠깐 멈춰 목적지를 확인하세요.",
    advice: "오늘 꼭 이루고 싶은 한 가지를 정하고 끝까지 가 보세요.",
  },
  {
    id: 8,
    numeral: "VIII",
    nameKo: "힘",
    nameEn: "Strength",
    symbol: "❋",
    keywords: ["용기", "인내", "부드러움"],
    upright: {
      general: "부드러운 태도가 가장 강한 힘이 되는 날이에요.",
      love: "조급해하지 않고 기다려 주는 마음이 관계를 지켜요.",
      work: "어려운 상황도 차분하게 풀어갈 수 있어요.",
      money: "충동을 다스리면 차곡차곡 쌓여요.",
    },
    reversed: "자신감이 조금 떨어져 있어요. 작은 성공부터 쌓아 보세요.",
    advice: "화가 나도 한 박자 쉬고 말해 보세요.",
  },
  {
    id: 9,
    numeral: "IX",
    nameKo: "은둔자",
    nameEn: "The Hermit",
    symbol: "✺",
    keywords: ["성찰", "고요", "지혜"],
    upright: {
      general: "혼자만의 시간이 답을 알려 주는 때예요. 속도를 늦춰도 괜찮아요.",
      love: "관계를 돌아보고 내가 원하는 사랑이 무엇인지 생각해 보세요.",
      work: "깊이 있는 공부·분석 작업에 집중하기 좋아요.",
      money: "지출을 점검하고 정리하기 좋은 때예요.",
    },
    reversed: "너무 혼자 있으면 외로움이 커져요. 가까운 사람과 연락해 보세요.",
    advice: "잠들기 전 10분, 오늘을 돌아보는 시간을 가져 보세요.",
  },
  {
    id: 10,
    numeral: "X",
    nameKo: "운명의 수레바퀴",
    nameEn: "Wheel of Fortune",
    symbol: "⊛",
    keywords: ["전환점", "행운", "흐름"],
    upright: {
      general: "흐름이 바뀌는 전환점이에요. 좋은 쪽으로 바퀴가 굴러가요.",
      love: "우연한 계기로 인연이 이어질 수 있어요.",
      work: "예상치 못한 기회가 찾아와요. 타이밍을 놓치지 마세요.",
      money: "뜻밖의 수입 운이 있어요.",
    },
    reversed: "잠깐 흐름이 엇갈릴 수 있어요. 억지로 거스르지 말고 기다려 보세요.",
    advice: "평소와 다른 길로 가 보세요. 새로운 우연이 생겨요.",
  },
  {
    id: 11,
    numeral: "XI",
    nameKo: "정의",
    nameEn: "Justice",
    symbol: "⚖︎",
    keywords: ["균형", "공정", "결정"],
    upright: {
      general: "뿌린 대로 거두는 때예요. 공정하게 판단하면 좋은 결과가 나와요.",
      love: "서로 주고받는 균형이 맞아야 오래가요.",
      work: "계약·서류·평가에서 정당한 결과를 얻어요.",
      money: "수입과 지출의 균형을 맞추기 좋은 때예요.",
    },
    reversed: "한쪽으로 기운 판단을 하고 있을 수 있어요. 상대 입장도 들어 보세요.",
    advice: "중요한 결정은 장단점을 적어 보고 내리세요.",
  },
  {
    id: 12,
    numeral: "XII",
    nameKo: "매달린 사람",
    nameEn: "The Hanged Man",
    symbol: "▽",
    keywords: ["관점 전환", "기다림", "내려놓기"],
    upright: {
      general: "지금은 멈춰서 다른 각도로 바라볼 때예요. 기다림도 전략이에요.",
      love: "상대 입장에서 생각해 보면 오해가 풀려요.",
      work: "진행이 더디지만 그 시간 동안 더 좋은 방법이 보여요.",
      money: "급하게 사고팔기보다 지켜보는 게 나아요.",
    },
    reversed: "의미 없이 버티고만 있진 않나요? 놓아야 할 것은 놓아 주세요.",
    advice: "오늘은 결론을 내리지 말고 한 번 더 생각해 보세요.",
  },
  {
    id: 13,
    numeral: "XIII",
    nameKo: "죽음",
    nameEn: "Death",
    symbol: "❖",
    keywords: ["끝과 시작", "변화", "정리"],
    upright: {
      general: "하나가 끝나야 새로운 것이 시작돼요. 정리할 것을 정리할 때예요.",
      love: "지난 관계를 정리하고 새로운 마음으로 나아가요.",
      work: "익숙한 방식을 바꾸면 새 길이 열려요.",
      money: "불필요한 구독·지출을 끊기 좋은 때예요.",
    },
    reversed: "변화를 두려워해서 붙잡고 있는 것이 있어요. 조금씩 놓아 보세요.",
    advice: "오늘 하나만 버리거나 정리해 보세요. 마음이 가벼워져요.",
  },
  {
    id: 14,
    numeral: "XIV",
    nameKo: "절제",
    nameEn: "Temperance",
    symbol: "≈",
    keywords: ["균형", "조화", "회복"],
    upright: {
      general: "서로 다른 것들이 조화를 이루는 때예요. 적당함이 가장 좋아요.",
      love: "서로 맞춰가며 편안하게 깊어지는 관계예요.",
      work: "협업과 조율이 잘 되는 날이에요.",
      money: "꾸준하고 절제된 관리가 결실을 맺어요.",
    },
    reversed: "어느 한쪽으로 지나치게 치우쳐 있어요. 생활 리듬을 되찾아 보세요.",
    advice: "물을 충분히 마시고, 일과 휴식의 균형을 챙기세요.",
  },
  {
    id: 15,
    numeral: "XV",
    nameKo: "악마",
    nameEn: "The Devil",
    symbol: "◆",
    keywords: ["유혹", "집착", "욕망"],
    upright: {
      general: "달콤한 유혹이 가까이 있어요. 즐기되 끌려다니지는 마세요.",
      love: "강한 끌림이 있지만 집착으로 번지지 않게 조심하세요.",
      work: "눈앞의 이익보다 장기적인 결과를 보세요.",
      money: "충동구매와 과소비를 특히 조심해야 해요.",
    },
    reversed: "나를 묶고 있던 습관에서 벗어날 수 있는 때예요.",
    advice: "장바구니에 담은 건 하루 뒤에 다시 보세요.",
  },
  {
    id: 16,
    numeral: "XVI",
    nameKo: "탑",
    nameEn: "The Tower",
    symbol: "⚡︎",
    keywords: ["급변", "깨달음", "재정비"],
    upright: {
      general: "예상치 못한 변화가 생길 수 있어요. 흔들려도 더 단단하게 다시 세울 수 있어요.",
      love: "숨겨진 감정이 드러날 수 있어요. 솔직한 대화가 필요해요.",
      work: "계획이 바뀔 수 있으니 대안을 준비해 두세요.",
      money: "큰 지출이나 투자는 잠시 미루는 게 좋아요.",
    },
    reversed: "변화를 피하려 할수록 더 커져요. 작은 부분부터 받아들여 보세요.",
    advice: "오늘은 일정에 여유를 두고 움직이세요.",
  },
  {
    id: 17,
    numeral: "XVII",
    nameKo: "별",
    nameEn: "The Star",
    symbol: "★",
    keywords: ["희망", "치유", "영감"],
    upright: {
      general: "어두웠던 시간이 지나고 희망이 비쳐요. 꿈꾸던 것을 다시 꺼내 보세요.",
      love: "상처가 아물고 설레는 마음이 다시 피어나요.",
      work: "창의적인 아이디어가 떠오르는 날이에요.",
      money: "장기적인 목표를 세우기 좋은 때예요.",
    },
    reversed: "잠시 자신감을 잃었어요. 내가 잘해온 것들을 떠올려 보세요.",
    advice: "이루고 싶은 소원 하나를 적어 두세요.",
  },
  {
    id: 18,
    numeral: "XVIII",
    nameKo: "달",
    nameEn: "The Moon",
    symbol: "☽",
    keywords: ["불안", "직감", "모호함"],
    upright: {
      general: "확실하지 않은 것들이 마음을 흔들어요. 사실과 걱정을 구분해 보세요.",
      love: "상대의 마음이 잘 안 보여 불안할 수 있어요. 추측보다 대화를 하세요.",
      work: "정보가 부족한 상태예요. 확인 후 진행하세요.",
      money: "애매한 제안은 피하는 게 좋아요.",
    },
    reversed: "흐릿하던 상황이 점점 선명해져요. 오해가 풀려요.",
    advice: "불안한 생각이 들면 종이에 적어 보세요. 생각보다 작아요.",
  },
  {
    id: 19,
    numeral: "XIX",
    nameKo: "태양",
    nameEn: "The Sun",
    symbol: "☀︎",
    keywords: ["성공", "기쁨", "활력"],
    upright: {
      general: "모든 것이 환하게 빛나는 최고의 날이에요. 마음껏 즐기세요.",
      love: "밝고 행복한 연애운이에요. 함께 웃을 일이 많아요.",
      work: "노력이 인정받고 좋은 성과가 나와요.",
      money: "금전운이 밝아요. 기분 좋은 소식이 있어요.",
    },
    reversed: "좋은 기운이 있지만 살짝 가려져 있어요. 조금만 더 힘내면 돼요.",
    advice: "햇볕을 쬐며 산책해 보세요. 기운이 더 올라가요.",
  },
  {
    id: 20,
    numeral: "XX",
    nameKo: "심판",
    nameEn: "Judgement",
    symbol: "✧",
    keywords: ["부활", "소식", "결단"],
    upright: {
      general: "기다리던 소식이 오거나, 다시 일어설 계기가 생겨요.",
      love: "지난 인연에게서 연락이 오거나 관계가 새롭게 시작돼요.",
      work: "그동안의 노력이 평가받는 시기예요.",
      money: "묵혀 둔 일이 정리되며 돈이 들어올 수 있어요.",
    },
    reversed: "과거에 머물러 있으면 앞으로 나아가기 어려워요. 스스로를 용서해 주세요.",
    advice: "미뤄둔 연락이나 답장을 오늘 해 보세요.",
  },
  {
    id: 21,
    numeral: "XXI",
    nameKo: "세계",
    nameEn: "The World",
    symbol: "◎",
    keywords: ["완성", "성취", "새로운 장"],
    upright: {
      general: "하나의 여정이 아름답게 마무리돼요. 스스로를 칭찬해 주세요.",
      love: "서로에게 온전한 짝이 되는 관계예요.",
      work: "프로젝트가 성공적으로 마무리돼요.",
      money: "목표했던 금액을 달성하거나 안정이 찾아와요.",
    },
    reversed: "마무리가 조금 남아 있어요. 마지막 한 걸음을 놓치지 마세요.",
    advice: "오늘 끝낸 일 하나를 축하해 주세요.",
  },
];

export type TarotTopic = "general" | "love" | "work" | "money";

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
}

export function readingText(drawn: DrawnCard, topic: TarotTopic): string {
  return drawn.reversed ? drawn.card.reversed : drawn.card.upright[topic];
}
