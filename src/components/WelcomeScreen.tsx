import React from 'react';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onEnter: () => void;
  appName: string;
  subtitle: string;
  enterLabel: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, appName, subtitle, enterLabel }) => (
  <motion.div
    key="welcome"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.8 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600"
  >
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
      className="flex flex-col items-center w-full px-4"
    >
      <Scale className="h-24 w-24 md:h-32 md:w-32 text-white drop-shadow-2xl mb-8 animate-bounce" />
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
        className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-2xl mb-6 tracking-tight text-center max-w-5xl w-full"
      >
        {appName}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl md:text-3xl text-pink-200 font-semibold mb-4 text-center max-w-3xl w-full"
      >
        Where everyone will receive justice and legal guidance.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-2xl md:text-3xl text-pink-100 font-medium mb-12 text-center max-w-4xl w-full"
      >
        {subtitle}
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.97 }}
        onClick={onEnter}
        className="px-10 py-4 bg-white text-indigo-700 font-bold rounded-full shadow-lg text-2xl transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900 focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        {enterLabel}
      </motion.button>
    </motion.div>
  </motion.div>
);

export default WelcomeScreen; 