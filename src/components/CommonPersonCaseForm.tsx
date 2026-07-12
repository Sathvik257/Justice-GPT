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
  'mt-2 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-950 shadow-sm transition placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500';

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

  const updateField = (field: keyof CommonPersonCaseInfo, value: string) => {
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
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
            <UserRound className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{t.analyzeCase}</p>
            <h2 className="text-2xl font-bold text-stone-950">{t.commonFormTitle}</h2>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">{t.commonFormHelper}</p>
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
            />
          </label>
        </section>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl px-4 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        {t.getGuidance}
      </motion.button>
    </motion.form>
  );
};
