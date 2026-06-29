function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function maxEditDistance(token: string): number {
  if (token.length <= 3) {
    return 0;
  }
  if (token.length <= 6) {
    return 1;
  }
  return 2;
}

function subsequenceScore(query: string, target: string): number | null {
  let queryIndex = 0;
  let score = 0;
  let lastMatchIndex = -1;
  let consecutiveMatches = 0;

  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] !== query[queryIndex]) {
      continue;
    }

    score += 1;

    if (lastMatchIndex === i - 1) {
      consecutiveMatches += 1;
      score += consecutiveMatches * 4;
    } else {
      consecutiveMatches = 0;
    }

    if (i === 0 || /[\s/]/.test(target[i - 1] ?? '')) {
      score += 8;
    }

    lastMatchIndex = i;
    queryIndex += 1;
  }

  return queryIndex === query.length ? score : null;
}

function tokenScore(token: string, target: string): number {
  if (target.includes(token)) {
    return 1000 - target.indexOf(token);
  }

  const subsequence = subsequenceScore(token, target);
  if (subsequence !== null) {
    return 500 + subsequence;
  }

  const words = target.split(/[\s/]+/).filter(Boolean);
  const allowedDistance = maxEditDistance(token);
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const word of words) {
    if (word.startsWith(token) || token.startsWith(word)) {
      return 300;
    }

    const distance = levenshtein(token, word);
    if (distance < bestDistance) {
      bestDistance = distance;
    }
  }

  if (bestDistance <= allowedDistance) {
    return 200 - bestDistance * 10;
  }

  return 0;
}

export function fuzzyScore(query: string, text: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.trim().toLowerCase();

  if (!normalizedQuery) {
    return 1;
  }

  if (normalizedText.includes(normalizedQuery)) {
    return 2000 - normalizedText.indexOf(normalizedQuery);
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return 1;
  }

  return tokens.reduce((total, token) => {
    const score = tokenScore(token, normalizedText);
    return score > 0 ? total + score : 0;
  }, 0);
}

export function filterByFuzzyMatch<T>(
  items: readonly T[],
  query: string,
  getText: (item: T) => string,
): T[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [...items];
  }

  return items
    .map((item) => ({ item, score: fuzzyScore(normalizedQuery, getText(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
