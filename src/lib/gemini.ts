// MOCKED Gemini API for local development without a real API key
import { constitutionalArticles } from '../data/constitutionalArticles';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function detectCaseType(keywords: string): string | null {
  if ((/murder|killed|homicide|stab|shoot|poison/.test(keywords)) && (/cut|pieces|dismember|body|corpse|burial|dispose/.test(keywords))) return 'Brutal Murder / Dismemberment';
  if (/cut into pieces|dismember|body parts|brutal murder|corpse|burial|dispose|dispose of body/.test(keywords)) return 'Brutal Murder / Dismemberment';
  if (/murder|killed|homicide|stab|shoot|poison/.test(keywords)) return 'Murder';
  if (/rape|sexual assault|sexual abuse|forced|gangrape|gang rape/.test(keywords)) return 'Sexual Assault / Rape';
  if (/theft|stolen|steal|robbery|burglary|snatch/.test(keywords)) return 'Theft';
  if (/harass|molest|outrage|woman|eve teasing|sexual/.test(keywords)) return 'Harassment';
  if (/property|trespass|encroach|land|house/.test(keywords)) return 'Property Dispute';
  if (/hit and run|accident|rash|negligence|bike|car|vehicle|died|death/.test(keywords)) return 'Hit and Run / Accident';
  if (/discrimination|caste|gender|race|religion|bias/.test(keywords)) return 'Discrimination';
  if (/freedom|speech|expression|assembly|movement|profession/.test(keywords)) return 'Freedom of Rights';
  if (/arrest|detention|custody|police|jail|imprisonment/.test(keywords)) return 'Arrest/Detention';
  if (/cyber|hacking|phishing|online fraud|identity theft|digital|computer/.test(keywords)) return 'Cybercrime';
  if (/dowry|dowry death|dowry harassment/.test(keywords)) return 'Dowry';
  if (/domestic violence|abuse at home|spousal abuse|family violence/.test(keywords)) return 'Domestic Violence';
  if (/corruption|bribery|graft|public servant/.test(keywords)) return 'Corruption';
  if (/environment|pollution|wildlife|forest|water act|air act/.test(keywords)) return 'Environmental Law';
  if (/child labor|child labour|child work|minor employed/.test(keywords)) return 'Child Labor';
  return null;
}

function detectAllCaseTypes(keywords: string): string[] {
  const types: string[] = [];
  if ((/murder|killed|homicide|stab|knife|shoot|poison/.test(keywords)) && (/attempt|try|poison|failed|not die|survive|didn't die|did not die/.test(keywords))) types.push('Attempt to Murder');
  if ((/murder|killed|homicide|stab|knife|shoot|poison/.test(keywords)) && !types.includes('Attempt to Murder')) types.push('Murder');
  if (/robbery|robbed|robber|dacoity|dacoit|snatch|snatched|bike snatch|armed|weapon|threaten|knife|gun|forcefully/.test(keywords)) types.push('Robbery');
  if (/theft|stolen|steal|burglar|burglary|break[- ]?in|broke into|locker|pickpocket|pick pocket/.test(keywords)) types.push('Theft');
  if (/cheat|fraud|scam|fake|forgery|dishonest|builder|online seller|not responding|unreachable|false|mislead/.test(keywords)) types.push('Fraud / Cheating');
  if (/assault|slap|hit|beat|push|attack|fight|physical|injury|hurt|aggressively/.test(keywords)) types.push('Assault');
  if (/harass|harassment|eve teasing|lewd|comment|inappropriate|touch|molest|outrage|modesty|insult|humiliate|public/.test(keywords)) types.push('Harassment');
  if (/intimidate|threat|threaten|blackmail|fear|frighten|kill you|kill me|kill family|anonymous message|personal details/.test(keywords)) types.push('Criminal Intimidation / Threats');
  if (/cyber|hack|hacked|phish|phishing|online|account|instagram|facebook|social media|morph|photoshop|obscene|blackmail|profile|lost access|fake image|fake video/.test(keywords)) types.push('Cybercrime');
  if (/domestic violence|husband hits|in-laws abuse|dowry|mental torture|abuse|family|spouse|remarry|throw me out|demand money/.test(keywords)) types.push('Domestic Violence / Family');
  if (/child|minor|underage|young girl|maid|beaten|not allowed|school|locked|student|teacher/.test(keywords)) types.push('Child Abuse / Protection');
  if (/rape|sexual assault|sexual abuse|sexual harassment|vulgar|gesture|bus|crowded|touching|inappropriately|consent|victim|man stood close|purpose/.test(keywords)) types.push('Sexual Offense');
  if (/expired medicine|pharmacy|chemist|sick|ill|refused|responsibility/.test(keywords)) types.push('Consumer / Medical Negligence');
  if (/landlord|rent|water|electricity|disconnect|force leave|evict|eviction|illegal/.test(keywords)) types.push('Landlord / Tenancy');
  return Array.from(new Set(types));
}

// Helper: Find relevant articles based on keywords in the case description/type
function findRelevantArticles(caseInfo: { incidentType: string; description: string; }) {
  const keywords = (caseInfo.incidentType + ' ' + caseInfo.description).toLowerCase();
  const caseTypes = detectAllCaseTypes(keywords);
  const lawOrder: string[] = [];
  const lawSet = new Set<string>();

  // If no specific case type detected, return only basic articles
  if (caseTypes.length === 0) {
    return constitutionalArticles.filter(a => ['14', '15', '19', '21', '22'].includes(a.number));
  }

  for (const caseType of caseTypes) {
    if (caseType === 'Murder') {
      ['IPC 302','IPC 120B','IPC 34','IPC 201','IPC 297','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Attempt to Murder') {
      ['IPC 307','IPC 120B','IPC 34','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Robbery') {
      ['IPC 392','IPC 397','IPC 398','IPC 394','IPC 395','IPC 34','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Theft') {
      ['IPC 379','IPC 380','IPC 457','IPC 411','IPC 454','IPC 21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Fraud / Cheating') {
      ['IPC 420','IPC 415','IPC 417','IPC 468','IPC 471','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Assault') {
      ['IPC 351','IPC 352','IPC 323','IPC 504','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Harassment') {
      ['IPC 354','IPC 509','14','15','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Criminal Intimidation / Threats') {
      ['IPC 503','IPC 506','IPC 507','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Cybercrime') {
      ['IT Act 66C','IT Act 66D','IT Act 67','IPC 354A','IPC 499','IPC 500','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Domestic Violence / Family') {
      ['DV Act 3','IPC 498A','IPC 506','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Child Abuse / Protection') {
      ['POCSO 3','POCSO 7','POCSO 9','IPC 75','IPC 82','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Sexual Offense') {
      ['IPC 376','IPC 354','IPC 354A','IPC 509','IPC 228A','21','14'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Consumer / Medical Negligence') {
      ['CPA 2','IPC 272','IPC 273','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
    if (caseType === 'Landlord / Tenancy') {
      ['Rent Act','IPC 441','IPC 427','21'].forEach(num => { if (!lawSet.has(num)) { lawOrder.push(num); lawSet.add(num); } });
    }
  }
  if (caseTypes.length > 0 && lawOrder.length === 0) {
    return [];
  }
  return lawOrder
    .map(num => constitutionalArticles.find(a => a.number === num))
    .filter((a): a is typeof constitutionalArticles[number] => Boolean(a));
}

// Build dynamic, case-specific procedural guidance
function buildProceduralAspects(caseTypes: string[]): string {
  const lines: string[] = [];

  const isHeinous = caseTypes.some(t => ['Murder', 'Attempt to Murder', 'Sexual Offense', 'Robbery'].includes(t));
  const isBailable = caseTypes.some(t => ['Theft', 'Assault', 'Criminal Intimidation / Threats', 'Landlord / Tenancy'].includes(t));
  const isCyber = caseTypes.includes('Cybercrime');
  const isDV = caseTypes.includes('Domestic Violence / Family');
  const isChild = caseTypes.includes('Child Abuse / Protection');

  // Jurisdiction / Trial
  if (isHeinous || isChild) {
    lines.push('- Jurisdiction: Sessions Court');
    lines.push('- Trial: Warrant case procedure by Court of Session');
  } else if (isDV) {
    lines.push('- Jurisdiction: Magistrate court under the Protection of Women from Domestic Violence Act');
    lines.push('- Trial: Summary/warrant procedure as applicable');
  } else if (isCyber) {
    lines.push('- Jurisdiction: Magistrate/Sessions (depending on sections), IT Act cognizance');
    lines.push('- Trial: Warrant case procedure');
  } else {
    lines.push('- Jurisdiction: Magistrate Court');
    lines.push('- Trial: Summary/Warrant procedure depending on offence');
  }

  // Limitation
  if (caseTypes.includes('Murder') || caseTypes.includes('Attempt to Murder') || caseTypes.includes('Sexual Offense')) {
    lines.push('- Limitation: No limitation (serious offences)');
  } else {
    lines.push('- Limitation: As per CrPC Chapter XXXVI (varies by maximum punishment)');
  }

  // Bail
  if (caseTypes.includes('Murder') || caseTypes.includes('Attempt to Murder') || caseTypes.includes('Robbery') || caseTypes.includes('Sexual Offense')) {
    lines.push('- Bail: Generally non‑bailable; considered on merits');
  } else if (isBailable) {
    lines.push('- Bail: Often bailable subject to conditions');
  } else if (isCyber) {
    lines.push('- Bail: Depends on invoked IT/IPC sections');
  }

  // Special procedures
  if (isCyber) {
    lines.push('- Procedure: Preserve digital evidence, hash values, seizure under CrPC/IT Act guidelines');
  }
  if (isChild) {
    lines.push('- Special Court: POCSO Special Court; child‑friendly recording under Sec. 164 CrPC');
  }
  if (isDV) {
    lines.push('- Interim Reliefs: Protection/residence/maintenance orders under DV Act');
  }

  return lines.join('\n');
}

// Build dynamic precedents based on case type
function buildPrecedents(caseTypes: string[]): string {
  const catalog: Record<string, string[]> = {
    'Murder': [
      'State of Andhra Pradesh v. Rayavarapu Punnayya (1976) — distinction between murder and culpable homicide',
      'Virsa Singh v. State of Punjab (1958) — intention and bodily injury test',
    ],
    'Attempt to Murder': [
      'State of Maharashtra v. Kashirao (2003) — ingredients of attempt under Sec. 307 IPC',
    ],
    'Robbery': [
      'Shiv Kumar v. State of M.P. (1994) — robbery/dacoity principles',
    ],
    'Theft': [
      'Pyare Lal Bhargava v. State of Rajasthan (1963) — meaning of “moves property”',
    ],
    'Cybercrime': [
      'Shreya Singhal v. Union of India (2015) — free speech and online content',
    ],
    'Sexual Offense': [
      'State of Punjab v. Gurmit Singh (1996) — testimony of prosecutrix',
      'Patan Jamal Vali v. State of Andhra Pradesh (2021) — consent and vulnerability',
    ],
    'Domestic Violence / Family': [
      'Hiral P. Harsora v. Kusum Narottamdas Harsora (2016) — scope of “respondent” under DV Act',
    ],
    'Child Abuse / Protection': [
      'Alakh Alok Srivastava v. Union of India (2018) — POCSO guidelines',
    ],
  };

  const picked = caseTypes.flatMap(t => catalog[t] ?? []);
  if (picked.length === 0) {
    return [
      'K.M. Nanavati v. State of Maharashtra (1962) — burden and provocation (illustrative)',
    ].join('\n');
  }
  return picked.map(p => `- ${p}`).join('\n');
}

// Build dynamic action plan
function buildActionPlan(caseTypes: string[]): string {
  const blocks: string[] = [];

  blocks.push('1. Immediate Steps:');
  blocks.push('   - File FIR/complaint under appropriate sections');
  blocks.push('   - Preserve evidence and record first version promptly');

  if (caseTypes.includes('Murder') || caseTypes.includes('Attempt to Murder')) {
    blocks.push('   - Secure crime scene; call FSL; ensure post‑mortem and inquest');
    blocks.push('   - Seize weapons/clothes; send for serology');
  }
  if (caseTypes.includes('Sexual Offense')) {
    blocks.push('   - Ensure medical examination within 24 hours; Section 164 CrPC statement');
    blocks.push('   - Provide victim compensation/support services');
  }
  if (caseTypes.includes('Robbery') || caseTypes.includes('Theft')) {
    blocks.push('   - Circulate property details; check pawn/second‑hand markets; CDR/CCTV analysis');
  }
  if (caseTypes.includes('Cybercrime')) {
    blocks.push('   - Preserve device logs, IPs, server data; notify platform/CERT‑In');
  }
  if (caseTypes.includes('Domestic Violence / Family')) {
    blocks.push('   - Apply for protection/residence/maintenance orders; connect with Protection Officer');
  }
  if (caseTypes.includes('Child Abuse / Protection')) {
    blocks.push('   - Child‑friendly procedures; statement via support person; avoid repeated examination');
  }

  blocks.push('\n2. Investigation Phase:');
  blocks.push('   - Witness examination and collection of documentary/digital evidence');
  if (caseTypes.includes('Cybercrime')) {
    blocks.push('   - Forensic imaging and chain‑of‑custody documentation');
  }
  if (caseTypes.includes('Murder') || caseTypes.includes('Attempt to Murder')) {
    blocks.push('   - Motive reconstruction; call records; last‑seen and recovery evidence');
  }

  blocks.push('\n3. Trial Preparation:');
  blocks.push('   - Draft charge; prepare examination‑in‑chief and cross‑examination notes');
  blocks.push('   - Organize exhibits with index and authenticity certificates');
  return blocks.join('\n');
}

// Build constitutional implications with short descriptions
function buildConstitutionalImplications(caseTypes: string[], relevant: Array<{ number: string; title: string; description?: string }>): string {
  // If relevant list already contains constitutional articles, show those with titles
  const constitutional = relevant.filter(a => !a.number.startsWith('IPC') && !a.number.includes('Act'));
  if (constitutional.length > 0) {
    return constitutional
      .slice(0, 6)
      .map(a => `- Article ${a.number}: ${a.title}`)
      .join('\n');
  }

  // Otherwise infer likely articles
  const inferred: string[] = ['21'];
  if (caseTypes.includes('Sexual Offense') || caseTypes.includes('Domestic Violence / Family') || caseTypes.includes('Child Abuse / Protection')) inferred.push('14');
  if (caseTypes.includes('Cybercrime')) inferred.push('19');
  if (caseTypes.includes('Arrest/Detention')) inferred.push('22');
  const unique = Array.from(new Set(inferred));
  return unique
    .map(num => constitutionalArticles.find(a => a.number === num))
    .filter((a): a is typeof constitutionalArticles[number] => Boolean(a))
    .map(a => `- Article ${a.number}: ${a.title}`)
    .join('\n');
}

function getFullLabel(article: { number: string }) {
  if (article.number.startsWith('IPC')) return `IPC Section ${article.number.replace('IPC ', '')}`;
  if (article.number.startsWith('MV Act')) return `MV Act Section ${article.number.replace('MV Act ', '')}`;
  return `Article ${article.number}`;
}

function getArticleExplanation(article: { number: string, title: string }) {
  switch (article.number) {
    case 'IPC 302':
      return `${getFullLabel(article)} applies because the case involves murder.`;
    case 'IPC 201':
      return `${getFullLabel(article)} applies if there was an attempt to hide evidence or dispose of the body.`;
    case 'IPC 297':
      return `${getFullLabel(article)} applies if there was indignity to a corpse or trespassing on burial places.`;
    case '21':
      return `${getFullLabel(article)} applies as it protects the right to life and personal liberty.`;
    case '14':
      return `${getFullLabel(article)} applies as it ensures equality before the law.`;
    case 'IPC 304A':
      return `${getFullLabel(article)} applies in cases of death by negligence (e.g., accidents).`;
    case 'MV Act 134':
      return `${getFullLabel(article)} applies for duties of a driver in case of an accident.`;
    case 'IPC 376':
      return `${getFullLabel(article)} applies in cases of rape or sexual assault.`;
    case '15':
      return `${getFullLabel(article)} applies as it prohibits discrimination.`;
    case '19':
      return `${getFullLabel(article)} applies for protection of fundamental rights.`;
    case '22':
      return `${getFullLabel(article)} applies for protection against arrest and detention.`;
    case 'IPC 379':
      return `${getFullLabel(article)} applies in cases of theft.`;
    case 'IPC 354':
      return `${getFullLabel(article)} applies in cases of harassment or assault on women.`;
    case 'IPC 441':
      return `${getFullLabel(article)} applies in cases of criminal trespass or property disputes.`;
    case 'IPC 120B':
      return `${getFullLabel(article)} applies if there was a criminal conspiracy related to the offence.`;
    case 'IPC 34':
      return `${getFullLabel(article)} applies when a criminal act is done by several persons in furtherance of common intention.`;
    case 'IPC 411':
      return `${getFullLabel(article)} applies if someone received or retained stolen property.`;
    case 'IPC 457':
      return `${getFullLabel(article)} applies in cases of house-breaking or lurking house-trespass by night.`;
    case 'IPC 427':
      return `${getFullLabel(article)} applies in cases of mischief causing damage to property.`;
    case 'IPC 447':
      return `${getFullLabel(article)} applies in cases of criminal trespass on property.`;
    case 'IPC 228A':
      return `${getFullLabel(article)} applies if there was disclosure of the identity of a victim of certain offences (e.g., rape).`;
    default:
      return '';
  }
}

// Placeholder for real web search or legal API integration
export async function fetchLegalWebResults(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  // TODO: Integrate with a real legal API or web search (e.g., Indian Kanoon, Google Custom Search, etc.)
  // For now, return mocked results
  return [
    {
      title: `Search results for "${query}" on Indian Kanoon`,
      url: `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`,
      snippet: 'Find relevant case law, statutes, and legal commentary for your query.'
    },
    {
      title: `General legal information for "${query}"`,
      url: `https://www.legalserviceindia.com/`,
      snippet: 'Browse articles, case studies, and legal advice on Indian law.'
    }
  ];
}

// API function to cross-check with external legal database
async function crossCheckWithAPI(laws: string[]): Promise<any[]> {
  try {
    // Example API endpoints (replace with actual legal database API)
    // const apiEndpoints = {
    //   indianKanoon: 'https://api.indiankanoon.org/search',
    //   legalDatabase: 'https://api.legaldatabase.in/verify',
    //   // Add more legal APIs as needed
    // };

    // For now, simulate API call with realistic data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return laws.map(law => {
      // Simulate different verification statuses
      const isVerified = Math.random() > 0.1; // 90% verification rate
      const lastUpdated = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      return {
        number: law,
        verified: isVerified,
        lastUpdated,
        status: isVerified ? 'Active' : 'Under Review',
        source: 'Indian Legal Database',
        url: `https://indiankanoon.org/search/?formInput=${encodeURIComponent(law)}`
      };
    });

    // TODO: Replace above simulation with actual API call:
    /*
    const response = await fetch(`${apiEndpoints.legalDatabase}/batch-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LEGAL_API_KEY}`
      },
      body: JSON.stringify({ laws })
    });
    
    if (!response.ok) {
      throw new Error('API verification failed');
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('API cross-check failed:', error);
    // Return fallback data if API fails
    return laws.map(law => ({
      number: law,
      verified: false,
      lastUpdated: 'Unknown',
      status: 'Verification Failed',
      source: 'Local Database',
      url: null
    }));
  }
}

export async function analyzeCaseWithAI(caseInfo: {
  incidentType: string;
  description: string;
  date: string;
  location: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const keywords = (caseInfo.incidentType + ' ' + caseInfo.description).toLowerCase();
  const caseTypes = detectAllCaseTypes(keywords);
  const relevantArticles = findRelevantArticles(caseInfo);

  // Extract law numbers for API cross-check
  const lawNumbers = relevantArticles.map(art => art.number);
  const apiVerification = await crossCheckWithAPI(lawNumbers);

  let output = '';
  
  // Header: Case Classification (to match screenshot)
  output += `### Case Classification\n`;
  const caseTypeLabel = caseTypes.length > 0 ? caseTypes.join(', ') : 'General Legal Matter';
  output += `Case Type: ${caseTypeLabel}\n`;
  output += `Date: ${caseInfo.date}\n`;
  output += `Location: ${caseInfo.location}\n\n`;

  if (relevantArticles.length > 0) {
    // Relevant IPC Sections
    output += '### Relevant IPC Sections\n\n';
    output += 'Primary Sections:\n';
    
    // Show primary laws with clean formatting
    const primaryLaws = relevantArticles.slice(0, 8); // Show up to 8 laws
    
    for (const art of primaryLaws) {
      const label = getFullLabel(art);
      output += `- ${label}: ${art.title}\n`;
    }

    // Attempt/related sections if present
    const attemptRelated = relevantArticles
      .slice(8)
      .map(a => `- ${getFullLabel(a)}: ${a.title}`)
      .join('\n');
    if (attemptRelated) {
      output += `\nAttempt Cases:\n${attemptRelated}\n`;
    }

    // Analysis section
    output += '\n### Detailed Legal Analysis\n\n';
    output += 'Mens Rea Elements:\n';
    output += '- Intention to cause death\n- Knowledge that act is likely to cause death\n- Absence of lawful excuse\n\n';
    output += 'Actus Reus Elements:\n';
    output += '- Causing death of another person\n- Voluntary act or omission\n- Causal connection between act and death\n\n';
    output += 'Evidence Requirements:\n';
    output += '1. Medical evidence of cause of death\n2. Witness testimony\n3. Forensic evidence\n4. Motive and opportunity\n\n';
    output += `Based on the information provided (Type: ${caseInfo.incidentType}, Description: ${caseInfo.description}, Date: ${caseInfo.date}, Location: ${caseInfo.location}), the following sections/articles are likely to be relevant:\n\n`;
    
    // Show why each law applies
    for (const art of primaryLaws.slice(0, 4)) {
      const explanation = getArticleExplanation(art);
      if (explanation) {
        output += `- **${getFullLabel(art)}**: _Why this law applies:_ ${explanation}\n\n`;
      }
    }

    // Procedural Aspects (dynamic)
    output += '### Procedural Aspects\n\n';
    output += buildProceduralAspects(caseTypes) + '\n\n';

    // Legal Precedents (dynamic)
    output += '### Legal Precedents\n\n';
    const precedents = buildPrecedents(caseTypes);
    output += precedents.startsWith('-') ? precedents + '\n' : `- ${precedents}\n`;
    output += '- State of Punjab v. Gurmit Singh (1996)\n\n';

    output += '### Professional Action Plan\n\n';
    output += buildActionPlan(caseTypes) + '\n\n';

    output += '### Constitutional Implications\n\n';
    output += buildConstitutionalImplications(caseTypes, relevantArticles) + '\n\n';

    // API verification status
    if (apiVerification.length > 0) {
      const verifiedCount = apiVerification.filter(v => v.verified).length;
      output += `**Database Status:** ${verifiedCount}/${apiVerification.length} laws verified\n\n`;
    }

    // Teacher's Note
    output += "**Teacher's Note:** This analysis is for educational purposes. Encourage students to research each law/section further and discuss real-world implications in class.\n\n";

  } else {
    output += '**No specific laws identified for this case type.**\n';
    output += 'Please provide more detailed case information for accurate legal analysis.\n\n';
  }

  // Educational disclaimer
  output += '---\n';
  output += '_This analysis is for educational purposes only. Always consult current legal resources and qualified professionals._';

  return output;
}
