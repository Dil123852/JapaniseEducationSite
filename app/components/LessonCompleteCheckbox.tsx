'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

interface LessonCompleteCheckboxProps {
  lessonId: string;
  studentId: string;
  initialCompleted?: boolean;
}

export default function LessonCompleteCheckbox({ 
  lessonId, 
  studentId,
  initialCompleted = false 
}: LessonCompleteCheckboxProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsCompleted(initialCompleted);
  }, [initialCompleted]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('lesson_completions')
          .delete()
          .eq('lesson_id', lessonId)
          .eq('student_id', studentId);
        
        if (!error) {
          setIsCompleted(false);
        }
      } else {
        // Add completion
        const { error } = await supabase
          .from('lesson_completions')
          .insert({
            lesson_id: lessonId,
            student_id: studentId,
            completed_at: new Date().toISOString(),
          });
        
        if (!error) {
          setIsCompleted(true);
        }
      }
    } catch (error) {
      console.error('Error toggling lesson completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
        ${isCompleted 
          ? 'bg-[#C2E2F5] border-[#C2E2F5]' 
          : 'border-[#E5E7EB] bg-white hover:border-[#C2E2F5]'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isCompleted && <Check className="w-3 h-3 text-[#2B2B2B]" />}
    </button>
  );
}

