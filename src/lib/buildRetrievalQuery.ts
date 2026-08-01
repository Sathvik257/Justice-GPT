export interface RetrievalQueryHints {
  issueTags?: string[];
  preferredSectionLabels?: string[];
}

export interface RetrievalCaseFields {
  incidentType: string;
  description: string;
  date: string;
  location: string;
  caseType?: string;
  position?: string;
  activity?: string;
  relationship?: string;
  witnesses?: string;
}

function clip(value: string, max: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function scrubPIIFromText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(?:\+?91[-.\s]?)?[6-9]\d{9}\b/g, '[phone]')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[id]')
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/gi, '[id]')
    .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, '[date]')
    .replace(/\b(?:Mr|Mrs|Ms|Miss|Shri|Smt|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g, '[person]')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDateBucket(date: string) {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'incident date provided';

  const transitionDate = new Date('2024-07-01T00:00:00+05:30');
  return parsed >= transitionDate
    ? 'incident date after 1 July 2024 current criminal codes apply'
    : 'incident date before 1 July 2024 legacy criminal code transition issue';
}

function getLocationContext(location: string) {
  const scrubbed = scrubPIIFromText(location)
    .replace(/\b\d{6}\b/g, '[pin]')
    .replace(/\b(?:flat|house|door|plot|street|lane|road)\s+\w+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return scrubbed ? `jurisdiction location context ${clip(scrubbed, 120)}` : '';
}

export function buildRetrievalQuery(caseInfo: RetrievalCaseFields, hints: RetrievalQueryHints = {}) {
  const issueTags = hints.issueTags?.filter(Boolean).join(' ');
  const preferredSections = hints.preferredSectionLabels?.filter(Boolean).join(' ');
  const roleSpecificFields = [
    caseInfo.caseType ?? '',
    caseInfo.position ?? '',
    caseInfo.activity ?? '',
    caseInfo.relationship ?? '',
    caseInfo.witnesses ?? '',
  ]
    .map((value) => scrubPIIFromText(value))
    .filter(Boolean)
    .join(' ');

  return [
    `reported issue ${scrubPIIFromText(caseInfo.incidentType)}`,
    `fact summary ${clip(scrubPIIFromText(caseInfo.description), 900)}`,
    roleSpecificFields ? `context ${clip(roleSpecificFields, 350)}` : '',
    issueTags ? `issue tags ${issueTags}` : '',
    preferredSections ? `preferred law candidates ${preferredSections}` : '',
    getDateBucket(caseInfo.date),
    getLocationContext(caseInfo.location),
  ]
    .filter(Boolean)
    .join(' | ');
}
