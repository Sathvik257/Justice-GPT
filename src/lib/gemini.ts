// MOCKED Gemini API for local development without a real API key
import { constitutionalArticles } from '../data/constitutionalArticles';

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

export async function analyzeCaseWithAI(caseInfo: {
  incidentType: string;
  description: string;
  date: string;
  location: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const keywords = (caseInfo.incidentType + ' ' + caseInfo.description).toLowerCase();
  const caseTypes = detectAllCaseTypes(keywords);
  const relevantArticles = findRelevantArticles(caseInfo);

  let output = '';
  // Add a bold summary card (markdown)
  output += `> **SUMMARY**: This case appears to involve: **${caseTypes.length > 0 ? caseTypes.join(', ') : 'a general legal issue'}**.\n> The most relevant laws and sections are listed below.\n\n`;

  output += `**Detected Case Type(s):** ${caseTypes.length > 0 ? caseTypes.join(', ') : 'Not specifically identified'}\n\n`;

  if (relevantArticles.length > 0) {
    output += '**Relevant Laws/Articles (in order of importance):**\n';
    for (const art of relevantArticles) {
      output += `- ⚖️ **${getFullLabel(art)}**: ${art.title}  \n  _${art.description}_\n`;
    }
    output += `\n**Analysis:**\n`;
    output += `Based on the information provided (Type: ${caseInfo.incidentType}, Description: ${caseInfo.description}, Date: ${caseInfo.date}, Location: ${caseInfo.location}), the following sections/articles are likely to be relevant:\n`;
    for (const art of relevantArticles) {
      const explanation = getArticleExplanation(art);
      if (explanation) {
        output += `- **${getFullLabel(art)}**: _Why this law applies:_ ${explanation}\n`;
      }
    }
  } else if (caseTypes.length > 0) {
    // Web search fallback for detected case types with no local laws
    output += '**No specific laws found in the local database for this case type. Searching the web for relevant legal information...**\n';
    output += '\n**Web Search Results:**\n';
    // Fetch real web results (mocked for now)
    const webResults = await fetchLegalWebResults(caseTypes.join(' '));
    for (const result of webResults) {
      output += `- [${result.title}](${result.url})\n  _${result.snippet}_\n`;
    }
    output += '\nPlease consult a qualified legal professional or trusted legal website for the most up-to-date information.\n';
  } else {
    // Fallback: general rights
    output += '**No specific case type detected. Please provide more details.**';
  }

  output += `\n**Suggested Next Steps:**\n- Consult a qualified legal professional\n- Gather all relevant evidence and documentation\n- Report to the police if not already done`;

  // Add a Teacher's Note for educational value
  output += `\n\n---\n**Teacher's Note:**\nThis analysis is for educational purposes. Encourage students to research each law/section further and discuss real-world implications in class.`;

  return output;
}
