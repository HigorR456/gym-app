// Dev-time generator — NOT run by the app at runtime. Regenerate whenever
// assets/exercise-dataset/images/flat changes:
//
//   node scripts/generate-exercise-image-map.cjs
//
// Metro can only bundle `require()` calls it can statically see as literal
// strings, and the 1000+ exercise images are looked up dynamically at
// runtime by key (from the `exercises` table), so a plain dynamic
// `require(path)` won't work. This script generates one explicit `require`
// per file instead, which Metro bundles normally.
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'assets', 'exercise-dataset', 'images', 'flat');
const outFile = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'sqlite',
  'seed',
  'exerciseImages.generated.ts',
);

const files = fs
  .readdirSync(imagesDir)
  .filter((f) => f.endsWith('.webp'))
  .sort();

const lines = [
  '// GENERATED FILE — do not edit by hand.',
  '// Regenerate with: node scripts/generate-exercise-image-map.cjs',
  '',
  '// Keys match the WebP filenames (without extension) referenced by the',
  "// `images` JSON stored on each row of the `exercises` table — see",
  '// src/data/sqlite/seed/seedExerciseCatalog.ts.',
  'export const exerciseImages: Record<string, number> = {',
  ...files.map((file) => {
    const key = file.replace(/\.webp$/, '');
    return `  '${key}': require('../../../../assets/exercise-dataset/images/flat/${file}'),`;
  }),
  '};',
  '',
];

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Wrote ${files.length} image entries to ${path.relative(process.cwd(), outFile)}`);
