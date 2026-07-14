# LatinConlangDamper

Experimental research repo testing the **damping hypothesis**: that round-trip translation through Ecclesiastical Latin's constrained liturgical register converges toward a stable attractor rather than diverging — a property that would be unique among natural-language registers and analogous to the formulaic stability of Cuneiform or Church Slavonic.

## What this repo contains

- **Experimental scripts** — round-trip translation stability experiment (`scripts/stability-experiment.mjs`)
- **Constrained translator** — rule-based Ecclesiastical Latin ↔ English translator with ~2,000-word lexicon (`scripts/constrained-translator.mjs`)
- **Metrics module** — Jaccard, cosine, Levenshtein, semantic slot preservation, formula structure (`scripts/metrics.mjs`)
- **Research paper** — full thesis, theoretical framework, experimental results (`DOCS/constrained-latin-thesis.md`)
- **Ground-truth recipe** — how to obtain copyrighted LH text for Tier 2 validation (`DOCS/ground-truth-recipe.md`)
- **Vendored PD sources** — Clementine Vulgate, Douay-Rheims, EF corpus (`missal.db`)

## What this repo does NOT contain

- Copyrighted Liturgia Horarum text (quarantined in `.tmp/lh-ground-truth/`, gitignored)
- Any reproduced LH text in any output (only aggregate metrics are published)

## Two-tier validation

| Tier | Ground truth | Purpose |
|------|-------------|---------|
| Tier 1 | EF corpus (`missal.db`, PD/MIT) | Round-trip stability — does L→E→L converge? |
| Tier 2 | Quarantined LH text (not committed) | How close does PD-synthesized text get to actual LH? |

## Bridge to StAndroidsMissal

The experiment script produces `DOCS/synthesized-texts.json` — constrained-translation outputs for OF elements keyed by liturgical position. This file is copied into StAndroidsMissal's `assets/` directory for the OF parallel view feature.

## Running

```bash
# Tier 1 only (no LH text needed)
node scripts/stability-experiment.mjs

# Tier 2 (requires quarantined LH text per DOCS/ground-truth-recipe.md)
node scripts/stability-experiment.mjs --tier2
```

## License

MIT for code. Vendored texts are public domain (Vulgate, Douay-Rheims) or MIT (Divinum Officium corpus). The research paper is CC-BY-SA 4.0.
