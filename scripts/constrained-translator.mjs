/**
 * Constrained Ecclesiastical Latin Translator
 *
 * Rule-based bidirectional translator using a curated lexicon of ~2,000
 * ecclesiastical Latin words with 1:1 or 1:few mappings to English.
 * The lexicon is deliberately constrained to the liturgical register:
 * each Latin word maps to exactly one English concept (non-overlapping
 * semantic slots), which is the mechanism behind the damping hypothesis.
 *
 * This is NOT a general-purpose translator. It is designed to test whether
 * round-trip translation through this constrained register converges.
 */

import { normalizeText } from '../lib/normalize.ts';

// ─── Lexicon ────────────────────────────────────────────────────────────
// Each entry: latin word → { en: english, pos: part of speech, slot: semantic slot }
// The "slot" field enforces non-overlapping semantic domains.

const LEXICON_LAT_EN = {
  // ── Deity terms (non-overlapping semantic slots) ──
  'deus':       { en: 'God',         pos: 'n', slot: 'deity' },
  'dominus':    { en: 'Lord',        pos: 'n', slot: 'lord' },
  'domine':     { en: 'O Lord',      pos: 'n', slot: 'lord_voc' },
  'christus':   { en: 'Christ',      pos: 'n', slot: 'christ' },
  'christe':    { en: 'O Christ',    pos: 'n', slot: 'christ_voc' },
  'jesus':      { en: 'Jesus',       pos: 'n', slot: 'jesus' },
  'spiritus':   { en: 'Spirit',      pos: 'n', slot: 'spirit' },
  'spiritui':   { en: 'Spirit',      pos: 'n', slot: 'spirit' },
  'spiritum':   { en: 'Spirit',      pos: 'n', slot: 'spirit' },
  'spiritus sanctus': { en: 'Holy Spirit', pos: 'n', slot: 'spirit' },

  // ── Grace/mercy/sin (non-overlapping) ──
  'gratia':     { en: 'grace',       pos: 'n', slot: 'grace' },
  'gratiam':    { en: 'grace',       pos: 'n', slot: 'grace' },
  'gratiae':    { en: 'grace',       pos: 'n', slot: 'grace' },
  'misericordia': { en: 'mercy',     pos: 'n', slot: 'mercy' },
  'misericordiam': { en: 'mercy',    pos: 'n', slot: 'mercy' },
  'misericordiae': { en: 'mercy',    pos: 'n', slot: 'mercy' },
  'clementia':  { en: 'clemency',    pos: 'n', slot: 'clemency' },
  'donum':      { en: 'gift',        pos: 'n', slot: 'gift' },
  'dona':       { en: 'gifts',       pos: 'n', slot: 'gift' },
  'peccatum':   { en: 'sin',         pos: 'n', slot: 'sin' },
  'peccata':    { en: 'sins',        pos: 'n', slot: 'sin' },
  'peccator':   { en: 'sinner',      pos: 'n', slot: 'sinner' },

  // ── Verbs (core liturgical) ──
  'quaeso':     { en: 'I beseech',   pos: 'v', slot: 'beseech' },
  'quaesumus':  { en: 'we beseech',  pos: 'v', slot: 'beseech' },
  'oro':        { en: 'I pray',      pos: 'v', slot: 'pray' },
  'oramus':     { en: 'we pray',     pos: 'v', slot: 'pray' },
  'da':         { en: 'grant',       pos: 'v', slot: 'grant' },
  'dare':       { en: 'to grant',    pos: 'v', slot: 'grant' },
  'det':        { en: 'may he grant', pos: 'v', slot: 'grant' },
  'tribue':     { en: 'grant',       pos: 'v', slot: 'grant' },
  'concede':    { en: 'grant',       pos: 'v', slot: 'grant' },
  'presta':     { en: 'grant',       pos: 'v', slot: 'grant' },
  'fac':        { en: 'make',        pos: 'v', slot: 'make' },
  'fiat':       { en: 'let it be',   pos: 'v', slot: 'be' },
  'sit':        { en: 'be',          pos: 'v', slot: 'be' },
  'sint':       { en: 'be',          pos: 'v', slot: 'be' },
  'est':        { en: 'is',          pos: 'v', slot: 'be' },
  'sunt':       { en: 'are',         pos: 'v', slot: 'be' },
  'exaudi':     { en: 'hear',        pos: 'v', slot: 'hear' },
  'audi':       { en: 'hear',        pos: 'v', slot: 'hear' },
  'respice':    { en: 'look upon',   pos: 'v', slot: 'look' },
  'intende':    { en: 'look upon',   pos: 'v', slot: 'look' },
  'libera':     { en: 'deliver',     pos: 'v', slot: 'deliver' },
  'salva':      { en: 'save',        pos: 'v', slot: 'save' },
  'sanctifica': { en: 'sanctify',    pos: 'v', slot: 'sanctify' },
  'benedic':    { en: 'bless',       pos: 'v', slot: 'bless' },
  'benedicere': { en: 'to bless',    pos: 'v', slot: 'bless' },
  'benedictio': { en: 'blessing',    pos: 'n', slot: 'bless' },
  'benedictionem': { en: 'blessing', pos: 'n', slot: 'bless' },
  'illumina':   { en: 'illuminate',  pos: 'v', slot: 'illumine' },
  'illumina':   { en: 'illuminate',  pos: 'v', slot: 'illumine' },
  'adiuva':     { en: 'help',        pos: 'v', slot: 'help' },
  'adiuva':     { en: 'help',        pos: 'v', slot: 'help' },

  // ── Adjectives ──
  'omnipotens': { en: 'almighty',    pos: 'adj', slot: 'omnipotent' },
  'omnipotentem': { en: 'almighty',  pos: 'adj', slot: 'omnipotent' },
  'sempiternus': { en: 'everlasting', pos: 'adj', slot: 'eternal' },
  'sempiterne': { en: 'everlasting', pos: 'adj', slot: 'eternal' },
  'aeternus':   { en: 'eternal',     pos: 'adj', slot: 'eternal' },
  'aeternum':   { en: 'eternal',     pos: 'adj', slot: 'eternal' },
  'aeterna':    { en: 'eternal',     pos: 'adj', slot: 'eternal' },
  'sanctus':    { en: 'holy',        pos: 'adj', slot: 'holy' },
  'sancta':     { en: 'holy',        pos: 'adj', slot: 'holy' },
  'sanctum':    { en: 'holy',        pos: 'adj', slot: 'holy' },
  'beatus':     { en: 'blessed',     pos: 'adj', slot: 'blessed' },
  'beata':      { en: 'blessed',     pos: 'adj', slot: 'blessed' },
  'gloriosus':  { en: 'glorious',    pos: 'adj', slot: 'glorious' },
  'gloriosa':   { en: 'glorious',    pos: 'adj', slot: 'glorious' },

  // ── Nouns (liturgical) ──
  'ecclesia':   { en: 'Church',      pos: 'n', slot: 'church' },
  'ecclesiam':  { en: 'Church',      pos: 'n', slot: 'church' },
  'ecclesiae':  { en: 'Church',      pos: 'n', slot: 'church' },
  'plebs':      { en: 'people',      pos: 'n', slot: 'people' },
  'populus':    { en: 'people',      pos: 'n', slot: 'people' },
  'populum':    { en: 'people',      pos: 'n', slot: 'people' },
  'fides':      { en: 'faith',       pos: 'n', slot: 'faith' },
  'spes':       { en: 'hope',        pos: 'n', slot: 'hope' },
  'caritas':    { en: 'charity',     pos: 'n', slot: 'charity' },
  'charitas':   { en: 'charity',     pos: 'n', slot: 'charity' },
  'amor':       { en: 'love',        pos: 'n', slot: 'love' },
  'pax':        { en: 'peace',       pos: 'n', slot: 'peace' },
  'lux':        { en: 'light',       pos: 'n', slot: 'light' },
  'lumen':      { en: 'light',       pos: 'n', slot: 'light' },
  'vita':       { en: 'life',        pos: 'n', slot: 'life' },
  'vita':       { en: 'life',        pos: 'n', slot: 'life' },
  'anima':      { en: 'soul',        pos: 'n', slot: 'soul' },
  'animam':     { en: 'soul',        pos: 'n', slot: 'soul' },
  'cor':        { en: 'heart',       pos: 'n', slot: 'heart' },
  'corde':      { en: 'heart',       pos: 'n', slot: 'heart' },
  'corpus':     { en: 'body',        pos: 'n', slot: 'body' },
  'corporis':   { en: 'body',        pos: 'n', slot: 'body' },
  'mens':       { en: 'mind',        pos: 'n', slot: 'mind' },
  'mentem':     { en: 'mind',        pos: 'n', slot: 'mind' },
  'caelum':     { en: 'heaven',      pos: 'n', slot: 'heaven' },
  'caeli':      { en: 'heaven',      pos: 'n', slot: 'heaven' },
  'terra':      { en: 'earth',       pos: 'n', slot: 'earth' },
  'mundus':     { en: 'world',       pos: 'n', slot: 'world' },
  'mundum':     { en: 'world',       pos: 'n', slot: 'world' },
  'regnum':     { en: 'kingdom',     pos: 'n', slot: 'kingdom' },
  'gloria':     { en: 'glory',       pos: 'n', slot: 'glory' },
  'gloriam':    { en: 'glory',       pos: 'n', slot: 'glory' },
  'gloriae':    { en: 'glory',       pos: 'n', slot: 'glory' },
  'honor':      { en: 'honor',       pos: 'n', slot: 'honor' },
  'laus':       { en: 'praise',      pos: 'n', slot: 'praise' },
  'laudem':     { en: 'praise',      pos: 'n', slot: 'praise' },
  'laudes':     { en: 'praises',     pos: 'n', slot: 'praise' },
  'nomen':      { en: 'name',        pos: 'n', slot: 'name' },
  'nomine':     { en: 'name',        pos: 'n', slot: 'name' },
  'verbum':     { en: 'word',        pos: 'n', slot: 'word' },
  'verba':      { en: 'words',       pos: 'n', slot: 'word' },
  'lex':        { en: 'law',         pos: 'n', slot: 'law' },
  'lex':        { en: 'law',         pos: 'n', slot: 'law' },

  // ── Prepositions / conjunctions ──
  'et':         { en: 'and',         pos: 'conj', slot: 'and' },
  'ac':         { en: 'and',         pos: 'conj', slot: 'and' },
  'atque':      { en: 'and',         pos: 'conj', slot: 'and' },
  'sed':        { en: 'but',         pos: 'conj', slot: 'but' },
  'autem':      { en: 'however',     pos: 'conj', slot: 'however' },
  'quia':       { en: 'because',     pos: 'conj', slot: 'because' },
  'quoniam':    { en: 'since',       pos: 'conj', slot: 'since' },
  'quod':       { en: 'that',        pos: 'conj', slot: 'that' },
  'ut':         { en: 'that',        pos: 'conj', slot: 'so_that' },
  'ne':         { en: 'lest',        pos: 'conj', slot: 'lest' },
  'si':         { en: 'if',          pos: 'conj', slot: 'if' },
  'in':         { en: 'in',          pos: 'prep', slot: 'in' },
  'per':        { en: 'through',     pos: 'prep', slot: 'through' },
  'ad':         { en: 'to',          pos: 'prep', slot: 'to' },
  'pro':        { en: 'for',         pos: 'prep', slot: 'for' },
  'ex':         { en: 'from',        pos: 'prep', slot: 'from' },
  'e':          { en: 'from',        pos: 'prep', slot: 'from' },
  'de':         { en: 'of',          pos: 'prep', slot: 'of' },
  'cum':        { en: 'with',        pos: 'prep', slot: 'with' },
  'sine':       { en: 'without',     pos: 'prep', slot: 'without' },
  'sub':        { en: 'under',       pos: 'prep', slot: 'under' },
  'super':      { en: 'upon',        pos: 'prep', slot: 'upon' },
  'contra':     { en: 'against',     pos: 'prep', slot: 'against' },
  'inter':      { en: 'among',       pos: 'prep', slot: 'among' },

  // ── Pronouns / relatives ──
  'qui':        { en: 'who',         pos: 'pron', slot: 'who' },
  'quae':       { en: 'who',         pos: 'pron', slot: 'who' },
  'quod':       { en: 'which',       pos: 'pron', slot: 'which' },
  'quos':       { en: 'whom',        pos: 'pron', slot: 'who' },
  'quas':       { en: 'whom',        pos: 'pron', slot: 'who' },
  'quorum':     { en: 'whose',       pos: 'pron', slot: 'whose' },
  'quarum':     { en: 'whose',       pos: 'pron', slot: 'whose' },
  'nos':        { en: 'us',          pos: 'pron', slot: 'us' },
  'nobis':      { en: 'us',          pos: 'pron', slot: 'us' },
  'nostri':     { en: 'us',          pos: 'pron', slot: 'us' },
  'tu':         { en: 'You',         pos: 'pron', slot: 'you' },
  'te':         { en: 'You',         pos: 'pron', slot: 'you' },
  'tui':        { en: 'You',         pos: 'pron', slot: 'you' },
  'tua':        { en: 'Your',        pos: 'pron', slot: 'your' },
  'tuas':       { en: 'Your',        pos: 'pron', slot: 'your' },
  'tuum':       { en: 'Your',        pos: 'pron', slot: 'your' },
  'sua':        { en: 'His',         pos: 'pron', slot: 'his' },
  'suum':       { en: 'His',         pos: 'pron', slot: 'his' },
  'suam':       { en: 'His',         pos: 'pron', slot: 'his' },
  'me':         { en: 'me',          pos: 'pron', slot: 'me' },
  'mea':        { en: 'my',          pos: 'pron', slot: 'my' },
  'meum':       { en: 'my',          pos: 'pron', slot: 'my' },

  // ── Collect formula markers ──
  'quaesumus':  { en: 'we beseech',  pos: 'v', slot: 'beseech' },

  // ── Doxology ──
  'per':        { en: 'through',     pos: 'prep', slot: 'through' },
  'eundem':     { en: 'the same',    pos: 'pron', slot: 'same' },
  'dominum':    { en: 'Lord',        pos: 'n', slot: 'lord' },
  'nostrum':    { en: 'our',         pos: 'pron', slot: 'our' },
  'jesum':      { en: 'Jesus',       pos: 'n', slot: 'jesus' },
  'christum':   { en: 'Christ',      pos: 'n', slot: 'christ' },
  'filium':     { en: 'Son',         pos: 'n', slot: 'son' },
  'tuum':       { en: 'Your',        pos: 'pron', slot: 'your' },
  'qui':        { en: 'who',         pos: 'pron', slot: 'who' },
  'vivit':      { en: 'lives',       pos: 'v', slot: 'live' },
  'regnat':     { en: 'reigns',      pos: 'v', slot: 'reign' },
  'imperat':    { en: 'rules',       pos: 'v', slot: 'rule' },
  'omnia':      { en: 'all things',  pos: 'pron', slot: 'all' },
  'saecula':    { en: 'ages',        pos: 'n', slot: 'ages' },
  'saeculorum': { en: 'of ages',     pos: 'n', slot: 'ages' },
  'amen':       { en: 'Amen',        pos: 'intj', slot: 'amen' },

  // ── Common liturgical phrases ──
  'in nomine':  { en: 'in the name', pos: 'phrase', slot: 'name' },
  'per dominum': { en: 'through the Lord', pos: 'phrase', slot: 'lord' },
  'jesum christum': { en: 'Jesus Christ', pos: 'phrase', slot: 'jesus' },
  'spiritum sanctum': { en: 'the Holy Spirit', pos: 'phrase', slot: 'spirit' },
  'in unitate': { en: 'in the unity', pos: 'phrase', slot: 'unity' },
  'deus in adiutorium': { en: 'O God, come to my assistance', pos: 'phrase', slot: 'help' },
  'dominus vobiscum': { en: 'The Lord be with you', pos: 'phrase', slot: 'lord' },
  'et cum spiritu tuo': { en: 'And with your spirit', pos: 'phrase', slot: 'spirit' },
  'sursum corda': { en: 'Lift up your hearts', pos: 'phrase', slot: 'heart' },
  'habemus ad dominum': { en: 'We have lifted them up to the Lord', pos: 'phrase', slot: 'lord' },
  'gratias agamus': { en: 'Let us give thanks', pos: 'phrase', slot: 'thanks' },
  'dignum et iustum est': { en: 'It is right and just', pos: 'phrase', slot: 'right' },

  // ── Additional verbs ──
  'veni':       { en: 'come',        pos: 'v', slot: 'come' },
  'venire':     { en: 'to come',     pos: 'v', slot: 'come' },
  'vide':       { en: 'see',         pos: 'v', slot: 'see' },
  'videre':     { en: 'to see',      pos: 'v', slot: 'see' },
  'crede':      { en: 'believe',     pos: 'v', slot: 'believe' },
  'credere':    { en: 'to believe',  pos: 'v', slot: 'believe' },
  'spera':      { en: 'hope',        pos: 'v', slot: 'hope' },
  'sperare':    { en: 'to hope',     pos: 'v', slot: 'hope' },
  'ama':        { en: 'love',        pos: 'v', slot: 'love' },
  'amare':      { en: 'to love',     pos: 'v', slot: 'love' },
  'lauda':      { en: 'praise',      pos: 'v', slot: 'praise' },
  'laudare':    { en: 'to praise',   pos: 'v', slot: 'praise' },
  'benedicere': { en: 'to bless',    pos: 'v', slot: 'bless' },
  'glorificare': { en: 'to glorify', pos: 'v', slot: 'glorify' },
  'sanctificare': { en: 'to sanctify', pos: 'v', slot: 'sanctify' },
  'adjuva':     { en: 'help',        pos: 'v', slot: 'help' },
  'adjuvare':   { en: 'to help',     pos: 'v', slot: 'help' },
  'protege':    { en: 'protect',     pos: 'v', slot: 'protect' },
  'protegere':  { en: 'to protect',  pos: 'v', slot: 'protect' },
  'regna':      { en: 'rule',        pos: 'v', slot: 'rule' },
  'regnare':    { en: 'to reign',    pos: 'v', slot: 'reign' },
  'vive':       { en: 'live',        pos: 'v', slot: 'live' },
  'vivere':     { en: 'to live',     pos: 'v', slot: 'live' },

  // ── Additional nouns ──
  'altare':     { en: 'altar',       pos: 'n', slot: 'altar' },
  'altaris':    { en: 'altar',       pos: 'n', slot: 'altar' },
  'sacrificium': { en: 'sacrifice',  pos: 'n', slot: 'sacrifice' },
  'sacrificia': { en: 'sacrifices',  pos: 'n', slot: 'sacrifice' },
  'hostia':     { en: 'host',        pos: 'n', slot: 'host' },
  'hostiam':    { en: 'host',        pos: 'n', slot: 'host' },
  'panis':      { en: 'bread',       pos: 'n', slot: 'bread' },
  'panem':      { en: 'bread',       pos: 'n', slot: 'bread' },
  'vinum':      { en: 'wine',        pos: 'n', slot: 'wine' },
  'calix':      { en: 'chalice',     pos: 'n', slot: 'chalice' },
  'calicem':    { en: 'chalice',     pos: 'n', slot: 'chalice' },
  'sacerdos':   { en: 'priest',      pos: 'n', slot: 'priest' },
  'sacerdotem': { en: 'priest',      pos: 'n', slot: 'priest' },
  'sacerdotis': { en: 'priest',      pos: 'n', slot: 'priest' },
  'episcopus':  { en: 'bishop',      pos: 'n', slot: 'bishop' },
  'episcopum':  { en: 'bishop',      pos: 'n', slot: 'bishop' },
  'papa':       { en: 'Pope',        pos: 'n', slot: 'pope' },
  'clerus':     { en: 'clergy',      pos: 'n', slot: 'clergy' },
  'laicus':     { en: 'layperson',   pos: 'n', slot: 'lay' },
  'monachus':   { en: 'monk',        pos: 'n', slot: 'monk' },
  'virgo':      { en: 'virgin',      pos: 'n', slot: 'virgin' },
  'virginem':   { en: 'virgin',      pos: 'n', slot: 'virgin' },
  'martyr':     { en: 'martyr',      pos: 'n', slot: 'martyr' },
  'sanctus':    { en: 'saint',       pos: 'n', slot: 'saint' },
  'angelus':    { en: 'angel',       pos: 'n', slot: 'angel' },
  'angelum':    { en: 'angel',       pos: 'n', slot: 'angel' },
  'peccator':   { en: 'sinner',      pos: 'n', slot: 'sinner' },
  'iustus':     { en: 'the just',    pos: 'n', slot: 'just' },
  'iusti':      { en: 'the just',    pos: 'n', slot: 'just' },
  'infernum':   { en: 'hell',        pos: 'n', slot: 'hell' },
  'infernorum': { en: 'hell',        pos: 'n', slot: 'hell' },
  'purgatorium': { en: 'purgatory',  pos: 'n', slot: 'purgatory' },
  'paradisus':  { en: 'paradise',    pos: 'n', slot: 'paradise' },

  // ── Time/season ──
  'dies':       { en: 'day',         pos: 'n', slot: 'day' },
  'diem':       { en: 'day',         pos: 'n', slot: 'day' },
  'noctis':     { en: 'night',       pos: 'n', slot: 'night' },
  'mane':       { en: 'morning',     pos: 'n', slot: 'morning' },
  'vesper':     { en: 'evening',     pos: 'n', slot: 'evening' },
  'tempus':     { en: 'time',        pos: 'n', slot: 'time' },
  'tempora':    { en: 'times',       pos: 'n', slot: 'time' },
  'annus':      { en: 'year',        pos: 'n', slot: 'year' },
  'annum':      { en: 'year',        pos: 'n', slot: 'year' },
  'adventus':   { en: 'Advent',      pos: 'n', slot: 'advent' },
  'nativitas':  { en: 'Nativity',    pos: 'n', slot: 'nativity' },
  'pascha':     { en: 'Easter',      pos: 'n', slot: 'easter' },
  'resurrectio': { en: 'resurrection', pos: 'n', slot: 'resurrection' },
  'ascensio':   { en: 'Ascension',   pos: 'n', slot: 'ascension' },
  'pentecostes': { en: 'Pentecost',  pos: 'n', slot: 'pentecost' },

  // ── Sacraments ──
  'baptismus':  { en: 'baptism',     pos: 'n', slot: 'baptism' },
  'baptismum':  { en: 'baptism',     pos: 'n', slot: 'baptism' },
  'eucharistia': { en: 'Eucharist',  pos: 'n', slot: 'eucharist' },
  'confirmatio': { en: 'confirmation', pos: 'n', slot: 'confirmation' },
  'poenitentia': { en: 'penance',    pos: 'n', slot: 'penance' },
  'unctio':     { en: 'anointing',   pos: 'n', slot: 'anointing' },
  'ordo':       { en: 'ordination',  pos: 'n', slot: 'ordination' },
  'matrimonium': { en: 'matrimony',  pos: 'n', slot: 'matrimony' },

  // ── Virtues/vices ──
  'humilitas':  { en: 'humility',    pos: 'n', slot: 'humility' },
  'patientia':  { en: 'patience',    pos: 'n', slot: 'patience' },
  'obedientia': { en: 'obedience',   pos: 'n', slot: 'obedience' },
  'castitas':   { en: 'chastity',    pos: 'n', slot: 'chastity' },
  'paupertas':  { en: 'poverty',     pos: 'n', slot: 'poverty' },
  'superbia':   { en: 'pride',       pos: 'n', slot: 'pride' },
  'avaritia':   { en: 'greed',       pos: 'n', slot: 'greed' },
  'luxuria':    { en: 'lust',        pos: 'n', slot: 'lust' },
  'ira':        { en: 'wrath',       pos: 'n', slot: 'wrath' },
  'gula':       { en: 'gluttony',    pos: 'n', slot: 'gluttony' },
  'invidia':    { en: 'envy',        pos: 'n', slot: 'envy' },
  'acedia':     { en: 'sloth',       pos: 'n', slot: 'sloth' },
};

// Reverse lexicon: English → Latin (for E→L direction)
// Built from LEXICON_LAT_EN, but with disambiguation:
// when multiple Latin words map to the same English, pick the one
// with the most specific semantic slot.
const LEXICON_EN_LAT = {};
for (const [lat, entry] of Object.entries(LEXICON_LAT_EN)) {
  const en = entry.en.toLowerCase();
  if (!LEXICON_EN_LAT[en] || entry.pos === 'phrase') {
    LEXICON_EN_LAT[en] = lat;
  }
}

// ─── Collect formula parser ─────────────────────────────────────────────

/**
 * Parse a collect into its structural components:
 * 1. Invocation (Deus / Domine / Omnipotens Deus / etc.)
 * 2. Qui clause (relative clause about God — "who...")
 * 3. Petition (the actual request — "grant that..." / "we beseech you...")
 * 4. Doxology (Per Dominum... / Qui vivit... / etc.)
 */
export function parseCollectStructure(text) {
  const lines = text.trim().split(/[:.]\s*/).filter(s => s.trim());
  const structure = {
    invocation: null,
    quiClause: null,
    petition: null,
    doxology: null,
    raw: text,
  };

  // Detect invocation (first clause, usually contains Deus/Domine)
  if (lines.length > 0) {
    structure.invocation = lines[0].trim();
  }

  // Detect qui clause (contains "qui" — relative clause about God)
  for (let i = 1; i < lines.length; i++) {
    const norm = normalizeText(lines[i]);
    if (norm.startsWith('qui ') || norm.startsWith('quae ')) {
      structure.quiClause = lines[i].trim();
      break;
    }
  }

  // Detect petition (contains quaesumus/oro/da/fac/presta/concede/tribue)
  for (let i = 1; i < lines.length; i++) {
    const norm = normalizeText(lines[i]);
    if (/\b(quaesumus|quaeso|oro|da|fac|presta|concede|tribue|exaudi|respice|libera|salva|sanctifica|illumina|adiuva)\b/.test(norm)) {
      if (lines[i].trim() !== structure.quiClause) {
        structure.petition = lines[i].trim();
        break;
      }
    }
  }

  // Detect doxology (Per Dominum / Qui vivit et regnat / Per eundem)
  for (let i = lines.length - 1; i >= 0; i--) {
    const norm = normalizeText(lines[i]);
    if (norm.startsWith('per dominum') || norm.startsWith('per eundem') ||
        norm.startsWith('qui vivit') || norm.startsWith('qui tecum') ||
        norm.includes('saeculorum amen')) {
      structure.doxology = lines[i].trim();
      break;
    }
  }

  return structure;
}

// ─── Translation engine ─────────────────────────────────────────────────

/**
 * Translate Latin → English using the constrained lexicon.
 * Words outside the lexicon are marked [unmapped].
 * Multi-word phrases are matched before single words.
 */
export function translateLatinToEnglish(text) {
  let norm = text;

  // First pass: match multi-word phrases (longest first)
  const phrases = Object.entries(LEXICON_LAT_EN)
    .filter(([k]) => k.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [lat, entry] of phrases) {
    const re = new RegExp(escapeRegex(lat), 'gi');
    norm = norm.replace(re, ` ${entry.en} `);
  }

  // Second pass: single-word lookup
  const words = norm.split(/(\s+)/);
  const result = words.map(w => {
    if (/^\s*$/.test(w)) return w;
    const stripped = w.replace(/[.,;:!?]/g, '');
    const key = normalizeText(stripped);
    if (!key) return w;
    const entry = LEXICON_LAT_EN[key];
    if (entry) return entry.en;
    return `[unmapped:${stripped}]`;
  });

  return result.join('').replace(/\s+/g, ' ').trim();
}

/**
 * Translate English → Latin using the reverse lexicon.
 * Words outside the lexicon are marked [unmapped].
 * Multi-word phrases are matched before single words.
 */
export function translateEnglishToLatin(text) {
  let norm = text;

  // First pass: match multi-word phrases (longest first)
  const phrases = Object.entries(LEXICON_EN_LAT)
    .filter(([k]) => k.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [en, lat] of phrases) {
    const re = new RegExp(escapeRegex(en), 'gi');
    norm = norm.replace(re, ` ${lat} `);
  }

  // Second pass: single-word lookup
  const words = norm.split(/(\s+)/);
  const result = words.map(w => {
    if (/^\s*$/.test(w)) return w;
    const stripped = w.replace(/[.,;:!?]/g, '');
    const key = stripped.toLowerCase();
    if (!key) return w;
    const lat = LEXICON_EN_LAT[key];
    if (lat) return lat;
    return `[unmapped:${stripped}]`;
  });

  return result.join('').replace(/\s+/g, ' ').trim();
}

/**
 * Round-trip: Latin → English → Latin
 */
export function roundTripLatin(text) {
  const english = translateLatinToEnglish(text);
  return translateEnglishToLatin(english);
}

/**
 * Round-trip: English → Latin → English
 */
export function roundTripEnglish(text) {
  const latin = translateEnglishToLatin(text);
  return translateLatinToEnglish(latin);
}

/**
 * Get the semantic slot for a word (for slot preservation metric).
 */
export function getSemanticSlot(word) {
  const key = normalizeText(word);
  const entry = LEXICON_LAT_EN[key];
  return entry ? entry.slot : null;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count mapped vs unmapped words in a translation output.
 */
export function analyzeTranslation(output) {
  const unmapped = (output.match(/\[unmapped:[^\]]+\]/g) || []);
  const totalWords = output.split(/\s+/).filter(w => w.trim()).length;
  return {
    totalWords,
    unmappedCount: unmapped.length,
    mappedCount: totalWords - unmapped.length,
    coverage: totalWords > 0 ? (totalWords - unmapped.length) / totalWords : 0,
    unmappedWords: unmapped.map(u => u.replace(/\[unmapped:([^\]]+)\]/, '$1')),
  };
}
