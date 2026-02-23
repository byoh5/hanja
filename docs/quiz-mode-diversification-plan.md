# Quiz Mode Diversification Proposal (HanjaStep)

- 작성일: 2026-02-23
- 대상: `src/pages/QuizPage.tsx` 중심 퀴즈 확장
- 목적: 현재 "뜻 고르기" 편중 구조를 다중 회상/변별/전이 학습 구조로 전환

## 1) 왜 확장해야 하는가 (요약)

현재 프로젝트는 퀴즈 모드 타입이 타입 시스템/문제 생성기에는 존재하지만, 화면 레벨에서 사실상 `meaning`으로 고정되어 있습니다. (현 코드: `const QUIZ_MODE: QuizMode = 'meaning';`)

학습과학/문자학습 연구를 종합하면:

1. 단순 재노출보다 "회상 기반 테스트"가 지연 유지(장기 기억)에 더 강함.
2. 객관식은 유용하지만 오답 보기(lure) 노출 부작용이 있어 피드백이 필수.
3. 모드를 섞는(interleaving) 것이 유형 구분/전이 성능에 유리.
4. 한자권 문자 학습에서는 부수(semantic radical) 기반 추론과 쓰기 연습이 의미/형태 연결에 도움.

즉, "한 가지 문제 형식"이 아니라 난이도와 처리 경로가 다른 문제 형식을 계획적으로 섞어야 효과가 커집니다.

---

## 2) 웹 근거에서 뽑은 설계 원칙

### 원칙 A. 회상형을 축으로 두고 인식형을 보조로 둔다
- 근거: 테스트 효과(Testing Effect), retrieval practice가 재학습 대비 지연 파지에 유리.
- 적용: 객관식(인식형) 비중을 낮추고, 입력형/산출형(회상형)을 SRS 단계가 오를수록 늘림.

### 원칙 B. 객관식은 "즉시/지연 피드백"을 반드시 붙인다
- 근거: 객관식은 학습효과가 있지만 lure로 인한 오개념 유입 가능. 피드백이 정확도 상승 + intrusion 감소에 기여.
- 적용: 모든 객관식 문항은 정답 공개 + 짧은 설명(뜻/음/예시) 제공.

### 원칙 C. 모드 혼합(interleaving)으로 변별력 강화
- 근거: interleaving은 범주 변별/유형 전환 능력을 높임.
- 적용: 혼합 모드에서 연속 같은 유형 제한(예: 최대 2연속), 오답 유형 우선 재노출.

### 원칙 D. 한자 특성(부수/형태/쓰기)을 문제 타입에 반영
- 근거: semantic radical 지도는 미학습 글자 의미 추론 전이에 도움. 쓰기 연습은 형태/의미 매핑 강화.
- 적용: 부수 힌트형 문항, 문맥 추론형 문항, 쓰기/입력형 문항을 단계적으로 추가.

### 원칙 E. SRS 상태와 퀴즈 난이도를 연결한다
- 근거: 분산 반복 + 적응형 난이도는 장기 유지에 유리.
- 적용: NEW/LEARNING/REVIEW/MASTERED별 기본 출제 모드 가중치 설정.

---

## 3) 제안 퀴즈 모드 (우선순위 포함)

## P0 (즉시 적용 권장: 1차)

1. 뜻 고르기 (existing)
- 형식: `한자 -> 뜻` 4지선다
- 역할: 입문/진입

2. 음 고르기 (existing engine, UI 미노출)
- 형식: `한자 -> 음` 4지선다
- 역할: 음독 분리 회상

3. 한자 고르기 (existing engine, UI 미노출)
- 형식: `뜻 -> 한자` 4지선다
- 역할: 형태 변별

4. 혼합 모드 (existing engine, UI 미노출)
- 형식: meaning/reading/character 인터리빙
- 역할: 실전 전환력

## P1 (학습효과 증폭: 2차)

5. 입력형 회상 (신규)
- 형식 A: `뜻+음 -> 한자 입력`
- 형식 B: `한자 -> 음 입력`
- 역할: recognition -> recall 전환
- 비고: 초기에는 완전 자동채점 대신 정규화 비교(공백/동의어 처리) + 부분정답 규칙

6. 오답 변별 모드 (신규)
- 형식: 직전 오답/혼동군 중심 재시험
- 역할: 약점 교정
- 핵심: 오답 보기 생성 시 "비슷한 음/뜻/형태" 중심으로 구성

## P2 (데이터/엔진 확장 필요: 3차)

7. 문맥 빈칸 모드 (신규)
- 형식: 예문 빈칸 + 보기/입력
- 역할: 단일 글자 암기 -> 문맥 이해 전이
- 전제: 현재 1~7급 examples가 placeholder라 고품질 예문 보강 필요

8. 부수 추론 모드 (신규)
- 형식: `부수 힌트 + 문맥 -> 미학습 글자 의미 추론`
- 역할: 미지 문자 해독 전략 학습
- 근거: semantic radical teaching의 전이 효과

9. 쓰기 퀴즈 (신규, 고난도)
- 형식: 손글씨 입력(캔버스) 또는 단계형 self-check
- 역할: 형태-의미 연결 강화
- 전제: 채점기(필획/형태 매칭) 또는 단계별 피드백 로직 필요

---

## 4) 권장 출제 정책 (실행 가능한 기본안)

### 4-1. SRS 단계 기반 모드 가중치

- NEW: 뜻 고르기 50 / 음 고르기 30 / 한자 고르기 20
- LEARNING: 뜻 30 / 음 30 / 한자 30 / 입력형 10
- REVIEW: 뜻 20 / 음 25 / 한자 25 / 입력형 30
- MASTERED: 혼합 40 / 입력형 40 / 오답변별 20

### 4-2. 피드백 정책

- 객관식: 즉시 정오 + 1줄 설명 + 정답 음성 재생 옵션
- 입력형: 정답 공개 + 오타/유사정답 처리 결과 표시
- 세션 종료: 오답 Top N 자동 재시험 진입 버튼

### 4-3. 인터리빙/반복 제어

- 동일 타입 2회 초과 연속 금지
- 동일 글자 재출제 최소 간격(문항 수 기준) 적용
- `wrongCount` 상위 항목은 세션 전반부에 우선 배치

---

## 5) 구현 로드맵 (프로젝트 기준)

## Phase 1 (빠른 효과, 리스크 낮음)
- `QuizPage`에서 모드 선택 UI 노출 (뜻/음/한자/혼합)
- 문제 수 옵션 50 추가
- 결과 화면에 "유형별 정답률" 추가
- 예상 변경 파일:
  - `src/pages/QuizPage.tsx`
  - `src/pages/ResultPage.tsx`
  - `src/types/index.ts` (유형별 통계 필드)

## Phase 2 (학습효과 강화)
- 입력형 회상 문제 타입 추가
- 오답 변별용 distractor 생성기 개선(유사 음/뜻 우선)
- 피드백 컴포넌트(즉시 설명/정답근거) 추가
- 예상 변경 파일:
  - `src/services/quiz.ts`
  - `src/pages/QuizPage.tsx`
  - `src/services/progress.ts`

## Phase 3 (고급 확장)
- 문맥 빈칸/부수 추론 모드 도입
- 데이터 스키마 확장(예문 품질, 부수 메타)
- 쓰기 모드 PoC
- 예상 변경 파일:
  - `src/data/*`
  - `src/services/quiz.ts`
  - `src/types/index.ts`

---

## 6) 측정 지표 (확장 성과 검증)

1. D+7 퀴즈 재시도 시 정답률 변화
2. 오답 재시험 1회 내 정답 전환율
3. 입력형 문항의 정답률 추이(초기 대비)
4. 모드별 평균 응답시간/중도이탈률
5. `wrongCount` 상위군의 2주 내 감소율

권장 비교 방식:
- A안(현행: 뜻 고정) vs B안(다중 모드+피드백)
- 최소 2주, 동일 급수 사용자군 비교

---

## 7) 리스크와 대응

1. 난이도 급상승으로 이탈 증가
- 대응: NEW 단계에서는 객관식 중심 유지, 회상형은 점진 도입

2. 문맥/부수 데이터 품질 부족
- 대응: 우선 8급/7급부터 검수 데이터로 제한 오픈

3. 객관식 오답 보기로 인한 오개념 강화
- 대응: 모든 객관식에 피드백 의무화

4. 구현 복잡도 증가
- 대응: P0 -> P1 -> P2 단계 게이트 운영

---

## 8) 추천 실행안 (컨펌 요청)

### 추천안: "2단계 착수"

- Step 1 (즉시): P0 전부 + 결과화면 유형통계
- Step 2 (다음): 입력형 회상 + 오답 변별 모드
- Step 3 (후속): 문맥/부수/쓰기 모드

이 순서가 현재 코드베이스 대비 효과/리스크 균형이 가장 좋습니다.

---

## 9) 참고한 웹 자료

학습과학/평가 설계
- Roediger & Karpicke (2006), *Psychological Science*: test-enhanced learning
  - https://pubmed.ncbi.nlm.nih.gov/16507066/
- Cepeda et al. (2006), *Psychological Bulletin*: distributed practice meta-analysis
  - https://pubmed.ncbi.nlm.nih.gov/16719566/
- Karpicke & Blunt (2011), *Science*: retrieval practice vs concept mapping
  - https://pubmed.ncbi.nlm.nih.gov/21252317/
- Butler & Roediger (2008), *Memory & Cognition*: MCQ + feedback 효과
  - https://pubmed.ncbi.nlm.nih.gov/18491500/
- Little & Bjork (2016), *Memory & Cognition*: multiple-choice pretesting 효과
  - https://pubmed.ncbi.nlm.nih.gov/27177505/
- Birnbaum et al. (2013), *Memory & Cognition*: interleaving 메커니즘
  - https://pubmed.ncbi.nlm.nih.gov/23138567/
- Pan & Rickard (2018), *Psychological Bulletin*: test-enhanced learning transfer meta-analysis
  - https://pubmed.ncbi.nlm.nih.gov/29733621/

한자/중문 문자 학습
- Nguyen et al. (2017), *Frontiers in Psychology*: semantic radical teaching + transfer
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC5660119/
- Hsiung et al. (2017), *Computers in Human Behavior*: handwriting exercise 효과
  - https://www.sciencedirect.com/science/article/abs/pii/S0747563217302649
- Cao et al. (2013), *Human Brain Mapping*: writing이 Chinese reading network에 미치는 영향
  - https://pubmed.ncbi.nlm.nih.gov/22378588/

실무 제품 참고 (모드/운영 아이디어)
- Pleco Flashcards Manual (alternating/score-based subject selection)
  - https://android.pleco.com/manual/310/flash.html
- Skritter (handwriting recognition, stroke-level feedback)
  - https://skritter.com/
- Skritter Spaced Repetition
  - https://ios.skritter.com/spaced-repetition
- WaniKani Radical strategy
  - https://knowledge.wanikani.com/wanikani/japanese/radical-names/
  - https://knowledge.wanikani.com/getting-started/unlocking-kanji/

