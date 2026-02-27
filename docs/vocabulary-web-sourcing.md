# 어휘 웹 수집 기록 (2026-02-27)

## 수집 기준
- 소스: 위키낱말사전(ko.wiktionary.org)
- 검증 방식:
  - 어휘 표제어 페이지 존재
  - 한국어 문단(`== 한국어 ==`) 포함
  - 해당 한자(예: `少`)가 문서 원문에 포함되는지 확인
- 목적: 자동 생성 어휘를 쓰지 않고, 웹에서 확인 가능한 실사용 어휘로 `vocabularyMaterials` 보강

## 보강한 어휘 (한자당 최소 5개 충족용)

### 少(소)
- 희소성: https://ko.wiktionary.org/wiki/%ED%9D%AC%EC%86%8C%EC%84%B1
- 다소: https://ko.wiktionary.org/wiki/%EB%8B%A4%EC%86%8C

### 代(대)
- 시대: https://ko.wiktionary.org/wiki/%EC%8B%9C%EB%8C%80
- 세대: https://ko.wiktionary.org/wiki/%EC%84%B8%EB%8C%80

### 手(수)
- 박수: https://ko.wiktionary.org/wiki/%EB%B0%95%EC%88%98
- 수술: https://ko.wiktionary.org/wiki/%EC%88%98%EC%88%A0

### 話(화)
- 동화: https://ko.wiktionary.org/wiki/%EB%8F%99%ED%99%94
- 신화: https://ko.wiktionary.org/wiki/%EC%8B%A0%ED%99%94

### 印(인)
- 인장: https://ko.wiktionary.org/wiki/%EC%9D%B8%EC%9E%A5
- 봉인: https://ko.wiktionary.org/wiki/%EB%B4%89%EC%9D%B8

### 一(일)
- 통일: https://ko.wiktionary.org/wiki/%ED%86%B5%EC%9D%BC
- 일심: https://ko.wiktionary.org/wiki/%EC%9D%BC%EC%8B%AC

### 重(중)
- 중시: https://ko.wiktionary.org/wiki/%EC%A4%91%EC%8B%9C

### 菊(국)
- 산국화: https://ko.wiktionary.org/wiki/%EC%82%B0%EA%B5%AD%ED%99%94
- 천수국: https://ko.wiktionary.org/wiki/%EC%B2%9C%EC%88%98%EA%B5%AD
- 소국: https://ko.wiktionary.org/wiki/%EC%86%8C%EA%B5%AD

### 越(월)
- 월권: https://ko.wiktionary.org/wiki/%EC%9B%94%EA%B6%8C
- 추월: https://ko.wiktionary.org/wiki/%EC%B6%94%EC%9B%94

## 2차 확장 (8급 중심)
- 반영 위치: `src/data/vocabularyMaterialsGrade8.ts`
- 반영 한자: 校, 敎, 軍, 金, 南, 年, 東, 木, 門, 民, 白, 父, 北, 四, 山, 三, 生, 西, 先, 室, 十, 五
- 수집 방식:
  - 위키낱말사전 검색 API 후보 추출 스크립트 사용
  - `npm run vocab:candidates -- --chars ...` (스크립트: `scripts/collect-wiktionary-candidates.mjs`)
  - 후보 중 실사용 빈도가 높은 기본 어휘를 수동 선별

### 대표 링크 (검증용)
- 학교: https://ko.wiktionary.org/wiki/%ED%95%99%EA%B5%90
- 교육: https://ko.wiktionary.org/wiki/%EA%B5%90%EC%9C%A1
- 군인: https://ko.wiktionary.org/wiki/%EA%B5%B0%EC%9D%B8
- 금속: https://ko.wiktionary.org/wiki/%EA%B8%88%EC%86%8D
- 남부: https://ko.wiktionary.org/wiki/%EB%82%A8%EB%B6%80
- 학년: https://ko.wiktionary.org/wiki/%ED%95%99%EB%85%84
- 동양: https://ko.wiktionary.org/wiki/%EB%8F%99%EC%96%91
- 목재: https://ko.wiktionary.org/wiki/%EB%AA%A9%EC%9E%AC
- 정문: https://ko.wiktionary.org/wiki/%EC%A0%95%EB%AC%B8
- 국민: https://ko.wiktionary.org/wiki/%EA%B5%AD%EB%AF%BC
- 백색: https://ko.wiktionary.org/wiki/%EB%B0%B1%EC%83%89
- 부모: https://ko.wiktionary.org/wiki/%EB%B6%80%EB%AA%A8
- 북쪽: https://ko.wiktionary.org/wiki/%EB%B6%81%EC%AA%BD
- 사각형: https://ko.wiktionary.org/wiki/%EC%82%AC%EA%B0%81%ED%98%95
- 산맥: https://ko.wiktionary.org/wiki/%EC%82%B0%EB%A7%A5
- 삼각형: https://ko.wiktionary.org/wiki/%EC%82%BC%EA%B0%81%ED%98%95
- 생일: https://ko.wiktionary.org/wiki/%EC%83%9D%EC%9D%BC
- 서양: https://ko.wiktionary.org/wiki/%EC%84%9C%EC%96%91
- 우선: https://ko.wiktionary.org/wiki/%EC%9A%B0%EC%84%A0
- 교실: https://ko.wiktionary.org/wiki/%EA%B5%90%EC%8B%A4
- 십자: https://ko.wiktionary.org/wiki/%EC%8B%AD%EC%9E%90
- 오행: https://ko.wiktionary.org/wiki/%EC%98%A4%ED%96%89

## 전 급수 전 한자 웹 수집 (2026-02-27)
- 실행 스크립트: `scripts/build-wiktionary-vocabulary-bank.mjs`
- 실행 명령:
  - `npm run vocab:build-bank -- --per-char 5 --limit 60 --workers 12 --request-interval 120 --no-fallback-search --resume`
- 산출물: `public/data/vocabulary_web_bank.json`
- 수집 기준:
  - 기본: 위키낱말사전 검색 API (`어원: 한자 [[...]]` + 한국어 문단)
  - 실패/희소어 보완: 배정한자 기본 예시 어휘(`shared/data/hanja_chars.json`)
- 최종 커버리지:
  - 대상 한자: 3,500자
  - 어휘가 1개 이상 준비된 한자: 3,500자
  - 총 수집 어휘: 14,984개
  - 한자당 평균 어휘 수: 4.28개
  - 5개 이상 준비된 한자: 2,526자

## 1급/2급 집중 보강 (2026-02-27)
- 목적: 1급/2급의 `5개 미만` 어휘를 추가 보강
- 보강 소스:
  - 위키낱말사전 검색 API
  - 네이버 한자사전 API (`https://hanja.dict.naver.com/api3/ccko/search`)
- 실행 명령:
  - `npm run vocab:build-bank -- --grades 1,2 --per-char 5 --limit 80 --workers 8 --request-interval 120 --with-naver-ccko --require-full-count --resume --out public/data/vocabulary_web_bank.json`
- 추가 보강 결과:
  - 총 수집 어휘: 17,089개
  - 한자당 평균 어휘 수: 4.88개
  - 5개 이상 준비된 한자: 3,321자
  - 5개 미만 한자: 179자
  - 급수별 5개 미만:
    - 1급: 49자
    - 2급: 68자
    - 3급: 59자
    - 4급: 3자
- 비고:
  - 1급/2급 잔여 117자는 네이버/위키 양쪽에서 실사용 표제어가 제한적인 희소 한자(또는 표기 변형/인명용 중심) 비중이 높음.
