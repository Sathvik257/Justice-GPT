import React, { useState } from 'react';
import { Briefcase, FileText, Scale, UserRound } from 'lucide-react';
import { motion } from '../lib/motion';
import type { LawyerCaseInfo } from '../types';
import type { Translation } from '../lib/i18n';

interface LawyerCaseFormProps {
  onSubmit: (info: LawyerCaseInfo) => void;
  t: Translation;
}

const inputClass =
  'mt-2 w-full border border-ink/20 bg-paper px-3.5 py-3 text-base text-ink shadow-insetPaper transition placeholder:text-ink-faded/55 focus:border-seal-gold focus:outline-none focus:ring-2 focus:ring-seal-gold';

const positionOptions = [
  'Defense Attorney',
  'Prosecutor',
  "Plaintiff's Attorney",
  "Defendant's Attorney",
  'Legal Advisor',
  'Consultant',
  'Other',
];

const categoryOptions = ['Criminal', 'Civil', 'Family Law', 'Property', 'Consumer', 'Employment', 'Constitutional', 'Other'];
const today = new Date().toISOString().slice(0, 10);

const sampleLawyerCases: Array<{ label: string; data: LawyerCaseInfo }> = [
  {
    label: 'Robbery',
    data: {
      incidentType: 'Robbery with weapon',
      description:
        'Two accused entered a small electronics shop at night, threatened the staff with a knife, took cash and phones, and injured one employee while escaping. CCTV footage and medical records are available.',
      date: '2026-07-18',
      location: 'Pune, Maharashtra',
      position: 'Legal Advisor',
      clientName: 'Sample Client',
      caseType: 'Criminal',
    },
  },
  {
    label: 'Cheating',
    data: {
      incidentType: 'Online investment cheating',
      description:
        'The client transferred money after being promised guaranteed monthly returns through a fake investment portal. The portal is now offline, but bank statements, chats, and screenshots are available.',
      date: '2026-07-21',
      location: 'Hyderabad, Telangana',
      position: 'Legal Advisor',
      clientName: 'Sample Client',
      caseType: 'Criminal',
    },
  },
  {
    label: 'Domestic',
    data: {
      incidentType: 'Cruelty and dowry harassment',
      description:
        'The client alleges repeated demands for money by the spouse and in-laws, threats, and physical assault. Medical papers, call recordings, and messages from family members are available.',
      date: '2026-07-14',
      location: 'Lucknow, Uttar Pradesh',
      position: 'Legal Advisor',
      clientName: 'Sample Client',
      caseType: 'Family Law',
    },
  },
  {
    label: 'Accident',
    data: {
      incidentType: 'Rash driving causing grievous injury',
      description:
        'A delivery rider was hit by a speeding car at a signal. The client has an FIR copy, medical records showing fracture, vehicle number, and possible traffic camera footage.',
      date: '2026-07-11',
      location: 'Chennai, Tamil Nadu',
      position: 'Legal Advisor',
      clientName: 'Sample Client',
      caseType: 'Criminal',
    },
  },
  {
    label: 'Property',
    data: {
      incidentType: 'Property trespass and damage',
      description:
        'The opposing party allegedly entered the client property, broke a boundary wall, and threatened workers during a pending ownership dispute. Photos and local witness statements are available.',
      date: '2026-07-09',
      location: 'Jaipur, Rajasthan',
      position: 'Legal Advisor',
      clientName: 'Sample Client',
      caseType: 'Property',
    },
  },
];

export const LawyerCaseForm: React.FC<LawyerCaseFormProps> = ({ onSubmit, t }) => {
  const [form, setForm] = useState<LawyerCaseInfo>({
    incidentType: '',
    description: '',
    date: '',
    location: '',
    position: '',
    clientName: '',
    caseType: '',
  });
  const [formError, setFormError] = useState('');

  const updateField = (field: keyof LawyerCaseInfo, value: string) => {
    setFormError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const cleaned: LawyerCaseInfo = {
      incidentType: form.incidentType.trim(),
      description: form.description.trim(),
      date: form.date,
      location: form.location.trim(),
      position: form.position.trim(),
      clientName: form.clientName.trim(),
      caseType: form.caseType.trim(),
    };

    if (
      !cleaned.incidentType ||
      !cleaned.description ||
      !cleaned.date ||
      !cleaned.location ||
      !cleaned.position ||
      !cleaned.clientName ||
      !cleaned.caseType
    ) {
      setFormError('Complete all required fields before analyzing the case.');
      return;
    }

    onSubmit(cleaned);
  };

  const fillSampleData = (sample: LawyerCaseInfo) => {
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
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-ink bg-ink text-paper">
              <Scale className="h-6 w-6" />
            </span>
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-stamp-red">{t.analyzeCase}</p>
              <h2 className="font-ledger text-2xl font-black text-ink">{t.lawyerFormTitle}</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-faded">{t.lawyerFormHelper}</p>
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wide text-ink-faded">
              <FileText className="h-4 w-4" />
              Sample case types
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleLawyerCases.map((sample) => (
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="grid gap-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-stone-950">
            <FileText className="h-5 w-5 text-teal-700" />
            {t.caseFacts}
          </h3>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.caseTypeIncident}</span>
            <input
              type="text"
              value={form.incidentType}
              onChange={(event) => updateField('incidentType', event.target.value)}
              className={inputClass}
              placeholder={t.phLawyerIncident}
              maxLength={120}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.detailedFacts}</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`${inputClass} min-h-40 resize-y`}
              placeholder={t.phLawyerFacts}
              maxLength={2500}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-stone-800">{t.incidentDate}</span>
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
              <span className="text-sm font-semibold text-stone-800">{t.location}</span>
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
            <UserRound className="h-5 w-5 text-teal-700" />
            {t.clientContext}
          </h3>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.yourPosition}</span>
            <select
              value={form.position}
              onChange={(event) => updateField('position', event.target.value)}
              className={inputClass}
              required
            >
              <option value="">{t.selectPosition}</option>
              {positionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-800">{t.clientName}</span>
            <input
              type="text"
              value={form.clientName}
              onChange={(event) => updateField('clientName', event.target.value)}
              className={inputClass}
              placeholder={t.phClientName}
              maxLength={120}
              required
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Briefcase className="h-4 w-4 text-teal-700" />
              {t.caseCategory}
            </span>
            <select
              value={form.caseType}
              onChange={(event) => updateField('caseType', event.target.value)}
              className={inputClass}
              required
            >
              <option value="">{t.selectCategory}</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
        {t.analyzeCase}
      </motion.button>
    </motion.form>
  );
};
