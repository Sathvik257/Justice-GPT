import React, { useState } from 'react';
import { CalendarDays, MapPin, MessageSquareText, UserRound, UsersRound } from 'lucide-react';
import { motion } from '../lib/motion';
import type { CommonPersonCaseInfo } from '../types';
import type { Translation } from '../lib/i18n';

interface CommonPersonCaseFormProps {
  onSubmit: (info: CommonPersonCaseInfo) => void;
  t: Translation;
}

const inputClass =
  'mt-2 w-full border border-ink/20 bg-paper px-3.5 py-3 text-base text-ink shadow-insetPaper transition placeholder:text-ink-faded/55 focus:border-seal-gold focus:outline-none focus:ring-2 focus:ring-seal-gold';

const incidentOptions = [
  'Theft or Robbery',
  'Assault or Harassment',
  'Property Dispute',
  'Family Issue',
  'Employment Issue',
  'Consumer Complaint',
  'Traffic Accident',
  'Cybercrime',
  'Other',
];

const relationshipOptions = ['Victim', 'Witness', 'Accused', 'Family Member', 'Friend', 'Neighbor', 'Colleague', 'Other'];
const today = new Date().toISOString().slice(0, 10);

const sampleCommonCases: Array<{ label: string; data: CommonPersonCaseInfo }> = [
  {
    label: 'Cyber fraud',
    data: {
      incidentType: 'Cybercrime',
      description:
        'My social media account was hacked, and the person used my profile to message relatives asking for money. I have screenshots, login alerts, and the payment number used in the fraud.',
      date: '2026-07-20',
      location: 'Hyderabad, Telangana',
      activity: 'I want to understand what offence this may fall under and what evidence I should preserve before filing a complaint.',
      relationship: 'Victim',
      witnesses: 'Two relatives received the fraudulent messages and can share screenshots.',
    },
  },
  {
    label: 'Robbery',
    data: {
      incidentType: 'Theft or Robbery',
      description:
        'Two people stopped me near a shop at night, threatened me with a knife, and took my phone and wallet. A nearby camera may have recorded the incident.',
      date: '2026-07-19',
      location: 'Pune, Maharashtra',
      activity: 'I was returning home from work and want to know what steps to take before going to the police station.',
      relationship: 'Victim',
      witnesses: 'One shop owner saw the incident and there may be CCTV footage.',
    },
  },
  {
    label: 'Harassment',
    data: {
      incidentType: 'Assault or Harassment',
      description:
        'A person from my neighborhood has been repeatedly following me, sending unwanted messages, and making threatening comments when I ask them to stop.',
      date: '2026-07-16',
      location: 'Vijayawada, Andhra Pradesh',
      activity: 'I want to understand what proof I should collect and whether this can be reported as harassment or stalking.',
      relationship: 'Victim',
      witnesses: 'My friend saw one incident and I have screenshots of repeated messages.',
    },
  },
  {
    label: 'Consumer',
    data: {
      incidentType: 'Consumer Complaint',
      description:
        'I bought a phone online, but the seller sent a damaged product and refused refund or replacement even after I shared photos and the invoice.',
      date: '2026-07-12',
      location: 'Bengaluru, Karnataka',
      activity: 'I want to know whether this is only a consumer complaint or if fraud may also be relevant.',
      relationship: 'Victim',
      witnesses: 'I have the invoice, delivery photos, chat messages, and payment receipt.',
    },
  },
  {
    label: 'Traffic',
    data: {
      incidentType: 'Traffic Accident',
      description:
        'A speeding car hit my two-wheeler at a junction and the driver left without helping. I received treatment at a clinic and noted the vehicle number.',
      date: '2026-07-10',
      location: 'Chennai, Tamil Nadu',
      activity: 'I need guidance on what documents and evidence are important before filing a complaint.',
      relationship: 'Victim',
      witnesses: 'A passerby helped me and there may be traffic camera footage near the junction.',
    },
  },
];

export const CommonPersonCaseForm: React.FC<CommonPersonCaseFormProps> = ({ onSubmit, t }) => {
  const [form, setForm] = useState<CommonPersonCaseInfo>({
    incidentType: '',
    description: '',
    date: '',
    location: '',
    activity: '',
    relationship: '',
    witnesses: '',
  });
  const [formError, setFormError] = useState('');

  const updateField = (field: keyof CommonPersonCaseInfo, value: string) => {
    setFormError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const cleaned: CommonPersonCaseInfo = {
      incidentType: form.incidentType.trim(),
      description: form.description.trim(),
      date: form.date,
      location: form.location.trim(),
      activity: form.activity.trim(),
      relationship: form.relationship.trim(),
      witnesses: form.witnesses.trim(),
    };

    if (
      !cleaned.incidentType ||
      !cleaned.description ||
      !cleaned.date ||
      !cleaned.location ||
      !cleaned.activity ||
      !cleaned.relationship
    ) {
      setFormError('Complete all required fields before generating guidance.');
      return;
    }

    onSubmit(cleaned);
  };

  const fillSampleData = (sample: CommonPersonCaseInfo) => {
    setFormError('');
    setForm(sample);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-ink/15 bg-paper p-5 shadow-insetPaper sm:p-7"
    >
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center border border-ink bg-ink text-paper">
            <UserRound className="h-6 w-6" />
          </span>
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-stamp-red">{t.analyzeCase}</p>
            <h2 className="font-ledger text-2xl font-black text-ink">{t.commonFormTitle}</h2>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-faded">{t.commonFormHelper}</p>
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wide text-ink-faded">
            <MessageSquareText className="h-4 w-4" />
            Sample case types
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleCommonCases.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => fillSampleData(sample.data)}
                className="inline-flex min-h-10 items-center border border-seal-gold/50 bg-seal-gold/10 px-3 font-mono text-xs font-black uppercase tracking-wide text-ink transition hover:bg-seal-gold/20 focus:outline-none focus:ring-2 focus:ring-seal-gold"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="grid gap-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-stone-950">
            <MessageSquareText className="h-5 w-5 text-teal-700" />
            {t.incidentDetails}
          </h3>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.typeOfIncident}</span>
            <select
              value={form.incidentType}
              onChange={(event) => updateField('incidentType', event.target.value)}
              className={inputClass}
              required
            >
              <option value="">{t.selectIncident}</option>
              {incidentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.whatHappened}</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`${inputClass} min-h-40 resize-y`}
              placeholder={t.phIncident}
              maxLength={2500}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                <CalendarDays className="h-4 w-4 text-teal-700" />
                {t.whenHappened}
              </span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                className={inputClass}
                max={today}
                required
              />
            </label>
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                <MapPin className="h-4 w-4 text-teal-700" />
                {t.whereHappened}
              </span>
              <input
                type="text"
                value={form.location}
                onChange={(event) => updateField('location', event.target.value)}
                className={inputClass}
                placeholder={t.phLocation}
                maxLength={160}
                required
              />
            </label>
          </div>
        </section>

        <section className="grid gap-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-stone-950">
            <UsersRound className="h-5 w-5 text-teal-700" />
            {t.yourSituation}
          </h3>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.whatDoing}</span>
            <textarea
              value={form.activity}
              onChange={(event) => updateField('activity', event.target.value)}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder={t.phActivity}
              maxLength={900}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.relationshipToCase}</span>
            <select
              value={form.relationship}
              onChange={(event) => updateField('relationship', event.target.value)}
              className={inputClass}
              required
            >
              <option value="">{t.selectRole}</option>
              {relationshipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.anyWitnesses}</span>
            <textarea
              value={form.witnesses}
              onChange={(event) => updateField('witnesses', event.target.value)}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder={t.phWitnesses}
              maxLength={900}
            />
          </label>
        </section>
      </div>

      {formError && (
        <p className="mt-6 border border-stamp-red/30 bg-stamp-red/10 px-3 py-2 text-sm font-bold text-stamp-red" role="alert">
          {formError}
        </p>
      )}

      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary mt-8 inline-flex min-h-12 w-full items-center justify-center px-4 text-base font-black text-paper focus:outline-none focus:ring-2 focus:ring-seal-gold focus:ring-offset-2"
      >
        {t.getGuidance}
      </motion.button>
    </motion.form>
  );
};
