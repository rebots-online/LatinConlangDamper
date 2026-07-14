/**
 * Metrics module for the stability experiment.
 *
 * Computes:
 * - Jaccard word overlap
 * - Character trigram cosine similarity (using embedText)
 * - Normalized Levenshtein edit distance
 * - Semantic slot preservation
 * - Formula structure preservation
 * - Per-word convergence rate
 */

import { embedText, cosine, normalizeText } from '../lib/embed.ts';
import { getSemanticSlot, parseCollectStructure } from './constrained-translator.mjs';

/**
 * Jaccard similarity: |A ∩ B| / |A ∪ B| over word sets.
 */
export function jaccard(a, b) {
  const setA = new Set(normalizeText(a).split(/\s+/).filter(Boolean));
  const setB = new Set(normalizeText(b).split(/\s+/).filter(Boolean));
  const intersection = [...setA].filter(w => setB.has(w));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.length / union.size : 0;
}

/**
 * Character trigram cosine similarity using the embedText function.
 */
export function trigramCosine(a, b) {
  const va = embedText(a);
  const vb = embedText(b);
  return cosine(va, vb);
}

/**
 * Levenshtein edit distance between two strings.
 */
function levenshteinRaw(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array(n + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

/**
 * Normalized Levenshtein: 1 - (editDistance / max(len_a, len_b))
 * Returns 0 (completely different) to 1 (identical).
 */
export function normalizedLevenshtein(a, b) {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (na.length === 0 && nb.length === 0) return 1;
  const dist = levenshteinRaw(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

/**
 * Per-word Levenshtein: average normalized edit distance over aligned word pairs.
 * Aligns by position (simple — no dynamic programming alignment).
 */
export function perWordLevenshtein(a, b) {
  const wa = normalizeText(a).split(/\s+/).filter(Boolean);
  const wb = normalizeText(b).split(/\s+/).filter(Boolean);
  if (wa.length === 0 && wb.length === 0) return 1;
  const maxLen = Math.max(wa.length, wb.length);
  let total = 0;
  for (let i = 0; i < maxLen; i++) {
    const wa_i = wa[i] || '';
    const wb_i = wb[i] || '';
    if (wa_i && wb_i) {
      total += normalizedLevenshtein(wa_i, wb_i);
    } else {
      total += 0; // missing word = 0 similarity
    }
  }
  return total / maxLen;
}

/**
 * Semantic slot preservation: what fraction of words retain their semantic slot
 * after round-trip translation?
 *
 * For each word in the original, get its semantic slot.
 * For each word in the round-tripped text, get its semantic slot.
 * Count how many original slots are preserved in the round-trip.
 */
export function slotPreservation(original, roundTripped) {
  const origWords = normalizeText(original).split(/\s+/).filter(Boolean);
  const rtWords = normalizeText(roundTripped).split(/\s+/).filter(Boolean);

  const origSlots = origWords.map(w => getSemanticSlot(w)).filter(Boolean);
  const rtSlots = new Set(rtWords.map(w => getSemanticSlot(w)).filter(Boolean));

  if (origSlots.length === 0) return null; // no mappable words

  let preserved = 0;
  for (const slot of origSlots) {
    if (rtSlots.has(slot)) preserved++;
  }
  return preserved / origSlots.length;
}

/**
 * Formula structure preservation: does the collect structure survive round-trip?
 * Compares the structural parse of original vs round-tripped text.
 */
export function formulaStructurePreservation(original, roundTripped) {
  const origStruct = parseCollectStructure(original);
  const rtStruct = parseCollectStructure(roundTripped);

  const checks = [
    origStruct.invocation !== null && rtStruct.invocation !== null,
    origStruct.quiClause !== null && rtStruct.quiClause !== null,
    origStruct.petition !== null && rtStruct.petition !== null,
    origStruct.doxology !== null && rtStruct.doxology !== null,
  ];

  const present = checks.filter(Boolean).length;
  const totalPossible = checks.filter((_, i) => [
    origStruct.invocation, origStruct.quiClause,
    origStruct.petition, origStruct.doxology
  ].filter(Boolean).length).length;

  return totalPossible > 0 ? present / totalPossible : null;
}

/**
 * Per-word convergence rate: what fraction of original words appear
 * (possibly in different form) in the round-tripped text?
 */
export function perWordConvergence(original, roundTripped) {
  const origWords = normalizeText(original).split(/\s+/).filter(Boolean);
  const rtWords = new Set(normalizeText(roundTripped).split(/\s+/).filter(Boolean));

  if (origWords.length === 0) return 0;

  let converged = 0;
  for (const w of origWords) {
    if (rtWords.has(w)) converged++;
  }
  return converged / origWords.length;
}

/**
 * Compute all metrics for a single text pair.
 */
export function computeAllMetrics(original, roundTripped) {
  return {
    jaccard: jaccard(original, roundTripped),
    trigramCosine: trigramCosine(original, roundTripped),
    normalizedLevenshtein: normalizedLevenshtein(original, roundTripped),
    perWordLevenshtein: perWordLevenshtein(original, roundTripped),
    slotPreservation: slotPreservation(original, roundTripped),
    formulaStructure: formulaStructurePreservation(original, roundTripped),
    perWordConvergence: perWordConvergence(original, roundTripped),
  };
}

/**
 * Aggregate metrics over a sample of text pairs.
 * Returns mean and std for each metric.
 */
export function aggregateMetrics(results) {
  const metrics = [
    'jaccard', 'trigramCosine', 'normalizedLevenshtein',
    'perWordLevenshtein', 'slotPreservation', 'formulaStructure',
    'perWordConvergence',
  ];

  const agg = {};
  for (const m of metrics) {
    const values = results.map(r => r.metrics[m]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) {
      agg[m] = { mean: null, std: null, n: 0 };
      continue;
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    agg[m] = {
      mean: round(mean, 4),
      std: round(Math.sqrt(variance), 4),
      n: values.length,
    };
  }
  return agg;
}

function round(x, dp) {
  const f = Math.pow(10, dp);
  return Math.round(x * f) / f;
}
