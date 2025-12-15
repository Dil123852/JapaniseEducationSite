# AI Integration Setup Guide

This guide explains how to set up and use the AI integration features in your learning platform.

## Features

1. **AI Chat Assistant** - A floating chat widget that helps students with their studies
2. **AI-Powered Recommendations** - Personalized next steps based on student progress
3. **Smart Context Gathering** - The AI understands each student's learning journey

## Environment Variables

Add the following to your `.env.local` file:

```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

Optional (for custom models):
```env
HF_MODEL=gpt2
HF_TEXT_MODEL=gpt2
```

## Getting a Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to your profile → Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token and add it to your `.env.local` file

## Recommended Models

The default model is `gpt2`, but you can use any text generation model from Hugging Face. Here are some recommendations:

### For Chat/Conversation:
- `gpt2` (default) - Fast and lightweight
- `distilgpt2` - Smaller, faster version of GPT-2
- `microsoft/DialoGPT-medium` - Specifically designed for conversations
- `facebook/blenderbot-400M-distill` - Good for conversational AI

### For Better Quality (requires more API credits):
- `gpt2-large` - Better quality but slower
- `EleutherAI/gpt-neo-125M` - Open-source alternative

## How It Works

### AI Chat Assistant
- Students can click the floating bot icon in the bottom-right corner
- The AI has access to:
  - Student's learning level and progress
  - Enrolled courses
  - Quiz performance
  - Learning time
  - Weak areas and strengths
- The AI provides personalized study advice

### AI Recommendations
- Automatically generates personalized next steps
- Based on:
  - Current learning status
  - Quiz performance
  - Course enrollment
  - Learning time
- Displayed on the "Next Step" page

### Student Context
The system gathers comprehensive context about each student:
- Profile information
- Enrolled courses
- Learning time statistics
- Quiz performance
- Recent activity
- Identified strengths and weak areas
- Recommended next steps

## Customization

### Changing the AI Model

Edit `.env.local`:
```env
HF_MODEL=your-preferred-model-name
```

### Adjusting AI Response Length

Edit `app/api/ai/chat/route.ts`:
```typescript
parameters: {
  max_new_tokens: 200, // Change this value (50-500 recommended)
  temperature: 0.7,    // Lower = more focused, Higher = more creative
  top_p: 0.9,          // Controls diversity
}
```

### Customizing the Chat Interface

Edit `app/components/AIAssistant.tsx` to customize:
- Colors and styling
- Welcome message
- Chat behavior

## Troubleshooting

### AI Not Responding
1. Check that `HUGGINGFACE_API_KEY` is set in `.env.local`
2. Verify your API key is valid
3. Check browser console for errors
4. Some models may take time to load on first use

### Poor Quality Responses
1. Try a different model (see Recommended Models above)
2. Adjust `temperature` parameter (lower = more focused)
3. Increase `max_new_tokens` for longer responses

### API Rate Limits
- Free Hugging Face accounts have rate limits
- Consider upgrading for production use
- The system includes fallback responses if the API is unavailable

## Files Created

- `app/lib/ai/student-context.ts` - Gathers student data for AI
- `app/api/ai/chat/route.ts` - Chat API endpoint
- `app/api/ai/recommendations/route.ts` - Recommendations API endpoint
- `app/components/AIAssistant.tsx` - Chat widget component
- `app/components/AIRecommendations.tsx` - Recommendations display component

## Usage

The AI assistant is automatically available to all students:
- Floating button appears in bottom-right corner
- Click to open chat interface
- Type questions about studies, progress, or next steps
- AI provides personalized responses based on student data

The recommendations appear on the "Next Step" page automatically.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test the Hugging Face API key directly
4. Check server logs for API errors
