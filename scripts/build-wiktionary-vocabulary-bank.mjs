#!/usr/bin/env node

/**
 * Build large-scale Korean vocabulary bank per Hanja char from ko.wiktionary.org.
 *
 * Output JSON schema:
 * {
 *   generatedAt,
 *   source,
 *   perCharTarget,
 *   stats,
 *   chars: {
 *     [char]: {
 *       char,
 *       grade,
 *       reading,
 *       meaning,
 *       entries: [{ word, readingToken, meaning, sentence, usageNote, sourceUrl }]
 *     }
 *   }
 * }
 *
 * Usage:
 *   node scripts/build-wiktionary-vocabulary-bank.mjs
 *   node scripts/build-wiktionary-vocabulary-bank.mjs --grades 8,7 --per-char 5 --workers 8
 *   node scripts/build-wiktionary-vocabulary-bank.mjs --out shared/data/vocabulary_web_bank.json --resume
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_LIMIT = 80;
const DEFAULT_PER_CHAR = 5;
const DEFAULT_WORKERS = 8;
const DEFAULT_OUTPUT = 'public/data/vocabulary_web_bank.json';
const DEFAULT_REQUEST_INTERVAL_MS = 350;
const DEFAULT_NAVER_PAGE_LIMIT = 8;
const HANGUL_WORD = /^[가-힣]{2,10}$/;
const MAX_FETCH_RETRY = 4;
const NAVER_CCKO_SEARCH_ENDPOINT = 'https://hanja.dict.naver.com/api3/ccko/search';
let requestIntervalMs = DEFAULT_REQUEST_INTERVAL_MS;
let throttleChain = Promise.resolve();
let nextRequestAt = 0;
let adaptiveBackoffMs = 0;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setRequestInterval(ms) {
  if (Number.isFinite(ms) && ms >= 0) {
    requestIntervalMs = ms;
  }
}

async function waitForRequestSlot() {
  const scheduled = throttleChain.then(async () => {
    const now = Date.now();
    if (nextRequestAt > now) {
      await sleep(nextRequestAt - now);
    }
    nextRequestAt = Date.now() + requestIntervalMs + adaptiveBackoffMs;
  });

  throttleChain = scheduled.catch(() => undefined);
  await scheduled;
}

function parseArgs(argv) {
  const options = {
    grades: null,
    limit: DEFAULT_LIMIT,
    perChar: DEFAULT_PER_CHAR,
    workers: DEFAULT_WORKERS,
    out: DEFAULT_OUTPUT,
    resume: true,
    startIndex: 0,
    requestIntervalMs: DEFAULT_REQUEST_INTERVAL_MS,
    withPageParse: false,
    useFallbackSearch: false,
    requireFullCount: false,
    useNaverCcko: false,
    naverPageLimit: DEFAULT_NAVER_PAGE_LIMIT,
    chars: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];

    if (token === '--grades' && value) {
      const grades = value
        .split(',')
        .map((item) => Number.parseInt(item.trim(), 10))
        .filter((item) => Number.isFinite(item));
      options.grades = grades.length > 0 ? grades : null;
      index += 1;
      continue;
    }

    if (token === '--limit' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        options.limit = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--per-char' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        options.perChar = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--workers' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        options.workers = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--out' && value) {
      options.out = value.trim();
      index += 1;
      continue;
    }

    if (token === '--resume') {
      options.resume = true;
      continue;
    }

    if (token === '--no-resume') {
      options.resume = false;
      continue;
    }

    if (token === '--start-index' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        options.startIndex = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--request-interval' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        options.requestIntervalMs = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--with-page-parse') {
      options.withPageParse = true;
      continue;
    }

    if (token === '--with-fallback-search') {
      options.useFallbackSearch = true;
      continue;
    }

    if (token === '--no-fallback-search') {
      options.useFallbackSearch = false;
      continue;
    }

    if (token === '--require-full-count') {
      options.requireFullCount = true;
      continue;
    }

    if (token === '--allow-partial-count') {
      options.requireFullCount = false;
      continue;
    }

    if (token === '--with-naver-ccko') {
      options.useNaverCcko = true;
      continue;
    }

    if (token === '--without-naver-ccko') {
      options.useNaverCcko = false;
      continue;
    }

    if (token === '--naver-page-limit' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        options.naverPageLimit = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--chars' && value) {
      const chars = value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      options.chars = chars.length > 0 ? chars : null;
      index += 1;
      continue;
    }
  }

  return options;
}

function splitReadingToken(reading) {
  return reading
    .split(/[\/,|]/g)
    .map((item) => item.trim())
    .find((item) => item.length > 0) ?? '';
}

function unique(items) {
  return [...new Set(items)];
}

function cleanWikiText(input) {
  let text = input;

  for (let loop = 0; loop < 5; loop += 1) {
    const replaced = text.replace(/\{\{[^{}]*\}\}/g, ' ');
    if (replaced === text) {
      break;
    }
    text = replaced;
  }

  text = text
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

function stripHtmlTags(input) {
  if (!input) {
    return '';
  }

  return input.replace(/<[^>]+>/g, '');
}

function splitReadingVariants(reading) {
  return reading
    .split(/[\/,|]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizePronunciationWord(input) {
  const compact = stripHtmlTags(input).replace(/\([^)]*\)/g, '').replace(/[^가-힣]/g, '');
  return compact.trim();
}

function hasReadingVariant(word, variants) {
  if (!word || variants.length === 0) {
    return false;
  }

  return variants.some((variant) => word.includes(variant));
}

function extractKoreanSection(wikitext) {
  const start = wikitext.indexOf('== 한국어 ==');
  if (start < 0) {
    return '';
  }

  const nextSectionOffset = wikitext.slice(start + 1).search(/\n== [^=][^\n]* ==/);
  if (nextSectionOffset < 0) {
    return wikitext.slice(start);
  }

  return wikitext.slice(start, start + 1 + nextSectionOffset);
}

function parseKoreanEntry(wikitext) {
  const section = extractKoreanSection(wikitext);
  if (!section) {
    return null;
  }

  const lines = section.split(/\r?\n/);

  const etymologyLines = lines.filter((line) => line.includes('어원') && line.includes('한자'));
  const hanjaForms = [];

  for (const line of etymologyLines) {
    const matches = line.match(/[一-龥]{1,12}/g) ?? [];
    for (const form of matches) {
      hanjaForms.push(form);
    }
  }

  let firstMeaning = '';
  let firstExample = '';

  for (const line of lines) {
    if (!firstMeaning) {
      const meaningMatch = line.match(/^#(?![:*])\s*(.+)$/);
      if (meaningMatch) {
        const cleaned = cleanWikiText(meaningMatch[1]);
        if (cleaned) {
          firstMeaning = cleaned;
        }
      }
    }

    if (!firstExample) {
      const exampleMatch = line.match(/^#:?\s*(.+)$/);
      if (exampleMatch) {
        const cleaned = cleanWikiText(exampleMatch[1]);
        if (cleaned) {
          firstExample = cleaned;
        }
      }
    }

    if (firstMeaning && firstExample) {
      break;
    }
  }

  return {
    section,
    hanjaForms: unique(hanjaForms),
    meaning: firstMeaning,
    example: firstExample
  };
}

async function fetchJson(url, retries = MAX_FETCH_RETRY, extraHeaders = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    await waitForRequestSlot();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
          ...extraHeaders
        },
        signal: controller.signal
      });

      if (response.status === 429) {
        adaptiveBackoffMs = Math.min(2200, adaptiveBackoffMs + 180);
        const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '0', 10);
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2400 * attempt;
        await sleep(waitMs);
        throw new Error('HTTP 429');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      clearTimeout(timeoutId);
      adaptiveBackoffMs = Math.max(0, adaptiveBackoffMs - 40);
      return JSON.parse(text);
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        const backoff = 260 * 2 ** (attempt - 1);
        await sleep(backoff);
      }
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

async function fetchWordWikitext(title) {
  const url =
    `https://ko.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
    '&prop=revisions&rvslots=main&rvprop=content&format=json';

  const json = await fetchJson(url);
  const page = Object.values(json.query?.pages ?? {})[0];

  if (!page || page.missing !== undefined) {
    return '';
  }

  return page.revisions?.[0]?.slots?.main?.['*'] ?? '';
}

async function searchTitlesByChar(char, limit) {
  const query = `insource:/어원: 한자 \\[\\[.*${char}/ insource:/== 한국어 ==/`;
  const url =
    'https://ko.wiktionary.org/w/api.php?action=query&list=search' +
    `&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`;

  const json = await fetchJson(url);
  return (json.query?.search ?? []).map((item) => ({ title: item.title, snippet: item.snippet ?? '' }));
}

async function fallbackSearchTitles(char, limit) {
  const query = `insource:/${char}/ insource:/== 한국어 ==/`;
  const url =
    'https://ko.wiktionary.org/w/api.php?action=query&list=search' +
    `&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`;

  const json = await fetchJson(url);
  return (json.query?.search ?? []).map((item) => ({ title: item.title, snippet: item.snippet ?? '' }));
}

function extractFirstMeaningFromCcko(item) {
  const collectors = item?.meansCollector ?? [];
  for (const collector of collectors) {
    for (const mean of collector?.means ?? []) {
      const cleaned = cleanWikiText(stripHtmlTags(mean?.value ?? ''));
      if (cleaned) {
        return cleaned;
      }
    }
  }

  const abstract = cleanWikiText(stripHtmlTags(item?.expAbstract?.value ?? item?.expAbstract ?? ''));
  if (abstract) {
    return abstract;
  }

  return '네이버 한자사전 뜻 정보 확인 필요';
}

function createNaverCckoUsageNote(char, charMeaning, hanjaEntry, frequencyAdd) {
  const levelInfo =
    typeof frequencyAdd === 'string' && frequencyAdd.trim().length > 0 ? ` · ${frequencyAdd.replace(/\^/g, ', ')}` : '';

  if (hanjaEntry) {
    return `${char}(${charMeaning})가 쓰인 한자어(${hanjaEntry}) · 네이버 한자사전${levelInfo}`;
  }

  return `${char}(${charMeaning}) 계열 네이버 한자사전 표제어${levelInfo}`;
}

async function fetchNaverCckoWordPage(char, page) {
  const params = new URLSearchParams({
    query: char,
    m: 'pc',
    range: 'word',
    page: String(page)
  });

  const url = `${NAVER_CCKO_SEARCH_ENDPOINT}?${params.toString()}`;
  return fetchJson(url, MAX_FETCH_RETRY, {
    Referer: 'https://hanja.dict.naver.com/',
    'X-Requested-With': 'XMLHttpRequest'
  });
}

function chooseHanjaForm(hanjaForms, char) {
  const matched = hanjaForms
    .filter((item) => item.includes(char))
    .sort((a, b) => a.length - b.length || a.localeCompare(b, 'ko-KR'));

  return matched[0] ?? '';
}

function makeUsageNote(char, charMeaning, hanjaForm) {
  if (hanjaForm) {
    return `${char}(${charMeaning})가 포함된 한자어(${hanjaForm})입니다.`;
  }

  return `${char}(${charMeaning}) 계열 실사용 어휘입니다.`;
}

function createFallbackEntry(exampleWord, readingToken, char, charMeaning) {
  return {
    word: exampleWord,
    readingToken,
    meaning: '배정한자 데이터의 기본 예시 어휘',
    sentence: '',
    usageNote: `${char}(${charMeaning}) 기본 예시 어휘`,
    sourceUrl: 'shared/data/hanja_chars.json'
  };
}

function normalizeWord(word) {
  return word.trim().replace(/\s+/g, '');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  setRequestInterval(options.requestIntervalMs);
  const rawChars = JSON.parse(await fs.readFile('shared/data/hanja_chars.json', 'utf8'));
  const allowedChars = options.chars ? new Set(options.chars) : null;

  const targets = rawChars
    .filter((item) => (allowedChars ? allowedChars.has(item.char) : true))
    .filter((item) => (options.grades ? options.grades.includes(item.grade) : true))
    .sort((a, b) => a.grade - b.grade || a.char.localeCompare(b.char, 'ko-KR'))
    .slice(options.startIndex);

  const outPath = path.resolve(options.out);

  let existingChars = {};
  if (options.resume) {
    try {
      const existing = JSON.parse(await fs.readFile(outPath, 'utf8'));
      existingChars = existing.chars ?? {};
      console.log(`[resume] loaded existing entries: ${Object.keys(existingChars).length}`);
    } catch {
      existingChars = {};
    }
  }

  const results = { ...existingChars };
  const pageCache = new Map();

  async function getParsedPage(title) {
    const cached = pageCache.get(title);
    if (cached) {
      return cached;
    }

    const promise = (async () => {
      const wikitext = await fetchWordWikitext(title);
      if (!wikitext) {
        return null;
      }
      const parsed = parseKoreanEntry(wikitext);
      if (!parsed) {
        return null;
      }
      return parsed;
    })();

    pageCache.set(title, promise);
    return promise;
  }

  async function collectNaverCckoEntries(charInfo, neededCount, usedWords) {
    if (!options.useNaverCcko || neededCount <= 0) {
      return [];
    }

    const readingVariants = splitReadingVariants(charInfo.reading);
    const strictMatches = [];
    const relaxedMatches = [];
    const seenWords = new Set();

    for (let page = 1; page <= options.naverPageLimit; page += 1) {
      const json = await fetchNaverCckoWordPage(charInfo.char, page);
      const items = json?.searchResultMap?.searchResultListMap?.WORD?.items ?? [];

      if (items.length === 0) {
        break;
      }

      for (const item of items) {
        if (strictMatches.length >= neededCount) {
          break;
        }

        const dictTypeForm = item?.dictTypeForm ?? '';
        if (dictTypeForm !== '2' && dictTypeForm !== '6') {
          continue;
        }

        const hanjaEntry = stripHtmlTags(item?.expEntry ?? '');
        if (!hanjaEntry.includes(charInfo.char)) {
          continue;
        }

        const pronunciation = normalizePronunciationWord(item?.expKoreanPron ?? '');
        if (!HANGUL_WORD.test(pronunciation)) {
          continue;
        }

        const normalized = normalizeWord(pronunciation);
        if (!normalized || usedWords.has(normalized) || seenWords.has(normalized)) {
          continue;
        }

        const entryId = item?.entryId ? String(item.entryId) : '';
        const sourceUrl = entryId
          ? `https://hanja.dict.naver.com/#/entry/ccko/${encodeURIComponent(entryId)}`
          : `https://hanja.dict.naver.com/#/search?range=all&query=${encodeURIComponent(charInfo.char)}`;

        const candidate = {
          word: pronunciation,
          readingToken: splitReadingToken(charInfo.reading),
          meaning: extractFirstMeaningFromCcko(item),
          sentence: '',
          usageNote: createNaverCckoUsageNote(charInfo.char, charInfo.meaning, hanjaEntry, item?.frequencyAdd),
          sourceUrl
        };

        if (hasReadingVariant(pronunciation, readingVariants)) {
          strictMatches.push(candidate);
        } else {
          relaxedMatches.push(candidate);
        }
        seenWords.add(normalized);
      }
    }

    const merged = [];
    for (const item of [...strictMatches, ...relaxedMatches]) {
      if (merged.length >= neededCount) {
        break;
      }
      merged.push(item);
    }
    return merged;
  }

  let processed = 0;
  let success = 0;
  let failed = 0;

  let nextIndex = 0;

  async function flushProgress() {
    const allChars = { ...results };
    const source = options.useNaverCcko
      ? 'https://ko.wiktionary.org/w/api.php + https://hanja.dict.naver.com/api3/ccko/search'
      : 'https://ko.wiktionary.org/w/api.php';
    const output = {
      generatedAt: new Date().toISOString(),
      source,
      perCharTarget: options.perChar,
      stats: {
        targetChars: targets.length,
        processed,
        success,
        failed
      },
      chars: allChars
    };

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  }

  async function processOne(charInfo, absoluteIndex) {
    const existing = results[charInfo.char];
    const existingCount = existing && Array.isArray(existing.entries) ? existing.entries.length : 0;
    const shouldSkipExisting = options.requireFullCount ? existingCount >= options.perChar : existingCount > 0;

    if (shouldSkipExisting) {
      processed += 1;
      success += 1;
      if (processed % 50 === 0) {
        console.log(`[skip] ${processed}/${targets.length} ${charInfo.char} already ${existingCount}`);
      }
      return;
    }

    try {
      const readingToken = splitReadingToken(charInfo.reading);
      const primaryTitles = await searchTitlesByChar(charInfo.char, options.limit);
      const backupTitles =
        options.useFallbackSearch && primaryTitles.length < options.perChar
          ? await fallbackSearchTitles(charInfo.char, options.limit)
          : [];

      const mergedCandidates = [];
      const seenTitles = new Set();
      for (const candidate of [...primaryTitles, ...backupTitles]) {
        const title = candidate?.title ?? '';
        if (!title || seenTitles.has(title)) {
          continue;
        }
        seenTitles.add(title);
        mergedCandidates.push({ title, snippet: candidate.snippet ?? '' });
      }

      const candidateTitles = mergedCandidates
        .filter((candidate) => HANGUL_WORD.test(candidate.title))
        .slice(0, Math.max(options.limit, options.perChar * 3));

      const entries = [];
      const usedWords = new Set();

      for (const candidate of candidateTitles) {
        if (entries.length >= options.perChar) {
          break;
        }

        const title = candidate.title;

        const normalized = normalizeWord(title);
        if (!normalized || usedWords.has(normalized)) {
          continue;
        }

        if (options.withPageParse) {
          const parsed = await getParsedPage(title);
          if (!parsed) {
            continue;
          }

          const hasCharByForm = parsed.hanjaForms.some((form) => form.includes(charInfo.char));
          const hasCharBySection = parsed.section.includes(charInfo.char);
          if (!hasCharByForm && !hasCharBySection) {
            continue;
          }

          const hanjaForm = chooseHanjaForm(parsed.hanjaForms, charInfo.char);
          const annotatedWord = hanjaForm ? `${title}(${hanjaForm})` : title;

          entries.push({
            word: annotatedWord,
            readingToken,
            meaning: parsed.meaning || '위키낱말사전 뜻 정보 확인 필요',
            sentence: parsed.example || '',
            usageNote: makeUsageNote(charInfo.char, charInfo.meaning, hanjaForm),
            sourceUrl: `https://ko.wiktionary.org/wiki/${encodeURIComponent(title)}`
          });
        } else {
          const snippet = cleanWikiText(candidate.snippet ?? '');
          entries.push({
            word: title,
            readingToken,
            meaning: '위키낱말사전 표제어',
            sentence: '',
            usageNote: snippet || `${charInfo.char}(${charInfo.meaning}) 관련 검색 결과`,
            sourceUrl: `https://ko.wiktionary.org/wiki/${encodeURIComponent(title)}`
          });
        }

        usedWords.add(normalized);
      }

      if (entries.length < options.perChar) {
        const naverEntries = await collectNaverCckoEntries(charInfo, options.perChar - entries.length, usedWords);

        for (const naverEntry of naverEntries) {
          if (entries.length >= options.perChar) {
            break;
          }

          const normalized = normalizeWord(naverEntry.word);
          if (!normalized || usedWords.has(normalized)) {
            continue;
          }

          entries.push(naverEntry);
          usedWords.add(normalized);
        }
      }

      if (entries.length < options.perChar) {
        for (const sample of charInfo.examples ?? []) {
          if (entries.length >= options.perChar) {
            break;
          }

          const normalized = normalizeWord(sample);
          if (!normalized || usedWords.has(normalized)) {
            continue;
          }

          entries.push(createFallbackEntry(sample, readingToken, charInfo.char, charInfo.meaning));
          usedWords.add(normalized);
        }
      }

      results[charInfo.char] = {
        char: charInfo.char,
        grade: charInfo.grade,
        reading: charInfo.reading,
        meaning: charInfo.meaning,
        entries
      };

      processed += 1;
      if (entries.length > 0) {
        success += 1;
      } else {
        failed += 1;
      }

      if (processed % 20 === 0) {
        console.log(`[progress] ${processed}/${targets.length} | ${charInfo.char} | entries=${entries.length} | idx=${absoluteIndex}`);
      }

      if (processed % 100 === 0) {
        await flushProgress();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[warn] ${charInfo.char}(${charInfo.grade}) failed: ${message}`);

      const readingToken = splitReadingToken(charInfo.reading);
      const fallbackEntries = [];
      const usedWords = new Set();

      for (const sample of charInfo.examples ?? []) {
        if (fallbackEntries.length >= options.perChar) {
          break;
        }

        const normalized = normalizeWord(sample);
        if (!normalized || usedWords.has(normalized)) {
          continue;
        }

        fallbackEntries.push(createFallbackEntry(sample, readingToken, charInfo.char, charInfo.meaning));
        usedWords.add(normalized);
      }

      if (fallbackEntries.length > 0) {
        results[charInfo.char] = {
          char: charInfo.char,
          grade: charInfo.grade,
          reading: charInfo.reading,
          meaning: charInfo.meaning,
          entries: fallbackEntries
        };
      }

      processed += 1;
      if (fallbackEntries.length > 0) {
        success += 1;
      } else {
        failed += 1;
      }
    }
  }

  async function worker(workerIndex) {
    while (true) {
      const relativeIndex = nextIndex;
      nextIndex += 1;

      if (relativeIndex >= targets.length) {
        return;
      }

      const absoluteIndex = options.startIndex + relativeIndex;
      const charInfo = targets[relativeIndex];
      await processOne(charInfo, absoluteIndex);

      if (relativeIndex % 120 === 0) {
        console.log(`[worker ${workerIndex}] heartbeat ${relativeIndex}/${targets.length}`);
      }
    }
  }

  const workerCount = Math.max(1, Math.min(options.workers, targets.length));
  console.log(
    `start: targets=${targets.length}, workers=${workerCount}, perChar=${options.perChar}, limit=${options.limit}, interval=${options.requestIntervalMs}ms, parse=${options.withPageParse ? 'detail' : 'title'}, fallback=${options.useFallbackSearch}, naver=${options.useNaverCcko}, naverPages=${options.naverPageLimit}, out=${options.out}`
  );

  await Promise.all(Array.from({ length: workerCount }, (_, index) => worker(index + 1)));
  await flushProgress();

  let totalEntries = 0;
  let coveredChars = 0;
  let enoughChars = 0;
  const byGrade = new Map();

  for (const row of Object.values(results)) {
    if (!row || typeof row !== 'object') {
      continue;
    }

    const entryCount = Array.isArray(row.entries) ? row.entries.length : 0;
    totalEntries += entryCount;
    if (entryCount > 0) {
      coveredChars += 1;
    }
    if (entryCount >= options.perChar) {
      enoughChars += 1;
    }

    const grade = row.grade ?? 'unknown';
    const stats = byGrade.get(grade) ?? { chars: 0, entries: 0, enough: 0 };
    stats.chars += 1;
    stats.entries += entryCount;
    if (entryCount >= options.perChar) {
      stats.enough += 1;
    }
    byGrade.set(grade, stats);
  }

  const gradeSummary = Object.fromEntries(
    [...byGrade.entries()].sort((a, b) => Number(a[0]) - Number(b[0])).map(([grade, stats]) => [grade, stats])
  );

  console.log(
    JSON.stringify(
      {
        output: options.out,
        targetChars: targets.length,
        coveredChars,
        enoughChars,
        totalEntries,
        averageEntriesPerCoveredChar: coveredChars === 0 ? 0 : Number((totalEntries / coveredChars).toFixed(2)),
        gradeSummary
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
