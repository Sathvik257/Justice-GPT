const translation = {
  // Brand
  appName: 'Justice GPT',
  tagline: 'Educational legal triage',
  subtitle: 'AI-assisted legal education for Indian law scenarios',
  copyright: 'For educational purposes only. Not legal advice.',

  // Welcome
  welcomeBadge: 'Legal education assistant',
  welcomeLead: 'Turn a real-life situation into a clear, structured legal map.',
  welcomeBody:
    'Describe what happened and Justice GPT builds an educational report with the likely offence, indicative sections, current BNS/BNSS/BSA law, procedure, and next steps to verify.',
  enter: 'Start assessment',
  featureTriageTitle: 'Guided case triage',
  featureTriageBody: 'Capture the incident, your role, date, place, and evidence in a simple guided flow.',
  featureCurrentTitle: 'Current law, not just old codes',
  featureCurrentBody: 'Every report maps older IPC/CrPC sections to the in-force BNS, BNSS, and BSA provisions.',
  featureEduTitle: 'Education first',
  featureEduBody: 'Clear disclaimers throughout, with reminders to verify current law and talk to a professional.',

  // Role
  roleHeading: 'How would you like to use it?',
  roleHelper: 'The questions adapt to whether you are preparing a professional analysis or seeking general guidance.',
  lawyerTitle: 'I am a lawyer',
  lawyerBody: 'Professional fields for client posture, case category, and litigation preparation.',
  commonTitle: 'I need general guidance',
  commonBody: 'Simple prompts for the incident, your relationship to it, and any witnesses.',

  // Personal details
  personalDetails: 'Personal Details',
  detailsHeading: 'Tell us who is using the report',
  detailsHelper: 'These details stay in this browser unless you clear your saved reports.',
  name: 'Name',
  email: 'Email',
  contact: 'Contact number',
  age: 'Age',
  continue: 'Continue',
  errName: 'Name is required.',
  errEmail: 'Enter a valid email address.',
  errContact: 'Enter a valid Indian mobile number.',
  errAge: 'Enter a valid age.',

  // Steps
  stepDetails: 'Details',
  stepRole: 'Role',
  stepCase: 'Case',
  stepReport: 'Report',

  // Header / nav
  caseIntake: 'Case Intake',
  lawLibrary: 'Law Library',
  history: 'History',
  reset: 'Reset',
  startOver: 'Start over',
  datasetActive: 'Local law dataset is active',

  // Case screen
  caseInfo: 'Case Information',
  caseHeading: 'Build a structured legal education report',
  caseIntro:
    'Share the facts, context, and location. Justice GPT creates an educational triage report with legal sections, procedure, and next steps to verify.',
  backToRole: 'Back to role',
  roleLabel: 'Role',
  roleLawyer: 'Lawyer',
  roleCommon: 'Common person',
  back: 'Back',

  // Common person form
  analyzeCase: 'Analyze Case',
  commonFormTitle: 'General legal guidance request',
  commonFormHelper: 'Use plain words. You do not need legal language; the report explains the likely legal areas to verify.',
  incidentDetails: 'Incident details',
  yourSituation: 'Your situation',
  typeOfIncident: 'Type of incident',
  whatHappened: 'What happened?',
  whenHappened: 'When did it happen?',
  whereHappened: 'Where did it happen?',
  whatDoing: 'What were you doing?',
  relationshipToCase: 'Your relationship to the case',
  anyWitnesses: 'Were there any witnesses?',
  getGuidance: 'Get Legal Guidance',
  phIncident: 'Describe the facts, people involved, what was said or done, and what proof exists.',
  phActivity: 'Explain your role and what you were doing before or during the incident.',
  phWitnesses: 'Names, contact details, CCTV, messages, or people who saw the incident.',
  phLocation: 'City, State',
  selectIncident: 'Select incident type',
  selectRole: 'Select your role',

  // Lawyer form
  lawyerFormTitle: 'Lawyer case analysis',
  lawyerFormHelper:
    'Add the client posture and incident facts so the report can separate legal ingredients, evidence, and procedure.',
  caseFacts: 'Case facts',
  clientContext: 'Client context',
  caseTypeIncident: 'Case type or incident',
  detailedFacts: 'Detailed facts',
  incidentDate: 'Incident date',
  location: 'Location',
  yourPosition: 'Your position',
  clientName: 'Client name',
  caseCategory: 'Case category',
  phLawyerIncident: 'Example: theft, domestic violence, cyber fraud',
  phLawyerFacts: 'Describe what happened, parties involved, evidence, and what relief is being considered.',
  phClientName: 'Client or party name',
  selectPosition: 'Select your position',
  selectCategory: 'Select category',

  // Analysis
  aiAnalysis: 'AI Analysis',
  reportTitle: 'Legal education report',
  backToForm: 'Back to form',
  copy: 'Copy',
  copied: 'Copied',
  print: 'Print',
  analysingTitle: 'Analysing your case',
  analysingBody: 'Matching the facts against educational legal references and building a structured report.',
  noAnalysis: 'No analysis yet.',
  analysisError: 'Analysis failed. Please check your connection and try again.',

  // History
  savedReports: 'Saved reports',
  caseHistory: 'Case History',
  noCases: 'No previous cases found.',
  viewReport: 'View Report',
  closeHistory: 'Close case history',

  // Disclaimer
  disclaimer:
    'This is an educational tool only and does not provide legal advice. Verify current law, court procedure, and local jurisdiction with official resources or a qualified legal professional before acting.',
};

export type Translation = typeof translation;

export function getTranslation(): Translation {
  return translation;
}
