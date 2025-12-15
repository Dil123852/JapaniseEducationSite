# Environment Variables Setup

## AI Integration Setup

To use the AI features, you need to set up your Hugging Face API key.

### Step 1: Create a `.env.local` file

Create a file named `.env.local` in the root directory of your project (same level as `package.json`).

### Step 2: Add your Hugging Face API Key

Add the following line to your `.env.local` file:

```env
HUGGINGFACE_API_KEY=your_actual_api_key_here
```

**Important Notes:**
- Replace `your_actual_api_key_here` with your actual Hugging Face API key
- Do NOT commit `.env.local` to git (it should be in `.gitignore`)
- The variable name must be exactly: `HUGGINGFACE_API_KEY` (all uppercase)

### Step 3: Get your Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up or log in
3. Go to your profile → Settings → Access Tokens
4. Click "New token"
5. Give it a name (e.g., "Learning Platform")
6. Select "Read" permissions
7. Click "Generate token"
8. Copy the token immediately (you won't see it again)
9. Paste it into your `.env.local` file

### Step 4: Restart your development server

After adding the API key:
1. Stop your Next.js development server (Ctrl+C)
2. Start it again with `npm run dev`

**The server must be restarted for environment variables to be loaded!**

### Optional: Custom Model Configuration

You can also specify which AI model to use:

```env
HUGGINGFACE_API_KEY=your_api_key_here
HF_MODEL=gpt2
HF_TEXT_MODEL=gpt2
```

Recommended models:
- `gpt2` (default) - Fast and lightweight
- `distilgpt2` - Smaller, faster version
- `microsoft/DialoGPT-medium` - Better for conversations

### Troubleshooting

**Issue: "Hugging Face API key not configured" error**

Solutions:
1. ✅ Make sure `.env.local` is in the root directory (not in `app/` or other folders)
2. ✅ Check the variable name is exactly `HUGGINGFACE_API_KEY` (case-sensitive)
3. ✅ Make sure there are no spaces around the `=` sign
4. ✅ Restart your development server after adding the key
5. ✅ Verify the API key is correct (no extra spaces or characters)

**Issue: API still not working after setup**

1. Check your `.env.local` file format:
   ```env
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   (No quotes, no spaces)

2. Verify the file is named exactly `.env.local` (with the dot at the beginning)

3. Make sure you've restarted the server

4. Check the server console for any error messages

### Fallback Mode

Even without the API key, the AI assistant will still work using intelligent fallback responses based on your student data. However, for the best experience, we recommend setting up the Hugging Face API key.

### Security Note

Never share your API key or commit it to version control. The `.env.local` file should already be in `.gitignore`, but double-check to make sure.
