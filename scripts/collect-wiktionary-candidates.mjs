#!/usr/bin/env node

/**
 * Collect Korean vocabulary candidates from ko.wiktionary.org for given Hanja chars.
 *
 * Usage examples:
 *   node scripts/collect-wiktionary-candidates.mjs --chars 少,代,手
 *   node scripts/collect-wiktionary-candidates.mjs --chars 菊 --limit 120 --out tmp/wiktionary-candidates.json
 *   node scripts/collect-wiktionary-candidates.mjs --chars 越 --verify
 */

import fs from 'node:fs/promises';

const HANGUL_WORD = /^[가-힣]{1,8}$/;
const DEFAULT_RETRIES = 4;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(argv) {
  const args = {
    chars: [],
    limit: 80,
    out: '',
    verify: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];

    if (token === '--chars' && value) {
      args.chars = value.split(',').map((item) => item.trim()).filter(Boolean);
      index += 1;
      continue;
    }

    if (token === '--limit' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.limit = parsed;
      }
      index += 1;
      continue;
    }

    if (token === '--out' && value) {
      args.out = value.trim();
      index += 1;
      continue;
    }

    if (token === '--verify') {
      args.verify = true;
      continue;
    }
  }

  return args;
}

async function fetchJson(url, retries = DEFAULT_RETRIES) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      return JSON.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === retries) {
        break;
      }

      const backoff = 300 * (2 ** (attempt - 1));
      await sleep(backoff);
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

async function fetchPageWikitext(title) {
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

async function collectForChar(char, limit, verify) {
  const query = `insource:/${char}/ insource:/== 한국어 ==/`;
  const searchUrl =
    'https://ko.wiktionary.org/w/api.php?action=query&list=search' +
    `&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`;

  const searchJson = await fetchJson(searchUrl);
  const searchTitles = (searchJson.query?.search ?? []).map((item) => item.title);
  const uniqueTitles = Array.from(new Set(searchTitles));

  const candidates = [];
  for (const title of uniqueTitles) {
    if (!HANGUL_WORD.test(title)) {
      continue;
    }

    if (verify) {
      const content = await fetchPageWikitext(title);
      if (!content.includes('== 한국어 ==')) {
        continue;
      }

      if (!content.includes(char)) {
        continue;
      }
    }

    candidates.push({
      word: title,
      sourceUrl: `https://ko.wiktionary.org/wiki/${encodeURIComponent(title)}`
    });
  }

  return candidates;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.chars.length === 0) {
    throw new Error('Missing required --chars option. Example: --chars 少,代,手');
  }

  const result = {};

  for (const char of args.chars) {
    try {
      result[char] = await collectForChar(char, args.limit, args.verify);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[warn] ${char} 수집 실패: ${message}`);
      result[char] = [];
    }
  }

  const output = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: 'https://ko.wiktionary.org/w/api.php',
      chars: result
    },
    null,
    2
  );

  if (args.out) {
    await fs.writeFile(args.out, `${output}\n`, 'utf8');
    console.log(`Saved: ${args.out}`);
    return;
  }

  console.log(output);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
