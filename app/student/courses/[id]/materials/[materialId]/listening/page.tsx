'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import VideoRenderer from '@/app/components/MaterialRenderers/VideoRenderer';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
}

export default function ListeningTestPage() {
  const params = useParams();
  const courseId = params.id as string;
  const materialId = params.materialId as string;

  const [material, setMaterial] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTest() {
      try {
        // Fetch material
        const materialRes = await fetch(`/api/courses/${courseId}/materials/${materialId}`);
        if (!materialRes.ok) throw new Error('Failed to load material');
        const materialData = await materialRes.json();
        setMaterial(materialData);

        // Fetch questions
        const questionsRes = await fetch(`/api/listening-tests/${materialId}/questions`);
        if (!questionsRes.ok) throw new Error('Failed to load questions');
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load test');
      } finally {
        setIsLoading(false);
      }
    }
    loadTest();
  }, [courseId, materialId]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert answers object to array format
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer as string,
      }));

      // Submit answers
      const response = await fetch(`/api/listening-tests/${materialId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (!response.ok) throw new Error('Failed to submit test');

      const data = await response.json();
      setResults(data.results || {});
      setScore(data.score || 0);
      setIsSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C2E2F5]" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] p-8">
          <p className="text-[#EF6161] mb-4">{error || 'Material not found'}</p>
          <Link href={`/student/courses/${courseId}`}>
            <Button>Back to Course</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Back Button */}
        <Link 
          href={`/student/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#2B2B2B] mb-6 transition-colors"
        >
          ← Back to course
        </Link>

        {/* Test Header */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-2">
              {material.title}
            </h1>
            {material.description && (
              <p className="text-base text-[#6B7280]">
                {material.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Video */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow mb-6">
          <CardContent className="p-6">
            <VideoRenderer material={material} />
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = isSubmitted && results[question.id] === true;
              const isIncorrect = isSubmitted && results[question.id] === false;

              return (
                <Card 
                  key={question.id}
                  className={`bg-white border-[#E5E7EB] rounded-[24px] soft-shadow ${
                    isCorrect ? 'border-green-200 bg-green-50' : 
                    isIncorrect ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#2B2B2B]">
                        Question {index + 1}
                      </h3>
                      {isSubmitted && (
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Correct</span>
                            </>
                          ) : isIncorrect ? (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm text-red-600 font-medium">Incorrect</span>
                            </>
                          ) : null}
                          <span className="text-xs text-[#9CA3AF]">({question.points} points)</span>
                        </div>
                      )}
                    </div>

                    <p className="text-base text-[#2B2B2B] mb-4">{question.question_text}</p>

                    {question.question_type === 'multiple_choice' && question.options ? (
                      <div className="space-y-3">
                        {question.options.filter(opt => opt.trim()).map((option, optIndex) => {
                          const isSelected = userAnswer === option;
                          const isCorrectAnswer = isSubmitted && option === question.correct_answer;
                          const isWrongSelected = isSubmitted && isSelected && option !== question.correct_answer;

                          return (
                            <label
                              key={optIndex}
                              htmlFor={`q-${question.id}-opt-${optIndex}`}
                              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : isWrongSelected
                                  ? 'border-red-500 bg-red-50'
                                  : isSelected
                                  ? 'border-[#C2E2F5] bg-[#F0F9FF]'
                                  : 'border-[#E5E7EB] bg-white hover:border-[#C2E2F5] hover:bg-[#F0F9FF]'
                              } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <input
                                type="radio"
                                id={`q-${question.id}-opt-${optIndex}`}
                                name={`question-${question.id}`}
                                value={option}
                                checked={isSelected}
                                onChange={() => {
                                  if (!isSubmitted) {
                                    setAnswers({ ...answers, [question.id]: option });
                                  }
                                }}
                                disabled={isSubmitted}
                                className="w-4 h-4 text-[#C2E2F5] focus:ring-[#C2E2F5] focus:ring-2"
                              />
                              <span
                                className={`flex-1 ${
                                  isCorrectAnswer
                                    ? 'text-green-700 font-medium'
                                    : isWrongSelected
                                    ? 'text-red-700'
                                    : 'text-[#2B2B2B]'
                                }`}
                              >
                                {option}
                              </span>
                              {isSubmitted && isCorrectAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                              {isSubmitted && isWrongSelected && (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={userAnswer || ''}
                          onChange={(e) => {
                            if (!isSubmitted) {
                              setAnswers({ ...answers, [question.id]: e.target.value });
                            }
                          }}
                          disabled={isSubmitted}
                          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2E2F5]"
                          placeholder="Type your answer..."
                        />
                        {isSubmitted && isIncorrect && (
                          <p className="mt-2 text-sm text-green-600">
                            Correct answer: {question.correct_answer}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
            <CardContent className="p-12 text-center">
              <p className="text-[#9CA3AF]">No questions available for this test.</p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {!isSubmitted && questions.length > 0 && (
          <div className="mt-8 sticky bottom-4">
            <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
              <CardContent className="p-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                  className="w-full bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium text-base py-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </Button>
                <p className="text-xs text-center text-[#9CA3AF] mt-3">
                  Answered: {Object.keys(answers).length} / {questions.length} questions
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {isSubmitted && score !== null && (
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow mt-6">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Test Results</h2>
              <div className="text-3xl font-bold text-[#C2E2F5] mb-2">
                {score} / {questions.reduce((sum, q) => sum + q.points, 0)} points
              </div>
              <p className="text-sm text-[#9CA3AF]">
                {Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100)}% correct
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

