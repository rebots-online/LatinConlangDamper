/**
 * Stability Experiment
 *
 * Tests the damping hypothesis: does round-trip translation through
 * Ecclesiastical Latin's constrained liturgical register converge?
 *
 * Tier 1: EF corpus round-trip stability (PD, no copyrighted text needed)
 * Tier 2: LH convergence distance (requires quarantined LH text)
 *
 * Usage:
 *   node scripts/stability-experiment.mjs           # Tier 1 only
 *   node scripts/stability-experiment.mjs --tier2   # Tier 1 + Tier 2
 */

import { DatabaseSync as Database } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  translateLatinToEnglish, translateEnglishToLatin,
  roundTripLatin, roundTripEnglish,
  analyzeTranslation, parseCollectStructure,
} from './constrained-translator.mjs';

import {
  computeAllMetrics, aggregateMetrics,
  jaccard, trigramCosine, normalizedLevenshtein,
} from './metrics.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'VENDORED', 'missal.db');
const DOCS_DIR = join(ROOT, 'DOCS');
const LH_DIR = join(ROOT, '.tmp', 'lh-ground-truth');

const TIER2 = process.argv.includes('--tier2');

// ─── Database access ────────────────────────────────────────────────────

function openDb() {
  const db = new Database(DB_PATH, { readOnly: true });
  return db;
}

function sampleBySection(db, sections, limit) {
  const placeholders = sections.map(() => '?').join(',');
  const stmt = db.prepare(
    `SELECT node_id, section, latin, english FROM text_blocks
     WHERE section IN (${placeholders})
       AND latin IS NOT NULL AND english IS NOT NULL
       AND length(latin) > 20 AND length(latin) < 2000
     ORDER BY RANDOM() LIMIT ?`
  );
  return stmt.all(...sections, limit);
}

function samplePsalms(db, limit) {
  // Psalm verses are in the Vulgate — use the scripture table if available,
  // otherwise sample from text_blocks where section contains 'Psalm'
  const stmt = db.prepare(
    `SELECT node_id, section, latin, english FROM text_blocks
     WHERE (section LIKE '%Psalm%' OR section LIKE '%psalm%')
       AND latin IS NOT NULL AND english IS NOT NULL
       AND length(latin) > 10 AND length(latin) < 500
     ORDER BY RANDOM() LIMIT ?`
  );
  return stmt.all(limit);
}

// ─── Experiment: Tier 1 ─────────────────────────────────────────────────

function runTier1RoundTrip(db) {
  const strata = [
    { name: 'collects', sections: ['Oratio', 'Secreta', 'Postcommunio'], limit: 100 },
    { name: 'antiphons', sections: ['Introitus', 'Offertorium', 'Communio'], limit: 100 },
    { name: 'hymns', sections: ['Hymnus', 'Hymn'], limit: 30 },
    { name: 'psalm_verses', sections: ['__psalms__'], limit: 100 },
    { name: 'readings', sections: ['Lectio', 'Lectio1', 'Lectio2', 'Lectio3'], limit: 30 },
  ];

  const results = {};

  for (const stratum of strata) {
    let samples;
    if (stratum.sections[0] === '__psalms__') {
      samples = samplePsalms(db, stratum.limit);
    } else {
      samples = sampleBySection(db, stratum.sections, stratum.limit);
    }

    console.log(`\n[${stratum.name}] Sampling ${samples.length} texts...`);

    const stratumResults = [];
    for (const sample of samples) {
      // L→E→L round-trip
      const rtLatin = roundTripLatin(sample.latin);
      const metricsL2E2L = computeAllMetrics(sample.latin, rtLatin);
      const analysisL2E2L = analyzeTranslation(rtLatin);

      // E→L→E round-trip
      const rtEnglish = roundTripEnglish(sample.english);
      const metricsE2L2E = computeAllMetrics(sample.english, rtEnglish);
      const analysisE2L2E = analyzeTranslation(rtEnglish);

      stratumResults.push({
        nodeId: sample.node_id,
        section: sample.section,
        latinRoundTrip: {
          originalLength: sample.latin.split(/\s+/).length,
          coverage: analysisL2E2L.coverage,
          unmappedWords: analysisL2E2L.unmappedWords,
          metrics: metricsL2E2L,
        },
        englishRoundTrip: {
          originalLength: sample.english.split(/\s+/).length,
          coverage: analysisE2L2E.coverage,
          unmappedWords: analysisE2L2E.unmappedWords,
          metrics: metricsE2L2E,
        },
      });
    }

    // Aggregate
    const latinAgg = aggregateMetrics(
      stratumResults.map(r => ({ metrics: r.latinRoundTrip.metrics }))
    );
    const englishAgg = aggregateMetrics(
      stratumResults.map(r => ({ metrics: r.englishRoundTrip.metrics }))
    );

    const avgCoverageL = stratumResults.reduce((a, r) => a + r.latinRoundTrip.coverage, 0) / stratumResults.length;
    const avgCoverageE = stratumResults.reduce((a, r) => a + r.englishRoundTrip.coverage, 0) / stratumResults.length;

    results[stratum.name] = {
      sampleSize: stratumResults.length,
      latinToEnglishToLatin: {
        ...latinAgg,
        avgCoverage: round(avgCoverageL, 4),
      },
      englishToLatinToEnglish: {
        ...englishAgg,
        avgCoverage: round(avgCoverageE, 4),
      },
      // Keep individual results for analysis (but don't include in published output)
      _individual: stratumResults,
    };

    console.log(`  L→E→L: Jaccard=${latinAgg.jaccard.mean}, Cosine=${latinAgg.trigramCosine.mean}, Coverage=${round(avgCoverageL, 4)}`);
    console.log(`  E→L→E: Jaccard=${englishAgg.jaccard.mean}, Cosine=${englishAgg.trigramCosine.mean}, Coverage=${round(avgCoverageE, 4)}`);
  }

  return results;
}

// ─── Experiment: Tier 2 ─────────────────────────────────────────────────

function runTier2Convergence(db) {
  if (!existsSync(LH_DIR)) {
    console.log('\n[Tier 2] No LH ground truth found at .tmp/lh-ground-truth/ — skipping Tier 2.');
    console.log('         See DOCS/ground-truth-recipe.md for how to obtain LH text.');
    return null;
  }

  console.log('\n[Tier 2] Loading quarantined LH text...');

  // Load LH text files
  const lhLatin = loadLhTexts(join(LH_DIR, 'latin'));
  const lhEnglish = loadLhTexts(join(LH_DIR, 'english'));

  if (lhLatin.length === 0 && lhEnglish.length === 0) {
    console.log('  No LH text files found. Skipping Tier 2.');
    return null;
  }

  console.log(`  Loaded ${lhLatin.length} Latin LH texts, ${lhEnglish.length} English LH texts`);

  // For each LH text, synthesize from PD sources and compare
  // (This is a simplified version — a full implementation would match
  //  LH elements to their PD Latin source texts)
  const convergenceResults = [];

  for (const lh of lhLatin.slice(0, 50)) {
    // Synthesize English from the LH Latin (simulating PD-source synthesis)
    const synthesized = translateLatinToEnglish(lh.text);
    // We can't compare to LH English directly without matching,
    // so we measure the translation coverage as a proxy
    const analysis = analyzeTranslation(synthesized);
    convergenceResults.push({
      file: lh.file,
      coverage: analysis.coverage,
      unmappedCount: analysis.unmappedCount,
    });
  }

  const avgConvergence = convergenceResults.reduce((a, r) => a + r.coverage, 0) / Math.max(convergenceResults.length, 1);

  console.log(`  Average synthesis coverage: ${round(avgConvergence, 4)}`);

  return {
    sampleSize: convergenceResults.length,
    avgCoverage: round(avgConvergence, 4),
    _individual: convergenceResults,
  };
}

function loadLhTexts(dir) {
  if (!existsSync(dir)) return [];
  const texts = [];
  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.txt')) {
        const content = readFileSync(full, 'utf-8');
        texts.push({ file: entry.name, text: content });
      }
    }
  }
  walk(dir);
  return texts;
}

// ─── Synthesized text artifact for app ──────────────────────────────────

function produceSynthesizedArtifact(db) {
  // Sample collects from EF corpus to produce synthesized OF elements
  const collects = sampleBySection(db, ['Oratio', 'Secreta', 'Postcommunio'], 50);
  const artifact = {};

  for (const c of collects) {
    const synthesized = translateLatinToEnglish(c.latin);
    const analysis = analyzeTranslation(synthesized);
    artifact[`section:${c.section}#node${c.node_id}`] = {
      section: c.section,
      latin: c.latin,
      synthesizedEnglish: synthesized,
      coverage: analysis.coverage,
      unmappedWords: analysis.unmappedWords,
    };
  }

  return artifact;
}

// ─── Main ───────────────────────────────────────────────────────────────

function round(x, dp) {
  const f = Math.pow(10, dp);
  return Math.round(x * f) / f;
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  LatinConlangDamper — Stability Experiment               ║');
  console.log('║  Testing the damping hypothesis                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nMode: ${TIER2 ? 'Tier 1 + Tier 2' : 'Tier 1 only'}`);
  console.log(`Database: ${DB_PATH}`);

  if (!existsSync(DB_PATH)) {
    console.error('ERROR: missal.db not found. Ensure VENDORED/missal.db exists.');
    process.exit(1);
  }

  const db = openDb();

  // Tier 1
  console.log('\n─── Tier 1: EF Corpus Round-Trip Stability ───');
  const tier1Results = runTier1RoundTrip(db);

  // Tier 2 (optional)
  let tier2Results = null;
  if (TIER2) {
    console.log('\n─── Tier 2: LH Convergence Distance ───');
    tier2Results = runTier2Convergence(db);
  }

  // Produce synthesized text artifact for app
  console.log('\n─── Producing synthesized text artifact for StAndroidsMissal ───');
  const synthesized = produceSynthesizedArtifact(db);
  console.log(`  ${Object.keys(synthesized).length} synthesized elements`);

  // Write outputs
  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

  // stability-results.json — aggregate metrics only (no LH text)
  const stabilityOutput = {
    experiment: 'LatinConlangDamper stability experiment',
    timestamp: new Date().toISOString(),
    tier1: stripIndividuals(tier1Results),
    tier2: tier2Results ? stripIndividuals(tier2Results) : null,
  };

  const resultsPath = join(DOCS_DIR, 'stability-results.json');
  writeFileSync(resultsPath, JSON.stringify(stabilityOutput, null, 2));
  console.log(`\n✓ Results written to ${resultsPath}`);

  // synthesized-texts.json — for app consumption
  const synthPath = join(DOCS_DIR, 'synthesized-texts.json');
  writeFileSync(synthPath, JSON.stringify(synthesized, null, 2));
  console.log(`✓ Synthesized texts written to ${synthPath}`);

  // Print summary table
  console.log('\n─── Summary ───');
  console.log('\nTier 1: Round-Trip Stability (L→E→L)');
  console.log('Stratum       | Jaccard | Cosine  | Levenst. | Slot    | Formula | Coverage');
  console.log('──────────────┼─────────┼─────────┼──────────┼─────────┼─────────┼─────────');
  for (const [name, data] of Object.entries(tier1Results)) {
    const m = data.latinToEnglishToLatin;
    console.log(
      `${name.padEnd(13)} | ${String(m.jaccard.mean).padEnd(7)} | ${String(m.trigramCosine.mean).padEnd(7)} | ${String(m.normalizedLevenshtein.mean).padEnd(8)} | ${String(m.slotPreservation?.mean ?? 'n/a').padEnd(7)} | ${String(m.formulaStructure?.mean ?? 'n/a').padEnd(7)} | ${m.avgCoverage}`
    );
  }

  console.log('\nTier 1: Round-Trip Stability (E→L→E)');
  console.log('Stratum       | Jaccard | Cosine  | Levenst. | Slot    | Formula | Coverage');
  console.log('──────────────┼─────────┼─────────┼──────────┼─────────┼─────────┼─────────');
  for (const [name, data] of Object.entries(tier1Results)) {
    const m = data.englishToLatinToEnglish;
    console.log(
      `${name.padEnd(13)} | ${String(m.jaccard.mean).padEnd(7)} | ${String(m.trigramCosine.mean).padEnd(7)} | ${String(m.normalizedLevenshtein.mean).padEnd(8)} | ${String(m.slotPreservation?.mean ?? 'n/a').padEnd(7)} | ${String(m.formulaStructure?.mean ?? 'n/a').padEnd(7)} | ${m.avgCoverage}`
    );
  }

  db.close();
  console.log('\n✓ Experiment complete.');
}

function stripIndividuals(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const { _individual, ...rest } = obj;
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v === 'object' && v !== null) {
      rest[k] = stripIndividuals(v);
    }
  }
  return rest;
}

main();
