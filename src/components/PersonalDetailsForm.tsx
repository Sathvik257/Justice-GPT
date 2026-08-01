import React, { useState } from 'react';
import { ChevronLeft, Mail, Phone, UserRound } from 'lucide-react';
import { motion } from '../lib/motion';
import type { PersonalDetails } from '../types';
import type { Translation } from '../lib/i18n';

interface PersonalDetailsFormProps {
  onSubmit: (details: PersonalDetails) => void;
  onBack: () => void;
  t: Translation;
}

const fieldClass =
  'mt-2 w-full border border-ink/20 bg-paper px-3.5 py-3 text-base text-ink shadow-insetPaper transition placeholder:text-ink-faded/55 focus:border-seal-gold focus:outline-none focus:ring-2 focus:ring-seal-gold';

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ onSubmit, onBack, t }) => {
  const [details, setDetails] = useState<PersonalDetails>({
    name: '',
    age: '',
    email: '',
    contact: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalDetails, string>>>({});

  const updateField = (field: keyof PersonalDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof PersonalDetails, string>> = {};

    if (!details.name.trim()) nextErrors.name = t.errName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      nextErrors.email = t.errEmail;
    }
    if (!/^(\+91)?[6-9]\d{9}$/.test(details.contact.replace(/\s/g, ''))) {
      nextErrors.contact = t.errContact;
    }
    const ageNumber = Number(details.age);
    if (!Number.isFinite(ageNumber) || ageNumber < 1 || ageNumber > 120) {
      nextErrors.age = t.errAge;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validate()) onSubmit(details);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full border border-ink/15 bg-paper p-5 shadow-insetPaper sm:p-7"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex min-h-11 items-center gap-2 border border-ink/15 bg-paper px-3 text-sm font-bold text-ink-faded transition hover:bg-paper-dark focus:outline-none focus:ring-2 focus:ring-seal-gold"
      >
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div className="mb-6">
        <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-stamp-red">{t.personalDetails}</p>
        <h1 className="mt-2 font-ledger text-3xl font-black text-ink">{t.detailsHeading}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-faded">{t.detailsHelper}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <UserRound className="h-4 w-4 text-teal-700" />
            {t.name}
          </span>
          <input
            type="text"
            value={details.name}
            onChange={(event) => updateField('name', event.target.value)}
            className={fieldClass}
            placeholder={t.name}
            required
          />
          {errors.name && <span className="mt-1 block text-sm text-red-700">{errors.name}</span>}
        </label>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <Mail className="h-4 w-4 text-teal-700" />
            {t.email}
          </span>
          <input
            type="email"
            value={details.email}
            onChange={(event) => updateField('email', event.target.value)}
            className={fieldClass}
            placeholder="name@example.com"
            required
          />
          {errors.email && <span className="mt-1 block text-sm text-red-700">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <Phone className="h-4 w-4 text-teal-700" />
            {t.contact}
          </span>
          <input
            type="tel"
            value={details.contact}
            onChange={(event) => updateField('contact', event.target.value)}
            className={fieldClass}
            placeholder="+91 9876543210"
            required
          />
          {errors.contact && <span className="mt-1 block text-sm text-red-700">{errors.contact}</span>}
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-stone-800">{t.age}</span>
          <input
            type="number"
            value={details.age}
            onChange={(event) => updateField('age', event.target.value)}
            className={fieldClass}
            placeholder={t.age}
            min="1"
            max="120"
            required
          />
          {errors.age && <span className="mt-1 block text-sm text-red-700">{errors.age}</span>}
        </label>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary mt-7 inline-flex min-h-12 w-full items-center justify-center px-4 text-base font-black text-paper focus:outline-none focus:ring-2 focus:ring-seal-gold focus:ring-offset-2"
      >
        {t.continue}
      </motion.button>
    </motion.form>
  );
};

export default PersonalDetailsForm;
