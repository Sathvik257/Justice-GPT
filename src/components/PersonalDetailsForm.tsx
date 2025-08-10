import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PersonalDetailsFormProps {
  onSubmit: (details: { name: string; age: string; email: string; contact: string }) => void;
  onBack: () => void;
  t: Record<string, string>;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ onSubmit, onBack, t }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState('');

  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateContact(contact: string) {
    // Check if contact starts with +91 and has exactly 10 digits after it
    const contactRegex = /^\+91[0-9]{10}$/;
    return contactRegex.test(contact);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setContactError('');
    
    let hasErrors = false;
    
    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address (e.g., example@domain.com)");
      hasErrors = true;
    }
    
    // Validate contact number
    if (!validateContact(contact)) {
      setContactError("Please enter a valid phone number starting with +91 followed by 10 digits");
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    onSubmit({ name, age, email, contact });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl flex flex-col gap-6 mx-auto border border-white/40 mt-4"
      style={{ boxShadow: '0 8px 40px 0 rgba(80,0,120,0.10), 0 1.5px 16px 0 rgba(236,72,153,0.10)' }}
    >
      {/* Back Button */}
      <motion.button
        type="button"
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="self-start px-4 py-2 bg-white/80 text-indigo-700 font-semibold rounded-full shadow transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900 mb-2"
      >
        ← Back
      </motion.button>
      
      <h2 className="text-2xl font-extrabold text-indigo-800 mb-4 text-center tracking-tight drop-shadow-sm">
        {t.personalDetails}
      </h2>
      <div>
        <label className="block text-lg font-semibold text-indigo-700 mb-2">{t.name}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
          placeholder={t.name}
        />
      </div>
      <div>
        <label className="block text-lg font-semibold text-indigo-700 mb-2">Email</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
          placeholder="Email"
        />
        {emailError && (
          <div className="text-red-600 text-sm mt-1">{emailError}</div>
        )}
      </div>
      <div>
        <label className="block text-lg font-semibold text-indigo-700 mb-2">{t.contact}</label>
        <input
          type="text"
          value={contact}
          onChange={e => setContact(e.target.value)}
          required
          className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
          placeholder="+91XXXXXXXXXX"
        />
        {contactError && (
          <div className="text-red-600 text-sm mt-1">{contactError}</div>
        )}
      </div>
      <div>
        <label className="block text-lg font-semibold text-indigo-700 mb-2">{t.age}</label>
        <input
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
          required
          min="1"
          className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
          placeholder={t.age}
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.03, backgroundColor: '#a21caf' }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg text-2xl transition-all duration-300 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300 mt-2"
      >
        {t.continue}
      </motion.button>
    </motion.form>
  );
};

export default PersonalDetailsForm; 