# Multi-Model AI Chat Setup

Your AI chat assistant now uses multiple specialized models for different purposes!

## 🎯 Available Features

### 💬 Q&A & Grammar Explanation
**Models Used (Priority Order):**
- `elyza/ELYZA-japanese-Llama-2-7b-fast-instruct` (⭐ Best for Japanese - Fast)
- `rinna/youri-7b-instruction` (⭐ Best for Japanese - Natural)
- `elyza/ELYZA-japanese-Llama-2-7b-instruct` (⭐ Best for Japanese - Accurate)
- `Qwen/Qwen2.5-7B-Instruct` (⭐ Best overall multilingual)
- `Qwen/Qwen2.5-3B-Instruct` (Fast & efficient)
- `google/gemma-2-2b-it` (Lightweight)
- `mistralai/Mistral-Nemo-Mini-4B-Instruct` (Very fast)

**Use Cases:**
- Ask questions about Japanese grammar
- Get explanations of language concepts
- Understand differences between similar words/particles

**Example Questions:**
- "What is the difference between は and が?"
- "How do I use て-form?"
- "Explain the difference between いる and ある"

### 📝 Grammar Correction
**Models Used (Priority Order):**
- `rinna/japanese-gpt-neox-3.6b-instruction-sft` (⭐ Specialized for Japanese grammar)
- `elyza/ELYZA-japanese-Llama-2-7b-fast-instruct` (Fast Japanese model)
- `rinna/youri-7b-instruction` (Natural Japanese)
- `Qwen/Qwen2.5-7B-Instruct` (Multilingual fallback)

**Use Cases:**
- Check and correct Japanese sentences
- Get feedback on your writing
- Fix grammar mistakes

**Example Requests:**
- "Correct this: 私は学生です"
- "Check my grammar: 昨日、公園に行きました"
- "Fix this sentence: 私は本を読む"

### 📚 Translation
**Models Used (Priority Order):**
- `staka/fugumt-en-ja` (⭐ High-quality English → Japanese)
- `staka/fugumt-ja-en` (⭐ High-quality Japanese → English)
- `Helsinki-NLP/opus-mt-en-jp` (Reliable English → Japanese)
- `Helsinki-NLP/opus-mt-jp-en` (Reliable Japanese → English)
- `Helsinki-NLP/opus-mt-en-jap` (Alternative naming)
- `Helsinki-NLP/opus-mt-ja-en` (Alternative naming)

**Use Cases:**
- Translate between English and Japanese
- Understand Japanese text
- Get translations for study materials

**Example Requests:**
- "Translate: How are you?"
- "What does こんにちは mean?"
- "Translate this: 私は日本語を勉強しています"

### 📊 Summarization
**Models Used:**
- `google/pegasus-xsum` (Primary)
- `facebook/bart-large-cnn` (Fallback)

**Use Cases:**
- Summarize long texts or lessons
- Get quick overviews of content
- Extract key points from materials

**Example Requests:**
- "Summarize this lesson"
- "Give me a brief overview"
- "What are the main points?"

## 🔄 How It Works

The system automatically detects what type of request you're making and routes it to the appropriate model:

1. **Request Detection**: Analyzes your message to determine the intent
2. **Model Selection**: Chooses the best model for the task
3. **Fallback System**: If one model fails, automatically tries alternatives
4. **Response Processing**: Cleans and formats the response

## 🎨 Smart Detection

The AI automatically detects your intent based on keywords:

- **Grammar Correction**: "correct", "grammar", "fix", "mistake", "check"
- **Translation**: "translate", "translation", "how do you say", "意味", "翻訳"
- **Summarization**: "summarize", "summary", "brief", "overview", "要点"
- **Q&A**: Questions with "?", "what", "how", "why", "explain", "何", "どう", "なぜ"

## ⚙️ Configuration

### Environment Variables

Make sure you have your Hugging Face API key set:

```env
HUGGINGFACE_API_KEY=your_api_key_here
```

### Model Priority

Models are tried in order:
1. Primary model (best for the task)
2. Secondary model (alternative)
3. Fallback model (general purpose)

If a model is loading (503 error), the system automatically tries the next one.

## 🚀 Usage Tips

1. **Be Specific**: The more specific your question, the better the response
2. **Use Keywords**: Include relevant keywords to help detection
3. **Try Different Phrasings**: If one doesn't work, rephrase your question
4. **Combine Features**: You can ask follow-up questions in the same conversation

## 📝 Example Conversations

### Grammar Explanation
```
You: What is the difference between は and が?
AI: [Uses Qwen2.5-7B-Instruct to explain the difference]
```

### Grammar Correction
```
You: Correct this: 私は学生です
AI: [Uses Qwen2.5-7B-Instruct to check and correct]
```

### Translation
```
You: Translate: How are you?
AI: [Uses Helsinki-NLP/opus-mt-en-jp to translate]
```

### Summarization
```
You: Summarize this lesson about particles
AI: [Uses google/pegasus-xsum to create summary]
```

## 🔧 Troubleshooting

### Model Loading (503 Error)
- The system automatically tries the next model
- Wait a moment and try again
- Some models take time to load on first use

### Poor Responses
- Try rephrasing your question
- Be more specific about what you need
- The system will try multiple models automatically

### Translation Issues
- Specify the direction (EN→JP or JP→EN)
- Use clear, simple sentences
- The system detects direction automatically

## 🎓 Best Practices

1. **For Grammar Questions**: Ask specific questions with examples
2. **For Corrections**: Provide the full sentence you want checked
3. **For Translations**: Include context if needed
4. **For Summaries**: Specify what you want summarized

## 📊 Model Performance

### Japanese-Specialized Models (Best for Japanese Learning)
- **ELYZA-japanese-Llama-2-7b-fast-instruct**: ⭐ Top choice - Fast and accurate for Japanese
- **youri-7b-instruction**: ⭐ Very natural Japanese conversations
- **ELYZA-japanese-Llama-2-7b-instruct**: More accurate but slower
- **japanese-gpt-neox-3.6b-instruction-sft**: ⭐ Best for grammar correction

### Multilingual Models
- **Qwen2.5-7B-Instruct**: ⭐ Best overall - Excellent for Q&A and grammar
- **Qwen2.5-3B-Instruct**: Smaller, faster version
- **gemma-2-2b-it**: Lightweight and fast

### Translation Models
- **staka/fugumt**: ⭐ Highest quality translations
- **Helsinki-NLP/opus-mt**: Reliable and fast

### Summarization
- **Pegasus/BART**: Excellent for summarization

## 🔐 Security

- All API calls are server-side only
- Your API key is never exposed to the client
- Conversation history is kept private
- Student data is used only for context

Enjoy your multi-model AI assistant! 🎉
