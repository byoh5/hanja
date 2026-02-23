# Memory Learning Implementation Spec (HanjaStep)

- 문서 버전: v1.0
- 작성일: 2026-02-23
- 범위: `StudyPage`, `QuizPage`, `SRS`, `HomePage`
- 목적: 단순 재노출 중심 학습을 회상/간격/교정 중심으로 전환해 암기 효율을 높인다.

## 1. 배경 및 근거

선정한 기법과 근거:

1. `Retrieval Practice` (회상 연습)
- 근거: Roediger & Karpicke (2006), Karpicke & Blunt (2011)
- 적용 방향: 정답을 바로 보여주지 않고 먼저 떠올리게 한 뒤 확인

2. `Spacing` (간격 반복)
- 근거: Cepeda et al. (2006)
- 적용 방향: 오답 문항을 즉시 재출제하지 않고 몇 문제 뒤에 다시 출제

3. `Corrective Feedback` (교정 피드백)
- 근거: Butler & Roediger (2008)
- 적용 방향: 오답 시 정답 공개 + 설명 + 재노출로 오개념 고정 방지

## 2. 구현 범위 (이번 릴리즈)

## FR-01. 학습 모드 Active Recall 단계
- 설명: 카드 진입 시 한자만 보여주고, 사용자가 `정답 확인`을 누를 때 뜻/음을 공개한다.
- UI:
  - 상태 A: 회상 단계(정답 비공개)
  - 상태 B: 공개 단계(뜻/음/예시 표시)
- 수용 기준(AC):
  - AC-1: `암기 강화` ON일 때에만 회상 단계가 나타난다.
  - AC-2: `정답 확인` 전에는 자기평가 버튼이 비활성 상태다.
  - AC-3: 공개 시점 이후 TTS가 동작한다.

## FR-02. 3단계 자기평가(모르겠어요/헷갈려요/알겠어요)
- 설명:
  - `모르겠어요` = 기존 retry
  - `헷갈려요` = hard(강등은 하되 완전 초기화는 피함)
  - `알겠어요` = known
- SRS 정책:
  - known: 기존 정책 유지
  - hard: `streak - 1`, `interval=1`, `dueDate=+1일`, `wrongCount +1`
  - retry: 기존 정책 유지(`streak=0`, `dueDate=오늘`)
- 수용 기준(AC):
  - AC-1: hard 액션 시 `markHard` 로직이 호출된다.
  - AC-2: hard는 retry보다 덜 강한 패널티를 가진다.

## FR-03. 퀴즈 오답 간격 재출제
- 설명: 오답 문항은 동일 세션에서 1회, 기본 2문항 뒤에 자동 재출제한다.
- 제약:
  - 원문항당 1회만 재출제(무한 루프 방지)
  - 재출제 문항은 새 id(`__retry__`)를 부여한다.
- 수용 기준(AC):
  - AC-1: 오답 발생 시 재출제 문항이 큐에 삽입된다.
  - AC-2: 이미 재출제된 원문항은 다시 삽입하지 않는다.
  - AC-3: 마지막 문항 오답이어도 재출제 문항이 먼저 실행되고 종료된다.

## FR-04. 홈 화면 학습 방식 토글
- 설명: `암기 강화` / `표준` 모드를 홈에서 선택하고 영속 저장한다.
- 수용 기준(AC):
  - AC-1: 새로고침 후에도 선택 상태가 유지된다.
  - AC-2: Study/Quiz 동작이 토글 상태를 즉시 반영한다.

## 3. 비범위 (Out of Scope)

1. 필순/손글씨 인식 채점
2. 부수 추론 전용 문제 모드
3. 문맥 빈칸 데이터셋 대규모 구축

## 4. 데이터/코드 변경 요약

1. 상태 저장
- `useAppStore`에 `memoryBoostEnabled` 추가

2. SRS
- `markHard` 추가
- `applyStudyAction`에 `hard` 액션 확장

3. 학습 화면
- 회상 단계 UI + 공개 단계 UI
- 3버튼 자기평가

4. 퀴즈 화면
- 재출제 스케줄 유틸(`quizReinforcement.ts`) 추가
- 오답 간격 재출제 로직 연결

## 5. 측정 지표 (릴리즈 후)

1. `quiz_retry_scheduled` 발생 대비 재출제 문항 정답 전환율
2. `card_hard` 비율의 주차별 변화
3. 암기 강화 ON/OFF 그룹의 7일 재시도 정답률

## 6. 참고 논문 링크

1. Roediger & Karpicke (2006): https://pubmed.ncbi.nlm.nih.gov/16507066/
2. Karpicke & Blunt (2011): https://pubmed.ncbi.nlm.nih.gov/21252317/
3. Cepeda et al. (2006): https://pubmed.ncbi.nlm.nih.gov/16719566/
4. Butler & Roediger (2008): https://pubmed.ncbi.nlm.nih.gov/18491500/
