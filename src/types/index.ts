export interface Article {
  id?: string;
  number: string;
  title: string;
  description: string;
  type?: string;
}

export type Language = 'en' | 'hi' | 'te';

export type UserRole = 'lawyer' | 'common';

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
}
