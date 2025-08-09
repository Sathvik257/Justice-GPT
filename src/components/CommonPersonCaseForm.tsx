import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, MapPin } from 'lucide-react';
import type { CaseInfo } from '../types';

interface CommonPersonCaseInfo extends CaseInfo {
  activity: string;
  relationship: string;
  witnesses: string;
}

interface CommonPersonCaseFormProps {
  onSubmit: (info: CommonPersonCaseInfo) => void;
  t: Record<string, string>;
}

export const CommonPersonCaseForm: React.FC<CommonPersonCaseFormProps> = ({ onSubmit, t }) => {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');
  const [relationship, setRelationship] = useState('');
  const [witnesses, setWitnesses] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      incidentType, 
      description, 
      date, 
      location, 
      activity, 
      relationship, 
      witnesses 
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
          <User className="h-12 w-12 text-indigo-700 mr-3" />
          <h1 className="text-3xl font-bold text-indigo-800">Legal Assistance Request</h1>
        </div>
        <p className="text-lg text-indigo-600">Tell us about your situation for personalized guidance</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-indigo-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Incident Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
              <MapPin className="mr-2" />
              Incident Details
            </h2>
            
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Type of Incident</label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
              >
                <option value="">Select incident type</option>
                <option value="Theft/Robbery">Theft/Robbery</option>
                <option value="Assault/Harassment">Assault/Harassment</option>
                <option value="Property Dispute">Property Dispute</option>
                <option value="Family Issue">Family Issue</option>
                <option value="Employment Issue">Employment Issue</option>
                <option value="Consumer Complaint">Consumer Complaint</option>
                <option value="Traffic Violation">Traffic Violation</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">What happened?</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm min-h-[120px]"
                placeholder="Please describe what happened in detail..."
              />
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div whileFocus={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-indigo-700 mb-2">When did it happen?</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                />
              </motion.div>
              <motion.div whileFocus={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Where did it happen?</label>
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

          {/* Right Column - Personal Context */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
              <Clock className="mr-2" />
              Your Situation
            </h2>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">What were you doing?</label>
              <textarea
                value={activity}
                onChange={e => setActivity(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm min-h-[80px]"
                placeholder="What were you doing when this incident occurred?"
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Your relationship to the case</label>
              <select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                required
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
              >
                <option value="">Select your role</option>
                <option value="Victim">Victim</option>
                <option value="Witness">Witness</option>
                <option value="Accused">Accused</option>
                <option value="Family Member">Family Member</option>
                <option value="Friend">Friend</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Colleague">Colleague</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-indigo-700 mb-2">Were there any witnesses?</label>
              <textarea
                value={witnesses}
                onChange={e => setWitnesses(e.target.value)}
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm min-h-[80px]"
                placeholder="Describe any witnesses or people who saw what happened..."
              />
            </motion.div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full mt-8 py-4 bg-indigo-700 text-white font-bold rounded-lg shadow-lg text-xl transition-all duration-300 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
        >
          Get Legal Guidance
        </motion.button>
      </motion.form>
    </motion.div>
  );
}; 