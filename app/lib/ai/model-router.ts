/**
 * AI Model Router - Routes requests to appropriate models based on intent
 */

export type RequestType = 'qa' | 'grammar' | 'translation' | 'summarization' | 'general';

export interface ModelConfig {
  model: string;
  endpoint: string;
  parameters?: Record<string, any>;
}

export const MODEL_CONFIGS: Record<RequestType, ModelConfig[]> = {
  // Q&A and Grammar Explanation - Best Free Models for Japanese Learning
  qa: [
    // Japanese-specialized models (best for Japanese learning)
    {
      model: 'elyza/ELYZA-japanese-Llama-2-7b-fast-instruct',
      endpoint: 'https://api-inference.huggingface.co/models/elyza/ELYZA-japanese-Llama-2-7b-fast-instruct',
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    {
      model: 'rinna/youri-7b-instruction',
      endpoint: 'https://api-inference.huggingface.co/models/rinna/youri-7b-instruction',
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    {
      model: 'elyza/ELYZA-japanese-Llama-2-7b-instruct',
      endpoint: 'https://api-inference.huggingface.co/models/elyza/ELYZA-japanese-Llama-2-7b-instruct',
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    // Multilingual models (Qwen - best overall for ChatGPT-like conversations)
    {
      model: 'Qwen/Qwen2.5-7B-Instruct',
      endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
      parameters: {
        max_new_tokens: 512, // Increased for longer, more detailed responses
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    {
      model: 'Qwen/Qwen2.5-3B-Instruct',
      endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-3B-Instruct',
      parameters: {
        max_new_tokens: 512, // Increased for longer responses
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    // Lightweight alternatives
    {
      model: 'google/gemma-2-2b-it',
      endpoint: 'https://api-inference.huggingface.co/models/google/gemma-2-2b-it',
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    {
      model: 'mistralai/Mistral-Nemo-Mini-4B-Instruct',
      endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Mini-4B-Instruct',
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
    // Fallback
    {
      model: 'gpt2',
      endpoint: 'https://api-inference.huggingface.co/models/gpt2',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
  ],
  
  // Grammar Correction - Japanese Specialized Models
  grammar: [
    {
      model: 'rinna/japanese-gpt-neox-3.6b-instruction-sft',
      endpoint: 'https://api-inference.huggingface.co/models/rinna/japanese-gpt-neox-3.6b-instruction-sft',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false,
      },
    },
    {
      model: 'elyza/ELYZA-japanese-Llama-2-7b-fast-instruct',
      endpoint: 'https://api-inference.huggingface.co/models/elyza/ELYZA-japanese-Llama-2-7b-fast-instruct',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false,
      },
    },
    {
      model: 'rinna/youri-7b-instruction',
      endpoint: 'https://api-inference.huggingface.co/models/rinna/youri-7b-instruction',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false,
      },
    },
    {
      model: 'Qwen/Qwen2.5-7B-Instruct',
      endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false,
      },
    },
    {
      model: 'gpt2', // Fallback for grammar
      endpoint: 'https://api-inference.huggingface.co/models/gpt2',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false,
      },
    },
  ],
  
  // Translation - Best Free Translation Models
  translation: [
    // High-quality translation models
    {
      model: 'staka/fugumt-en-ja',
      endpoint: 'https://api-inference.huggingface.co/models/staka/fugumt-en-ja',
      parameters: {
        return_full_text: false,
      },
    },
    {
      model: 'staka/fugumt-ja-en',
      endpoint: 'https://api-inference.huggingface.co/models/staka/fugumt-ja-en',
      parameters: {
        return_full_text: false,
      },
    },
    // Helsinki-NLP models (reliable fallback)
    {
      model: 'Helsinki-NLP/opus-mt-en-jp',
      endpoint: 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-jp',
      parameters: {
        return_full_text: false,
      },
    },
    {
      model: 'Helsinki-NLP/opus-mt-jp-en',
      endpoint: 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-jp-en',
      parameters: {
        return_full_text: false,
      },
    },
    // Alternative naming
    {
      model: 'Helsinki-NLP/opus-mt-en-jap',
      endpoint: 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-jap',
      parameters: {
        return_full_text: false,
      },
    },
    {
      model: 'Helsinki-NLP/opus-mt-ja-en',
      endpoint: 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-ja-en',
      parameters: {
        return_full_text: false,
      },
    },
  ],
  
  // Summarization
  summarization: [
    {
      model: 'google/pegasus-xsum',
      endpoint: 'https://api-inference.huggingface.co/models/google/pegasus-xsum',
      parameters: {
        max_length: 100,
        min_length: 30,
        return_full_text: false,
      },
    },
    {
      model: 'facebook/bart-large-cnn',
      endpoint: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      parameters: {
        max_length: 100,
        min_length: 30,
        return_full_text: false,
      },
    },
  ],
  
  // General chat (fallback)
  general: [
    {
      model: 'gpt2',
      endpoint: 'https://api-inference.huggingface.co/models/gpt2',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    },
  ],
};

/**
 * Detect the type of request based on message content
 */
export function detectRequestType(message: string): RequestType {
  const lowerMessage = message.toLowerCase();
  
  // Grammar correction keywords
  if (
    lowerMessage.includes('correct') ||
    lowerMessage.includes('grammar') ||
    lowerMessage.includes('fix') ||
    lowerMessage.includes('mistake') ||
    lowerMessage.includes('wrong') ||
    lowerMessage.includes('check this') ||
    lowerMessage.includes('is this correct')
  ) {
    return 'grammar';
  }
  
  // Translation keywords (check first before other types)
  if (
    lowerMessage.startsWith('translate') ||
    lowerMessage.includes('translate:') ||
    lowerMessage.includes('translation') ||
    lowerMessage.includes('how do you say') ||
    lowerMessage.includes('what does this mean') ||
    lowerMessage.includes('意味') ||
    lowerMessage.includes('翻訳') ||
    (lowerMessage.includes('translate') && lowerMessage.includes(':'))
  ) {
    return 'translation';
  }
  
  // Summarization keywords
  if (
    lowerMessage.includes('summarize') ||
    lowerMessage.includes('summary') ||
    lowerMessage.includes('brief') ||
    lowerMessage.includes('overview') ||
    lowerMessage.includes('要点')
  ) {
    return 'summarization';
  }
  
  // Q&A (questions about Japanese, grammar explanations, or any Japanese-related question)
  // Since this is a Japanese learning chatbot, most questions will be about Japanese
  if (
    lowerMessage.includes('?') ||
    lowerMessage.includes('what') ||
    lowerMessage.includes('how') ||
    lowerMessage.includes('why') ||
    lowerMessage.includes('explain') ||
    lowerMessage.includes('difference') ||
    lowerMessage.includes('meaning') ||
    lowerMessage.includes('何') ||
    lowerMessage.includes('どう') ||
    lowerMessage.includes('なぜ') ||
    lowerMessage.includes('日本語') ||
    lowerMessage.includes('japanese') ||
    lowerMessage.includes('grammar') ||
    lowerMessage.includes('particle') ||
    lowerMessage.includes('verb') ||
    lowerMessage.includes('kanji') ||
    lowerMessage.includes('hiragana') ||
    lowerMessage.includes('katakana')
  ) {
    return 'qa';
  }
  
  // Default to qa for Japanese learning chatbot (most questions will be about Japanese)
  return 'qa';
}

/**
 * Get the appropriate model config for a request type
 */
export function getModelConfig(requestType: RequestType, index: number = 0): ModelConfig {
  const configs = MODEL_CONFIGS[requestType];
  if (!configs || configs.length === 0) {
    // Fallback to general
    return MODEL_CONFIGS.general[0];
  }
  return configs[Math.min(index, configs.length - 1)];
}

/**
 * Extract text to translate from message
 */
export function extractTranslationText(message: string): string {
  // Remove "translate:" or "translation:" prefix
  let text = message.replace(/^translate\s*:?\s*/i, '');
  text = text.replace(/^translation\s*:?\s*/i, '');
  text = text.replace(/^how do you say\s+/i, '');
  text = text.replace(/\?$/, ''); // Remove trailing question mark
  return text.trim();
}

/**
 * Detect translation direction (EN→JP or JP→EN)
 */
export function detectTranslationDirection(text: string): 'en-jp' | 'jp-en' {
  // Check if text contains Japanese characters (hiragana, katakana, kanji)
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japaneseRegex.test(text) ? 'jp-en' : 'en-jp';
}

/**
 * Build prompt based on request type
 */
export function buildPrompt(
  requestType: RequestType,
  contextPrompt: string,
  message: string,
  conversationHistory: any[]
): string {
  const conversationText = conversationHistory
    .slice(-6)
    .map((m: any) => {
      if (m.role === 'user') return `Student: ${m.content}`;
      if (m.role === 'assistant') return `Assistant: ${m.content}`;
      return '';
    })
    .filter(Boolean)
    .join('\n');

  switch (requestType) {
    case 'grammar':
      return `You are a Japanese grammar correction assistant. Correct any grammar mistakes in the following Japanese text and explain the corrections briefly.\n\n${conversationText}\nStudent: ${message}\nAssistant (Corrected):`;
    
    case 'translation':
      // For translation, extract the actual text to translate
      const textToTranslate = extractTranslationText(message);
      return textToTranslate; // Translation models just need the text
    
    case 'summarization':
      return `You are a summarization assistant. Provide a concise summary of the following content.\n\n${message}\n\nSummary:`;
    
    case 'qa':
      // For Q&A, create a clear instruction prompt
      return `You are an expert Japanese language teacher. Answer the student's question clearly and provide helpful explanations with examples when appropriate.\n\n${contextPrompt}\n\n${conversationText}\nStudent: ${message}\nAssistant:`;
    
    default:
      return `${contextPrompt}\n\n${conversationText}\nStudent: ${message}\nAssistant:`;
  }
}

/**
 * Build instruction format for instruction-based models
 * Supports: Qwen, Llama, ELYZA, Youri, Gemma, and other instruction models
 */
export function buildInstructionPrompt(
  requestType: RequestType,
  contextPrompt: string,
  message: string,
  conversationHistory: any[],
  modelName?: string
): string {
  // Check if it's a Qwen model (uses ChatML format)
  const isQwen = modelName?.includes('Qwen');
  // Check if it's ELYZA or Youri (Japanese models, may use different formats)
  const isJapaneseModel = modelName?.includes('ELYZA') || modelName?.includes('youri') || modelName?.includes('rinna');
  
  // For Japanese models, use simpler prompts that work better
  // Include conversation history for context
  if (isJapaneseModel) {
    const conversationText = conversationHistory
      .slice(-6)
      .map((msg: any) => {
        if (msg.role === 'user') return `学生: ${msg.content}`;
        if (msg.role === 'assistant') return `先生: ${msg.content}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');
    
    switch (requestType) {
      case 'qa':
      case 'general':
        return `${contextPrompt}

温かく、親しみやすく、励ましの言葉を使いながら、学生の日本語学習をサポートしてください。自然な会話のように話してください。

${conversationText ? conversationText + '\n' : ''}学生: ${message}\n\n先生:`;
      
      case 'grammar':
        return `あなたは親切で励ましの言葉を使う日本語の文法修正アシスタントです。間違いを修正する際は、励ましながら、なぜその修正が必要かを説明してください。

${conversationText ? conversationText + '\n' : ''}学生: ${message}\n\n先生:`;
      
      default:
        return `${contextPrompt}\n\n${conversationText ? conversationText + '\n' : ''}学生: ${message}\n\n先生:`;
    }
  }
  
  // For Qwen models, use ChatML format with conversation history
  if (isQwen) {
    // Format conversation history for ChatML
    const chatHistory = conversationHistory
      .slice(-8) // Keep last 8 messages for context
      .map((msg: any) => {
        if (msg.role === 'user') return `<|im_start|>user\n${msg.content}<|im_end|>`;
        if (msg.role === 'assistant') return `<|im_start|>assistant\n${msg.content}<|im_end|>`;
        return '';
      })
      .filter(Boolean)
      .join('\n');
    
    switch (requestType) {
      case 'qa':
      case 'general':
        return `<|im_start|>system
${contextPrompt}

Remember to be warm, friendly, and conversational. Use natural language and show enthusiasm for helping students learn Japanese. Provide detailed explanations with examples when helpful.<|im_end|>
${chatHistory}
<|im_start|>user
${message}<|im_end|>
<|im_start|>assistant
`;
      
      case 'grammar':
        return `<|im_start|>system
You are a friendly Japanese grammar correction assistant. When correcting mistakes, be encouraging and explain why the correction is needed. Use a warm, supportive tone.<|im_end|>
${chatHistory}
<|im_start|>user
${message}<|im_end|>
<|im_start|>assistant
`;
      
      default:
        return `<|im_start|>system
${contextPrompt}

Be conversational and helpful. Remember you're a caring Japanese language teacher!<|im_end|>
${chatHistory}
<|im_start|>user
${message}<|im_end|>
<|im_start|>assistant
`;
    }
  }
  
  // Default format for other instruction models (Llama, Mistral, etc.)
  // Include conversation history for better context
  const conversationText = conversationHistory
    .slice(-8)
    .map((msg: any) => {
      if (msg.role === 'user') return `Student: ${msg.content}`;
      if (msg.role === 'assistant') return `Sensei: ${msg.content}`;
      return '';
    })
    .filter(Boolean)
    .join('\n');
  
  switch (requestType) {
    case 'qa':
    case 'general':
      return `${contextPrompt}

Remember to be warm, friendly, and conversational. Use encouraging language and show enthusiasm for helping students learn Japanese.

${conversationText ? conversationText + '\n' : ''}Student: ${message}\n\nSensei:`;
    
    case 'grammar':
      return `You are a friendly Japanese grammar correction assistant. When correcting mistakes, be encouraging and explain why the correction is needed. Use a warm, supportive tone.

${conversationText ? conversationText + '\n' : ''}Student: ${message}\n\nSensei:`;
    
    default:
      return `${contextPrompt}

Be conversational and helpful. Remember you're a caring Japanese language teacher!

${conversationText ? conversationText + '\n' : ''}Student: ${message}\n\nSensei:`;
  }
}
