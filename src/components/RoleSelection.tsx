import React from 'react';
import { motion } from 'framer-motion';
import { Scale, User } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'lawyer' | 'common') => void;
  onBack: () => void;
  t: Record<string, string>;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect, onBack, t }) => (
  <motion.div
    key="role-select"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.7 }}
    className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600"
  >
    <motion.h1
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-4xl md:text-5xl font-bold text-white mb-4 text-center"
    >
      Who are you?
    </motion.h1>
    
    <motion.p
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-xl text-pink-200 font-medium mb-12 text-center max-w-2xl"
    >
      Choose your role to get personalized legal assistance
    </motion.p>

    <div className="flex gap-8 mb-12">
      {/* Lawyer Card */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('lawyer')}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl border border-white/40"
        style={{ minWidth: '280px' }}
      >
        <div className="flex flex-col items-center text-center">
          <Scale className="h-16 w-16 text-yellow-600 mb-4 drop-shadow-lg" />
          <h3 className="text-2xl font-bold text-indigo-800 mb-3">I am a Lawyer</h3>
          <p className="text-indigo-700 text-lg">Professional legal assistance with advanced analysis</p>
        </div>
      </motion.div>

      {/* Common Person Card */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('common')}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl border border-white/40"
        style={{ minWidth: '280px' }}
      >
        <div className="flex flex-col items-center text-center">
          <User className="h-16 w-16 text-indigo-700 mb-4 drop-shadow-lg" />
          <h3 className="text-2xl font-bold text-indigo-800 mb-3">I am a Common Person</h3>
          <p className="text-indigo-700 text-lg">General legal guidance and support</p>
        </div>
      </motion.div>
    </div>

    <motion.button
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onBack}
      className="px-6 py-3 bg-white/80 text-indigo-700 font-semibold rounded-full shadow transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900"
    >
      ← Back
    </motion.button>
  </motion.div>
);

export default RoleSelection; 