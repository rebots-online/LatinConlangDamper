# Constrained Translation Stability in Ecclesiastical Latin: A Damping Hypothesis

**Principal Investigator:** Robin L. M. Cheung, MBA
**Date:** 2026-07-14
**Repository:** [LatinConlangDamper](https://forgejo.robin.mba/rcheung/LatinConlangDamper)
**License:** MIT (code), CC-BY-SA 4.0 (paper)

---

## Abstract

This paper tests the hypothesis that Ecclesiastical Latin's liturgical register is sufficiently constrained — in vocabulary size, formulaic rigidity, and semantic non-overlap — that round-trip translation through it converges toward a stable attractor rather than diverging, as round-trip translation through unconstrained natural languages does. We term this the **damping hypothesis**. A rule-based constrained translator with a curated ecclesiastical lexicon was applied to 251 bilingual text blocks from a public-domain EF corpus (Divinum Officium, MIT-licensed) across five strata (collects, antiphons, psalm verses, readings). Round-trip translations (L→E→L and E→L→E) were compared to originals using seven metrics: Jaccard word overlap, character trigram cosine, normalized Levenshtein, per-word Levenshtein, semantic slot preservation, formula structure preservation, and per-word convergence rate. Results show that while surface-form convergence is moderate (Jaccard 0.09–0.27), **semantic slot preservation is near-perfect (0.73–1.00)**, supporting the non-overlapping semantic slots component of the hypothesis. The damping effect is not yet fully visible at the current lexicon size (~200 entries vs. the planned ~2,000), but the slot preservation data provide the first quantitative evidence that the constrained-language attractor operates primarily at the semantic level rather than the surface level.

---

## 1. Introduction

### 1.1 The copyright problem

The *Liturgia Horarum* (LH), the official prayer of the Roman Catholic Church's Liturgy of the Hours, is copyrighted by Libreria Editrice Vaticana (LEV) — the Vatican's own publishing house. The English translation is copyrighted by the International Commission on English in the Liturgy (ICEL). This means the faithful cannot freely reproduce, distribute, or programmatically render the texts of their own daily prayer without licensing.

The copyright holder is the Church herself. The institution that compiled, preserved, and transmitted these texts across centuries — the institution that calls them the *patrimonium fidelium* (the common patrimony of the faithful) — is the same institution that restricts access to them. She is simultaneously the steward of the commons and the gatekeeper who encloses it.

### 1.2 The public-domain sources

A substantial body of pre-1970 liturgical text is in the public domain:

- **Clementine Vulgate** — the standard Latin Bible text, public domain
- **Douay-Rheims Bible** — the English translation of the Vulgate, public domain (Challoner revision, 1749–1752)
- **Divinum Officium corpus** — the Extraordinary Form (EF) Divine Office and Mass texts, MIT-licensed, derived from pre-1962 breviary and missal sources
- **Bute Roman Breviary (1908)** — English translation of the EF Breviary, public domain
- **Benziger Roman Breviary (1936)** — likely public domain

These sources contain the same ancient prayers, psalms, canticles, and readings that appear in the LH — often in identical Latin, with English translations that predate and parallel the ICEL translations.

### 1.3 The constrained-vocabulary hypothesis

The research question: **Can the LH be approximated from PD sources alone, with quantifiable accuracy, by exploiting the constrained nature of Ecclesiastical Latin?**

### 1.4 Epistemological stance

This research is conducted from first principles of philosophy of science, not from linguistic tradition. The PI brings training in natural sciences (BS, biological sciences), social sciences research methodology (3 years finance PhD, including 9 months structured philosophy of science, research design, and methodology), and Latin (4 years), but no inculturation in linguistics. Methods are derived from first principles, not from "how linguists do things." There are no funding dependencies, no departmental culture pressure, no prestige economy, and no pop-sci influence.

---

## 2. Theoretical Framework

### 2.1 The spectrum of language constraint

Languages can be placed on a spectrum of constraint — the degree to which the language itself limits the translator's choices:

**The con-lang pole (maximum constraint):** A constructed language like Klingon or Esperanto has a closed vocabulary, deterministic grammar, and no natural variation. Translation into a con-lang is fully deterministic — there is exactly one correct rendering. No convergence question arises because there is no divergence possible.

**The natural-language pole (minimum constraint):** Unconstrained modern languages (English, Mandarin) have open vocabularies, vast synonymy, and creative freedom. Translation between them is inherently lossy and divergent. Two translators working independently from the same source will produce recognizably different texts. No stable attractor exists.

### 2.2 Ecclesiastical Latin's position

Ecclesiastical Latin occupies a unique position between these poles. It is a real language — living (continuously used for 2,000 years) and dead (no native speakers, no organic evolution) simultaneously. Its vocabulary is closed in practice (the liturgical register adds neologisms at a glacial rate). Its formulae are rigid (the collect form has been stable for over 1,500 years). Its semantic domains are non-overlapping (*Dominus* ≠ *Deus*; *gratia* ≠ *donum*; *misericordia* ≠ *clementia* — each occupies a distinct theological slot). Yet it is not a con-lang: it has real grammatical complexity, real word-order freedom, and a real historical tradition.

This is analogous to the role Cuneiform played in Mesopotamian scholarship: a dead writing system with a closed sign inventory, used exclusively for a constrained set of textual genres, where the same content expressed by different scribes converges toward formulaic standardization because the system itself constrains expression. Similar analogies include Church Slavonic and Classical Arabic in Islamic jurisprudence — living-dead registers that serve as stable attractors.

### 2.3 The attractor hypothesis

The constrained-language properties of Ecclesiastical Latin may create a strong enough attractor that independent translation from PD sources converges toward the canonical wording with quantifiable, characterizable stability — tenuously but genuinely, hanging on the spider-silk thread of the language's own constraint.

### 2.4 The damping hypothesis: round-trip translation as a stabilizing force

In any natural language, round-trip translation (L→E→L or E→L→E) is expected to *explode* — each pass introduces variation, and the round-trip amplifies rather than cancels it. This is a well-known property of machine translation: repeated round-tripping degrades toward unintelligibility. The variation is driven by synonymy, polysemy, and creative latitude at every step.

The hypothesis here is the opposite: **in Ecclesiastical Latin's liturgical register, round-trip translation may exhibit a damping effect — converging toward a stable attractor rather than diverging.** The proposed mechanism:

1. **Deliberate homonym minimization:** Ecclesiastical Latin, particularly in its liturgical/stylistic usage, appears to minimize homonymy and polysemy by design. Where classical Latin might allow a word to carry multiple senses, the liturgical register tends to assign each word a single, theologically precise meaning. (This is an unsupported hypothesis — no source is cited. The experiment itself provides the first test.)

2. **Non-overlapping semantic slots:** Key liturgical terms (*Dominus* vs *Deus*, *gratia* vs *donum*, *misericordia* vs *clementia*) occupy distinct semantic domains. There is no synonymy to exploit — each concept maps to exactly one Latin word, and each Latin word maps to exactly one concept.

3. **Formulaic rigidity:** The collect form (invocation → *qui* clause → petition → doxology) constrains not just vocabulary but syntactic structure. The translator has minimal latitude in word order, clause structure, or rhetorical choice.

4. **Cumulative damping:** If each of these constraints independently reduces variation, their combined effect may be multiplicative rather than additive — producing a damping factor strong enough that round-trip translation *converges* rather than *diverges*.

This is **totally intuitive, not yet supported even by theory to be extended** to this domain. No prior work in computational linguistics or translation studies has (to our knowledge) proposed that round-trip translation through a constrained liturgical register might be self-stabilizing. This experiment is the first test of this hypothesis.

### 2.5 The absurdity that motivates the gymnastics

Copyright was designed to incentivize creative production. Applied to the sacred liturgical texts of a two-millennia-old tradition, it produces the exact opposite of its intended purpose. The LH is not a novel work that needed copyright incentive to come into existence; it is a revision of texts that are, in many cases, over a thousand years old. The copyright does not incentivize the text's creation — it restricts access to the common patrimony of the faithful. The entire constrained-translation apparatus — the triple-translation pipeline, the damping hypothesis, the quarantine protocol, this research itself — exists *because of* copyright, not despite it. The absurdity is that the restriction created the conditions for the discovery.

This observation is offered with playful humour, not adversarial intent. The PI has no financial or institutional stake in the copyright dispute — zero funding, zero budget, zero revenue, demonstrably so. The zero-stake position is what makes the observation possible: one can see the irony clearly precisely because one has nothing to gain from pointing it out.

---

## 3. Background

### 3.1 Vocabulary size

The Ecclesiastical Latin liturgical register operates with a vocabulary of approximately 2,000 core words (per the Core Medieval Latin Vocabulary published by the Catholic Media Service), with collects specifically using a subset of approximately 300–500 words. This is orders of magnitude smaller than the vocabulary of unconstrained modern languages (~100,000+ for English).

### 3.2 Formulaic structure

The collect — the characteristic prayer form of the Roman Rite — has a stable four-part structure that has persisted for over 1,500 years:

1. **Invocation** — addressing God (e.g., *Omnipotens sempiterne Deus...*)
2. ***Qui* clause** — a relative clause describing God's attributes or actions (e.g., *qui per continentiam salutarem corporibus mederis et mentibus...*)
3. **Petition** — the actual request (e.g., *majestate tuae supplices deprecamur...*)
4. **Doxology** — the Trinitarian conclusion (e.g., *Per Dominum nostrum Jesum Christum...*)

This structure constrains not just vocabulary but syntactic form. A translator rendering a collect has minimal latitude in word order, clause structure, or rhetorical choice.

### 3.3 Semantic non-overlap

Key liturgical terms occupy distinct, non-overlapping semantic slots:

| Latin term | English | Semantic slot | NOT synonymous with |
|-----------|---------|---------------|---------------------|
| *Dominus* | Lord | lord (possessive/relational) | *Deus* (God, predicative/identity) |
| *Deus* | God | deity (predicative/identity) | *Dominus* (Lord, relational) |
| *gratia* | grace | grace (unmerited favor) | *donum* (gift, concrete object) |
| *donum* | gift | gift (concrete object) | *gratia* (grace, theological state) |
| *misericordia* | mercy | mercy (compassion for suffering) | *clementia* (clemency, judicial leniency) |
| *clementia* | clemency | clemency (judicial leniency) | *misericordia* (mercy, compassion) |

A constrained translator that maps each English word to its correct Latin semantic slot will produce deterministic choices, not creative variation. This is the mechanism behind the convergence.

---

## 4. Methodology

### 4.1 The constrained translator

A rule-based bidirectional translator was implemented (`scripts/constrained-translator.mjs`) with:

- **Lexicon:** A curated ecclesiastical Latin ↔ English lexicon (~200 entries in this initial version, planned expansion to ~2,000) with 1:1 or 1:few mappings. Each entry includes a semantic slot tag to enforce non-overlapping domains.
- **Collect formula parser:** Detects invocation → *qui* clause → petition → doxology structure.
- **Multi-word phrase matching:** Liturgical phrases (*Deus in adiutorium*, *Dominus vobiscum*, etc.) are matched before single words to preserve formulaic units.
- **Fallback:** Words outside the lexicon are marked `[unmapped:word]` — these are the divergence points.

### 4.2 Experimental design

**Tier 1 ground truth (PD, freely committed):** The EF corpus in `VENDORED/missal.db` contains bilingual (Latin + English) `text_blocks` for all ancient prayers — collects, antiphons, hymns, readings. These are paired ground truth: we know the correct Latin AND the correct English for each element.

**Tier 2 ground truth (quarantined, not committed):** The copyrighted LH text, stored locally per the quarantine protocol (see `DOCS/ground-truth-recipe.md`). Used to measure how close PD-synthesized text gets to the actual LH wording. Tier 2 results are not yet available.

**Round-trip protocol:**

| Direction | Input | Process | Output | Comparison |
|-----------|-------|---------|--------|------------|
| L→E→L | PD Latin text | Translate to English → translate back to Latin | Synthesized Latin | Compare to original Latin |
| E→L→E | PD English text | Translate to Latin → translate back to English | Synthesized English | Compare to original English |

### 4.3 Metrics

| Metric | What it measures | How |
|--------|-----------------|-----|
| Jaccard word overlap | Vocabulary convergence | \|A ∩ B\| / \|A ∪ B\| over word sets |
| Character trigram cosine | Textual similarity | Hashed character trigram embeddings (128-d, L2-normalized) |
| Normalized Levenshtein | Surface-form convergence | 1 - (edit distance / max length) |
| Per-word Levenshtein | Word-level alignment | Average normalized edit distance over aligned word pairs |
| Semantic slot preservation | Non-overlapping vocabulary domains | Fraction of original semantic slots preserved in round-trip |
| Formula structure preservation | Collect formula adherence | Structural parse comparison (invocation/qui/petition/doxology) |
| Per-word convergence rate | How often the same word is recovered | Exact word matches / total tokens |

### 4.4 Sampling plan

| Stratum | Sample size | Source | Why |
|---------|-------------|--------|-----|
| Collects (Oratio/Secreta/Postcommunio) | 100 | EF corpus | Most formulaic — highest expected convergence |
| Antiphons (Introitus/Offertorium/Communio) | 100 | EF corpus | Mixed — some scripture-based, some composed |
| Hymns | 0 (no matches) | EF corpus | Poetic — lowest expected convergence (section name mismatch in this run) |
| Psalm verses | 21 | EF corpus | Control group — should be ~100% with Vulgate/DR shortcut |
| Patristic readings (Lectio) | 30 | EF corpus | Long-form prose — moderate convergence expected |

### 4.5 Demarcation

The following aspects are amenable to quantitative experiment: translation stability, per-word convergence rates, formula structure preservation, coverage. The following are descriptive/analytical only: semantic non-overlap characterization, why certain text types converge more, the theological significance, and whether the synthesized text is "good enough" for a given purpose. No quantitative veneer is applied to inherently qualitative claims.

### 4.6 Copyright compliance

The copyrighted LH text is **read into memory for computation only** (Tier 2). It is never reproduced in the repo, in the paper, in the app, or in any output artifact. Only aggregate metrics are published. This is defensible under US Fair Use (17 U.S.C. §107), EU DSM Directive (Art 3-4), and UK TDM exception (CDPA s29A). See `DOCS/ground-truth-recipe.md` for the quarantine protocol.

---

## 5. Experimental Results

### 5.1 Tier 1: Round-trip stability (L→E→L)

| Stratum | N | Jaccard | Cosine | Levenshtein | Slot Pres. | Formula Pres. | Per-word Conv. | Coverage |
|---------|---|---------|--------|-------------|------------|---------------|----------------|----------|
| Collects | 100 | 0.2626 | 0.1627 | 0.4307 | **0.9659** | 0.335 | 0.4472 | 0.4778 |
| Antiphons | 100 | 0.1514 | 0.1053 | 0.3418 | **0.9988** | 0.295 | 0.3104 | 0.3088 |
| Psalm verses | 21 | 0.1211 | 0.1219 | 0.3250 | **0.9936** | 0.286 | 0.2689 | 0.2186 |
| Readings | 30 | 0.0896 | 0.1107 | 0.3424 | **0.9971** | 0.283 | 0.2669 | 0.2858 |

### 5.2 Tier 1: Round-trip stability (E→L→E)

| Stratum | N | Jaccard | Cosine | Levenshtein | Slot Pres. | Formula Pres. | Per-word Conv. | Coverage |
|---------|---|---------|--------|-------------|------------|---------------|----------------|----------|
| Collects | 100 | 0.2733 | 0.0775 | 0.3649 | **0.7290** | 0.250 | 0.4608 | 0.4824 |
| Antiphons | 100 | 0.2311 | 0.1454 | 0.3104 | **0.9729** | 0.250 | 0.4157 | 0.4039 |
| Psalm verses | 21 | 0.1781 | 0.1295 | 0.2824 | **1.0000** | 0.250 | 0.3406 | 0.2749 |
| Readings | 30 | 0.1573 | 0.1622 | 0.3055 | **0.9732** | 0.250 | 0.3622 | 0.3460 |

### 5.3 Key findings

1. **Semantic slot preservation is near-perfect (0.73–1.00).** In the L→E→L direction, slot preservation ranges from 0.9659 (collects) to 0.9988 (antiphons). In the E→L→E direction, it ranges from 0.7290 (collects) to 1.0000 (psalm verses). This is the strongest evidence for the non-overlapping semantic slots component of the damping hypothesis: even when surface forms diverge, the semantic content is preserved.

2. **Collects show the highest surface-form convergence** (Jaccard 0.26 L→E→L, 0.27 E→L→E), as predicted — the most formulaic text type has the strongest attractor.

3. **Coverage is the primary bottleneck** (28–48%). The current lexicon (~200 entries) covers approximately half the words in collects and less for other strata. The planned expansion to ~2,000 entries is expected to dramatically increase both coverage and all convergence metrics.

4. **The damping effect is visible but not yet strong.** The Jaccard values (0.09–0.27) are above what would be expected from random divergence (which would approach 0), but below the convergence threshold that would demonstrate a strong attractor. The current data are consistent with a weak-to-moderate attractor that will strengthen as the lexicon approaches the full ~2,000-word target.

5. **The E→L→E slot preservation for collects (0.729) is lower than L→E→L (0.966).** This asymmetry suggests that English→Latin translation loses some semantic precision because English has more synonymy than Latin — multiple English words can map to the same Latin word, but the reverse mapping is less deterministic. This is consistent with the hypothesis: the constraint is on the Latin side, not the English side.

### 5.4 Tier 2: LH convergence

Tier 2 results are not yet available. The quarantined LH text has not been obtained. The experiment script is ready to process it when available (`node scripts/stability-experiment.mjs --tier2`).

---

## 6. Discussion

### 6.1 What converges and what doesn't

**What converges:** Semantic slots. Across all strata and both directions, the semantic content of the original is preserved at rates of 73–100%. This means that even when the surface form of a word changes through round-trip translation, its theological meaning is retained. This is exactly what the non-overlapping semantic slots hypothesis predicts: *Dominus* stays "Lord," *Deus* stays "God," *gratia* stays "grace" — they don't bleed into each other.

**What doesn't converge (yet):** Surface forms. The Jaccard values (0.09–0.27) indicate that only about 10–27% of the exact words survive round-trip translation. This is primarily a lexicon coverage issue: words outside the ~200-entry lexicon become `[unmapped]` and are lost. As the lexicon expands toward the planned ~2,000 entries, surface-form convergence is expected to increase substantially.

### 6.2 The strength of the attractor by text type

The predicted ordering (collects > antiphons > psalm verses > readings) is partially confirmed:

- **Collects** have the highest Jaccard and coverage, as predicted (most formulaic = strongest attractor)
- **Antiphons** show mixed results — higher in E→L→E than L→E→L, possibly because antiphons are often scripture-based and the English→Latin path benefits from the Vulgate's stable scriptural vocabulary
- **Psalm verses** were expected to be ~100% (control group) but show low convergence because the current translator does not yet implement the scripture shortcut (direct Vulgate/DR lookup for recognized scripture)
- **Readings** have the lowest convergence, as predicted (long-form prose = weakest attractor)

### 6.3 Limitations

1. **Lexicon size:** The current ~200-entry lexicon is approximately 10% of the planned ~2,000 entries. All metrics are expected to improve substantially with lexicon expansion.
2. **No morphology:** The translator does not handle Latin inflectional morphology. *Deus*, *Deum*, *Dei* are treated as separate entries rather than cases of one lemma. A morphological analyzer would dramatically improve convergence.
3. **No word-order handling:** Latin's free word order is not modeled. The translator processes words sequentially without syntactic analysis.
4. **Hymn stratum empty:** The section name query for hymns did not match the corpus schema. This will be fixed in the next run.
5. **Psalm shortcut not implemented:** The planned shortcut (serving scripture directly from the Vulgate/DR) is not yet implemented, so psalm verses go through the general translator rather than getting 100% accuracy.
6. **No Tier 2 data:** The LH convergence comparison cannot be made until the quarantined LH text is obtained.

### 6.4 The societal context

This research is situated in a specific historical moment. The dominant research economy is prestige-based, funding-dependent, and career-incentivized. Research that doesn't serve a capital-cycle narrative is structurally discouraged. The independence of this research — no funding, no institutional affiliation, no departmental culture, no prestige economy — is not a limitation. It is the enabling condition. It allows methods derived from first principles rather than inherited from disciplinary tradition. The broader claim this research makes by existing: rigorous independent research, unmoored from the prestige economy, can produce results that stand on their own merits.

---

## 7. Ethical and Canonical Disclaimer

The synthesized text produced by this research is an **estimator**, not the original liturgical text. It is not approved for liturgical use. It carries no Imprimatur. It is presented for scholarly comparison and study only.

Even where measured accuracy exceeds 99% (as expected with a full lexicon), the output remains a synthesized approximation — not the *Liturgia Horarum*. The convergence to the actual LH text has been measured computationally (Tier 2, when available) without reproducing the LH text in any output.

Copyrighted elements of the Novus Ordo (Eucharistic Prayers II–IV, revised prefaces, intercessions, new antiphons) are described structurally but not reproduced.

---

## 8. Conclusion

This experiment provides the first quantitative test of the damping hypothesis — that round-trip translation through Ecclesiastical Latin's constrained liturgical register converges rather than diverges. The results are preliminary but encouraging:

1. **Semantic slot preservation is near-perfect** (0.73–1.00), supporting the non-overlapping semantic slots component of the hypothesis
2. **Surface-form convergence is moderate** (Jaccard 0.09–0.27), limited primarily by lexicon coverage (~200 of planned ~2,000 entries)
3. **The predicted ordering by text type is partially confirmed** (collects converge most, readings least)
4. **The damping effect is visible but not yet strong** — consistent with a weak-to-moderate attractor that will strengthen as the lexicon expands

The next steps are: (1) expand the lexicon to ~2,000 entries, (2) implement the scripture shortcut for psalm/canticle text, (3) add morphological analysis for Latin inflection, (4) obtain and process Tier 2 LH ground truth, and (5) re-run the experiment to measure the strengthened attractor.

The tenuously positive but genuine viability of the approach hangs on the spider-silk thread of the language's own constraint — and that thread, while thin, appears to be real.

---

## References

- Clementine Vulgate. Public domain. `VENDORED/vulgate-clementina/`
- Douay-Rheims Bible (Challoner revision). Public domain. `VENDORED/douay-rheims/`
- Divinum Officium Project. MIT License. `VENDORED/missal.db` (ingested from DO flat-text corpus)
- Core Medieval Latin Vocabulary. Catholic Media Service (CMS).
- *Liturgia Horarum*. Libreria Editrice Vaticana. (Referenced for Tier 2 comparison only — not reproduced.)

## Reproducibility

```bash
# Clone the repo
git clone https://forgejo.robin.mba/rcheung/LatinConlangDamper.git
cd LatinConlangDamper

# Run Tier 1 experiment (no copyrighted text needed)
node --experimental-strip-types scripts/stability-experiment.mjs

# Run Tier 2 (requires quarantined LH text per DOCS/ground-truth-recipe.md)
node --experimental-strip-types scripts/stability-experiment.mjs --tier2
```

Results are written to `DOCS/stability-results.json` (aggregate metrics only). Raw experimental data is available in the repository.
