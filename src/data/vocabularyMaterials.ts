import { GRADE8_ADDITIONAL_VOCABULARY_MATERIALS } from './vocabularyMaterialsGrade8';

export interface VocabularyMaterialEntry {
  word: string;
  readingToken: string;
  meaning: string;
  sentence: string;
  usageNote: string;
}

export interface VocabularyMaterial {
  char: string;
  reading: string;
  meaning: string;
  entries: VocabularyMaterialEntry[];
}

export const VOCABULARY_MATERIALS: Record<string, VocabularyMaterial> = {
  小: {
    char: '小',
    reading: '소',
    meaning: '작을',
    entries: [
      {
        word: '소형(小型)',
        readingToken: '소',
        meaning: '크기나 규모가 작은 형태.',
        sentence: '소형 가전은 공간을 적게 차지해서 원룸에 잘 어울린다.',
        usageNote: '小는 "작을" 뜻으로 제품 크기를 나타낸다.'
      },
      {
        word: '소규모(小規模)',
        readingToken: '소',
        meaning: '규모가 작음.',
        sentence: '이번 행사는 소규모로 진행해 참가자와 더 깊게 대화했다.',
        usageNote: '小가 규모의 작음을 나타낸다.'
      },
      {
        word: '소도시(小都市)',
        readingToken: '소',
        meaning: '규모가 작은 도시.',
        sentence: '소도시에서는 출퇴근 시간이 짧아 생활 리듬을 유지하기 쉽다.',
        usageNote: '小가 도시의 크기가 작다는 뜻을 더한다.'
      },
      {
        word: '소액(小額)',
        readingToken: '소',
        meaning: '금액이 적음.',
        sentence: '처음에는 소액으로 투자 원칙을 익히는 것이 안전하다.',
        usageNote: '小가 금액이 적다는 뜻을 만든다.'
      },
      {
        word: '최소(最小)',
        readingToken: '소',
        meaning: '가장 작음.',
        sentence: '목표를 최소 단위로 나누면 매일 실행하기 쉬워진다.',
        usageNote: '최소에서 小는 "작을" 핵심 의미를 맡는다.'
      }
    ]
  },
  少: {
    char: '少',
    reading: '소',
    meaning: '적을',
    entries: [
      {
        word: '감소(減少)',
        readingToken: '소',
        meaning: '줄어듦.',
        sentence: '오차 감소를 위해 측정 절차를 표준화했다.',
        usageNote: '少는 양이 적어짐을 나타낸다.'
      },
      {
        word: '희소(稀少)',
        readingToken: '소',
        meaning: '드물고 적음.',
        sentence: '희소 자원은 우선순위를 정해 배분해야 한다.',
        usageNote: '少는 수량이 적다는 의미를 만든다.'
      },
      {
        word: '소수(少數)',
        readingToken: '소',
        meaning: '적은 수.',
        sentence: '소수 의견도 의사결정 과정에서 반드시 검토한다.',
        usageNote: '少는 "적은" 의미를 강조한다.'
      },
      {
        word: '소량(少量)',
        readingToken: '소',
        meaning: '적은 분량.',
        sentence: '소량 생산은 초기 검증 단계에서 유용하다.',
        usageNote: '少는 양이 작음을 나타낸다.'
      },
      {
        word: '희소성(稀少性)',
        readingToken: '소',
        meaning: '드물어서 가치가 높아지는 성질.',
        sentence: '희소성이 높은 자원은 사용 우선순위를 분명히 정해야 한다.',
        usageNote: '少가 적고 드문 성질의 핵심 의미를 만든다.'
      },
      {
        word: '다소(多少)',
        readingToken: '소',
        meaning: '조금 많거나 조금 적음.',
        sentence: '예산은 다소 늘었지만 유지비 절감 효과가 더 컸다.',
        usageNote: '多少에서 少는 양이 적다는 대비 의미를 이룬다.'
      }
    ]
  },
  大: {
    char: '大',
    reading: '대',
    meaning: '큰',
    entries: [
      {
        word: '대형(大型)',
        readingToken: '대',
        meaning: '크기나 규모가 큰 형태.',
        sentence: '대형 행사는 이동 동선을 미리 확인해야 혼잡을 줄일 수 있다.',
        usageNote: '大는 "큰" 의미를 통해 크기를 강조한다.'
      },
      {
        word: '대규모(大規模)',
        readingToken: '대',
        meaning: '규모가 큼.',
        sentence: '대규모 점검을 앞두고 장비 목록을 먼저 정리했다.',
        usageNote: '大가 규모의 큼을 나타낸다.'
      },
      {
        word: '대도시(大都市)',
        readingToken: '대',
        meaning: '인구와 기능이 집중된 큰 도시.',
        sentence: '대도시는 교통수단이 다양해 이동 선택지가 많다.',
        usageNote: '大는 도시의 큰 규모를 뜻한다.'
      },
      {
        word: '확대(擴大)',
        readingToken: '대',
        meaning: '범위나 규모를 넓히고 크게 함.',
        sentence: '서비스 지역을 전국으로 확대하기 전에 고객 지원 체계를 보강했다.',
        usageNote: '확대의 大는 결과적으로 "크게" 만든다는 의미를 가진다.'
      },
      {
        word: '위대(偉大)',
        readingToken: '대',
        meaning: '매우 큼, 훌륭함.',
        sentence: '위대한 성과는 작은 습관을 오래 지킨 사람에게서 나온다.',
        usageNote: '위대에서 大는 크고 뛰어남을 표현한다.'
      }
    ]
  },
  代: {
    char: '代',
    reading: '대',
    meaning: '대신할',
    entries: [
      {
        word: '대리(代理)',
        readingToken: '대',
        meaning: '본인을 대신하여 처리함.',
        sentence: '대리 결재 시에는 근거 자료를 함께 남겨야 한다.',
        usageNote: '代는 대신함의 의미를 가진다.'
      },
      {
        word: '대체(代替)',
        readingToken: '대',
        meaning: '다른 것으로 바꾸어 대신함.',
        sentence: '대체 부품을 확보해 두면 장애 대응 속도를 높일 수 있다.',
        usageNote: '代는 치환과 대체의 뜻을 만든다.'
      },
      {
        word: '교대(交代)',
        readingToken: '대',
        meaning: '서로 번갈아 맡음.',
        sentence: '야간 근무는 교대 기준을 명확히 정해야 피로를 줄일 수 있다.',
        usageNote: '代는 맡은 역할을 바꿔 이어받는 의미를 가진다.'
      },
      {
        word: '시대(時代)',
        readingToken: '대',
        meaning: '사회가 공통된 특징을 보이는 일정한 시기.',
        sentence: '시대 변화에 맞춰 학습 방식도 계속 업데이트해야 한다.',
        usageNote: '代는 시간의 한 구획을 뜻하는 의미로 쓰인다.'
      },
      {
        word: '세대(世代)',
        readingToken: '대',
        meaning: '비슷한 시기에 태어나 공통 경험을 가진 집단.',
        sentence: '세대 간 대화에서는 용어 차이를 먼저 확인하는 것이 좋다.',
        usageNote: '代는 세월의 흐름 속 집단 단위를 나타낸다.'
      }
    ]
  },
  水: {
    char: '水',
    reading: '수',
    meaning: '물',
    entries: [
      {
        word: '수영(水泳)',
        readingToken: '수',
        meaning: '물에서 헤엄치는 운동.',
        sentence: '여름에는 수영을 하며 체력을 꾸준히 관리한다.',
        usageNote: '水가 물과 관련된 활동임을 나타낸다.'
      },
      {
        word: '수도(水道)',
        readingToken: '수',
        meaning: '생활용 물을 공급하는 시설.',
        sentence: '수도 점검 안내가 오면 사용 시간을 미리 조정해야 한다.',
        usageNote: '水가 물 공급과 직접 연결된다.'
      },
      {
        word: '수질(水質)',
        readingToken: '수',
        meaning: '물의 성질과 상태.',
        sentence: '하천 수질을 개선하려면 생활 오염원을 함께 줄여야 한다.',
        usageNote: '水가 물 자체의 상태를 뜻한다.'
      },
      {
        word: '수분(水分)',
        readingToken: '수',
        meaning: '물기, 물의 성분.',
        sentence: '운동 후에는 수분을 충분히 보충해야 회복이 빠르다.',
        usageNote: '水가 물의 성분이라는 의미를 만든다.'
      },
      {
        word: '수위(水位)',
        readingToken: '수',
        meaning: '물의 높이.',
        sentence: '폭우 예보가 있으면 하천 수위를 자주 확인해야 한다.',
        usageNote: '水가 물 높이와 관련된 뜻을 더한다.'
      }
    ]
  },
  手: {
    char: '手',
    reading: '수',
    meaning: '손',
    entries: [
      {
        word: '수기(手記)',
        readingToken: '수',
        meaning: '직접 쓴 기록.',
        sentence: '선배의 수기를 읽으면 실제 시행착오를 배울 수 있다.',
        usageNote: '手는 손으로 직접 함을 나타낸다.'
      },
      {
        word: '수화(手話)',
        readingToken: '수',
        meaning: '손짓으로 뜻을 전달하는 언어.',
        sentence: '수화 통역이 있으면 정보 접근성이 높아진다.',
        usageNote: '手는 손의 동작을 의미한다.'
      },
      {
        word: '악수(握手)',
        readingToken: '수',
        meaning: '서로 손을 잡아 인사함.',
        sentence: '첫 만남에서는 밝은 표정과 악수가 좋은 인상을 만든다.',
        usageNote: '手가 손이라는 의미를 담당한다.'
      },
      {
        word: '박수(拍手)',
        readingToken: '수',
        meaning: '손뼉을 치며 칭찬이나 환영의 뜻을 나타냄.',
        sentence: '발표가 끝나자 청중이 큰 박수로 응답했다.',
        usageNote: '手가 손동작을 통한 표현이라는 의미를 만든다.'
      },
      {
        word: '수술(手術)',
        readingToken: '수',
        meaning: '의학적으로 몸을 절개하거나 처치하는 치료 행위.',
        sentence: '수술 전에는 회복 계획을 미리 공유해야 불안을 줄일 수 있다.',
        usageNote: '手는 손으로 직접 시행하는 처치를 뜻하는 어원 요소다.'
      }
    ]
  },
  火: {
    char: '火',
    reading: '화',
    meaning: '불',
    entries: [
      {
        word: '화재(火災)',
        readingToken: '화',
        meaning: '불이 나서 생긴 재난.',
        sentence: '화재 대피 훈련은 실제 상황을 가정해 반복해야 효과가 있다.',
        usageNote: '火가 불과 관련된 사건임을 나타낸다.'
      },
      {
        word: '화산(火山)',
        readingToken: '화',
        meaning: '마그마 활동으로 형성된 산.',
        sentence: '화산 지대에서는 지질 활동 정보를 꾸준히 모니터링한다.',
        usageNote: '火가 뜨거운 열과 분출을 상징한다.'
      },
      {
        word: '화력(火力)',
        readingToken: '화',
        meaning: '불의 세기 또는 무기의 공격력.',
        sentence: '조리할 때는 화력을 단계별로 조절해야 음식 맛이 안정된다.',
        usageNote: '火가 불의 힘이라는 의미를 만든다.'
      },
      {
        word: '발화(發火)',
        readingToken: '화',
        meaning: '불이 붙어 타기 시작함.',
        sentence: '배터리 발화를 막기 위해 충전 환경 온도를 관리한다.',
        usageNote: '발화에서 火는 불이 생기는 핵심 뜻이다.'
      },
      {
        word: '화염(火焰)',
        readingToken: '화',
        meaning: '불꽃.',
        sentence: '실험에서는 화염의 색을 관찰해 물질 성분을 추정한다.',
        usageNote: '火가 불꽃의 속성을 직접 나타낸다.'
      }
    ]
  },
  話: {
    char: '話',
    reading: '화',
    meaning: '말',
    entries: [
      {
        word: '대화(對話)',
        readingToken: '화',
        meaning: '서로 말을 주고받음.',
        sentence: '갈등이 생기면 대화의 규칙부터 다시 맞추는 것이 효과적이다.',
        usageNote: '話는 말하고 소통함의 의미를 가진다.'
      },
      {
        word: '화제(話題)',
        readingToken: '화',
        meaning: '이야깃거리.',
        sentence: '발표 도입에서 공감되는 화제를 잡으면 집중도가 올라간다.',
        usageNote: '話는 이야기 주제를 나타낸다.'
      },
      {
        word: '통화(通話)',
        readingToken: '화',
        meaning: '전화로 이야기함.',
        sentence: '중요 통화는 핵심 내용을 메모로 남겨 두는 편이 좋다.',
        usageNote: '話는 말로 전달하는 의미를 포함한다.'
      },
      {
        word: '동화(童話)',
        readingToken: '화',
        meaning: '어린이를 대상으로 한 이야기.',
        sentence: '동화는 짧은 이야기 속에 가치와 상상력을 함께 담는다.',
        usageNote: '話는 이야기 서사의 핵심 뜻을 이룬다.'
      },
      {
        word: '신화(神話)',
        readingToken: '화',
        meaning: '신적 존재와 세계의 기원을 다룬 전승 이야기.',
        sentence: '신화를 읽으면 고대 사회의 세계관을 이해하는 데 도움이 된다.',
        usageNote: '話는 전해 내려오는 이야기의 형식을 나타낸다.'
      }
    ]
  },
  人: {
    char: '人',
    reading: '인',
    meaning: '사람',
    entries: [
      {
        word: '인간(人間)',
        readingToken: '인',
        meaning: '사람, 사람이라는 존재.',
        sentence: '인간은 협력을 통해 더 큰 문제를 해결해 왔다.',
        usageNote: '人이 사람 자체를 뜻한다.'
      },
      {
        word: '인구(人口)',
        readingToken: '인',
        meaning: '일정 지역에 사는 사람 수.',
        sentence: '도시 인구 변화는 교통 계획에도 큰 영향을 준다.',
        usageNote: '人이 사람의 수를 세는 개념에 쓰인다.'
      },
      {
        word: '인원(人員)',
        readingToken: '인',
        meaning: '어떤 집단을 구성하는 사람 수.',
        sentence: '행사 인원을 먼저 확정하면 예산을 정확히 짤 수 있다.',
        usageNote: '人이 구성원이라는 뜻을 만든다.'
      },
      {
        word: '본인(本人)',
        readingToken: '인',
        meaning: '자기 자신.',
        sentence: '본인 확인 절차를 거쳐야 민감한 정보를 조회할 수 있다.',
        usageNote: '本人에서 人은 사람, 즉 자신을 가리킨다.'
      },
      {
        word: '인재(人才)',
        readingToken: '인',
        meaning: '능력이 뛰어난 사람.',
        sentence: '좋은 인재를 키우려면 성장 피드백을 자주 제공해야 한다.',
        usageNote: '人이 사람의 능력 가치를 나타내는 데 쓰인다.'
      }
    ]
  },
  印: {
    char: '印',
    reading: '인',
    meaning: '도장',
    entries: [
      {
        word: '인감(印鑑)',
        readingToken: '인',
        meaning: '본인의 공식 도장.',
        sentence: '중요 계약에서는 인감 사용 절차를 반드시 확인해야 한다.',
        usageNote: '印은 도장과 표식을 나타낸다.'
      },
      {
        word: '인쇄(印刷)',
        readingToken: '인',
        meaning: '종이 등에 글자나 그림을 찍어 냄.',
        sentence: '대량 인쇄 전에는 교정본을 먼저 확인해 오탈자를 줄인다.',
        usageNote: '印은 찍어서 남기는 의미를 가진다.'
      },
      {
        word: '날인(捺印)',
        readingToken: '인',
        meaning: '문서에 도장을 찍음.',
        sentence: '최종본 검토 후에 날인해야 불필요한 수정 비용을 줄일 수 있다.',
        usageNote: '印은 문서 확인의 표시 역할을 한다.'
      },
      {
        word: '인장(印章)',
        readingToken: '인',
        meaning: '도장.',
        sentence: '전시된 인장을 보면 시대별 서체 특징을 한눈에 비교할 수 있다.',
        usageNote: '印은 공식 표식으로서의 도장 의미를 직접 드러낸다.'
      },
      {
        word: '봉인(封印)',
        readingToken: '인',
        meaning: '열지 못하게 단단히 막고 표시함.',
        sentence: '증거물은 봉인 상태를 유지해야 신뢰성을 확보할 수 있다.',
        usageNote: '印은 밀봉 사실을 확인하는 표식 의미로 쓰인다.'
      }
    ]
  },
  日: {
    char: '日',
    reading: '일',
    meaning: '날',
    entries: [
      {
        word: '일요일(日曜日)',
        readingToken: '일',
        meaning: '한 주의 첫째 요일.',
        sentence: '일요일 아침에는 다음 주 계획을 가볍게 정리한다.',
        usageNote: '日은 날짜와 요일의 기준 단위로 쓰인다.'
      },
      {
        word: '일기(日記)',
        readingToken: '일',
        meaning: '날마다 기록한 글.',
        sentence: '짧게라도 일기를 쓰면 하루의 감정을 정리하기 쉽다.',
        usageNote: '日이 하루 단위 기록이라는 뜻을 만든다.'
      },
      {
        word: '일상(日常)',
        readingToken: '일',
        meaning: '날마다 반복되는 생활.',
        sentence: '작은 운동 습관을 일상에 넣으면 건강 유지가 쉬워진다.',
        usageNote: '日이 매일의 반복이라는 의미를 더한다.'
      },
      {
        word: '일출(日出)',
        readingToken: '일',
        meaning: '해가 떠오름.',
        sentence: '해변에서 본 일출은 하루를 차분히 시작하게 해 준다.',
        usageNote: '日이 해 또는 낮을 의미한다.'
      },
      {
        word: '일몰(日沒)',
        readingToken: '일',
        meaning: '해가 짐.',
        sentence: '일몰 전에는 야외 촬영 조명을 미리 점검해야 한다.',
        usageNote: '日이 해의 움직임을 나타낸다.'
      }
    ]
  },
  一: {
    char: '一',
    reading: '일',
    meaning: '한',
    entries: [
      {
        word: '일등(一等)',
        readingToken: '일',
        meaning: '첫째 등급.',
        sentence: '일등 전략보다 중요한 것은 꾸준히 반복 가능한 학습 계획이다.',
        usageNote: '一은 첫째/하나의 의미를 가진다.'
      },
      {
        word: '일원(一員)',
        readingToken: '일',
        meaning: '구성원 한 사람.',
        sentence: '팀의 일원으로서 맡은 역할을 명확히 이해하는 것이 중요하다.',
        usageNote: '一은 하나의 구성 단위를 나타낸다.'
      },
      {
        word: '일체(一體)',
        readingToken: '일',
        meaning: '하나로 묶인 전체.',
        sentence: '디자인과 기능을 일체로 보면 사용자 경험을 더 잘 개선할 수 있다.',
        usageNote: '一은 하나로 통합됨을 의미한다.'
      },
      {
        word: '통일(統一)',
        readingToken: '일',
        meaning: '여럿을 하나로 합침.',
        sentence: '문서 형식을 통일하면 협업 속도가 눈에 띄게 빨라진다.',
        usageNote: '一은 결국 하나로 모인다는 결과 의미를 만든다.'
      },
      {
        word: '일심(一心)',
        readingToken: '일',
        meaning: '한마음.',
        sentence: '팀이 일심으로 목표를 공유하면 실행력이 높아진다.',
        usageNote: '一은 마음을 하나로 모으는 뜻을 강조한다.'
      }
    ]
  },
  中: {
    char: '中',
    reading: '중',
    meaning: '가운데',
    entries: [
      {
        word: '중앙(中央)',
        readingToken: '중',
        meaning: '한가운데 위치.',
        sentence: '중앙 통로는 비상 이동을 위해 항상 비워 둬야 한다.',
        usageNote: '中은 가운데 위치 의미를 가진다.'
      },
      {
        word: '중간(中間)',
        readingToken: '중',
        meaning: '처음과 끝 사이.',
        sentence: '중간 점검을 하면 일정 지연 위험을 일찍 발견할 수 있다.',
        usageNote: '中은 가운데 지점을 뜻한다.'
      },
      {
        word: '중학교(中學校)',
        readingToken: '중',
        meaning: '초등과 고등 사이의 학교 과정.',
        sentence: '중학교 과정부터 자기주도 학습 습관이 중요해진다.',
        usageNote: '中은 중간 단계의 의미를 만든다.'
      },
      {
        word: '중단(中斷)',
        readingToken: '중',
        meaning: '하던 일을 중간에 끊음.',
        sentence: '배포 중단 기준을 사전에 정의해 두면 장애 대응이 빨라진다.',
        usageNote: '中은 진행 도중이라는 의미를 포함한다.'
      },
      {
        word: '중립(中立)',
        readingToken: '중',
        meaning: '어느 한쪽에도 치우치지 않음.',
        sentence: '토론 진행자는 중립 태도를 유지해야 논의가 공정해진다.',
        usageNote: '中은 치우치지 않는 가운데 위치를 뜻한다.'
      }
    ]
  },
  重: {
    char: '重',
    reading: '중',
    meaning: '무거울',
    entries: [
      {
        word: '중량(重量)',
        readingToken: '중',
        meaning: '무게의 양.',
        sentence: '운송비는 제품 중량에 따라 크게 달라진다.',
        usageNote: '重은 무겁거나 중요함의 뜻을 가진다.'
      },
      {
        word: '중복(重複)',
        readingToken: '중',
        meaning: '같은 것이 거듭됨.',
        sentence: '중복 입력을 막으면 데이터 품질이 안정적으로 유지된다.',
        usageNote: '重은 겹침의 의미를 나타낸다.'
      },
      {
        word: '중요(重要)',
        readingToken: '중',
        meaning: '매우 긴요함.',
        sentence: '중요 지표는 매일 같은 시간에 점검하는 습관이 좋다.',
        usageNote: '重은 무게감, 중요성을 나타낸다.'
      },
      {
        word: '중대(重大)',
        readingToken: '중',
        meaning: '아주 큼, 영향이 큼.',
        sentence: '중대 결함은 즉시 대응 체계로 전환해 처리해야 한다.',
        usageNote: '重은 사안의 무거움을 뜻한다.'
      },
      {
        word: '중시(重視)',
        readingToken: '중',
        meaning: '중요하게 여겨 살핌.',
        sentence: '안전 기준을 중시하면 운영 리스크를 크게 줄일 수 있다.',
        usageNote: '重은 가치의 무게를 크게 두는 뜻으로 쓰인다.'
      }
    ]
  },
  國: {
    char: '國',
    reading: '국',
    meaning: '나라',
    entries: [
      {
        word: '국가(國家)',
        readingToken: '국',
        meaning: '국민, 영토, 주권으로 이루어진 정치 공동체.',
        sentence: '국가 통계는 정책 방향을 정할 때 중요한 기준이 된다.',
        usageNote: '國이 나라 단위를 뜻한다.'
      },
      {
        word: '전국(全國)',
        readingToken: '국',
        meaning: '온 나라 전체.',
        sentence: '전국 단위 조사는 지역 차이를 비교하기에 적합하다.',
        usageNote: '國이 전체 지역 범위를 나타낸다.'
      },
      {
        word: '국기(國旗)',
        readingToken: '국',
        meaning: '한 나라를 상징하는 깃발.',
        sentence: '국기 디자인에는 역사와 정체성이 함께 담긴다.',
        usageNote: '國이 나라의 상징 의미를 만든다.'
      },
      {
        word: '국경(國境)',
        readingToken: '국',
        meaning: '나라와 나라의 경계.',
        sentence: '국경 지역은 통관 절차를 미리 확인해야 이동이 수월하다.',
        usageNote: '國이 국가 간 경계를 뜻한다.'
      },
      {
        word: '국회(國會)',
        readingToken: '국',
        meaning: '국가의 입법 기관.',
        sentence: '국회 회의록을 보면 정책 결정 과정을 구체적으로 이해할 수 있다.',
        usageNote: '國이 국가 운영 맥락을 형성한다.'
      }
    ]
  },
  菊: {
    char: '菊',
    reading: '국',
    meaning: '국화',
    entries: [
      {
        word: '국화(菊花)',
        readingToken: '국',
        meaning: '가을에 피는 꽃의 한 종류.',
        sentence: '국화 전시회는 품종별 색과 향을 비교하기 좋다.',
        usageNote: '菊은 국화 식물을 가리킨다.'
      },
      {
        word: '국화차(菊花茶)',
        readingToken: '국',
        meaning: '국화로 우린 차.',
        sentence: '국화차는 향이 은은해 저녁 시간에 마시기 좋다.',
        usageNote: '菊이 재료 식물을 뜻한다.'
      },
      {
        word: '산국화(山菊花)',
        readingToken: '국',
        meaning: '산지에서 자라는 국화류 식물.',
        sentence: '가을 산길에서는 산국화가 군데군데 피어 풍경을 밝힌다.',
        usageNote: '菊은 국화 계열 식물을 가리키는 핵심 글자다.'
      },
      {
        word: '천수국(千壽菊)',
        readingToken: '국',
        meaning: '관상용으로 널리 기르는 국화과 식물.',
        sentence: '천수국은 색이 선명해 화단 가장자리에 자주 심는다.',
        usageNote: '이름의 菊이 국화과 식물 계열을 나타낸다.'
      },
      {
        word: '소국(小菊)',
        readingToken: '국',
        meaning: '꽃이 작은 국화 품종.',
        sentence: '소국은 화병에 꽂으면 공간 분위기를 차분하게 만든다.',
        usageNote: '菊이 꽃 종류를, 小가 크기 특징을 더한다.'
      }
    ]
  },
  月: {
    char: '月',
    reading: '월',
    meaning: '달',
    entries: [
      {
        word: '월요일(月曜日)',
        readingToken: '월',
        meaning: '한 주의 둘째 요일.',
        sentence: '월요일 일정은 우선순위를 먼저 정하고 시작했다.',
        usageNote: '月은 달력의 시간 체계에서 쓰인다.'
      },
      {
        word: '월급(月給)',
        readingToken: '월',
        meaning: '매달 받는 급여.',
        sentence: '월급 관리 계획을 세우면 장기 목표를 더 안정적으로 달성한다.',
        usageNote: '月이 한 달 주기를 나타낸다.'
      },
      {
        word: '월말(月末)',
        readingToken: '월',
        meaning: '달의 마지막 무렵.',
        sentence: '월말에는 지출 내역을 점검해 다음 달 예산을 조정한다.',
        usageNote: '月이 달 단위 시점을 나타낸다.'
      },
      {
        word: '월초(月初)',
        readingToken: '월',
        meaning: '달의 처음 무렵.',
        sentence: '월초에 이번 달 목표를 적어두면 실행률이 높아진다.',
        usageNote: '月이 한 달 시작 시점을 뜻한다.'
      },
      {
        word: '월간(月刊)',
        readingToken: '월',
        meaning: '한 달에 한 번 발행함.',
        sentence: '월간 리포트로 학습 진척을 확인하면 장기 추세가 보인다.',
        usageNote: '月이 발행 주기(한 달)를 나타낸다.'
      }
    ]
  },
  越: {
    char: '越',
    reading: '월',
    meaning: '넘을',
    entries: [
      {
        word: '월등(越等)',
        readingToken: '월',
        meaning: '수준이 아주 뛰어남.',
        sentence: '기초 체력이 좋아지면 후반 집중력도 월등히 좋아진다.',
        usageNote: '越은 넘어서 뛰어남의 의미를 가진다.'
      },
      {
        word: '월경(越境)',
        readingToken: '월',
        meaning: '경계를 넘음.',
        sentence: '월경 이동은 국가별 규정 확인이 필수다.',
        usageNote: '越은 경계를 넘어감을 뜻한다.'
      },
      {
        word: '초월(超越)',
        readingToken: '월',
        meaning: '보통의 한계를 넘음.',
        sentence: '좋은 설명은 전공 장벽을 초월해 전달된다.',
        usageNote: '越은 한계를 넘는 뜻으로 쓰인다.'
      },
      {
        word: '월권(越權)',
        readingToken: '월',
        meaning: '권한의 범위를 넘어섬.',
        sentence: '월권 판단 기준을 문서로 남겨 두면 조직 갈등을 줄일 수 있다.',
        usageNote: '越은 허용된 경계를 넘어선다는 의미를 가진다.'
      },
      {
        word: '추월(追越)',
        readingToken: '월',
        meaning: '앞지르며 지나감.',
        sentence: '고속도로에서는 안전 거리를 확보한 뒤에만 추월해야 한다.',
        usageNote: '越은 위치와 경계를 넘어 앞서는 뜻을 더한다.'
      }
    ]
  },
  ...GRADE8_ADDITIONAL_VOCABULARY_MATERIALS
};

const materialsByReadingToken = new Map<string, VocabularyMaterial[]>();

for (const material of Object.values(VOCABULARY_MATERIALS)) {
  const tokens = Array.from(new Set(material.entries.map((entry) => entry.readingToken.trim()).filter(Boolean)));
  for (const token of tokens) {
    const bucket = materialsByReadingToken.get(token) ?? [];
    bucket.push(material);
    materialsByReadingToken.set(token, bucket);
  }
}

export function getVocabularyMaterialByChar(char: string): VocabularyMaterial | null {
  return VOCABULARY_MATERIALS[char] ?? null;
}

export function getVocabularyMaterialsByReadingToken(readingToken: string): VocabularyMaterial[] {
  return materialsByReadingToken.get(readingToken.trim()) ?? [];
}
