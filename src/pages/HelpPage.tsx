import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Layers,
  ZoomIn,
  Focus,
  SlidersHorizontal,
  AlertCircle,
  UserSearch,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  icon?: React.ReactNode;
}

const GENERAL_FAQS: FAQItem[] = [
  {
    question: 'What is "Estimated Interest Likelihood"?',
    icon: <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
    answer: (
      <p>
        Interest likelihood is an estimate based on patterns found in historical campaign data.
        It shows how likely a customer's profile is to be associated with a positive response to
        a term deposit offer, expressed as a percentage.
        <br /><br />
        A higher percentage means the customer's profile is <em>more similar</em> to customers who have
        shown interest in the past — it does not guarantee the customer will subscribe.
      </p>
    ),
  },
  {
    question: 'What do HIGH, MEDIUM, and LOW interest levels mean?',
    answer: (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">HIGH</span>
          <p>The customer's profile closely matches historical customers who showed strong interest in term deposits. Consider prioritising this customer for a personalised follow-up call.</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">MEDIUM</span>
          <p>The customer may be worth following up. A short, targeted conversation could help determine their interest level.</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">LOW</span>
          <p>The customer's profile is less aligned with historical patterns of interest. Consider focusing campaign resources on higher-priority customers first.</p>
        </div>
      </div>
    ),
  },
  {
    question: 'How should I use the interest assessment?',
    answer: (
      <p>
        Use the assessment to help <strong>prioritise</strong> which customers deserve additional follow-up
        and to guide the timing and approach of your conversations. It is a decision-support tool —
        always combine it with your own knowledge of the customer, relationship history, and professional judgement.
      </p>
    ),
  },
  {
    question: 'Can I fully trust the assessment?',
    icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
    answer: (
      <div className="space-y-2">
        <p>
          No — and this is important. The assessment is based on <strong>historical campaign patterns</strong>,
          not a prediction of any individual customer's future behaviour.
        </p>
        <p>
          It should be used as a <strong>supporting tool</strong>, combined with:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Your personal knowledge of the customer</li>
          <li>Relationship history and any recent changes</li>
          <li>Current events or customer circumstances</li>
          <li>Your professional judgement</li>
        </ul>
        <p className="text-amber-700 dark:text-amber-300 font-medium">
          Never use this system as the sole basis for a customer decision.
        </p>
      </div>
    ),
  },
  {
    question: 'What information do I need to assess a customer?',
    icon: <UserSearch className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
    answer: (
      <ul className="space-y-1.5">
        <li><strong>Customer Age</strong> — the customer's current age</li>
        <li><strong>Occupation</strong> — the customer's current job category</li>
        <li><strong>Contact Method</strong> — how the customer was reached (mobile or landline)</li>
        <li><strong>Conversation Duration</strong> — how long the current or most recent call lasted</li>
        <li><strong>Number of Contacts in Current Campaign</strong> — how many times the customer has been contacted in this campaign</li>
        <li><strong>Previous Campaign Contacts</strong> — how many times the customer was contacted in a prior campaign</li>
        <li><strong>Previous Campaign Result</strong> — whether a previous campaign contact was successful, unsuccessful, or if there was no previous contact</li>
        <li><strong>Current Interest Rate Environment</strong> — the current 3-month Euribor rate</li>
      </ul>
    ),
  },
];

const EXPLORER_FAQS: FAQItem[] = [
  {
    question: 'What is "Campaign Summary"?',
    icon: <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
    answer: (
      <p>
        "Campaign Summary" lets you see campaign response rates at a higher level. Instead of individual
        customer records, you see grouped summaries — for example, response rates by <em>Age Group</em>
        or by <em>Occupation</em>. Use the "View Results By" buttons to switch between different summary levels.
      </p>
    ),
  },
  {
    question: 'What does "Explore Performance" do?',
    icon: <ZoomIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    answer: (
      <p>
        "Explore Performance" lets you move from a high-level summary into more detailed information.
        For example, if you are viewing response by <em>Age Group</em>, you can click on the
        "26–35" group to see a breakdown of that age group by occupation.
      </p>
    ),
  },
  {
    question: 'What does "Focus on a Group" mean?',
    icon: <Focus className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    answer: (
      <p>
        "Focus on a Group" lets you apply a single filter — for example, showing only customers aged 31–45,
        or only retired customers. All statistics on the page update to reflect only that selected group.
      </p>
    ),
  },
  {
    question: 'What does "Compare Customer Groups" mean?',
    icon: <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    answer: (
      <p>
        "Compare Customer Groups" lets you apply <em>multiple</em> filters at the same time —
        for example, customers aged 31–45 who are in management and were contacted by mobile.
      </p>
    ),
  },
];

function FAQSection({ title, items }: { title: string; items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3">{title}</h2>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] overflow-hidden shadow-sm transition-colors"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2.5">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.question}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-[#263247] pt-4">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const HelpPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 max-w-3xl mx-auto">
      {/* Intro */}
      <div className="bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/30 border border-brand-200 dark:border-brand-800 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/60 border border-brand-200 dark:border-brand-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome to the Help Centre</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This guide explains how to use the Bank Campaign Intelligence system effectively.
              The system is designed to help bank employees and managers understand customer response
              patterns and make better-informed campaign decisions.
            </p>
          </div>
        </div>
      </div>

      {/* General questions */}
      <FAQSection title="Customer Assessment" items={GENERAL_FAQS} />

      {/* Campaign Explorer */}
      <FAQSection title="Campaign Explorer" items={EXPLORER_FAQS} />

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200">
          <p className="font-bold mb-1">Important Disclaimer</p>
          <p>
            Bank Campaign Intelligence is a <strong>decision support system</strong>. All assessments and
            statistics are based on historical campaign data and are intended to assist — not replace —
            professional judgement. Customer behaviour cannot be guaranteed from any analytical system.
            Always use this tool in combination with your knowledge of the customer and applicable bank policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
