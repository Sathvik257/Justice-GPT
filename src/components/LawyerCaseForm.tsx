import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, User, Briefcase } from 'lucide-react';
import type { CaseInfo } from '../types';

interface LawyerCaseInfo extends CaseInfo {
  position: string;
  clientName: string;
  caseType: string;
}

interface LawyerCaseFormProps {
  onSubmit: (info: LawyerCaseInfo) => void;
  t: Record<string, string>;
}

export const LawyerCaseForm: React.FC<LawyerCaseFormProps> = ({ onSubmit, t }) => {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState('');
  const [clientName, setClientName] = useState('');
  const [caseType, setCaseType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      incidentType, 
      description, 
      date, 
      location, 
      position, 
      clientName, 
      caseType 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Scale className="h-12 w-12 text-yellow-600 mr-3" />
          <h1 className="text-3xl font-bold text-indigo-800">Lawyer Case Analysis</h1>
        </div>
        <p className="text-lg text-indigo-600">Professional legal case evaluation and analysis</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-indigo-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Case Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
              <Briefcase className="mr-2" />
              Case Information
            </h2>
            
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Case Type</label>
              <input
                type="text"
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                placeholder="e.g., Criminal, Civil, Family Law, etc."
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Case Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm min-h-[120px]"
                placeholder="Detailed description of the case..."
              />
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div whileFocus={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                />
              </motion.div>
              <motion.div whileFocus={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                  placeholder="City, State"
                />
              </motion.div>
            </div>
          </div>

          {/* Right Column - Lawyer Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
              <User className="mr-2" />
              Your Role & Client
            </h2>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Your Position</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
              >
                <option value="">Select your position</option>
                <option value="Defense Attorney">Defense Attorney</option>
                <option value="Prosecutor">Prosecutor</option>
                <option value="Plaintiff's Attorney">Plaintiff's Attorney</option>
                <option value="Defendant's Attorney">Defendant's Attorney</option>
                <option value="Legal Advisor">Legal Advisor</option>
                <option value="Consultant">Consultant</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                placeholder="Client's full name"
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Case Category</label>
              <select
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
              >
                <option value="">Select case category</option>
                <option value="Criminal">Criminal</option>
                <option value="Civil">Civil</option>
                <option value="Family Law">Family Law</option>
                <option value="Corporate">Corporate</option>
                <option value="Property">Property</option>
                <option value="Labor">Labor</option>
                <option value="Tax">Tax</option>
                <option value="Constitutional">Constitutional</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full mt-8 py-4 bg-indigo-700 text-white font-bold rounded-lg shadow-lg text-xl transition-all duration-300 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
        >
          Analyze Case
        </motion.button>
      </motion.form>
    </motion.div>
  );
}; 