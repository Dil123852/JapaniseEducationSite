'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  priority: number;
  type: string;
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/ai/recommendations');
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C2E2F5]" />
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">
              AI-Powered Recommendations
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#C2E2F5]" />
            <span className="ml-2 text-sm text-[#9CA3AF]">Loading AI recommendations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const getIcon = (type: string, index: number) => {
    const icons = [BookOpen, Clock, Target, TrendingUp];
    return icons[index % icons.length];
  };

  const getLink = (title: string) => {
    if (title.toLowerCase().includes('enroll') || title.toLowerCase().includes('course')) {
      return '/student/enroll';
    }
    if (title.toLowerCase().includes('quiz') || title.toLowerCase().includes('test')) {
      return '/student/quizzes';
    }
    if (title.toLowerCase().includes('video') || title.toLowerCase().includes('watch')) {
      return '/student/courses';
    }
    if (title.toLowerCase().includes('dashboard') || title.toLowerCase().includes('progress')) {
      return '/dashboard';
    }
    return '/student/courses';
  };

  return (
    <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#C2E2F5]" />
          <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">
            AI-Powered Recommendations
          </CardTitle>
        </div>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Personalized next steps based on your learning progress
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => {
            const Icon = getIcon(rec.type, idx);
            const href = getLink(rec.title);
            
            return (
              <Link
                key={rec.id}
                href={href}
                className="p-4 border-2 border-[#C2E2F5] rounded-lg hover:bg-[#F0F9FF] transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-6 h-6 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                  <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-medium text-[#2B2B2B] mb-1">{rec.title}</h3>
                <p className="text-xs text-[#9CA3AF]">Priority: {rec.priority}</p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
