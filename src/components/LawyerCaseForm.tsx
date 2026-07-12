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
  'mt-2 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-950 shadow-sm transition placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500';

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

  const updateField = (field: keyof LawyerCaseInfo, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-stone-200/50 backdrop-blur sm:p-8"
    >
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md">
              <Scale className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{t.analyzeCase}</p>
              <h2 className="text-2xl font-bold text-stone-950">{t.lawyerFormTitle}</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">{t.lawyerFormHelper}</p>
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

      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl px-4 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        {t.analyzeCase}
      </motion.button>
    </motion.form>
  );
};
