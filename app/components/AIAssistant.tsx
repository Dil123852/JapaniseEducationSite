'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bot, X, Send, Loader2, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIAssistant } from './AIAssistantContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { isOpen, openDialog, closeDialog } = useAIAssistant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message will be shown in the empty state instead
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      });

      let data: any;
      try {
        const responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch {
          // If not JSON, treat as plain text response
          data = { response: responseText };
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = { response: "I'm here to help! Could you please rephrase your question?" };
      }

      // Always use the response if available, regardless of status
      const responseText = data?.response || data?.message || data?.error || "I'm here to help! Could you please rephrase your question?";
      
      console.log('Received response:', responseText.substring(0, 100));
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Use fallback response that's always helpful
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm here to help you with your studies! Based on your progress, I recommend focusing on your enrolled courses and taking quizzes to track your improvement. Feel free to ask me about your next steps or any study questions!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? openDialog() : closeDialog()}>
      <DialogContent 
          showCloseButton={false}
          className="max-w-4xl w-full h-[90vh] md:h-[85vh] flex flex-col p-0 bg-white border-0 shadow-2xl rounded-none md:rounded-lg"
        >
          {/* Header - ChatGPT style */}
          <DialogHeader className="px-4 md:px-6 py-3 border-b border-[#E5E7EB] bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-semibold text-[#2B2B2B]">
                Japanese Sensei (先生) 🇯🇵
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeDialog}
                className="h-8 w-8 hover:bg-[#F3F4F6] rounded-lg"
              >
                <X className="h-4 w-4 text-[#6B7280]" />
              </Button>
            </div>
          </DialogHeader>

        {/* Messages Container - ChatGPT style */}
        <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="h-8 w-8 text-[#2B2B2B]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-3">
                  こんにちは！(Konnichiwa!) 👋
                </h3>
                <p className="text-sm text-[#9CA3AF] text-center max-w-md mb-6">
                  I'm Sensei, your friendly Japanese language tutor! I'm here to help you learn Japanese in a natural, conversational way. Ask me anything about Japanese - grammar, vocabulary, translations, culture, or study tips. Let's learn together! 一緒に勉強しましょう！
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                  <button
                    onClick={() => {
                      setInput("What is the difference between は and が?");
                      textareaRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm text-left border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] hover:border-[#C2E2F5] transition-colors text-[#2B2B2B]"
                  >
                    💬 Ask about grammar
                  </button>
                  <button
                    onClick={() => {
                      setInput("Translate: I want to go home");
                      textareaRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm text-left border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] hover:border-[#C2E2F5] transition-colors text-[#2B2B2B]"
                  >
                    📚 Translate text
                  </button>
                  <button
                    onClick={() => {
                      setInput("Correct this: 私は学生です");
                      textareaRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm text-left border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] hover:border-[#C2E2F5] transition-colors text-[#2B2B2B]"
                  >
                    📝 Check grammar
                  </button>
                  <button
                    onClick={() => {
                      setInput("What's the difference between は and が?");
                      textareaRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm text-left border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] hover:border-[#C2E2F5] transition-colors text-[#2B2B2B]"
                  >
                    🤔 Ask about particles
                  </button>
                </div>
              </div>
            )}
            
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={cn(
                  'group w-full',
                  message.role === 'user' ? 'bg-white' : 'bg-white'
                )}
              >
                <div className="flex gap-4 px-4 md:px-6 py-4 md:py-6">
                  {/* Avatar */}
                  <div className={cn(
                    'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#C2E2F5] to-[#B0D9F0]'
                      : 'bg-gradient-to-r from-[#F7DDE2] to-[#F0D1D8]'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-[#2B2B2B]" />
                    ) : (
                      <Bot className="h-4 w-4 text-[#2B2B2B]" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#2B2B2B]">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-[#2B2B2B] leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base">
                        {message.content.split('\n').map((line, i, arr) => (
                          <span key={i}>
                            {line}
                            {i < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="group w-full bg-white">
                <div className="flex gap-4 px-4 md:px-6 py-4 md:py-6">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-[#F7DDE2] to-[#F0D1D8] flex items-center justify-center">
                    <Bot className="h-4 w-4 text-[#2B2B2B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#2B2B2B]">
                        AI Assistant
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin text-[#C2E2F5]" />
                      <span className="text-sm text-[#9CA3AF]">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - ChatGPT style */}
        <div className="border-t border-[#E5E7EB] bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AI Assistant..."
                  className="min-h-[52px] max-h-[200px] resize-none pr-12 py-3 px-4 rounded-2xl border-[#E5E7EB] bg-white text-[#2B2B2B] placeholder:text-[#9CA3AF] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 transition-all"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-lg bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2 text-center">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
