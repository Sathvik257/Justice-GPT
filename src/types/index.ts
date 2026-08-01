export interface Article {
  id?: string;
  number: string;
  title: string;
  description: string;
  type?: string;
}

export type UserRole = 'lawyer' | 'common';

export type AnalysisSource = 'gemini' | 'local-rule-engine';

export type CoverageLevel = 'strong' | 'moderate' | 'thin';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface RetrievalReference {
  title: string;
  url: string;
  source: string;
}

export interface LawTransitionDetails {
  section: string;
  actName: string;
  text: string;
  url?: string;
}

export interface ProcedureStage {
  id: string;
  label: string;
  description: string;
  typicalDuration: string;
  citations?: Array<{
    oldLaw: LawTransitionDetails;
    newLaw: LawTransitionDetails;
  }>;
}

export interface CaseStrengthScore {
  label: string;
  value: number;
  explanation: string;
}

export interface AnalysisMetadata {
  source: AnalysisSource;
  coverageLevel: CoverageLevel;
  coverageSummary: string;
  retrievalCount: number;
  retrievalStrategy: 'local-embedding-rag' | 'keyword-fallback';
  verifiedOn: string;
  references: RetrievalReference[];
  sectionConfidence: Record<string, ConfidenceLevel>;
  citationValidation: {
    supportedCount: number;
    unsupportedCitations: string[];
  };
}

export interface PersonalDetails {
  name: string;
  age: string;
  email: string;
  contact: string;
}

export interface CaseInfo {
  incidentType: string;
  description: string;
  date: string;
  location: string;
}

export interface LawyerCaseInfo extends CaseInfo {
  position: string;
  clientName: string;
  caseType: string;
}

export interface CommonPersonCaseInfo extends CaseInfo {
  activity: string;
  relationship: string;
  witnesses: string;
}

export type CaseSubmission = LawyerCaseInfo | CommonPersonCaseInfo;

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  role: UserRole;
  caseInfo: CaseSubmission;
  analysis: string;
  metadata?: AnalysisMetadata;
}
