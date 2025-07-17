import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { constitutionalArticles } from '../data/constitutionalArticles';
import { Scale } from 'lucide-react';

interface AIAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  t: Record<string, string>;
}

// Glossary Tooltip component
const GlossaryTooltip: React.FC<{ term: string; children: React.ReactNode }> = ({ term, children }) => {
  const article = constitutionalArticles.find(a => term.includes(a.number));
  if (!article) return <>{children}</>;
    return (
    <span className="relative group cursor-help focus-within:outline-none">
      <span tabIndex={0} className="underline decoration-dotted decoration-pink-500 underline-offset-2 focus:outline-none">{children}</span>
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 min-w-[220px] max-w-xs bg-white border border-pink-200 shadow-xl rounded-xl p-4 text-sm text-gray-900 font-normal whitespace-normal">
        <span className="font-bold text-pink-700">{article.title}</span><br/>
        <span className="text-gray-700">{article.description}</span>
      </span>
    </span>
  );
};

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, isLoading, t }) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Split the analysis into sections for better formatting
  let summary = '', caseType = '', laws = '', analysisSection = '', nextSteps = '', teachersNote = '';
  if (analysis) {
    const summaryMatch = analysis.match(/SUMMARY[\s\S]*?\n\n/);
    summary = summaryMatch ? summaryMatch[0].replace('> ', '').trim() : '';
    const caseTypeMatch = analysis.match(/\*\*Detected Case Type[s]?:\*\*[\s\S]*?\n\n/);
    caseType = caseTypeMatch ? caseTypeMatch[0].trim() : '';
    const lawsMatch = analysis.match(/\*\*Relevant Laws\/Articles.*?\*\*[\s\S]*?\n\n/);
    laws = lawsMatch ? lawsMatch[0].replace(/\*\*Relevant Laws\/Articles.*?\*\*/, '').trim() : '';
    const analysisMatch = analysis.match(/\*\*Analysis:\*\*[\s\S]*?\n\n/);
    analysisSection = analysisMatch ? analysisMatch[0].replace('**Analysis:**', '').trim() : '';
    const nextStepsMatch = analysis.match(/\*\*Suggested Next Steps:\*\*[\s\S]*?(?=---|$)/);
    nextSteps = nextStepsMatch ? nextStepsMatch[0].replace('**Suggested Next Steps:**', '').trim() : '';
    const teachersNoteMatch = analysis.match(/\*\*Teacher[’']s Note:\*\*[\s\S]*/);
    teachersNote = teachersNoteMatch ? teachersNoteMatch[0].replace('**Teacher’s Note:**', '').replace('**Teacher\'s Note:**', '').trim() : '';
  }

  const handlePrint = () => {
    if (printRef.current) {
      window.print();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.98 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="w-full bg-white/95 rounded-2xl shadow-2xl p-0 md:p-0 max-w-5xl mx-auto relative"
    >
      {/* Download/Print Button - hide in print view and during loading */}
      {(!isLoading) && (
        <motion.button
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
          onClick={handlePrint}
          className="absolute top-4 right-4 z-20 bg-pink-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-300 print:hidden"
          aria-label="Download or Print Analysis"
        >
          🖨️ Download as PDF / Print
        </motion.button>
      )}
      <div ref={printRef} className="print:bg-white print:text-black print:shadow-none print:p-0">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-20 relative w-full"
          >
            {/* Glowing animated background */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-0"
              initial={{ opacity: 0.7, scale: 0.9 }}
              animate={{ opacity: [0.7, 1, 0.7], scale: [0.9, 1.05, 0.9] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              style={{ filter: 'blur(60px)' }}
            >
              <div className="w-72 h-72 rounded-full bg-gradient-to-br from-pink-300 via-indigo-300 to-purple-300 opacity-60" />
            </motion.div>
            {/* Centered icon stack */}
            <div className="relative flex items-center justify-center w-44 h-44 z-20">
              {/* Rotating scale icon behind main icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                style={{ opacity: 0.18 }}
              >
                <Scale className="w-44 h-44 text-pink-400" />
              </motion.div>
              {/* Main bouncing scale icon */}
              <motion.div
                className="relative z-10"
                animate={{ y: [0, -40, 0, -24, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              >
                <Scale className="w-24 h-24 text-pink-600 drop-shadow-2xl" />
              </motion.div>
            </div>
            {/* Animated loading text with dots */}
            <motion.div
              className="text-2xl font-extrabold text-indigo-700 mt-4 text-center z-20 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span>Case is being analysed</span>
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2], x: [0, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="inline-block"
              >
                ...
              </motion.span>
            </motion.div>
          </motion.div>
        ) : analysis ? (
          <div className="flex flex-col gap-8 p-6 md:p-12">
            {/* Summary Card */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                className="bg-indigo-100 border-l-4 border-indigo-400 shadow-lg rounded-xl p-6 mb-2 text-indigo-900 font-bold text-xl text-left"
              >
                {summary}
              </motion.div>
            )}
            {/* Case Type */}
            {caseType && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                className="text-lg font-semibold text-indigo-700 mb-2"
              >{caseType}</motion.div>
            )}
            {/* Laws/Articles List */}
            {laws && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
              >
                <div className="font-bold text-pink-700 text-lg mb-2">Relevant Laws/Articles</div>
                <ul className="space-y-4">
                  {laws.split('\n').filter(Boolean).map((law, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + 0.08 * idx, duration: 0.4, type: 'spring' }}
                      className="flex items-start gap-3 bg-pink-50 rounded-lg p-4 shadow print:bg-white print:shadow-none"
                    >
                      <span className="text-2xl mt-1">⚖️</span>
                      <span className="text-base text-gray-800 whitespace-pre-line print:text-black">
                        {/* Wrap legal term with tooltip if found */}
                        <GlossaryTooltip term={law}>
                          {law}
                        </GlossaryTooltip>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
            {/* Analysis Section */}
            {analysisSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}
              >
                <div className="font-bold text-indigo-700 text-lg mb-2">Analysis</div>
                <div className="text-base text-gray-800 whitespace-pre-line print:text-black">{analysisSection}</div>
              </motion.div>
            )}
            {/* Next Steps */}
            {nextSteps && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5, type: 'spring' }}
              >
                <div className="font-bold text-indigo-700 text-lg mb-2">Next Steps</div>
                <ul className="list-disc ml-6 text-base text-gray-800 whitespace-pre-line print:text-black">
                  {nextSteps.split('\n').filter(Boolean).map((step, idx) => (
                    <li key={idx}>{step.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            {/* Teacher's Note */}
            {teachersNote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5, type: 'spring' }}
                className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 mt-4 text-yellow-900 font-medium print:bg-white print:border-none print:text-black"
              >
                <span className="font-bold">Teacher’s Note: </span>{teachersNote}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 italic">{t.noAnalysis}</div>
        )}
      </div>
    </motion.div>
  );
};