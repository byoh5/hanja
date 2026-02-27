import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const gradeFiles = [
  'src/data/grade8.ts',
  'src/data/grade7.ts',
  'src/data/grade6.ts',
  'src/data/grade5.ts',
  'src/data/grade4.ts',
  'src/data/grade3.ts',
  'src/data/grade2.ts',
  'src/data/grade1.ts'
];

function parseStringList(raw) {
  const values = [];
  const stringPattern = /'((?:\\'|[^'])*)'/g;
  for (const match of raw.matchAll(stringPattern)) {
    values.push(match[1].replace(/\\'/g, "'"));
  }
  return values;
}

function parseGrade8(content) {
  const chars = [];
  const objectPattern =
    /\{\s*char:\s*'((?:\\'|[^'])*)',\s*grade:\s*8,\s*reading:\s*'((?:\\'|[^'])*)',\s*meaning:\s*'((?:\\'|[^'])*)',\s*examples:\s*\[([^\]]*)\]\s*\}/g;

  for (const match of content.matchAll(objectPattern)) {
    chars.push({
      char: match[1].replace(/\\'/g, "'"),
      grade: 8,
      reading: match[2].replace(/\\'/g, "'"),
      meaning: match[3].replace(/\\'/g, "'"),
      examples: parseStringList(match[4])
    });
  }

  return chars;
}

function parseRawGrade(content, grade) {
  const chars = [];
  const rawPattern = /\[\s*"((?:\\"|[^"])*)"\s*,\s*"((?:\\"|[^"])*)"\s*,\s*"((?:\\"|[^"])*)"\s*\]/g;

  for (const match of content.matchAll(rawPattern)) {
    chars.push({
      char: match[1].replace(/\\"/g, '"'),
      grade,
      reading: match[2].replace(/\\"/g, '"'),
      meaning: match[3].replace(/\\"/g, '"'),
      examples: [match[1].replace(/\\"/g, '"')]
    });
  }

  return chars;
}

async function collectChars() {
  const result = [];

  for (const relativeFile of gradeFiles) {
    const fullPath = path.join(repoRoot, relativeFile);
    const content = await readFile(fullPath, 'utf8');

    if (relativeFile.endsWith('grade8.ts')) {
      result.push(...parseGrade8(content));
      continue;
    }

    const gradeMatch = relativeFile.match(/grade(\d+)\.ts$/);
    if (!gradeMatch) {
      throw new Error(`Could not resolve grade from file: ${relativeFile}`);
    }
    const grade = Number(gradeMatch[1]);
    result.push(...parseRawGrade(content, grade));
  }

  return result;
}

async function writeJson(targetPath, data) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function main() {
  const chars = await collectChars();

  const sharedPath = path.join(repoRoot, 'shared/data/hanja_chars.json');
  const flutterAssetPath = path.join(repoRoot, 'apps/flutter/assets/data/hanja_chars.json');

  await writeJson(sharedPath, chars);
  await writeJson(flutterAssetPath, chars);

  // eslint-disable-next-line no-console
  console.log(`Synced ${chars.length} characters -> shared/data and apps/flutter/assets/data`);
}

await main();
