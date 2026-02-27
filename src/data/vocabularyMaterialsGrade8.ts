export interface AdditionalVocabularyMaterialEntry {
  word: string;
  readingToken: string;
  meaning: string;
  sentence: string;
  usageNote: string;
}

export interface AdditionalVocabularyMaterial {
  char: string;
  reading: string;
  meaning: string;
  entries: AdditionalVocabularyMaterialEntry[];
}

export const GRADE8_ADDITIONAL_VOCABULARY_MATERIALS: Record<string, AdditionalVocabularyMaterial> = {
  校: {
    char: '校',
    reading: '교',
    meaning: '학교',
    entries: [
      {
        word: '학교(學校)',
        readingToken: '교',
        meaning: '학생을 가르치고 배우는 기관.',
        sentence: '학교에서는 기초 개념을 반복해 학습 습관을 만든다.',
        usageNote: '校는 학교와 관련된 장소 의미를 이룬다.'
      },
      {
        word: '교장(校長)',
        readingToken: '교',
        meaning: '학교를 대표해 운영을 총괄하는 사람.',
        sentence: '교장은 교육 목표와 학교 운영 방향을 함께 조율한다.',
        usageNote: '校가 학교라는 범위를 분명하게 보여 준다.'
      },
      {
        word: '교문(校門)',
        readingToken: '교',
        meaning: '학교의 문.',
        sentence: '등교 시간에는 교문 주변 보행 안전 지도가 중요하다.',
        usageNote: '校門에서 校는 학교 시설을 가리킨다.'
      },
      {
        word: '교정(校庭)',
        readingToken: '교',
        meaning: '학교 건물 주변의 마당.',
        sentence: '점심시간 교정은 학생들의 휴식 공간으로 자주 활용된다.',
        usageNote: '校가 학교 부지를 의미하는 핵심 요소다.'
      },
      {
        word: '교가(校歌)',
        readingToken: '교',
        meaning: '학교를 상징하는 노래.',
        sentence: '입학식에서 교가를 배우며 학교 구성원이라는 소속감을 느낀다.',
        usageNote: '校가 학교 정체성과 연결된 뜻을 만든다.'
      }
    ]
  },
  敎: {
    char: '敎',
    reading: '교',
    meaning: '가르칠',
    entries: [
      {
        word: '교육(敎育)',
        readingToken: '교',
        meaning: '지식과 태도를 가르치고 기르는 일.',
        sentence: '좋은 교육은 학생이 스스로 질문하게 만드는 데서 시작한다.',
        usageNote: '敎는 가르치고 이끈다는 의미를 담는다.'
      },
      {
        word: '교사(敎師)',
        readingToken: '교',
        meaning: '학생을 가르치는 사람.',
        sentence: '교사는 학습 수준에 맞는 설명 방식을 계속 조정해야 한다.',
        usageNote: '敎가 교사의 핵심 역할인 가르침을 나타낸다.'
      },
      {
        word: '교훈(敎訓)',
        readingToken: '교',
        meaning: '가르침이 되는 훈계나 지침.',
        sentence: '실패 경험을 교훈으로 정리하면 같은 실수를 줄일 수 있다.',
        usageNote: '敎는 배우고 깨닫게 하는 뜻을 만든다.'
      },
      {
        word: '교재(敎材)',
        readingToken: '교',
        meaning: '가르치거나 배울 때 쓰는 자료.',
        sentence: '교재는 학습 목표에 맞게 난이도를 단계별로 구성해야 한다.',
        usageNote: '敎가 학습 자료의 목적을 분명히 한다.'
      },
      {
        word: '교실(敎室)',
        readingToken: '교',
        meaning: '수업을 진행하는 방.',
        sentence: '교실 환경이 안정적이면 학생들의 집중 시간이 길어진다.',
        usageNote: '敎가 가르침이 이루어지는 공간이라는 뜻을 더한다.'
      }
    ]
  },
  軍: {
    char: '軍',
    reading: '군',
    meaning: '군사',
    entries: [
      {
        word: '군인(軍人)',
        readingToken: '군',
        meaning: '군대에 소속되어 복무하는 사람.',
        sentence: '군인은 임무 수행을 위해 체력과 규율을 함께 관리한다.',
        usageNote: '軍이 군대 조직과 관련된 뜻을 이끈다.'
      },
      {
        word: '군대(軍隊)',
        readingToken: '군',
        meaning: '국가를 방위하기 위해 조직된 무력 집단.',
        sentence: '군대는 지휘 체계와 협업 절차가 명확해야 안정적으로 운영된다.',
        usageNote: '軍이 무력 조직의 기본 의미를 담당한다.'
      },
      {
        word: '군사(軍事)',
        readingToken: '군',
        meaning: '군대와 전쟁에 관한 일.',
        sentence: '군사 용어는 상황 오해를 막기 위해 정확히 사용해야 한다.',
        usageNote: '軍이 국방 관련 사안을 뜻한다.'
      },
      {
        word: '해군(海軍)',
        readingToken: '군',
        meaning: '바다에서 활동하는 군대.',
        sentence: '해군은 해상 교통로를 지키기 위한 작전을 수행한다.',
        usageNote: '軍이 병력 조직의 성격을 나타낸다.'
      },
      {
        word: '장군(將軍)',
        readingToken: '군',
        meaning: '군대를 지휘하는 높은 계급의 장교.',
        sentence: '장군은 작전 목표와 병력 운용을 종합적으로 판단한다.',
        usageNote: '軍이 지휘와 전력 운용의 맥락을 만든다.'
      }
    ]
  },
  金: {
    char: '金',
    reading: '금',
    meaning: '쇠',
    entries: [
      {
        word: '금속(金屬)',
        readingToken: '금',
        meaning: '광택과 전도성을 지닌 물질.',
        sentence: '금속 부품은 습기에 노출되면 부식 관리가 필요하다.',
        usageNote: '金이 금속 재료의 성질을 나타낸다.'
      },
      {
        word: '금요일(金曜日)',
        readingToken: '금',
        meaning: '한 주의 다섯째 요일.',
        sentence: '금요일에는 다음 주 준비를 미리 해 두면 주말이 편해진다.',
        usageNote: '金은 요일 이름의 한 요소로 쓰인다.'
      },
      {
        word: '황금(黃金)',
        readingToken: '금',
        meaning: '빛나는 노란 금속 또는 매우 귀중한 것.',
        sentence: '황금 시간대에는 핵심 업무를 먼저 처리하는 편이 효율적이다.',
        usageNote: '金이 가치가 높은 귀금속 의미를 만든다.'
      },
      {
        word: '금융(金融)',
        readingToken: '금',
        meaning: '돈이 융통되는 경제 활동.',
        sentence: '금융 기초를 이해하면 가계 계획을 더 안정적으로 세울 수 있다.',
        usageNote: '金이 돈과 자본의 의미로 확장되어 쓰인다.'
      },
      {
        word: '금고(金庫)',
        readingToken: '금',
        meaning: '돈이나 귀중품을 보관하는 단단한 상자.',
        sentence: '중요 문서는 금고에 보관해 분실 위험을 줄여야 한다.',
        usageNote: '金이 금전과 귀중품의 맥락을 형성한다.'
      }
    ]
  },
  南: {
    char: '南',
    reading: '남',
    meaning: '남녘',
    entries: [
      {
        word: '남부(南部)',
        readingToken: '남',
        meaning: '어떤 지역의 남쪽 부분.',
        sentence: '남부 지역은 여름 강수량 변동이 커 대비가 필요하다.',
        usageNote: '南은 방향상 남쪽을 가리킨다.'
      },
      {
        word: '남북(南北)',
        readingToken: '남',
        meaning: '남쪽과 북쪽.',
        sentence: '남북 이동 경로를 함께 확인하면 일정 지연을 줄일 수 있다.',
        usageNote: '南이 북과 짝을 이루며 방향 대비를 만든다.'
      },
      {
        word: '남해(南海)',
        readingToken: '남',
        meaning: '남쪽 바다.',
        sentence: '남해 연안은 계절별 바람 변화가 뚜렷한 편이다.',
        usageNote: '南이 바다 위치를 남쪽으로 특정한다.'
      },
      {
        word: '동남(東南)',
        readingToken: '남',
        meaning: '동쪽과 남쪽 사이의 방향.',
        sentence: '건물의 동남 방향 창은 오전 햇빛이 잘 들어온다.',
        usageNote: '南이 복합 방향 표현의 한 축을 이룬다.'
      },
      {
        word: '남동(南東)',
        readingToken: '남',
        meaning: '남쪽과 동쪽 사이의 방향.',
        sentence: '태풍 진로가 남동으로 꺾이면 해상 작업 계획을 다시 세워야 한다.',
        usageNote: '南이 방향 좌표를 세밀하게 나타낼 때 쓰인다.'
      }
    ]
  },
  年: {
    char: '年',
    reading: '년',
    meaning: '해',
    entries: [
      {
        word: '학년(學年)',
        readingToken: '년',
        meaning: '학교 교육 과정에서 한 해 단위의 단계.',
        sentence: '학년이 올라갈수록 자기주도 학습 비중이 커진다.',
        usageNote: '年이 해 단위의 구분을 담당한다.'
      },
      {
        word: '연말(年末)',
        readingToken: '년',
        meaning: '한 해의 마지막 무렵.',
        sentence: '연말에는 연간 목표 달성 여부를 점검해 다음 계획을 세운다.',
        usageNote: '年이 시간 단위로서 한 해를 의미한다.'
      },
      {
        word: '연초(年初)',
        readingToken: '년',
        meaning: '한 해의 처음 무렵.',
        sentence: '연초에는 핵심 지표를 정해 실행 방향을 분명히 하는 게 좋다.',
        usageNote: '年이 새해의 시작 시점을 나타낸다.'
      },
      {
        word: '청년(靑年)',
        readingToken: '년',
        meaning: '젊은 나이의 사람.',
        sentence: '청년 지원 정책은 주거와 일자리 문제를 함께 다뤄야 효과가 높다.',
        usageNote: '年이 연령 단계 의미를 더한다.'
      },
      {
        word: '소년(少年)',
        readingToken: '년',
        meaning: '어린 남자아이.',
        sentence: '소년 축구 대회에서는 기본기 중심 훈련이 장기적으로 중요하다.',
        usageNote: '年이 나이와 성장 단계를 나타낸다.'
      }
    ]
  },
  東: {
    char: '東',
    reading: '동',
    meaning: '동녘',
    entries: [
      {
        word: '동쪽(東쪽)',
        readingToken: '동',
        meaning: '해가 뜨는 방향.',
        sentence: '동쪽 창은 아침 채광이 좋아 작업 공간으로 선호된다.',
        usageNote: '東은 기본 방향인 동을 뜻한다.'
      },
      {
        word: '동양(東洋)',
        readingToken: '동',
        meaning: '아시아를 중심으로 한 동쪽 지역 문화권.',
        sentence: '동양 철학은 관계와 조화의 가치를 강조하는 경우가 많다.',
        usageNote: '東이 지역적 기준을 동쪽으로 잡는다.'
      },
      {
        word: '동해(東海)',
        readingToken: '동',
        meaning: '한반도 동쪽의 바다.',
        sentence: '동해의 파고 예보를 확인하고 해상 활동 일정을 조정했다.',
        usageNote: '東이 바다의 위치 정보를 제공한다.'
      },
      {
        word: '동문(東門)',
        readingToken: '동',
        meaning: '동쪽에 난 문.',
        sentence: '행사장 동문은 입장 동선이 짧아 혼잡도가 낮은 편이다.',
        usageNote: '東이 출입구 위치를 명확히 한다.'
      },
      {
        word: '극동(極東)',
        readingToken: '동',
        meaning: '아시아의 매우 동쪽 지역.',
        sentence: '극동 지역 물류는 항로와 기상 변수를 함께 고려해야 한다.',
        usageNote: '東이 지리적 동쪽 끝의 의미를 만든다.'
      }
    ]
  },
  木: {
    char: '木',
    reading: '목',
    meaning: '나무',
    entries: [
      {
        word: '목재(木材)',
        readingToken: '목',
        meaning: '건축이나 제작에 쓰는 나무 재료.',
        sentence: '목재는 습도에 따라 수축과 팽창이 달라져 보관이 중요하다.',
        usageNote: '木이 재료로서 나무 의미를 나타낸다.'
      },
      {
        word: '목요일(木曜日)',
        readingToken: '목',
        meaning: '한 주의 넷째 요일.',
        sentence: '목요일에는 주간 업무 진행률을 점검해 남은 일정을 조정한다.',
        usageNote: '木이 요일 명칭의 요소로 쓰인다.'
      },
      {
        word: '수목(樹木)',
        readingToken: '목',
        meaning: '나무를 통틀어 이르는 말.',
        sentence: '수목 관리는 계절별 병해충 점검을 함께 해야 효과적이다.',
        usageNote: '木이 식물로서 나무의 범주를 형성한다.'
      },
      {
        word: '초목(草木)',
        readingToken: '목',
        meaning: '풀과 나무.',
        sentence: '비가 내린 뒤 산책로의 초목이 더 선명한 색을 띠었다.',
        usageNote: '木이 초목의 구성 요소인 나무를 가리킨다.'
      },
      {
        word: '목조(木造)',
        readingToken: '목',
        meaning: '나무로 만든 구조.',
        sentence: '목조 건물은 화재 안전 설계를 초기부터 꼼꼼히 적용해야 한다.',
        usageNote: '木이 재료 기반 구조 의미를 만든다.'
      }
    ]
  },
  門: {
    char: '門',
    reading: '문',
    meaning: '문',
    entries: [
      {
        word: '정문(正門)',
        readingToken: '문',
        meaning: '건물이나 시설의 중심이 되는 문.',
        sentence: '정문 안내 표지판을 정비하면 방문자 이동이 훨씬 수월해진다.',
        usageNote: '門이 출입구 의미를 직접 나타낸다.'
      },
      {
        word: '대문(大門)',
        readingToken: '문',
        meaning: '집이나 건물의 큰 문.',
        sentence: '대문 잠금 상태를 습관적으로 확인하면 보안 사고를 줄일 수 있다.',
        usageNote: '門이 건물의 입구를 뜻한다.'
      },
      {
        word: '입문(入門)',
        readingToken: '문',
        meaning: '어떤 분야에 처음 들어가 배움의 기초를 익힘.',
        sentence: '처음 입문할 때는 핵심 개념 세 가지를 먼저 잡는 전략이 효과적이다.',
        usageNote: '門이 분야의 문턱이라는 비유적 의미를 만든다.'
      },
      {
        word: '전문(專門)',
        readingToken: '문',
        meaning: '한 분야를 깊이 연구하거나 담당함.',
        sentence: '전문 인력과 협업하면 문제 해결 속도가 크게 빨라진다.',
        usageNote: '門이 특정 분야의 체계를 뜻한다.'
      },
      {
        word: '문하생(門下生)',
        readingToken: '문',
        meaning: '스승 문하에서 배우는 제자.',
        sentence: '옛 문하생 기록을 보면 학맥 형성과 전승 과정을 이해할 수 있다.',
        usageNote: '門이 스승의 학문 체계 안을 뜻한다.'
      }
    ]
  },
  民: {
    char: '民',
    reading: '민',
    meaning: '백성',
    entries: [
      {
        word: '시민(市民)',
        readingToken: '민',
        meaning: '도시에 사는 사람.',
        sentence: '시민 참여가 활발할수록 지역 정책의 실효성이 높아진다.',
        usageNote: '民이 사회 구성원 의미를 담당한다.'
      },
      {
        word: '국민(國民)',
        readingToken: '민',
        meaning: '한 나라의 구성원 전체.',
        sentence: '국민 안전과 직결된 정보는 쉽고 정확하게 전달되어야 한다.',
        usageNote: '民이 국가의 사람들을 포괄한다.'
      },
      {
        word: '주민(住民)',
        readingToken: '민',
        meaning: '일정 지역에 살고 있는 사람.',
        sentence: '주민 의견 수렴을 통해 시설 운영 시간을 현실적으로 조정했다.',
        usageNote: '民이 거주 공동체의 사람을 가리킨다.'
      },
      {
        word: '민족(民族)',
        readingToken: '민',
        meaning: '공통된 문화와 역사 의식을 공유하는 집단.',
        sentence: '민족 문화 연구는 언어와 생활사 자료를 함께 검토해야 정확하다.',
        usageNote: '民이 집단 정체성을 나타내는 기반 요소다.'
      },
      {
        word: '서민(庶民)',
        readingToken: '민',
        meaning: '평범한 생활을 하는 일반 사람들.',
        sentence: '서민 물가 지표는 체감 경제를 판단할 때 중요한 기준이 된다.',
        usageNote: '民이 일반 사람들의 삶을 가리킨다.'
      }
    ]
  },
  白: {
    char: '白',
    reading: '백',
    meaning: '흰',
    entries: [
      {
        word: '백색(白色)',
        readingToken: '백',
        meaning: '흰 빛의 색.',
        sentence: '백색 배경은 정보 가독성을 높이는 데 자주 활용된다.',
        usageNote: '白이 흰색 의미를 직접 나타낸다.'
      },
      {
        word: '백지(白紙)',
        readingToken: '백',
        meaning: '아무것도 쓰지 않은 종이.',
        sentence: '처음 기획할 때는 백지에서 핵심 가정부터 적어 나가는 편이 좋다.',
        usageNote: '白이 비어 있고 깨끗한 상태를 뜻한다.'
      },
      {
        word: '고백(告白)',
        readingToken: '백',
        meaning: '마음이나 사실을 솔직히 털어놓음.',
        sentence: '문제 원인에 대한 고백이 있어야 재발 방지 대책도 구체화된다.',
        usageNote: '白은 말로 드러낸다는 의미로 확장되어 쓰인다.'
      },
      {
        word: '자백(自白)',
        readingToken: '백',
        meaning: '자신의 잘못이나 사실을 스스로 인정해 밝힘.',
        sentence: '정확한 자백 기록은 사건 경위를 재구성할 때 중요하다.',
        usageNote: '白이 사실을 밝힌다는 의미를 가진다.'
      },
      {
        word: '독백(獨白)',
        readingToken: '백',
        meaning: '혼자 말함.',
        sentence: '연극 독백 장면은 인물의 내면 갈등을 강하게 드러낸다.',
        usageNote: '白이 말로 표현한다는 뜻을 담당한다.'
      }
    ]
  },
  父: {
    char: '父',
    reading: '부',
    meaning: '아비',
    entries: [
      {
        word: '부모(父母)',
        readingToken: '부',
        meaning: '아버지와 어머니.',
        sentence: '부모와의 꾸준한 대화는 진로 선택 과정에서 큰 힘이 된다.',
        usageNote: '父가 가족 관계에서 아버지를 뜻한다.'
      },
      {
        word: '부친(父親)',
        readingToken: '부',
        meaning: '남의 아버지를 높여 이르는 말.',
        sentence: '부친의 경력을 소개할 때는 예의를 갖춘 표현을 쓰는 것이 좋다.',
        usageNote: '父가 존칭 표현에서도 아버지 의미를 유지한다.'
      },
      {
        word: '조부(祖父)',
        readingToken: '부',
        meaning: '할아버지.',
        sentence: '조부 세대의 구술 기록은 지역사 연구에 중요한 자료가 된다.',
        usageNote: '父가 윗세대 남성 친족 의미를 구성한다.'
      },
      {
        word: '의부(義父)',
        readingToken: '부',
        meaning: '법률이나 의리 관계로 맺어진 아버지.',
        sentence: '의부와의 법적 관계는 관련 서류를 통해 명확히 확인해야 한다.',
        usageNote: '父가 법적·사회적 가족 관계를 표시한다.'
      },
      {
        word: '부자(父子)',
        readingToken: '부',
        meaning: '아버지와 아들.',
        sentence: '부자 간 공동 작업은 역할을 나누면 갈등을 줄이고 성과를 높일 수 있다.',
        usageNote: '父가 부자 관계의 첫 축을 이룬다.'
      }
    ]
  },
  北: {
    char: '北',
    reading: '북',
    meaning: '북녘',
    entries: [
      {
        word: '북쪽(北쪽)',
        readingToken: '북',
        meaning: '해가 뜨는 방향의 반대편.',
        sentence: '북쪽 사면은 햇빛이 적어 겨울 결빙 관리가 중요하다.',
        usageNote: '北은 기본 방향인 북을 뜻한다.'
      },
      {
        word: '동북(東北)',
        readingToken: '북',
        meaning: '동쪽과 북쪽 사이의 방향.',
        sentence: '동북 방향 바람이 강하면 외부 작업 시간을 조정해야 한다.',
        usageNote: '北이 복합 방향 표현을 완성한다.'
      },
      {
        word: '서북(西北)',
        readingToken: '북',
        meaning: '서쪽과 북쪽 사이의 방향.',
        sentence: '서북 지역은 계절풍 영향을 크게 받아 기상 변동이 잦다.',
        usageNote: '北이 지리적 위치를 세분화한다.'
      },
      {
        word: '북동(北東)',
        readingToken: '북',
        meaning: '북쪽과 동쪽 사이의 방향.',
        sentence: '북동쪽 통로는 비상 대피 시 보조 동선으로 활용된다.',
        usageNote: '北이 방향 축의 기준 역할을 한다.'
      },
      {
        word: '북서(北西)',
        readingToken: '북',
        meaning: '북쪽과 서쪽 사이의 방향.',
        sentence: '북서풍이 강한 날에는 해상 안전 점검 주기를 짧게 가져가야 한다.',
        usageNote: '北이 기상·지리 표현에서 중심 의미를 갖는다.'
      }
    ]
  },
  四: {
    char: '四',
    reading: '사',
    meaning: '넉',
    entries: [
      {
        word: '사월(四月)',
        readingToken: '사',
        meaning: '일 년의 네 번째 달.',
        sentence: '사월에는 기온 변화가 커서 건강 관리에 특히 주의해야 한다.',
        usageNote: '四가 숫자 4의 의미를 드러낸다.'
      },
      {
        word: '사방(四方)',
        readingToken: '사',
        meaning: '동서남북 모든 방향.',
        sentence: '사방 시야를 확보하면 이동 중 안전사고를 예방하기 쉽다.',
        usageNote: '四가 네 방향 전체를 뜻한다.'
      },
      {
        word: '사각형(四角形)',
        readingToken: '사',
        meaning: '변이 네 개인 도형.',
        sentence: '사각형 면적 공식은 도형 학습의 기본 개념으로 자주 다뤄진다.',
        usageNote: '四가 개수 4를 수학 개념에 적용한다.'
      },
      {
        word: '사계절(四季節)',
        readingToken: '사',
        meaning: '봄, 여름, 가을, 겨울 네 계절.',
        sentence: '사계절 기후 데이터는 농업 계획을 세울 때 필수적이다.',
        usageNote: '四가 네 계절이라는 분류를 형성한다.'
      },
      {
        word: '사중주(四重奏)',
        readingToken: '사',
        meaning: '네 사람이 함께 연주하는 음악 형식.',
        sentence: '사중주에서는 각 악기가 서로의 소리를 듣고 균형을 맞추는 것이 중요하다.',
        usageNote: '四가 구성 인원 수를 명확히 보여 준다.'
      }
    ]
  },
  山: {
    char: '山',
    reading: '산',
    meaning: '메',
    entries: [
      {
        word: '산맥(山脈)',
        readingToken: '산',
        meaning: '산들이 줄지어 이어진 지형.',
        sentence: '산맥 지형은 기후와 강수 분포에 큰 영향을 준다.',
        usageNote: '山이 지형 요소로서 산을 나타낸다.'
      },
      {
        word: '등산(登山)',
        readingToken: '산',
        meaning: '산에 오르는 활동.',
        sentence: '등산 전에는 기상 정보와 코스 난이도를 함께 확인해야 한다.',
        usageNote: '山이 활동 대상인 산을 뜻한다.'
      },
      {
        word: '화산(火山)',
        readingToken: '산',
        meaning: '마그마 활동으로 형성된 산.',
        sentence: '화산 지대에서는 지진과 가스 농도를 함께 관측한다.',
        usageNote: '山이 지형의 기본 개념을 형성한다.'
      },
      {
        word: '산림(山林)',
        readingToken: '산',
        meaning: '산과 숲.',
        sentence: '산림 관리 계획은 생태 보전과 이용 균형을 함께 고려해야 한다.',
        usageNote: '山이 자연 생태 공간의 의미를 확장한다.'
      },
      {
        word: '산지(山地)',
        readingToken: '산',
        meaning: '산이 많은 땅.',
        sentence: '산지 도로는 급경사가 많아 제동 거리 계산이 특히 중요하다.',
        usageNote: '山이 지형 분류의 핵심 기준이 된다.'
      }
    ]
  },
  三: {
    char: '三',
    reading: '삼',
    meaning: '석',
    entries: [
      {
        word: '삼월(三月)',
        readingToken: '삼',
        meaning: '일 년의 세 번째 달.',
        sentence: '삼월 학기 초에는 학습 계획을 구체적으로 세우는 것이 좋다.',
        usageNote: '三이 숫자 3을 나타낸다.'
      },
      {
        word: '삼십(三十)',
        readingToken: '삼',
        meaning: '서른.',
        sentence: '삼십 분 단위로 집중 시간을 관리하면 피로를 줄이기 쉽다.',
        usageNote: '三이 수량 개념을 만든다.'
      },
      {
        word: '삼각형(三角形)',
        readingToken: '삼',
        meaning: '변이 세 개인 도형.',
        sentence: '삼각형 성질은 기하학의 기본 정리 이해에 자주 쓰인다.',
        usageNote: '三이 도형의 변 개수를 나타낸다.'
      },
      {
        word: '삼국(三國)',
        readingToken: '삼',
        meaning: '세 나라.',
        sentence: '삼국 시기 기록은 정치와 문화 교류를 함께 보여 준다.',
        usageNote: '三이 국가 수를 표시한다.'
      },
      {
        word: '삼일(三日)',
        readingToken: '삼',
        meaning: '사흘.',
        sentence: '삼일 단위 점검은 짧은 목표 관리에 적합한 주기다.',
        usageNote: '三이 날짜 수를 분명하게 나타낸다.'
      }
    ]
  },
  生: {
    char: '生',
    reading: '생',
    meaning: '날',
    entries: [
      {
        word: '학생(學生)',
        readingToken: '생',
        meaning: '학교에서 배우는 사람.',
        sentence: '학생 중심 수업에서는 질문과 토론 시간이 충분히 확보되어야 한다.',
        usageNote: '生이 배우는 사람이라는 뜻을 구성한다.'
      },
      {
        word: '생일(生日)',
        readingToken: '생',
        meaning: '태어난 날.',
        sentence: '생일 기록은 인구 통계와 행정 업무에서 기본 정보로 쓰인다.',
        usageNote: '生이 태어남의 의미를 드러낸다.'
      },
      {
        word: '생활(生活)',
        readingToken: '생',
        meaning: '일상적으로 살아가는 과정.',
        sentence: '생활 패턴을 일정하게 유지하면 학습 효율이 높아진다.',
        usageNote: '生이 삶과 관련된 의미를 만든다.'
      },
      {
        word: '인생(人生)',
        readingToken: '생',
        meaning: '사람이 살아가는 평생의 과정.',
        sentence: '인생 목표는 짧은 계획과 긴 방향을 함께 세울 때 실천력이 높아진다.',
        usageNote: '生이 생애의 시간 흐름을 나타낸다.'
      },
      {
        word: '탄생(誕生)',
        readingToken: '생',
        meaning: '새로 태어남.',
        sentence: '새 기술의 탄생 배경을 이해하면 활용 범위를 더 정확히 판단할 수 있다.',
        usageNote: '生이 생성과 출현의 핵심 뜻을 가진다.'
      }
    ]
  },
  西: {
    char: '西',
    reading: '서',
    meaning: '서녘',
    entries: [
      {
        word: '서쪽(西쪽)',
        readingToken: '서',
        meaning: '해가 지는 방향.',
        sentence: '서쪽 하늘은 일몰 시간대에 색 변화가 뚜렷하게 나타난다.',
        usageNote: '西는 기본 방향인 서를 뜻한다.'
      },
      {
        word: '서양(西洋)',
        readingToken: '서',
        meaning: '유럽과 아메리카를 중심으로 한 서쪽 문화권.',
        sentence: '서양 미술사는 시대별 표현 기법의 변화를 비교하기에 좋다.',
        usageNote: '西가 지역적 기준을 서쪽으로 설정한다.'
      },
      {
        word: '서해(西海)',
        readingToken: '서',
        meaning: '한반도 서쪽의 바다.',
        sentence: '서해 조석 차는 해안 활동 계획에 큰 영향을 준다.',
        usageNote: '西가 바다의 위치를 나타낸다.'
      },
      {
        word: '서문(西門)',
        readingToken: '서',
        meaning: '서쪽에 난 문.',
        sentence: '행사장 서문은 퇴장 동선으로 지정해 혼잡을 분산했다.',
        usageNote: '西가 시설 위치 정보를 제공한다.'
      },
      {
        word: '서북(西北)',
        readingToken: '서',
        meaning: '서쪽과 북쪽 사이의 방향.',
        sentence: '서북 방향 구름대가 발달하면 기온 변화가 빠르게 나타난다.',
        usageNote: '西가 복합 방향 표현의 한 축을 이룬다.'
      }
    ]
  },
  先: {
    char: '先',
    reading: '선',
    meaning: '먼저',
    entries: [
      {
        word: '선생(先生)',
        readingToken: '선',
        meaning: '학생을 가르치는 사람을 높여 부르는 말.',
        sentence: '선생의 피드백을 바로 반영하면 학습 속도가 빨라진다.',
        usageNote: '先이 먼저 가르치는 사람의 의미를 만든다.'
      },
      {
        word: '우선(優先)',
        readingToken: '선',
        meaning: '중요도나 순서에서 먼저 함.',
        sentence: '우선순위를 정해 일하면 시간 부족 문제를 줄일 수 있다.',
        usageNote: '先이 순서를 앞세우는 뜻을 담당한다.'
      },
      {
        word: '선행(先行)',
        readingToken: '선',
        meaning: '앞서 먼저 나아감.',
        sentence: '선행 연구를 검토하면 같은 시행착오를 반복하지 않을 수 있다.',
        usageNote: '先이 시간·순서상 앞섬을 나타낸다.'
      },
      {
        word: '선두(先頭)',
        readingToken: '선',
        meaning: '맨 앞자리.',
        sentence: '선두 그룹은 페이스 조절을 잘해야 전체 흐름이 안정된다.',
        usageNote: '先이 위치상 가장 앞을 뜻한다.'
      },
      {
        word: '선조(先祖)',
        readingToken: '선',
        meaning: '먼 조상.',
        sentence: '선조 기록은 가문사뿐 아니라 지역사의 단서를 제공하기도 한다.',
        usageNote: '先이 시간상 앞선 세대를 가리킨다.'
      }
    ]
  },
  室: {
    char: '室',
    reading: '실',
    meaning: '집',
    entries: [
      {
        word: '교실(敎室)',
        readingToken: '실',
        meaning: '수업을 하는 방.',
        sentence: '교실 좌석 배치를 바꾸면 토론 참여도가 높아질 수 있다.',
        usageNote: '室이 방과 공간 의미를 나타낸다.'
      },
      {
        word: '침실(寢室)',
        readingToken: '실',
        meaning: '잠을 자는 방.',
        sentence: '침실 조명을 낮추면 수면 준비에 도움이 된다.',
        usageNote: '室이 용도별 방의 기능을 드러낸다.'
      },
      {
        word: '실내(室內)',
        readingToken: '실',
        meaning: '건물 안쪽.',
        sentence: '실내 공기 질 관리는 집중력 유지와 건강에 모두 중요하다.',
        usageNote: '室이 실내 공간 범위를 의미한다.'
      },
      {
        word: '왕실(王室)',
        readingToken: '실',
        meaning: '왕과 그 가족이 속한 집안.',
        sentence: '왕실 기록은 정치사와 의례 문화를 이해하는 데 중요한 자료다.',
        usageNote: '室이 집안·가문 의미로 확장되어 쓰인다.'
      },
      {
        word: '교무실(敎務室)',
        readingToken: '실',
        meaning: '학교에서 교무 업무를 보는 사무실.',
        sentence: '교무실 공지는 학생 생활과 직결되므로 전달 시점이 중요하다.',
        usageNote: '室이 업무 공간의 성격을 분명히 한다.'
      }
    ]
  },
  十: {
    char: '十',
    reading: '십',
    meaning: '열',
    entries: [
      {
        word: '십월(十月)',
        readingToken: '십',
        meaning: '일 년의 열 번째 달.',
        sentence: '십월에는 일교차가 커서 건강 관리에 신경 써야 한다.',
        usageNote: '十이 숫자 10의 의미를 나타낸다.'
      },
      {
        word: '십분(十分)',
        readingToken: '십',
        meaning: '열 분.',
        sentence: '회의 시작 전 십분만 투자해 안건을 정리하면 논의가 훨씬 효율적이다.',
        usageNote: '十이 시간 단위 수량을 구성한다.'
      },
      {
        word: '십자(十字)',
        readingToken: '십',
        meaning: '십(+) 모양의 글자나 형태.',
        sentence: '도로의 십자 교차로에서는 보행자 우선 신호를 먼저 확인해야 한다.',
        usageNote: '十이 형태와 숫자 의미를 함께 가진다.'
      },
      {
        word: '십중팔구(十中八九)',
        readingToken: '십',
        meaning: '열 중 여덟아홉이라는 뜻으로 거의 대부분을 이르는 말.',
        sentence: '준비를 충분히 하면 십중팔구 예상 문제를 빠르게 해결할 수 있다.',
        usageNote: '十이 관용 표현에서 기준 수량 역할을 한다.'
      },
      {
        word: '십대(十代)',
        readingToken: '십',
        meaning: '열 살부터 열아홉 살까지의 나이대.',
        sentence: '십대 시기에는 습관 형성이 평생 학습 태도에 큰 영향을 준다.',
        usageNote: '十이 연령 범주를 나타내는 핵심 수가 된다.'
      }
    ]
  },
  五: {
    char: '五',
    reading: '오',
    meaning: '다섯',
    entries: [
      {
        word: '오월(五月)',
        readingToken: '오',
        meaning: '일 년의 다섯 번째 달.',
        sentence: '오월에는 야외 활동이 늘어 체력 관리 계획을 세우기 좋다.',
        usageNote: '五가 숫자 5의 의미를 분명히 한다.'
      },
      {
        word: '오십(五十)',
        readingToken: '오',
        meaning: '쉰.',
        sentence: '오십 분 단위 집중 학습은 휴식 계획과 함께 운영하면 효과가 좋다.',
        usageNote: '五가 수량 표현에서 기본 요소로 쓰인다.'
      },
      {
        word: '오감(五感)',
        readingToken: '오',
        meaning: '시각, 청각, 후각, 미각, 촉각의 다섯 감각.',
        sentence: '오감을 활용한 학습 활동은 기억 지속 시간을 늘리는 데 도움이 된다.',
        usageNote: '五가 다섯 가지 범주를 묶는 의미를 만든다.'
      },
      {
        word: '오대양(五大洋)',
        readingToken: '오',
        meaning: '지구의 다섯 큰 바다.',
        sentence: '오대양 해류 흐름은 기후와 물류 환경에 모두 영향을 준다.',
        usageNote: '五가 분류 개수의 기준을 제공한다.'
      },
      {
        word: '오행(五行)',
        readingToken: '오',
        meaning: '동양 사상에서 만물을 이루는 다섯 기본 요소.',
        sentence: '오행 개념은 전통 사유 체계를 이해할 때 자주 등장한다.',
        usageNote: '五가 사상 체계의 구성 수를 나타낸다.'
      }
    ]
  }
};
