# FlowState Environment Setup

This project requires API keys for AI functionality. Follow these steps to configure your environment:

## 1. Get Your API Keys

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### DeepSeek API Key (Optional)
1. Go to [DeepSeek Platform](https://platform.deepseek.com/api_keys)
2. Sign up or sign in
3. Create a new API key
4. Copy your API key

## 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual API keys:
   ```env
   # For React frontend (Vite)
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   VITE_DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here

   # For Electron main process
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
   ```

## 3. Security Notes

- **Never commit your `.env` file** to version control
- The `.env` file is already included in `.gitignore`
- Only share your `.env.example` file (which contains placeholders)
- Keep your API keys secure and don't share them publicly

## 4. Running the Application

After setting up your environment variables:

```bash
# Development mode
npm run electron:dev

# Production build
npm run electron:pack
```

## 5. Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for React frontend |
| `VITE_DEEPSEEK_API_KEY` | No | DeepSeek API key for React frontend |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for Electron main process |
| `DEEPSEEK_API_KEY` | No | DeepSeek API key for Electron main process |

**Note**:
- You need to set both `VITE_*` and non-prefixed versions because FlowState uses both Vite (for the React UI) and Node.js (for the Electron main process).
- The project uses `dotenv` to automatically load environment variables from `.env` file in Node.js processes.
- No additional configuration needed - just create the `.env` file and the variables will be loaded automatically.

## 6. Troubleshooting

### Missing API Key Error
If you see an error like `❌ GEMINI_API_KEY environment variable is required`, make sure:
1. You have created a `.env` file
2. The `.env` file contains valid API keys
3. You have restarted the development server after adding the keys

### Build Issues
If the build fails, ensure your `.env` file is properly formatted and contains valid keys.