'use client';

import { Question } from '@/app/lib/db/tests';

interface TestQuestionProps {
  question: Question;
  questionNumber: number;
  value?: string;
  onChange: (value: string) => void;
}

export default function TestQuestion({
  question,
  questionNumber,
  value = '',
  onChange,
}: TestQuestionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
      <div className="mb-4">
        <span className="text-sm font-medium text-slate-500">Question {questionNumber}</span>
        <span className="ml-2 text-xs text-slate-400">({question.points} points)</span>
      </div>
      
      <p className="text-base text-slate-800 mb-4 font-medium">{question.question_text}</p>

      {question.question_type === 'multiple_choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors min-h-[56px]"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="mr-3 w-5 h-5 text-slate-800"
              />
              <span className="text-base text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.question_type === 'fill_blank' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-base"
          placeholder="Enter your answer"
        />
      )}

      {question.question_type === 'short_answer' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-base resize-none"
          placeholder="Enter your answer"
        />
      )}
    </div>
  );
}

