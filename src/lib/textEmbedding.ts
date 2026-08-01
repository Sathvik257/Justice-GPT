export const TEXT_EMBEDDING_DIMENSIONS = 96;

const stopWords = new Set([
  'about',
  'after',
  'against',
  'also',
  'and',
  'are',
  'available',
  'because',
  'been',
  'before',
  'being',
  'case',
  'candidates',
  'context',
  'current',
  'date',
  'details',
  'did',
  'does',
  'documents',
  'for',
  'from',
  'had',
  'has',
  'have',
  'incident',
  'into',
  'issue',
  'jurisdiction',
  'law',
  'legal',
  'location',
  'not',
  'offence',
  'offense',
  'our',
  'preferred',
  'reported',
  'that',
  'the',
  'their',
  'then',
  'there',
  'this',
  'section',
  'summary',
  'under',
  'was',
  'were',
  'what',
  'when',
  'where',
  'with',
  'witness',
  'your',
]);

const embeddingExpansions: Record<string, string[]> = {
  abduct: ['kidnap', 'kidnapping', 'abduction', 'ransom', 'guardian'],
  accident: ['rash', 'negligent', 'driving', 'motor', 'vehicle'],
  assault: ['hurt', 'force', 'injury', 'attack', 'criminal force'],
  blackmail: ['extortion', 'threat', 'intimidation', 'fear'],
  cheat: ['cheating', 'fraud', 'dishonest', 'forgery'],
  cyber: ['digital', 'computer', 'information technology', 'online', 'electronic'],
  defame: ['defamation', 'reputation', 'libel', 'slander'],
  domestic: ['cruelty', 'dowry', 'family', 'protection women'],
  dowry: ['cruelty', 'death', 'harassment', 'marriage'],
  extort: ['extortion', 'fear', 'threat', 'ransom'],
  fraud: ['cheating', 'dishonest', 'forgery', 'financial'],
  harassment: ['sexual harassment', 'modesty', 'woman', 'insult'],
  hack: ['cyber', 'computer', 'digital', 'identity theft'],
  kidnap: ['kidnapping', 'abduction', 'ransom', 'guardian'],
  minor: ['child', 'juvenile', 'pocso', 'children'],
  murder: ['homicide', 'killed', 'death', 'bns 103', 'ipc 302'],
  rape: ['sexual assault', 'survivor', 'consent', 'bns 64', 'ipc 376'],
  robbery: ['dacoity', 'theft', 'weapon', 'force', 'bns 309'],
  stalking: ['voyeurism', 'following', 'monitoring', 'privacy'],
  theft: ['stolen', 'property', 'dishonestly', 'bns 303', 'ipc 379'],
  threat: ['intimidation', 'criminal intimidation', 'fear', 'extortion'],
};

export function normaliseEmbeddingText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9()]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeForEmbedding(value: string) {
  const baseTokens = normaliseEmbeddingText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !stopWords.has(token));

  const expanded = baseTokens.flatMap((token) => embeddingExpansions[token] ?? []);
  const expansionTokens = expanded.flatMap((phrase) => normaliseEmbeddingText(phrase).split(' '));

  return Array.from(new Set([...baseTokens, ...expansionTokens].filter((token) => token.length > 2)));
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getFeatures(text: string) {
  const tokens = tokenizeForEmbedding(text);
  const features: string[] = [...tokens];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    features.push(`${tokens[index]} ${tokens[index + 1]}`);
  }

  tokens.forEach((token) => {
    if (token.length > 5) features.push(token.slice(0, 5), token.slice(-5));
    if (/^\d/.test(token)) features.push(`section ${token}`);
  });

  return features;
}

export function createTextEmbedding(text: string, dimensions = TEXT_EMBEDDING_DIMENSIONS) {
  const vector = Array.from({ length: dimensions }, () => 0);
  const features = getFeatures(text);

  if (features.length === 0) return vector;

  features.forEach((feature) => {
    const hash = hashString(feature);
    const index = hash % dimensions;
    const sign = hashString(`sign:${feature}`) % 2 === 0 ? 1 : -1;
    const weight = feature.includes(' ') ? 1.35 : feature.length > 6 ? 1.15 : 1;
    vector[index] += sign * weight;
  });

  const magnitude = Math.sqrt(vector.reduce((total, value) => total + value * value, 0));
  if (magnitude === 0) return vector;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function cosineSimilarity(first: number[], second: number[]) {
  const length = Math.min(first.length, second.length);
  if (length === 0) return 0;

  let dot = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    dot += first[index] * second[index];
    firstMagnitude += first[index] * first[index];
    secondMagnitude += second[index] * second[index];
  }

  if (firstMagnitude === 0 || secondMagnitude === 0) return 0;
  return dot / (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude));
}
