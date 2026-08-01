import { constitutionalArticles } from '../data/constitutionalArticles';
import {
  CURRENT_LAW_MAPPING_LAST_VERIFIED_ON,
  currentLawEquivalents,
  getOfficialCitationForLegacyLabel,
  getOfficialCurrentLawUrl,
} from '../data/currentLawMapping';
import { buildRetrievalQuery } from './buildRetrievalQuery';
import {
  appendCitationValidationNotice,
  getAllowedCitationLabelsFromRetrieval,
  getStaticAllowedCitationLabels,
  validateCitations,
  type CitationValidationResult,
} from './citationValidation';
import { buildSectionConfidence, getRetrievalStrategy } from './confidenceScoring';
import { retrieveRelevantLaws, type RetrievedLaw } from './retrieval';
import type { AnalysisMetadata, AnalysisSource, Article, CaseSubmission, CoverageLevel, RetrievalReference } from '../types';

type CaseType =
  | 'Murder'
  | 'Attempt to Murder'
  | 'Robbery'
  | 'Theft'
  | 'Fraud / Cheating'
  | 'Assault'
  | 'Harassment'
  | 'Criminal Intimidation / Threats'
  | 'Cybercrime'
  | 'Domestic Violence / Family'
  | 'Child Abuse / Protection'
  | 'Sexual Offense'
  | 'Consumer / Medical Negligence'
  | 'Landlord / Tenancy'
  | 'Kidnapping / Abduction'
  | 'Extortion'
  | 'Stalking / Voyeurism'
  | 'Dowry Death'
  | 'Rash / Negligent Driving'
  | 'Defamation';

const IMPORTANT_NOTICE =
  'Indian criminal law references changed after most BNS, BNSS, and BSA provisions came into force on 1 July 2024. Treat older IPC and CrPC references as educational starting points and verify the current law, incident date, and local jurisdiction before acting.';

export interface AnalysisResult {
  markdown: string;
  metadata: AnalysisMetadata;
}

const LAW_MAP: Record<CaseType, string[]> = {
  Murder: ['IPC 302', 'IPC 120B', 'IPC 34', 'IPC 201', 'IPC 297', '21'],
  'Attempt to Murder': ['IPC 307', 'IPC 120B', 'IPC 34', '21'],
  Robbery: ['IPC 392', 'IPC 397', 'IPC 398', 'IPC 394', 'IPC 395', 'IPC 34', '21'],
  Theft: ['IPC 379', 'IPC 380', 'IPC 457', 'IPC 411', 'IPC 454', '21'],
  'Fraud / Cheating': ['IPC 420', 'IPC 415', 'IPC 417', 'IPC 468', 'IPC 471', '21'],
  Assault: ['IPC 351', 'IPC 352', 'IPC 323', 'IPC 504', '21'],
  Harassment: ['IPC 354', 'IPC 354A', 'IPC 509', '14', '15', '21'],
  'Criminal Intimidation / Threats': ['IPC 503', 'IPC 506', 'IPC 507', '21'],
  Cybercrime: ['IT Act 66C', 'IT Act 66D', 'IT Act 67', 'IPC 354A', 'IPC 499', 'IPC 500', '21'],
  'Domestic Violence / Family': ['DV Act 3', 'IPC 498A', 'IPC 506', '21'],
  'Child Abuse / Protection': ['POCSO 3', 'POCSO 7', 'POCSO 9', 'JJ Act 75', '21'],
  'Sexual Offense': ['IPC 376', 'IPC 354', 'IPC 354A', 'IPC 509', 'IPC 228A', '21', '14'],
  'Consumer / Medical Negligence': ['CPA 2', 'IPC 272', 'IPC 273', 'Drugs and Cosmetics Act 27', '21'],
  'Landlord / Tenancy': ['Rent Act', 'IPC 441', 'IPC 427', 'CrPC 145', '21'],
  'Kidnapping / Abduction': ['IPC 363', 'IPC 364A', 'IPC 366', 'IPC 34', '21'],
  Extortion: ['IPC 384', 'IPC 386', 'IPC 506', '21'],
  'Stalking / Voyeurism': ['IPC 354D', 'IPC 354C', 'IT Act 66E', 'IPC 509', '21'],
  'Dowry Death': ['IPC 304B', 'DP Act 3', 'IPC 498A', 'IPC 34', '21'],
  'Rash / Negligent Driving': ['IPC 279', 'IPC 304A', 'IPC 337', 'IPC 338', 'MV Act 134', '21'],
  Defamation: ['IPC 499', 'IPC 500', '19', '21'],
};

const PRECEDENTS: Partial<Record<CaseType, string[]>> = {
  Murder: [
    'State of Andhra Pradesh v. Rayavarapu Punnayya (1976) - distinction between murder and culpable homicide',
    'Virsa Singh v. State of Punjab (1958) - intention and bodily injury test',
  ],
  'Attempt to Murder': [
    'State of Maharashtra v. Kashirao (2003) - ingredients of attempt under Section 307 IPC',
  ],
  Cybercrime: [
    'Shreya Singhal v. Union of India (2015) - constitutional limits on online speech restrictions',
  ],
  'Sexual Offense': [
    'State of Punjab v. Gurmit Singh (1996) - evidentiary treatment of survivor testimony',
    'Patan Jamal Vali v. State of Andhra Pradesh (2021) - consent, vulnerability, and intersectionality',
  ],
  'Domestic Violence / Family': [
    'Hiral P. Harsora v. Kusum Narottamdas Harsora (2016) - scope of respondent under the DV Act',
  ],
  'Child Abuse / Protection': [
    'Alakh Alok Srivastava v. Union of India (2018) - POCSO implementation guidance',
  ],
  'Kidnapping / Abduction': [
    'Vishwanath v. State of U.P. (1960) - scope of abduction and intent',
    'State of Haryana v. Raja Ram (1973) - "taking or enticing" a minor out of lawful guardianship',
  ],
  'Dowry Death': [
    'Kans Raj v. State of Punjab (2000) - proximate cause and cruelty in dowry death',
    'Satbir Singh v. State of Haryana (2021) - reiterating the presumption under Section 304B',
  ],
  'Stalking / Voyeurism': [
    'State of West Bengal v. Animesh Boxi (2018) - non-consensual sharing of private images',
  ],
  'Rash / Negligent Driving': [
    'Alister Anthony Pareira v. State of Maharashtra (2012) - culpability in rash and negligent driving',
  ],
  Defamation: [
    'Subramanian Swamy v. Union of India (2016) - constitutionality of criminal defamation',
  ],
};

function detectAllCaseTypes(keywords: string): CaseType[] {
  const types: CaseType[] = [];

  if ((/murder|killed|homicide|stab|knife|shoot|poison/.test(keywords)) && (/attempt|try|failed|survive|did not die|didn't die/.test(keywords))) {
    types.push('Attempt to Murder');
  }
  if ((/murder|killed|homicide|stab|knife|shoot|poison|corpse|body/.test(keywords)) && !types.includes('Attempt to Murder')) {
    types.push('Murder');
  }
  if (/robbery|robbed|dacoity|snatch|armed|weapon|threaten|knife|gun|forcefully/.test(keywords)) {
    types.push('Robbery');
  }
  if (/theft|stolen|steal|burglar|burglary|break[- ]?in|locker|pickpocket/.test(keywords)) {
    types.push('Theft');
  }
  if (/cheat|fraud|scam|fake|forgery|dishonest|builder|online seller|mislead/.test(keywords)) {
    types.push('Fraud / Cheating');
  }
  if (/assault|slap|hit|beat|push|attack|fight|injury|hurt/.test(keywords)) {
    types.push('Assault');
  }
  if (/harass|harassment|eve teasing|lewd|inappropriate|touch|molest|modesty|insult|humiliate/.test(keywords)) {
    types.push('Harassment');
  }
  if (/intimidate|threat|threaten|blackmail|fear|kill you|anonymous message/.test(keywords)) {
    types.push('Criminal Intimidation / Threats');
  }
  if (/cyber|hack|hacked|phish|online|account|instagram|facebook|social media|morph|obscene|profile|digital/.test(keywords)) {
    types.push('Cybercrime');
  }
  if (/domestic violence|husband|in-laws|dowry|mental torture|spouse|family abuse|demand money/.test(keywords)) {
    types.push('Domestic Violence / Family');
  }
  if (/child|minor|underage|student|teacher|school|locked|maid/.test(keywords)) {
    types.push('Child Abuse / Protection');
  }
  if (/rape|sexual assault|sexual abuse|sexual harassment|vulgar|consent|inappropriately|survivor|victim/.test(keywords)) {
    types.push('Sexual Offense');
  }
  if (/expired medicine|pharmacy|chemist|medical negligence|doctor|hospital|consumer/.test(keywords)) {
    types.push('Consumer / Medical Negligence');
  }
  if (/landlord|rent|tenant|water|electricity|disconnect|evict|property dispute/.test(keywords)) {
    types.push('Landlord / Tenancy');
  }
  if (/kidnap|abduct|ransom|took (?:my|the) child|missing child|held captive|confined against/.test(keywords)) {
    types.push('Kidnapping / Abduction');
  }
  if (/extort|extortion|protection money|pay or else|demand money.*threat|ransom demand|hafta|mafia/.test(keywords)) {
    types.push('Extortion');
  }
  if (/stalk|stalking|following me|follows me|watching me|voyeur|peeping|hidden camera|spy cam|record.*private|upskirt/.test(keywords)) {
    types.push('Stalking / Voyeurism');
  }
  if (/dowry death|dowry.*died|burnt for dowry|died.*marriage.*dowry|unnatural death.*bride|suicide.*harassment.*dowry/.test(keywords)) {
    types.push('Dowry Death');
  }
  if (/rash driving|negligent driving|drunk driving|drink and drive|hit and run|ran over|road accident|traffic accident|vehicle accident|speeding|overspeed|reckless driving|knocked down|car hit|bike hit|two-wheeler/.test(keywords)) {
    types.push('Rash / Negligent Driving');
  }
  if (/defam|slander|libel|false statement|spread rumou?r|damaged? my reputation|character assassination/.test(keywords)) {
    types.push('Defamation');
  }

  return Array.from(new Set(types));
}

function findRelevantArticles(caseInfo: Pick<CaseSubmission, 'incidentType' | 'description'>): Article[] {
  const keywords = `${caseInfo.incidentType} ${caseInfo.description}`.toLowerCase();
  const caseTypes = detectAllCaseTypes(keywords);
  const orderedNumbers = new Set<string>();

  if (caseTypes.length === 0) {
    ['14', '19', '21', '22'].forEach((number) => orderedNumbers.add(number));
  } else {
    caseTypes.forEach((type) => LAW_MAP[type].forEach((number) => orderedNumbers.add(number)));
  }

  return Array.from(orderedNumbers)
    .map((number) => constitutionalArticles.find((article) => article.number === number))
    .filter((article): article is Article => Boolean(article));
}

function getFullLabel(article: Pick<Article, 'number'>) {
  if (article.number.startsWith('IPC')) return `IPC Section ${article.number.replace('IPC ', '')}`;
  if (article.number.startsWith('CrPC')) return `CrPC Section ${article.number.replace('CrPC ', '')}`;
  if (article.number.startsWith('IT Act')) return `IT Act Section ${article.number.replace('IT Act ', '')}`;
  if (article.number.startsWith('POCSO')) return `POCSO Section ${article.number.replace('POCSO ', '')}`;
  if (article.number.startsWith('Article')) return article.number;
  if (/^\d+$/.test(article.number)) return `Article ${article.number}`;
  return article.number;
}

function getArticleExplanation(article: Article) {
  const explanations: Record<string, string> = {
    'IPC 302': 'Applies when the facts indicate intentional killing or murder.',
    'IPC 307': 'Applies when the facts indicate an attempt to cause death.',
    'IPC 201': 'Applies if evidence was destroyed, hidden, or altered after the offence.',
    'IPC 34': 'Applies when multiple people acted with a shared intention.',
    'IPC 120B': 'Applies when the facts suggest a criminal conspiracy.',
    'IPC 379': 'Applies when movable property was dishonestly taken.',
    'IPC 420': 'Applies when deception caused delivery of property or valuable security.',
    'IPC 376': 'Applies to allegations of rape or serious sexual assault.',
    'IPC 498A': 'Applies to cruelty by a husband or his relatives.',
    'IT Act 66C': 'Applies where identity credentials or personal digital identity were misused.',
    'IT Act 66D': 'Applies where cheating happened through personation using computer resources.',
    'IPC 363': 'Applies where a person was taken away from lawful guardianship or from India.',
    'IPC 364A': 'Applies where a person was kidnapped or abducted with a ransom or threat demand.',
    'IPC 384': 'Applies where fear of injury was used to dishonestly obtain property or money.',
    'IPC 354D': 'Applies to repeated following, contacting, or monitoring against a woman’s wishes, including online.',
    'IPC 354C': 'Applies where a private act was watched or recorded without consent.',
    'IPC 304B': 'Applies to a woman’s unnatural death within seven years of marriage linked to dowry cruelty.',
    'IPC 304A': 'Applies to death caused by a rash or negligent act not amounting to culpable homicide.',
    'IPC 279': 'Applies to rash or negligent driving endangering human life on a public way.',
    'IPC 499': 'Applies where a statement harmed a person’s reputation; note the statutory exceptions.',
    '21': 'Protects life and personal liberty and is often relevant to criminal process.',
    '19': 'Protects freedom of speech and expression, relevant to defamation and its limits.',
    '14': 'Protects equality before law and equal protection of laws.',
  };

  return (
    COMMON_LANGUAGE_EXPLANATIONS[article.number] ??
    explanations[article.number] ??
    'May be relevant based on the reported facts; verify the ingredients against the current provision.'
  );
}

const COMMON_LANGUAGE_EXPLANATIONS: Record<string, string> = {
  'IPC 302': 'This is the serious murder law; it matters when someone is alleged to have intentionally caused another person\'s death.',
  'IPC 307': 'This covers trying to kill someone even if the person survives; the focus is on the intention and the act done.',
  'IPC 120B': 'This is used when two or more people allegedly planned a crime together.',
  'IPC 34': 'This can make each person responsible when a group acts together with the same criminal purpose.',
  'IPC 201': 'This matters if someone hid, destroyed, or changed evidence after an offence.',
  'IPC 297': 'This covers disrespectful or unlawful acts involving burial places, funeral rites, or a human body.',
  'IPC 392': 'This covers robbery, which is theft involving force, fear, or immediate threat.',
  'IPC 397': 'This is a more serious robbery or dacoity situation involving a deadly weapon, grievous hurt, or an attempt to cause death.',
  'IPC 398': 'This covers an attempted robbery or dacoity when the person is armed with a deadly weapon.',
  'IPC 394': 'This matters when someone is hurt while robbery is being committed.',
  'IPC 395': 'This covers dacoity, which is robbery by a group of five or more people.',
  'IPC 379': 'This applies when movable property is allegedly taken dishonestly without consent.',
  'IPC 380': 'This is theft from a house, building, or similar place, so the location makes it more serious.',
  'IPC 457': 'This covers breaking into or entering a place at night for an unlawful purpose.',
  'IPC 411': 'This applies to someone who knowingly receives or keeps stolen property.',
  'IPC 454': 'This covers house-trespass or house-breaking done to commit another offence inside.',
  'IPC 420': 'This applies when someone is allegedly cheated into handing over money, property, or something valuable.',
  'IPC 415': 'This defines cheating: dishonest deception that causes loss, harm, or delivery of property.',
  'IPC 417': 'This is the punishment provision for cheating.',
  'IPC 468': 'This applies when a forged document is allegedly created to cheat someone.',
  'IPC 471': 'This applies when someone allegedly uses a forged document as if it were genuine.',
  'IPC 351': 'This explains assault: creating fear that force is about to be used.',
  'IPC 352': 'This punishes assault or criminal force when there is no serious provocation defence.',
  'IPC 323': 'This applies when someone voluntarily causes bodily pain, disease, or injury.',
  'IPC 504': 'This matters when insults are meant to provoke a fight or disturb public peace.',
  'IPC 354': 'This protects women from assault or force meant to violate dignity or modesty.',
  'IPC 354A': 'This covers sexual harassment, such as unwelcome sexual conduct or demands.',
  'IPC 509': 'This covers words, gestures, or acts intended to insult a woman\'s dignity or modesty.',
  'IPC 503': 'This defines criminal intimidation: threatening someone with injury to cause fear or force action.',
  'IPC 506': 'This is the punishment provision for criminal intimidation.',
  'IPC 507': 'This covers anonymous threats, such as threats sent without revealing the sender.',
  'IPC 499': 'This covers reputation-harming statements, but there are important legal exceptions.',
  'IPC 500': 'This is the punishment provision for criminal defamation.',
  'IPC 498A': 'This applies when a husband or his relatives are accused of cruelty toward a married woman.',
  'IPC 376': 'This applies to rape allegations and must be handled with survivor safety, privacy, and professional support.',
  'IPC 228A': 'This protects the identity of survivors in certain sexual offence cases.',
  'IPC 272': 'This applies when food or drink is allegedly adulterated so it becomes harmful for sale.',
  'IPC 273': 'This applies when harmful or unsafe food or drink is allegedly sold.',
  'IPC 441': 'This defines criminal trespass: entering or staying on property to commit an offence, intimidate, insult, or annoy.',
  'IPC 427': 'This applies when property is damaged and the loss crosses the legal threshold.',
  'CrPC 145': 'This is a preventive procedure for urgent land or water disputes likely to disturb public peace.',
  'IPC 363': 'This applies when someone is allegedly taken away from lawful guardianship or from India.',
  'IPC 364A': 'This applies to kidnapping or abduction linked to ransom or threats of death or serious hurt.',
  'IPC 366': 'This applies when a woman is kidnapped or abducted to force marriage or sexual exploitation.',
  'IPC 384': 'This applies when fear is used to force someone to give money, property, or value.',
  'IPC 386': 'This is a more serious extortion situation involving fear of death or grievous hurt.',
  'IPC 354D': 'This covers repeated following, contacting, or online monitoring after a woman has shown disinterest.',
  'IPC 354C': 'This covers watching, recording, or sharing images of a woman in a private act without consent.',
  'IPC 304B': 'This applies to a woman\'s unnatural death within seven years of marriage linked to dowry cruelty or harassment.',
  'IPC 304A': 'This applies when rash or negligent conduct causes death, without the intention required for murder.',
  'IPC 279': 'This applies to rash or negligent driving on a public road that endangers people.',
  'IPC 337': 'This applies when rash or negligent conduct causes hurt.',
  'IPC 338': 'This applies when rash or negligent conduct causes grievous hurt.',
  'IT Act 66C': 'This covers misuse of another person\'s password, identity, account, or digital credentials.',
  'IT Act 66D': 'This covers online impersonation used to cheat someone, such as fake profiles or fraud messages.',
  'IT Act 66E': 'This protects privacy against capturing or sharing private images without consent.',
  'IT Act 67': 'This applies to publishing or sending obscene material electronically.',
  'DV Act 3': 'This defines domestic violence broadly, including physical, emotional, sexual, verbal, and economic abuse.',
  'POCSO 3': 'This covers penetrative sexual assault against a child and requires child-protective handling.',
  'POCSO 7': 'This covers sexual assault against a child without needing penetration.',
  'POCSO 9': 'This covers aggravated forms of child sexual assault, such as abuse by a person in authority.',
  'JJ Act 75': 'This protects children from cruelty, assault, neglect, abandonment, or mental or physical suffering.',
  'CPA 2': 'This helps decide whether the person is a consumer and whether a service or product complaint can be made.',
  'Drugs and Cosmetics Act 27': 'This applies to serious violations involving unsafe, adulterated, or spurious drugs.',
  'Rent Act': 'This points to state tenancy protections; the exact rule depends on the state and rental arrangement.',
  'DP Act 3': 'This punishes giving, taking, or demanding dowry.',
  'MV Act 134': 'This explains duties after a road accident, such as helping the injured and reporting to police.',
  '21': 'This protects life, liberty, dignity, safety, and fair legal procedure.',
  '19': 'This protects free speech, but speech can still be limited by valid laws such as defamation.',
  '15': 'This protects citizens from discrimination on grounds like religion, race, caste, sex, or place of birth.',
  '14': 'This means the law should treat people equally and fairly.',
  '22': 'This gives basic safeguards after arrest, including being told the grounds and access to a lawyer.',
};

function formatLawExplanationBullet(article: Article) {
  return `- ${getFullLabel(article)}: ${article.title}. Source: local fallback rule mapping. In simple words: ${getArticleExplanation(article)}`;
}

const thinCoverageTypes = new Set<CaseType>([
  'Consumer / Medical Negligence',
  'Landlord / Tenancy',
  'Defamation',
]);

function getEngineLabel(source: AnalysisSource) {
  return source === 'gemini'
    ? 'Gemini live AI, grounded with local retrieval context'
    : 'Local educational rule engine fallback';
}

function assessCoverage(caseTypes: CaseType[], retrievedLaws: RetrievedLaw[]): {
  level: CoverageLevel;
  summary: string;
} {
  if (caseTypes.length === 0) {
    return {
      level: 'thin',
      summary:
        'No known offence pattern matched strongly. Treat this as a broad triage report and add more facts before relying on the section list.',
    };
  }

  if (retrievedLaws.length === 0) {
    return {
      level: 'thin',
      summary:
        'The local law index did not return close matches. Verify every cited section directly against official law sources.',
    };
  }

  if (caseTypes.some((type) => thinCoverageTypes.has(type)) || caseTypes.length > 3 || retrievedLaws.length < 3) {
    return {
      level: 'moderate',
      summary:
        'The app matched a known issue area, but coverage is narrower or overlaps multiple domains. Use the report as a research starting point.',
    };
  }

  return {
    level: 'strong',
    summary:
      'The facts matched a well-covered offence pattern and multiple local law records. Still verify ingredients, amendments, and jurisdiction.',
  };
}

function getOfficialCitationReferences(relevantArticles: Article[]): RetrievalReference[] {
  return relevantArticles
    .map((article) => {
      const equivalent = currentLawEquivalents[article.number];
      if (!equivalent) return null;

      const url = getOfficialCurrentLawUrl(equivalent.current);
      if (!url) return null;

      return {
        title: `${getFullLabel(article)} -> ${equivalent.current}: ${equivalent.subject}`,
        url,
        source: 'India Code',
      };
    })
    .filter((reference): reference is RetrievalReference => Boolean(reference));
}

function getCaseTypes(caseInfo: Pick<CaseSubmission, 'incidentType' | 'description'>) {
  return detectAllCaseTypes(`${caseInfo.incidentType} ${caseInfo.description}`.toLowerCase());
}

function getPreferredSectionLabels(caseTypes: CaseType[]) {
  const legacyLabels = caseTypes.flatMap((type) => LAW_MAP[type]);
  return Array.from(
    new Set(
      legacyLabels.flatMap((label) => {
        const equivalent = currentLawEquivalents[label];
        return equivalent ? [label, equivalent.current] : [label];
      }),
    ),
  );
}

function retrieveLawsForCase(caseInfo: CaseSubmission) {
  const caseTypes = getCaseTypes(caseInfo);
  const retrievalQuery = buildRetrievalQuery(caseInfo, {
    issueTags: caseTypes,
    preferredSectionLabels: getPreferredSectionLabels(caseTypes),
  });

  return retrieveRelevantLaws(retrievalQuery, 8);
}

function validateReportCitations(markdown: string, retrievedLaws: RetrievedLaw[]): CitationValidationResult {
  return validateCitations(markdown, [
    ...getStaticAllowedCitationLabels(),
    ...getAllowedCitationLabelsFromRetrieval(retrievedLaws),
  ]);
}

function buildMetadata(
  caseInfo: CaseSubmission,
  source: AnalysisSource,
  retrievedLaws: RetrievedLaw[],
  citationValidation: CitationValidationResult,
): AnalysisMetadata {
  const caseTypes = getCaseTypes(caseInfo);
  const coverage = assessCoverage(caseTypes, retrievedLaws);
  const relevantArticles = findRelevantArticles(caseInfo);
  const retrievedReferences = retrievedLaws
    .filter((match) => Boolean(match.url))
    .slice(0, 5)
    .map((match) => ({
      title: match.sectionNumber ? `${match.sectionNumber} - ${match.actName}` : match.actName,
      url: match.url,
      source: match.source,
    }));

  return {
    source,
    coverageLevel: coverage.level,
    coverageSummary: coverage.summary,
    retrievalCount: retrievedLaws.length,
    retrievalStrategy: getRetrievalStrategy(retrievedLaws),
    verifiedOn: CURRENT_LAW_MAPPING_LAST_VERIFIED_ON,
    references: [...getOfficialCitationReferences(relevantArticles), ...retrievedReferences].slice(0, 8),
    sectionConfidence: buildSectionConfidence({
      source,
      coverageLevel: coverage.level,
      retrievedLaws,
      citationValidation,
    }),
    citationValidation,
  };
}

function buildTrustSection(metadata: AnalysisMetadata) {
  const coverageLabel = metadata.coverageLevel[0].toUpperCase() + metadata.coverageLevel.slice(1);

  return [
    '### Trust & Retrieval Signals',
    `Report engine: ${getEngineLabel(metadata.source)}`,
    `Coverage indicator: ${coverageLabel}`,
    `Coverage note: ${metadata.coverageSummary}`,
    `Retrieval strategy: ${metadata.retrievalStrategy}`,
    `Retrieved law records: ${metadata.retrievalCount}`,
    `Citation validation: ${metadata.citationValidation.unsupportedCitations.length === 0 ? `${metadata.citationValidation.supportedCount} supported citation(s), no unsupported section labels detected` : `low confidence for ${metadata.citationValidation.unsupportedCitations.join(', ')}`}`,
    `Section confidence: laws ${metadata.sectionConfidence['Indicative Laws and Sections']}, procedure ${metadata.sectionConfidence['Procedural Aspects']}, analysis ${metadata.sectionConfidence['Detailed Legal Analysis']}`,
    `BNS/BNSS mapping table last verified on: ${metadata.verifiedOn}`,
  ].join('\n');
}

function buildOfficialCitationSection(relevantArticles: Article[]) {
  const lines = relevantArticles
    .map((article) => {
      const equivalent = currentLawEquivalents[article.number];
      if (!equivalent) return null;

      const url = getOfficialCitationForLegacyLabel(article.number);
      const currentLabel = url ? `[${equivalent.current}](${url})` : equivalent.current;
      return `- ${getFullLabel(article)} maps to ${currentLabel} - ${equivalent.subject}. Source: local current-law mapping table. In simple words: ${getArticleExplanation(article)}`;
    })
    .filter((line): line is string => Boolean(line));

  if (lines.length === 0) {
    return [
      '### Official Section Citations',
      '- No direct BNS/BNSS/BSA section citation is available from the local mapping for this fact pattern. Use the Law Library and India Code search before relying on any section.',
    ].join('\n');
  }

  return ['### Official Section Citations', ...lines].join('\n');
}

function attachTrustSections(markdown: string, metadata: AnalysisMetadata, caseInfo: CaseSubmission) {
  return [
    buildTrustSection(metadata),
    buildOfficialCitationSection(findRelevantArticles(caseInfo)),
    markdown.trim(),
  ].join('\n\n');
}

function buildProceduralAspects(caseTypes: CaseType[]) {
  const lines = ['- Start with date, place, parties, witnesses, and documents before selecting sections.'];
  const serious = caseTypes.some((type) =>
    ['Murder', 'Attempt to Murder', 'Robbery', 'Sexual Offense', 'Kidnapping / Abduction', 'Dowry Death'].includes(type),
  );

  if (serious) {
    lines.push('- Police process: treat as a cognizable serious offence; preserve scene evidence and medical records.');
    lines.push('- Court track: likely to require Magistrate committal or Sessions-level handling depending on invoked sections.');
  } else {
    lines.push('- Police process: confirm whether the incident is cognizable, non-cognizable, compoundable, or civil in substance.');
  }

  if (caseTypes.includes('Cybercrime')) {
    lines.push('- Digital procedure: preserve screenshots, device logs, URLs, account IDs, headers, and chain of custody.');
  }
  if (caseTypes.includes('Domestic Violence / Family')) {
    lines.push('- Reliefs: consider protection, residence, monetary, custody, and compensation orders under applicable law.');
  }
  if (caseTypes.includes('Child Abuse / Protection')) {
    lines.push('- Child protection: use child-friendly reporting and statement-recording safeguards.');
  }

  lines.push('- Limitation, bail, and forum depend on final sections and incident date.');
  return lines.join('\n');
}

function buildActionPlan(caseTypes: CaseType[]) {
  const lines = [
    '1. Capture the facts in a short chronology with dates, locations, people, and available proof.',
    '2. Preserve evidence immediately: photos, messages, call records, medical papers, bills, CCTV, and witness details.',
    '3. Compare the facts against the ingredients of each possible offence before finalising sections.',
  ];

  if (caseTypes.includes('Cybercrime') || caseTypes.includes('Stalking / Voyeurism')) {
    lines.push('4. For cyber matters, avoid deleting chats or accounts and preserve original devices, screenshots, and URLs.');
  } else if (caseTypes.includes('Sexual Offense')) {
    lines.push('4. Prioritise survivor safety, medical care, privacy, and support services.');
  } else if (caseTypes.includes('Domestic Violence / Family') || caseTypes.includes('Dowry Death')) {
    lines.push('4. Prepare immediate safety planning and interim relief requests if there is ongoing risk.');
  } else if (caseTypes.includes('Rash / Negligent Driving')) {
    lines.push('4. Secure the FIR, medical/post-mortem records, vehicle details, insurance papers, and any CCTV or dashcam footage.');
  } else {
    lines.push('4. Seek qualified legal advice before filing or responding to formal proceedings.');
  }

  lines.push('5. Verify current BNS, BNSS, BSA, state law, and local rules before taking action.');
  return lines.join('\n');
}

function buildPrecedents(caseTypes: CaseType[]) {
  const picked = caseTypes.flatMap((type) => PRECEDENTS[type] ?? []);
  if (picked.length === 0) {
    return '- Use precedent research after the final sections and court forum are identified.';
  }
  return picked.map((precedent) => `- ${precedent}`).join('\n');
}

function buildCurrentLawMapping(relevant: Article[]) {
  const mapped = relevant
    .map((article) => {
      const equivalent = currentLawEquivalents[article.number];
      if (!equivalent) return null;
      const url = getOfficialCitationForLegacyLabel(article.number);
      const currentLabel = url ? `[${equivalent.current}](${url})` : equivalent.current;
      return `- ${getFullLabel(article)} maps to ${currentLabel} - ${equivalent.subject}. Source: local current-law mapping table. In simple words: ${getArticleExplanation(article)}`;
    })
    .filter((line): line is string => Boolean(line));

  if (mapped.length === 0) {
    return [
      `- Mapping table last verified on ${CURRENT_LAW_MAPPING_LAST_VERIFIED_ON}.`,
      '- No direct BNS/BNSS/BSA equivalent is listed here. Where IPC, CrPC, or Evidence Act sections were cited, confirm the current provision on India Code before relying on it.',
    ].join('\n');
  }

  return [
    `- Mapping table last verified on ${CURRENT_LAW_MAPPING_LAST_VERIFIED_ON}.`,
    ...mapped,
    '- Statutes such as the IT Act, POCSO, the DV Act, and the Consumer Protection Act were not replaced in 2024 and continue in force.',
  ].join('\n');
}

function buildConstitutionalImplications(relevant: Article[]) {
  const constitutional = relevant.filter((article) => /^\d+$/.test(article.number));
  if (constitutional.length === 0) {
    return '- Article 21 may be relevant where liberty, dignity, safety, or fair procedure is affected.';
  }
  return constitutional
    .slice(0, 6)
    .map((article) => `- Article ${article.number}: ${article.title}`)
    .join('\n');
}

function formatRetrievedLawMatches(matches: RetrievedLaw[]) {
  if (matches.length === 0) {
    return '- No close retrieved law record was found. Search the Law Library with broader keywords.';
  }

  return matches
    .map((match) => {
      const section = match.sectionNumber ? `${match.sectionNumber}: ` : '';
      const source = match.retrievalSource === 'embedding' ? 'embedding retrieval' : 'keyword fallback';
      const url = match.url ? ` - ${match.url}` : '';
      return `- ${section}${match.actName} (${match.source}, ${match.place}). Source: ${source}. Similarity: ${match.similarity.toFixed(2)}${url}`;
    })
    .join('\n');
}

function buildLocalAnalysis(caseInfo: CaseSubmission, retrievedLaws: RetrievedLaw[]) {
  const caseTypes = getCaseTypes(caseInfo);
  const relevantArticles = findRelevantArticles(caseInfo);
  const caseTypeLabel = caseTypes.length > 0 ? caseTypes.join(', ') : 'General Legal Matter';

  const primaryLaws = relevantArticles.slice(0, 10);
  const laws = primaryLaws.length
    ? primaryLaws.map(formatLawExplanationBullet).join('\n')
    : '- No specific local match found. Add more facts for a sharper classification.';

  const lawReasons = primaryLaws
    .map((article) => `- ${getFullLabel(article)}: ${getArticleExplanation(article)}`)
    .join('\n');

  return [
    '### Case Classification',
    `Case Type: ${caseTypeLabel}`,
    `Date: ${caseInfo.date}`,
    `Location: ${caseInfo.location}`,
    '',
    `Currency Notice: ${IMPORTANT_NOTICE}`,
    '',
    '### Indicative Laws and Sections',
    laws,
    '',
    '### Current Law Mapping (BNS / BNSS / BSA)',
    buildCurrentLawMapping(relevantArticles),
    '',
    '### Dataset Matches',
    formatRetrievedLawMatches(retrievedLaws),
    '',
    '### Detailed Legal Analysis',
    `Reported Issue: ${caseInfo.incidentType}`,
    `Facts Provided: ${caseInfo.description}`,
    '',
    lawReasons || '- More facts are needed to map legal ingredients confidently.',
    '',
    '### Procedural Aspects',
    buildProceduralAspects(caseTypes),
    '',
    '### Legal Precedents',
    buildPrecedents(caseTypes),
    '',
    '### Professional Action Plan',
    buildActionPlan(caseTypes),
    '',
    '### Constitutional Implications',
    buildConstitutionalImplications(relevantArticles),
    '',
    "### Teacher's Note",
    'This analysis is for education and triage. It is not legal advice and should be checked against current official law and a qualified professional.',
  ].join('\n');
}

async function analyzeWithProxy(caseInfo: CaseSubmission): Promise<string | null> {
  const relevantArticles = findRelevantArticles(caseInfo);
  const officialCitations = relevantArticles
    .map((article) => {
      const equivalent = currentLawEquivalents[article.number];
      if (!equivalent) return null;

      const url = getOfficialCitationForLegacyLabel(article.number);
      if (!url) return null;

      return {
        legacyLabel: getFullLabel(article),
        currentLabel: equivalent.current,
        subject: equivalent.subject,
        url,
      };
    })
    .filter(Boolean);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseInfo: {
          incidentType: caseInfo.incidentType,
          description: caseInfo.description,
          date: caseInfo.date,
          location: caseInfo.location,
        },
        officialCitations,
      }),
    });

    // 204 = no key configured or empty AI output; 404 = running the static
    // build with no serverless function (e.g. `vite dev`). Both mean "fall
    // back to the local engine".
    if (!response.ok || response.status === 204) return null;

    const data = (await response.json()) as { markdown?: string };
    const text = data?.markdown?.trim();
    return text || null;
  } catch (error) {
    console.warn('AI proxy unavailable, using local analysis fallback.', error);
    return null;
  }
}

export async function fetchLegalWebResults(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  return [
    {
      title: `Search "${query}" on India Code`,
      url: `https://www.indiacode.nic.in/search?q=${encodeURIComponent(query)}`,
      snippet: 'Check official central law text and current amendments.',
    },
    {
      title: `Search "${query}" on Indian Kanoon`,
      url: `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`,
      snippet: 'Explore judgments and legal commentary for educational research.',
    },
  ];
}

export function buildLocalAnalysisResult(caseInfo: CaseSubmission, source: AnalysisSource = 'local-rule-engine'): AnalysisResult {
  const retrievedLaws = retrieveLawsForCase(caseInfo);
  const localMarkdown = buildLocalAnalysis(caseInfo, retrievedLaws.slice(0, 6));
  const citationValidation = validateReportCitations(localMarkdown, retrievedLaws);
  const checkedMarkdown = appendCitationValidationNotice(localMarkdown, citationValidation);
  const metadata = buildMetadata(caseInfo, source, retrievedLaws, citationValidation);

  return {
    markdown: attachTrustSections(checkedMarkdown, metadata, caseInfo),
    metadata,
  };
}

export async function analyzeCaseWithAI(caseInfo: CaseSubmission): Promise<AnalysisResult> {
  const retrievedLaws = retrieveLawsForCase(caseInfo);
  const proxyResult = await analyzeWithProxy(caseInfo);

  if (proxyResult) {
    const citationValidation = validateReportCitations(proxyResult, retrievedLaws);
    const checkedMarkdown = appendCitationValidationNotice(proxyResult, citationValidation);
    const metadata = buildMetadata(caseInfo, 'gemini', retrievedLaws, citationValidation);
    return {
      markdown: attachTrustSections(checkedMarkdown, metadata, caseInfo),
      metadata,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 400));
  return buildLocalAnalysisResult(caseInfo);
}
