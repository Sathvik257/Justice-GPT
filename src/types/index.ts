export interface Article {
  id: string;
  number: string;
  title: string;
  description: string;
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