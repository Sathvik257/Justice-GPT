// Expanded Indian Constitutional Articles and IPC Sections
export const constitutionalArticles = [
  {
    id: '1',
    number: '14',
    title: 'Right to Equality',
    description: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
    type: 'general'
  },
  {
    id: '2',
    number: '15',
    title: 'Prohibition of Discrimination',
    description: 'The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them.',
    type: 'discrimination'
  },
  {
    id: '3',
    number: '19',
    title: 'Protection of Fundamental Rights',
    description: 'All citizens shall have the right to freedom of speech and expression, assembly, association, movement, residence, and profession.',
    type: 'freedom'
  },
  {
    id: '4',
    number: '21',
    title: 'Right to Life and Personal Liberty',
    description: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.',
    type: 'life'
  },
  {
    id: '5',
    number: '22',
    title: 'Protection Against Arrest and Detention',
    description: 'No person who is arrested shall be detained in custody without being informed of the grounds for such arrest nor shall be denied the right to consult and defend by a legal practitioner of his choice.',
    type: 'arrest'
  },
  // IPC Sections
  {
    id: '6',
    number: 'IPC 304A',
    title: 'Causing death by negligence',
    description: 'Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished.',
    type: 'hit and run'
  },
  // Add commonly referenced homicide/murder sections used in analysis UI
  { number: 'IPC 299', title: 'Culpable Homicide', description: 'Defines culpable homicide and lays the foundation for homicide offences.' },
  { number: 'IPC 300', title: 'Murder', description: 'Explains when culpable homicide amounts to murder.' },
  { number: 'IPC 304', title: 'Culpable Homicide Not Amounting to Murder', description: 'Punishment for culpable homicide that does not amount to murder.' },
  { number: 'IPC 308', title: 'Attempt to Commit Culpable Homicide', description: 'Punishment for attempt to commit culpable homicide.' },
  {
    id: '7',
    number: 'IPC 302',
    title: 'Punishment for murder',
    description: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
    type: 'murder'
  },
  {
    id: '8',
    number: 'IPC 379',
    title: 'Punishment for theft',
    description: 'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
    type: 'theft'
  },
  {
    id: '9',
    number: 'IPC 354',
    title: 'Assault or criminal force to woman with intent to outrage her modesty',
    description: 'Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished.',
    type: 'rape'
  },
  {
    id: '10',
    number: 'MV Act 134',
    title: 'Duty of driver in case of accident and injury to a person',
    description: 'The driver of a vehicle involved in an accident must secure medical attention for the injured and report the incident to the police.',
    type: 'hit and run'
  },
  {
    id: '11',
    number: 'IPC 441',
    title: 'Criminal trespass',
    description: 'Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property.',
    type: 'property'
  },
  {
    id: '12',
    number: 'IPC 376',
    title: 'Punishment for rape',
    description: 'Whoever, except in the cases provided for in sub-section (2), commits rape, shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years but which may extend to imprisonment for life, and shall also be liable to fine.',
    type: 'rape'
  },
  {
    id: '13',
    number: 'IPC 201',
    title: 'Causing disappearance of evidence of offence, or giving false information to screen offender',
    description: 'Whoever, knowing or having reason to believe that an offence has been committed, causes any evidence of the commission of that offence to disappear, or gives any information respecting the offence which he knows or believes to be false, shall be punished.',
    type: 'murder'
  },
  {
    id: '14',
    number: 'IPC 297',
    title: 'Trespassing on burial places, etc.',
    description: 'Whoever, with the intention of wounding the feelings of any person, or of insulting the religion of any person, trespasses on any burial place, or place set apart for the performance of funeral rites, or offers any indignity to any human corpse, or causes disturbance to any persons assembled for the performance of funeral ceremonies, shall be punished.',
    type: 'murder'
  },
  {
    id: '15',
    number: 'IPC 120B',
    title: 'Punishment of criminal conspiracy',
    description: 'Whoever is a party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment for a term of two years or upwards shall be punished.',
    type: 'murder'
  },
  {
    id: '16',
    number: 'IPC 34',
    title: 'Acts done by several persons in furtherance of common intention',
    description: 'When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act as if done by him alone.',
    type: 'murder'
  },
  {
    id: '17',
    number: 'IPC 411',
    title: 'Dishonestly receiving stolen property',
    description: 'Whoever dishonestly receives or retains any stolen property, knowing or having reason to believe the same to be stolen property, shall be punished.',
    type: 'theft'
  },
  {
    id: '18',
    number: 'IPC 457',
    title: 'Lurking house-trespass or house-breaking by night',
    description: 'Whoever commits lurking house-trespass by night, or house-breaking by night, shall be punished.',
    type: 'theft'
  },
  {
    id: '19',
    number: 'IPC 228A',
    title: 'Disclosure of identity of the victim of certain offences',
    description: 'Whoever prints or publishes the name or any matter which may make known the identity of any person against whom an offence under section 376 is alleged or found to have been committed, shall be punished.',
    type: 'rape'
  },
  {
    id: '20',
    number: 'IPC 427',
    title: 'Mischief causing damage',
    description: 'Whoever commits mischief and thereby causes loss or damage to the amount of fifty rupees or upwards, shall be punished.',
    type: 'property'
  },
  {
    id: '21',
    number: 'IPC 447',
    title: 'Punishment for criminal trespass',
    description: 'Whoever commits criminal trespass shall be punished with imprisonment of either description for a term which may extend to three months, or with fine which may extend to five hundred rupees, or with both.',
    type: 'property'
  },
  // Add missing law entries for all referenced sections
  { number: 'CPA 2', title: 'Consumer Protection Act, Section 2', description: 'Defines consumer rights and who is a consumer under the law.' },
  { number: 'IPC 272', title: 'Adulteration of food or drink intended for sale', description: 'Punishes anyone who adulterates food or drink, making it harmful for sale.' },
  { number: 'IPC 273', title: 'Sale of noxious food or drink', description: 'Punishes anyone who sells food or drink that is harmful or unfit for consumption.' },
  { number: 'IPC 379', title: 'Theft', description: 'Punishment for theft of movable property.' },
  { number: 'IPC 380', title: 'Theft in dwelling house', description: 'Punishment for theft committed in a house, building, or vessel.' },
  { number: 'IPC 392', title: 'Robbery', description: 'Punishment for committing robbery.' },
  { number: 'IPC 394', title: 'Voluntarily causing hurt in committing robbery', description: 'Punishment for causing hurt while committing robbery.' },
  { number: 'IPC 395', title: 'Dacoity', description: 'Punishment for committing dacoity (robbery by a group of five or more).' },
  { number: 'IPC 397', title: 'Robbery or dacoity with attempt to cause death or grievous hurt', description: 'Enhanced punishment for robbery/dacoity with deadly weapon or causing grievous hurt.' },
  { number: 'IPC 398', title: 'Attempt to commit robbery/dacoity with deadly weapon', description: 'Punishment for attempt to commit robbery/dacoity with deadly weapon.' },
  { number: 'IPC 411', title: 'Dishonestly receiving stolen property', description: 'Punishment for receiving or retaining stolen property.' },
  { number: 'IPC 454', title: 'Lurking house-trespass or house-breaking', description: 'Punishment for lurking house-trespass or house-breaking.' },
  { number: 'IPC 457', title: 'Lurking house-trespass or house-breaking by night', description: 'Punishment for house-breaking or trespass by night.' },
  { number: 'IPC 302', title: 'Murder', description: 'Punishment for murder.' },
  { number: 'IPC 307', title: 'Attempt to murder', description: 'Punishment for attempt to commit murder.' },
  { number: 'IPC 120B', title: 'Criminal conspiracy', description: 'Punishment for being part of a criminal conspiracy.' },
  { number: 'IPC 34', title: 'Common intention', description: 'Acts done by several persons in furtherance of common intention.' },
  { number: 'IPC 201', title: 'Causing disappearance of evidence', description: 'Punishment for causing disappearance of evidence of an offence.' },
  { number: 'IPC 297', title: 'Trespassing on burial places', description: 'Punishment for trespassing on burial places or offering indignity to a human corpse.' },
  { number: 'IPC 351', title: 'Assault', description: 'Defines assault and its punishment.' },
  { number: 'IPC 352', title: 'Punishment for assault or criminal force', description: 'Punishment for assault or use of criminal force otherwise than on grave provocation.' },
  { number: 'IPC 323', title: 'Voluntarily causing hurt', description: 'Punishment for voluntarily causing hurt.' },
  { number: 'IPC 504', title: 'Intentional insult with intent to provoke breach of peace', description: 'Punishment for intentional insult to provoke breach of peace.' },
  { number: 'IPC 354', title: 'Assault or criminal force to woman with intent to outrage her modesty', description: 'Punishment for assault or criminal force to woman with intent to outrage her modesty.' },
  { number: 'IPC 509', title: 'Word, gesture or act intended to insult the modesty of a woman', description: 'Punishment for word, gesture or act intended to insult the modesty of a woman.' },
  { number: 'IPC 503', title: 'Criminal intimidation', description: 'Defines criminal intimidation and its punishment.' },
  { number: 'IPC 506', title: 'Punishment for criminal intimidation', description: 'Punishment for criminal intimidation.' },
  { number: 'IPC 507', title: 'Criminal intimidation by anonymous communication', description: 'Punishment for criminal intimidation by anonymous communication.' },
  { number: 'IPC 415', title: 'Cheating', description: 'Defines cheating.' },
  { number: 'IPC 417', title: 'Punishment for cheating', description: 'Punishment for cheating.' },
  { number: 'IPC 420', title: 'Cheating and dishonestly inducing delivery of property', description: 'Punishment for cheating and dishonestly inducing delivery of property.' },
  { number: 'IPC 468', title: 'Forgery for purpose of cheating', description: 'Punishment for forgery for the purpose of cheating.' },
  { number: 'IPC 471', title: 'Using as genuine a forged document', description: 'Punishment for using as genuine a forged document.' },
  { number: 'IT Act 66C', title: 'Identity theft', description: 'Punishment for identity theft under the Information Technology Act.' },
  { number: 'IT Act 66D', title: 'Cheating by personation using computer resource', description: 'Punishment for cheating by personation using computer resource.' },
  { number: 'IT Act 67', title: 'Publishing or transmitting obscene material in electronic form', description: 'Punishment for publishing or transmitting obscene material in electronic form.' },
  { number: 'IPC 354A', title: 'Sexual harassment', description: 'Punishment for sexual harassment.' },
  { number: 'IPC 499', title: 'Defamation', description: 'Punishment for defamation.' },
  { number: 'IPC 500', title: 'Punishment for defamation', description: 'Punishment for defamation.' },
  { number: 'DV Act 3', title: 'Definition of domestic violence', description: 'Defines domestic violence under the Protection of Women from Domestic Violence Act.' },
  { number: 'IPC 498A', title: 'Husband or relative of husband of a woman subjecting her to cruelty', description: 'Punishment for subjecting a woman to cruelty by husband or his relatives.' },
  { number: 'POCSO 3', title: 'Penetrative sexual assault', description: 'Defines and punishes penetrative sexual assault under the POCSO Act.' },
  { number: 'POCSO 7', title: 'Sexual assault', description: 'Defines and punishes sexual assault under the POCSO Act.' },
  { number: 'POCSO 9', title: 'Aggravated sexual assault', description: 'Defines and punishes aggravated sexual assault under the POCSO Act.' },
  { number: 'IPC 75', title: 'Punishment for cruelty to child', description: 'Punishment for cruelty to child.' },
  { number: 'IPC 82', title: 'Act of a child under seven years of age', description: 'No act is an offence if done by a child under seven years of age.' },
  { number: 'IPC 376', title: 'Rape', description: 'Punishment for rape.' },
  { number: 'IPC 228A', title: 'Disclosure of identity of the victim of certain offences', description: 'Punishment for disclosure of identity of rape victim.' },
  { number: 'Rent Act', title: 'Rent Control Act', description: 'Relevant state Rent Control Act for protection of tenant rights.' },
  // Additional professional law entries for each scenario
  { number: 'CrPC 154', title: 'CrPC Section 154: FIR', description: 'Procedure for registering a First Information Report (FIR) in cognizable offences.' },
  { number: 'CrPC 41', title: 'CrPC Section 41: Arrest without warrant', description: 'Police powers to arrest without warrant in cognizable cases.' },
  { number: 'CrPC 437', title: 'CrPC Section 437: Bail in non-bailable offences', description: 'Conditions for granting bail in non-bailable offences.' },
  { number: 'Evidence Act 114', title: 'Presumption of possession', description: 'Court may presume existence of certain facts, such as possession of stolen property.' },
  { number: 'Arms Act 25', title: 'Arms Act Section 25: Punishment for illegal possession or use of arms', description: 'Punishment for use or possession of illegal arms or weapons.' },
  { number: 'CrPC 302', title: 'CrPC Section 302: Trial of offences punishable with death or life imprisonment', description: 'Procedure for trial of serious offences.' },
  { number: 'CrPC 313', title: 'CrPC Section 313: Power to examine the accused', description: 'Court’s power to examine the accused during trial.' },
  { number: 'Evidence Act 27', title: 'Discovery of facts', description: 'Admissibility of information received from accused leading to discovery of facts.' },
  { number: 'CrPC 323', title: 'CrPC Section 323: Procedure when, after commencement of inquiry or trial, Magistrate finds case should be committed', description: 'Procedure for committal of cases.' },
  { number: 'POSH 3', title: 'POSH Act Section 3: Prevention of sexual harassment at workplace', description: 'Defines and prohibits sexual harassment at workplace.' },
  { number: 'CrPC 107', title: 'CrPC Section 107: Security for keeping the peace', description: 'Magistrate’s power to require security for keeping the peace.' },
  { number: 'Indian Contract Act 17', title: 'Fraud (Contract Act)', description: 'Defines fraud in contracts.' },
  { number: 'Indian Contract Act 18', title: 'Misrepresentation (Contract Act)', description: 'Defines misrepresentation in contracts.' },
  { number: 'IT Act 67A', title: 'IT Act Section 67A: Punishment for publishing or transmitting material containing sexually explicit act', description: 'Punishment for publishing or transmitting sexually explicit material in electronic form.' },
  { number: 'IT Act 67B', title: 'IT Act Section 67B: Punishment for publishing or transmitting material depicting children in sexually explicit act', description: 'Punishment for publishing or transmitting child sexual abuse material.' },
  { number: 'CrPC 156', title: 'CrPC Section 156: Police officer’s power to investigate cognizable case', description: 'Police power to investigate cognizable offences.' },
  { number: 'CrPC 202', title: 'CrPC Section 202: Postponement of issue of process', description: 'Magistrate may postpone issue of process and direct investigation.' },
  { number: 'CrPC 125', title: 'CrPC Section 125: Order for maintenance of wives, children and parents', description: 'Provides for maintenance to wives, children, and parents.' },
  { number: 'JJ Act 75', title: 'Juvenile Justice Act Section 75: Punishment for cruelty to child', description: 'Punishment for cruelty to child under the Juvenile Justice Act.' },
  { number: 'SC/ST Act 3(1)(w)', title: 'SC/ST Act: Offences of sexual exploitation', description: 'Punishment for sexual exploitation of SC/ST women.' },
  { number: 'Drugs and Cosmetics Act 27', title: 'Drugs and Cosmetics Act Section 27: Penalty for manufacture, sale, etc., of drugs in contravention of this Chapter', description: 'Punishment for sale of adulterated or spurious drugs.' },
  { number: 'CrPC 145', title: 'CrPC Section 145: Procedure where dispute concerning land or water is likely to cause breach of peace', description: 'Magistrate’s power to intervene in tenancy/land disputes.' },
  { number: 'SC Guidelines', title: 'Supreme Court Guidelines', description: 'Supreme Court guidelines may apply for arrest, bail, digital evidence, and victim protection in relevant cases.' },
];