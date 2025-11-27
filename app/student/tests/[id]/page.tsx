'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import TestQuestion from '@/app/components/TestQuestion';
import { getTestWithQuestionsClient, submitTestClient } from '@/app/lib/db/tests-client';
import { Question } from '@/app/lib/db/tests';
import { supabase } from '@/app/lib/supabaseClient';
import Link from 'next/link';

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; totalPoints: number } | null>(null);

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    try {
      const testData = await getTestWithQuestionsClient(testId);
      setTest(testData);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load test');
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Submit test? You cannot change answers after submission.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login required');

      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await submitTestClient(testId, user.id, answerArray);
      setResult(result);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/student/courses" className="text-slate-800 underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-xl font-light text-slate-800">Test Submitted</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-4xl font-bold text-slate-800 mb-2">
              {result.score} / {result.totalPoints} points
            </div>
            <div className="text-lg text-slate-600 mb-6">
              ({((result.score / result.totalPoints) * 100).toFixed(1)}%)
            </div>
            <Link
              href="/student/courses"
              className="inline-block px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 min-h-[48px]"
            >
              Back to courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-light text-slate-800">{test?.title}</h1>
          {test?.description && (
            <p className="text-sm text-slate-600 mt-1">{test.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {test?.questions.map((question: Question, index: number) => (
          <TestQuestion
            key={question.id}
            question={question}
            questionNumber={index + 1}
            value={answers[question.id] || ''}
            onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
          />
        ))}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky bottom-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length === 0}
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium text-base hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Answered: {Object.keys(answers).length} / {test?.questions.length || 0} questions
          </p>
        </div>
      </main>
    </div>
  );
}

