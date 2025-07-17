import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CaseInfo } from '../types';

interface CaseFormProps {
  onSubmit: (info: CaseInfo) => void;
  t: Record<string, string>;
}

export const CaseForm: React.FC<CaseFormProps> = ({ onSubmit, t }) => {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ incidentType, description, date, location });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="space-y-6"
    >
      <motion.div whileFocus={{ scale: 1.03 }}>
        <label className="block text-sm font-medium text-indigo-700 mb-1">{t.type}</label>
          <input
            type="text"
          value={incidentType}
          onChange={e => setIncidentType(e.target.value)}
            required
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
          placeholder={t.type}
        />
      </motion.div>
      <motion.div whileFocus={{ scale: 1.03 }}>
        <label className="block text-sm font-medium text-indigo-700 mb-1">{t.description}</label>
          <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
            required
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm min-h-[80px]"
          placeholder={t.description}
        />
      </motion.div>
      <div className="flex gap-4">
        <motion.div className="flex-1" whileFocus={{ scale: 1.03 }}>
          <label className="block text-sm font-medium text-indigo-700 mb-1">{t.date}</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
          />
        </motion.div>
        <motion.div className="flex-1" whileFocus={{ scale: 1.03 }}>
          <label className="block text-sm font-medium text-indigo-700 mb-1">{t.location}</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
            placeholder={t.location}
          />
        </motion.div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="w-full py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-lg text-lg transition-all duration-300 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        {t.analyzeCase}
      </motion.button>
    </motion.form>
  );
}