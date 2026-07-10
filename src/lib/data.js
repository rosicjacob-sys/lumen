// Research-peptide catalog. Powder color drives the whole visual system:
// each product's `hue` feeds the 3D vial + the section accent lighting.
export const PEPTIDES = [
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    dose: 100,
    unit: 'MG',
    tag: 'COPPER TRIPEPTIDE-1',
    hue: '#1F6FEB', // blue powder
    hueDeep: '#0B3D91',
    powder: 'blue',
    seq: 'Gly-His-Lys · Cu²⁺',
    purity: 99.2,
    mass: '340.9 g/mol',
    price: 46,
    blurb: 'Copper-bound tripeptide. Studied in skin-remodeling and matrix-repair research.',
    research: 'Extracellular matrix · fibroblast · angiogenesis models',
  },
  {
    id: '5a1mq',
    name: '5-Amino-1MQ',
    dose: 50,
    unit: 'MG',
    tag: 'NNMT INHIBITOR',
    hue: '#F5871F', // orange powder
    hueDeep: '#B8560A',
    powder: 'orange',
    seq: 'C₁₀H₁₂N₂ · small molecule',
    purity: 98.7,
    mass: '160.2 g/mol',
    price: 64,
    blurb: 'Small-molecule NNMT inhibitor. Studied in adipocyte and metabolic-flux research.',
    research: 'NNMT · NAD⁺ salvage · adipose models',
  },
  {
    id: 'reta',
    name: 'Retatrutide',
    dose: 20,
    unit: 'MG',
    tag: 'GGG TRI-AGONIST',
    hue: '#F2F4F7', // white powder (rendered as bright neutral)
    hueDeep: '#B9C0C9',
    ui: '#5E6B7E', // UI accent must stay readable on the light canvas
    uiDeep: '#39434f',
    powder: 'white',
    seq: '39-aa peptide · GIP/GLP-1/GCG',
    purity: 99.5,
    mass: '4731 g/mol',
    price: 189,
    blurb: 'Triple-receptor agonist peptide. Studied in energy-balance and metabolic research.',
    research: 'GIP · GLP-1 · glucagon receptor models',
  },
]

export const CATALOG_EXTRA = [
  { name: 'BPC-157', dose: 10, unit: 'MG', tag: 'PENTADECAPEPTIDE', purity: 99.0, price: 42 },
  { name: 'TB-500', dose: 10, unit: 'MG', tag: 'THYMOSIN β4 FRAG', purity: 98.9, price: 55 },
  { name: 'Tesamorelin', dose: 10, unit: 'MG', tag: 'GHRH ANALOG', purity: 99.1, price: 96 },
  { name: 'Semaglutide', dose: 10, unit: 'MG', tag: 'GLP-1 AGONIST', purity: 99.4, price: 78 },
  { name: 'Ipamorelin', dose: 10, unit: 'MG', tag: 'GH SECRETAGOGUE', purity: 99.3, price: 38 },
  { name: 'Epithalon', dose: 50, unit: 'MG', tag: 'TETRAPEPTIDE', purity: 98.8, price: 44 },
]

export const PILLARS = [
  {
    k: '01',
    title: 'HPLC-verified, every batch',
    body: 'Reverse-phase HPLC and mass-spec on each lot. The purity number on the vial is the number the assay returned — never a target.',
  },
  {
    k: '02',
    title: 'A public paper trail',
    body: 'Every lot ships with a downloadable third-party COA, keyed to the batch code printed on the cap. Nothing is unverifiable.',
  },
  {
    k: '03',
    title: 'Lyophilized, cold-chain',
    body: 'Freeze-dried under vacuum, sealed under argon, shipped with cold packs. Reconstitution guidance in every box.',
  },
  {
    k: '04',
    title: 'Research-use handling',
    body: 'Labeled and documented for laboratory research use only. Not for human or veterinary use. Sold to qualified researchers.',
  },
]

export const STEPS = [
  { n: 1, t: 'Assay', d: 'Each lot is HPLC + mass-spec tested by an independent lab before it is cleared to ship.' },
  { n: 2, t: 'Lyophilize', d: 'Freeze-dried to a stable powder, sealed under inert gas in amber borosilicate vials.' },
  { n: 3, t: 'Document', d: 'A COA is generated and linked to the batch code — scannable from the vial cap.' },
  { n: 4, t: 'Cold-ship', d: 'Packed with cold packs and tracked, dispatched within 24h on business days.' },
]

export const FAQS = [
  {
    q: 'What does “research use only” mean here?',
    a: 'Every product on this site is sold strictly for in-vitro and laboratory research. Nothing here is a drug, supplement, or food. It is not for human or veterinary use, and we sell only to qualified researchers and institutions. The label and documentation say exactly that.',
  },
  {
    q: 'How do I know the purity is real?',
    a: 'Each lot is tested by an independent, ISO 17025-accredited lab using reverse-phase HPLC and mass spectrometry. The purity printed on the vial is the assay result, not a marketing figure. Scan the batch code on the cap to pull the matching certificate of analysis.',
  },
  {
    q: 'How is it shipped and stored?',
    a: 'Peptides are lyophilized (freeze-dried) and sealed under argon in amber borosilicate vials. Orders ship within 24 hours on business days with cold packs and tracking. Store lyophilized vials cold and away from light; reconstitution guidance is in every box.',
  },
  {
    q: 'What is your reshipment policy?',
    a: 'If a vial arrives broken, or an assay you run in good faith disagrees materially with our COA, contact us with your batch code and we reship or refund — no return shipment required for damaged goods.',
  },
  {
    q: 'Do you offer bulk or recurring orders?',
    a: 'Yes. Lab accounts get tiered bulk pricing and standing monthly orders that ship automatically; pause or cancel any time in one click. Contact us with your institution details to open an account.',
  },
]

export const DISCLAIMER =
  'For laboratory and research use only. Not for human or veterinary use. Not a drug, dietary supplement, or food. Products are not intended to diagnose, treat, cure, or prevent any disease. Sold only to qualified researchers; the purchaser assumes all responsibility for safe handling and lawful use.'

export const MARQUEE_WORDS = [
  'HPLC-VERIFIED',
  'PUBLIC COA',
  'LYOPHILIZED',
  'COLD-CHAIN',
  '≥98% PURITY',
  'ARGON-SEALED',
  'BATCH-TRACEABLE',
  'RESEARCH USE ONLY',
]
