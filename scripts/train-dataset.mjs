import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawCsvPath = path.join(root, 'data', 'raw', 'laws-and-acts-of-india', 'indian_laws_and_acts_v2.csv');
const generatedDatasetPath = path.join(root, 'src', 'data', 'lawsAndActs.ts');

function runNodeScript(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (fs.existsSync(rawCsvPath)) {
  console.log('Raw law CSV found. Rebuilding src/data/lawsAndActs.ts...');
  runNodeScript(path.join(root, 'scripts', 'prepare-law-dataset.mjs'));
} else if (fs.existsSync(generatedDatasetPath)) {
  console.log('Raw law CSV not found. Using existing generated src/data/lawsAndActs.ts.');
  console.log(`To rebuild from raw data later, place the CSV at: ${rawCsvPath}`);
} else {
  console.error('No trainable law dataset was found.');
  console.error(`Expected raw CSV: ${rawCsvPath}`);
  console.error(`Or generated dataset: ${generatedDatasetPath}`);
  process.exit(1);
}

console.log('Generating local law embedding index...');
runNodeScript(path.join(root, 'scripts', 'generate-embeddings.ts'));

console.log('Running retrieval accuracy evaluation...');
runNodeScript(path.join(root, 'scripts', 'eval-accuracy.ts'));

console.log('Running answer generation verification...');
runNodeScript(path.join(root, 'scripts', 'verify-answers.ts'));

console.log('Dataset training complete.');
