# Ground-Truth Recipe: Obtaining Copyrighted LH Text for Tier 2 Validation

This document describes how to obtain the copyrighted *Liturgia Horarum* (LH) text for Tier 2 convergence validation. The text itself is **never committed to this repository** — it is stored locally in `.tmp/lh-ground-truth/` (gitignored) and read into memory only for computational comparison.

## Legal basis

Using copyrighted text as computational ground truth — without reproducing it in any output — is defensible under:

- **US Fair Use (17 U.S.C. §107)**: research purpose, published factual work, internal computation only, no market substitution
- **EU DSM Directive (Art 3-4)**: text-and-data-mining for scientific research
- **UK TDM exception (CDPA s29A)**: non-commercial research

Only aggregate metrics (convergence rates, similarity scores) are published. No LH text is reproduced in the repo, the paper, the app, or any output artifact.

## Sources to obtain

### Latin typical edition

- **Title:** *Liturgia Horarum iuxta ritum Romanum, editio typica altera*
- **Publisher:** Libreria Editrice Vaticana (LEV)
- **ISBN:** 88-209-6104-8 (4-volume set)
- **Purchase:** [LEV online bookstore](https://www.libreriaeditricevaticana.va) or Catholic bookstores (e.g., [Loome Theological Booksellers](https://www.loome.com))

### English ICEL edition

- **Title:** *Liturgy of the Hours* (ICEL translation)
- **Publisher:** International Commission on English in the Liturgy (ICEL) / Catholic Book Publishing Corp
- **ISBN:** 0-89942-957-7 (4-volume set)
- **Purchase:** [Catholic Book Publishing](https://www.catholicbookpublishing.com) or Amazon

### Alternative: AELF (French)

- **Title:** *Liturgie des Heures* (AELF translation)
- **Publisher:** Association Épiscopale Liturgique pour les pays Francophones
- **Website:** [AELF](https://www.aelf.org)
- **Note:** AELF text is available online but is copyrighted; the same quarantine applies

## Directory structure

Once obtained, store the text as plain UTF-8 files in this structure:

```
.tmp/lh-ground-truth/
├── latin/
│   ├── laudes/
│   │   ├── week1-sunday.txt
│   │   ├── week1-monday.txt
│   │   └── ...
│   ├── vesperae/
│   │   └── ...
│   ├── officium-lectionis/
│   │   └── ...
│   └── completorium/
│       └── ...
├── english/
│   ├── laudes/
│   │   └── ...
│   └── ...
└── manifest.json
```

Each file should contain the complete text for that hour on that day, with elements separated by blank lines and labeled with a header line starting with `#`:

```
# Oratio
Deus, qui nobis sub Sacramento mirabili...
# Hymnus
Lucis Creator optime...
```

### manifest.json

```json
{
  "latin_edition": "LEV editio typica altera, 2000",
  "english_edition": "ICEL 1975, Catholic Book Publishing",
  "volumes": ["Advent/Christmas", "Lent/Easter", "Ordinary Time I", "Ordinary Time II"],
  "obtained_date": "2026-07-13",
  "obtained_by": "PI (personal copy, purchased)"
}
```

## Statement

The user reproducing this experiment must obtain their own copy of the LH text under applicable copyright law. The copyrighted text never enters this repository. The experiment script reads from `.tmp/lh-ground-truth/` if present and gracefully degrades if absent (Tier 1 only).
