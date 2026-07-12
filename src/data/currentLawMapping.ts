// Indicative correspondence between the legacy IPC / CrPC labels used by this
// app and the current criminal codes that came into force on 1 July 2024:
//   BNS  - Bharatiya Nyaya Sanhita, 2023        (replaces the IPC)
//   BNSS - Bharatiya Nagarik Suraksha Sanhita   (replaces the CrPC)
//   BSA  - Bharatiya Sakshya Adhiniyam          (replaces the Evidence Act)
//
// These pairings are the widely published section-to-section equivalents. They
// are provided for education only: exact sub-sections, ingredients, and
// punishments must be verified against the official bare acts on India Code.

export interface CurrentLawEquivalent {
  /** Current section label, e.g. "BNS 103". */
  current: string;
  /** Short subject of the current provision. */
  subject: string;
}

/**
 * Keyed by the legacy label used in `LAW_MAP` (e.g. "IPC 302", "CrPC 145").
 * Statutes that were NOT replaced in 2024 (IT Act, POCSO, DV Act, CPA, JJ Act,
 * Drugs and Cosmetics Act) are intentionally omitted - they remain current.
 */
export const currentLawEquivalents: Record<string, CurrentLawEquivalent> = {
  'IPC 302': { current: 'BNS 103', subject: 'Punishment for murder' },
  'IPC 307': { current: 'BNS 109', subject: 'Attempt to murder' },
  'IPC 120B': { current: 'BNS 61(2)', subject: 'Criminal conspiracy' },
  'IPC 34': { current: 'BNS 3(5)', subject: 'Acts done by several persons in furtherance of common intention' },
  'IPC 201': { current: 'BNS 238', subject: 'Causing disappearance of evidence of an offence' },
  'IPC 297': { current: 'BNS 301', subject: 'Trespassing on burial places etc.' },
  'IPC 392': { current: 'BNS 309(4)', subject: 'Punishment for robbery' },
  'IPC 397': { current: 'BNS 311', subject: 'Robbery or dacoity with attempt to cause death or grievous hurt' },
  'IPC 398': { current: 'BNS 311', subject: 'Attempt to commit robbery/dacoity when armed with deadly weapon' },
  'IPC 394': { current: 'BNS 309(6)', subject: 'Voluntarily causing hurt in committing robbery' },
  'IPC 395': { current: 'BNS 310(2)', subject: 'Punishment for dacoity' },
  'IPC 379': { current: 'BNS 303(2)', subject: 'Punishment for theft' },
  'IPC 380': { current: 'BNS 305', subject: 'Theft in a dwelling house, means of transport, or place of worship' },
  'IPC 457': { current: 'BNS 331(4)', subject: 'House-breaking by night to commit an offence' },
  'IPC 411': { current: 'BNS 317(2)', subject: 'Dishonestly receiving stolen property' },
  'IPC 454': { current: 'BNS 331(3)', subject: 'Lurking house-trespass or house-breaking to commit an offence' },
  'IPC 420': { current: 'BNS 318(4)', subject: 'Cheating and dishonestly inducing delivery of property' },
  'IPC 415': { current: 'BNS 318(1)', subject: 'Cheating (definition)' },
  'IPC 417': { current: 'BNS 318(2)', subject: 'Punishment for cheating' },
  'IPC 468': { current: 'BNS 336(3)', subject: 'Forgery for the purpose of cheating' },
  'IPC 471': { current: 'BNS 340(2)', subject: 'Using as genuine a forged document' },
  'IPC 351': { current: 'BNS 130', subject: 'Assault (definition)' },
  'IPC 352': { current: 'BNS 131', subject: 'Punishment for assault or criminal force otherwise than on grave provocation' },
  'IPC 323': { current: 'BNS 115(2)', subject: 'Punishment for voluntarily causing hurt' },
  'IPC 504': { current: 'BNS 352', subject: 'Intentional insult with intent to provoke breach of the peace' },
  'IPC 354': { current: 'BNS 74', subject: 'Assault or criminal force to woman with intent to outrage her modesty' },
  'IPC 354A': { current: 'BNS 75', subject: 'Sexual harassment' },
  'IPC 509': { current: 'BNS 79', subject: 'Word, gesture or act intended to insult the modesty of a woman' },
  'IPC 503': { current: 'BNS 351(1)', subject: 'Criminal intimidation (definition)' },
  'IPC 506': { current: 'BNS 351(2)-(3)', subject: 'Punishment for criminal intimidation' },
  'IPC 507': { current: 'BNS 351(4)', subject: 'Criminal intimidation by anonymous communication' },
  'IPC 499': { current: 'BNS 356(1)', subject: 'Defamation (definition)' },
  'IPC 500': { current: 'BNS 356(2)', subject: 'Punishment for defamation' },
  'IPC 498A': { current: 'BNS 85', subject: 'Husband or relative of husband subjecting a woman to cruelty' },
  'IPC 376': { current: 'BNS 64', subject: 'Punishment for rape' },
  'IPC 228A': { current: 'BNS 72', subject: 'Disclosure of identity of a victim of certain offences' },
  'IPC 272': { current: 'BNS 274', subject: 'Adulteration of food or drink intended for sale' },
  'IPC 273': { current: 'BNS 275', subject: 'Sale of noxious food or drink' },
  'IPC 441': { current: 'BNS 329(3)', subject: 'Criminal trespass' },
  'IPC 427': { current: 'BNS 324(4)', subject: 'Mischief causing damage' },
  'CrPC 145': { current: 'BNSS 164', subject: 'Dispute concerning land or water likely to cause breach of the peace' },
  'IPC 363': { current: 'BNS 137(2)', subject: 'Punishment for kidnapping' },
  'IPC 364A': { current: 'BNS 140(2)', subject: 'Kidnapping for ransom' },
  'IPC 366': { current: 'BNS 87', subject: 'Kidnapping or abducting a woman to compel marriage etc.' },
  'IPC 384': { current: 'BNS 308(2)', subject: 'Punishment for extortion' },
  'IPC 386': { current: 'BNS 308(3)', subject: 'Extortion by putting a person in fear of death or grievous hurt' },
  'IPC 354D': { current: 'BNS 78', subject: 'Stalking' },
  'IPC 354C': { current: 'BNS 77', subject: 'Voyeurism' },
  'IPC 304B': { current: 'BNS 80(2)', subject: 'Dowry death' },
  'IPC 304A': { current: 'BNS 106(1)', subject: 'Causing death by negligence' },
  'IPC 279': { current: 'BNS 281', subject: 'Rash driving or riding on a public way' },
  'IPC 337': { current: 'BNS 125(a)', subject: 'Causing hurt by an act endangering life or personal safety' },
  'IPC 338': { current: 'BNS 125(b)', subject: 'Causing grievous hurt by an act endangering life or personal safety' },
  'CrPC 154': { current: 'BNSS 173', subject: 'Information in cognizable cases (FIR)' },
  'CrPC 156': { current: 'BNSS 175', subject: 'Power of police to investigate cognizable cases' },
  'CrPC 41': { current: 'BNSS 35', subject: 'When police may arrest without a warrant' },
  'CrPC 125': { current: 'BNSS 144', subject: 'Order for maintenance of wives, children and parents' },
  'CrPC 437': { current: 'BNSS 480', subject: 'Bail in non-bailable offences' },
};

/** Statutes that were replaced wholesale in July 2024 (for the currency notice). */
export function isLegacyCriminalLabel(label: string): boolean {
  return /^(IPC|CrPC)\b/.test(label);
}
