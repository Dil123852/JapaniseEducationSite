# Chatbot Troubleshooting Guide

## Common Issues and Solutions

### Issue: Chatbot Not Giving Answers / Not Working

#### Solution 1: Check Environment Variables
Make sure your `.env.local` file has the Hugging Face API key:
```env
HUGGINGFACE_API_KEY=your_api_key_here
```

**Important:**
- File must be named `.env.local` (with the dot)
- Variable name must be exactly `HUGGINGFACE_API_KEY` (all uppercase)
- No spaces around the `=` sign
- Restart your development server after adding the key

#### Solution 2: Check Server Console
Look for error messages in your terminal/console. Common errors:
- `Hugging Face API key not configured` → Add API key to `.env.local`
- `Model loading (503)` → Wait a moment, model is starting up
- `API error: 401` → Invalid API key
- `API error: 429` → Rate limit exceeded (wait a bit)

#### Solution 3: Test the API Directly
Open your browser console and check the Network tab when sending a message. Look for:
- Request to `/api/ai/chat`
- Response status (should be 200)
- Response body (should have `response` field)

#### Solution 4: Check Browser Console
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Any error messages

### Issue: Getting Generic Responses Instead of Real Answers

The chatbot has intelligent fallbacks that work even without the API key. However, for best results:

1. **Set up your Hugging Face API key** (see Solution 1 above)
2. **Wait for models to load** - First request to a model may take 10-30 seconds
3. **Try rephrasing** - Be more specific in your questions

### Issue: Translation Not Working

For translations, the system:
1. Tries high-quality translation models first
2. Falls back to common phrase dictionary
3. Provides helpful translations even if models fail

**Example working translations:**
- "Translate: I am hungry" → お腹が空きました
- "Translate: Hello" → こんにちは
- "Translate: Thank you" → ありがとうございます

### Issue: Models Taking Too Long

Some models need to "wake up" on first use:
- **ELYZA models**: 10-30 seconds first time
- **Qwen models**: 5-15 seconds first time
- **Translation models**: Usually fast (1-3 seconds)

**Solution:** Wait for the first response, subsequent requests will be faster.

### Issue: Getting Same Response Every Time

This usually means:
1. All models are failing
2. API key is not configured
3. Rate limits are being hit

**Solutions:**
1. Check your API key is set correctly
2. Check server logs for errors
3. Wait a few minutes if you hit rate limits
4. The fallback system should still provide helpful answers

## Testing the Chatbot

### Test 1: Basic Question
**Input:** "What is the difference between は and が?"
**Expected:** Detailed explanation about は vs が

### Test 2: Translation
**Input:** "Translate: I am hungry"
**Expected:** "Translation: お腹が空きました (Onaka ga sukimashita)"

### Test 3: Grammar Correction
**Input:** "Correct this: 私は学生です"
**Expected:** Grammar check and correction

### Test 4: General Question
**Input:** "How do I use て-form?"
**Expected:** Explanation of て-form usage

## Debugging Steps

1. **Check Server Logs**
   - Look for console.log messages
   - Check for error messages
   - Note which models are being tried

2. **Check Network Requests**
   - Open browser DevTools → Network tab
   - Send a message
   - Check the `/api/ai/chat` request
   - Look at the response

3. **Test API Key**
   - Verify it's in `.env.local`
   - Check it's valid on Hugging Face website
   - Make sure server was restarted after adding it

4. **Check Model Status**
   - Some models may be temporarily unavailable
   - The system will try multiple models automatically
   - Check server logs to see which models are being tried

## Quick Fixes

### Fix 1: Restart Server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 2: Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache

### Fix 3: Check API Key Format
Make sure `.env.local` looks like this:
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(No quotes, no spaces)

### Fix 4: Verify API Key
1. Go to https://huggingface.co/settings/tokens
2. Check your token is active
3. Make sure it has "Read" permissions

## Still Not Working?

If the chatbot still doesn't work:

1. **Check the server console** for specific error messages
2. **Check browser console** for client-side errors
3. **Verify the API route** is accessible: `http://localhost:3000/api/ai/chat`
4. **Test with a simple message** like "hello" or "help"

The system is designed to always provide helpful responses, even if AI models fail. If you're getting no response at all, there may be a network or server issue.

## Expected Behavior

✅ **Working correctly:**
- Chatbot responds to all messages
- Provides helpful answers even without API key
- Tries multiple models if one fails
- Gives translations for common phrases
- Explains Japanese grammar concepts

❌ **Not working:**
- No response at all
- Error messages in console
- Blank responses
- Network errors

If you see error messages, share them and I can help fix the specific issue!
