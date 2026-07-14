# LatinConlangDamper — Session Context

**Last session:** 2026-07-13/14 (initiated from StAndroidsMissal workspace)
**Status:** Initial scaffold complete, first Tier 1 experiment run

## What was done this session

1. **Repo created** at ~/CascadeProjects/LatinConlangDamper
   - Origin: forgejo.robin.mba:rcheung/LatinConlangDamper
   - Mirror: github.com:rebots-online/LatinConlangDamper
   - 5 commits, all pushed to both remotes

2. **Vendored dependencies** from StAndroidsMissal:
   - missal.db (134MB, Git LFS) — EF corpus with bilingual text_blocks
   - vulgate-clementina — Clementine Vulgate (PD)
   - douay-rheims — Douay-Rheims Bible (PD)
   - lib/embed.ts + lib/normalize.ts — text embedding + normalization functions

3. **Constrained translator** (scripts/constrained-translator.mjs):
   - ~200-entry bidirectional Latin↔English lexicon with semantic slot tags
   - Collect formula parser (invocation → qui clause → petition → doxology)
   - Multi-word phrase matching for liturgical formulae
   - [unmapped:word] fallback for out-of-lexicon words

4. **Metrics module** (scripts/metrics.mjs):
   - Jaccard word overlap, trigram cosine, normalized Levenshtein
   - Per-word Levenshtein, semantic slot preservation, formula structure preservation
   - Per-word convergence rate, aggregate stats (mean/std)

5. **Experiment script** (scripts/stability-experiment.mjs):
   - Tier 1: EF corpus round-trip (L→E→L and E→L→E) — works now
   - Tier 2: LH convergence (requires quarantined LH text) — ready, awaiting data
   - Outputs: DOCS/stability-results.json + DOCS/synthesized-texts.json

6. **Research paper** (DOCS/constrained-latin-thesis.md):
   - Full 8-section paper with embedded first experimental results
   - Theoretical framework, damping hypothesis, societal context
   - Copyright compliance statement, reproducibility instructions

7. **Ground-truth recipe** (DOCS/ground-truth-recipe.md):
   - How to obtain LH text for Tier 2 validation
   - Directory structure, legal basis, quarantine protocol

## First experimental results

| Stratum | N | Jaccard (L→E→L) | Slot Pres. | Coverage |
|---------|---|-----------------|------------|----------|
| Collects | 100 | 0.2626 | 0.9659 | 0.4778 |
| Antiphons | 100 | 0.1514 | 0.9988 | 0.3088 |
| Psalm verses | 21 | 0.1211 | 0.9936 | 0.2186 |
| Readings | 30 | 0.0896 | 0.9971 | 0.2858 |

Key finding: **semantic slot preservation is near-perfect (0.73–1.00)** across all strata.

## Next steps (priority order)

1. **Expand lexicon** to ~2,000 entries (currently ~200, limiting all metrics)
2. **Implement scripture shortcut** — serve psalms/canticles directly from Vulgate/DR
3. **Add morphological analysis** — handle Latin inflection (Deus/Deum/Dei as one lemma)
4. **Fix hymn stratum** — section name query doesn't match corpus schema
5. **Obtain Tier 2 LH ground truth** per DOCS/ground-truth-recipe.md
6. **Re-run experiment** with expanded lexicon and updated translator

## Bridge to StAndroidsMissal

The experiment produces `DOCS/synthesized-texts.json` which gets copied to
StAndroidsMissal's `assets/` directory. The app's OF parallel view (steps 8-14
of the plan) consumes this artifact. Those steps depend on middleware
architectural constraints being pinned down in a separate conversation.

## Plan document

The full plan is at: /home/robin/.windsurf/plans/constrained-latin-thesis-and-feature-2c325d.md

## How to run

```bash
cd ~/CascadeProjects/LatinConlangDamper
node --experimental-strip-types scripts/stability-experiment.mjs          # Tier 1
node --experimental-strip-types scripts/stability-experiment.mjs --tier2  # Tier 1 + 2
```
