# AI Integration Guide

## Overview

This repository includes a comprehensive AI integration system that supports multiple AI providers and enables code generation, review, testing, and documentation.

## Supported AI Providers

### 1. Claude (Anthropic) - **Recommended**
- **Best for**: Code generation, complex tasks, reasoning
- **Setup**: Get API key from [console.anthropic.com](https://console.anthropic.com)
- **Models**: 
  - `claude-3-5-sonnet-20241022` (Latest, Recommended)
  - `claude-3-opus-20250219`
  - `claude-3-haiku-20240307`

### 2. OpenAI GPT-4
- **Best for**: Code, creative writing, general tasks
- **Setup**: Get API key from [platform.openai.com](https://platform.openai.com)
- **Models**:
  - `gpt-4`
  - `gpt-4-turbo`
  - `gpt-3.5-turbo`

### 3. Groq - **Free & Fast**
- **Best for**: Fast inference, free tier available
- **Setup**: Get API key from [console.groq.com](https://console.groq.com)
- **Models**:
  - `mixtral-8x7b-32768`
  - `llama2-70b-4096`
  - `gemma-7b-it`

### 4. Hugging Face
- **Best for**: Open source models, self-hosted
- **Setup**: Get API key from [huggingface.co](https://huggingface.co/settings/tokens)
- **Models**:
  - `meta-llama/Llama-2-7b-chat-hf`
  - `mistralai/Mistral-7B-Instruct-v0.1`

## API Endpoints

### File Generation
```bash
POST /api/ai/generate-file
Content-Type: application/json

{
  "fileName": "utils.ts",
  "description": "Utility functions for data processing",
  "fileType": "typescript",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Multiple Files
```bash
POST /api/ai/generate-files
Content-Type: application/json

{
  "files": [
    { "fileName": "file1.ts", "description": "...", ... },
    { "fileName": "file2.tsx", "description": "...", ... }
  ]
}
```

### Code Review
```bash
POST /api/ai/code-review
Content-Type: application/json

{
  "code": "function example() { ... }",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Bug Fix
```bash
POST /api/ai/bug-fix
Content-Type: application/json

{
  "code": "function example() { ... }",
  "error": "TypeError: Cannot read property 'x' of undefined",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Refactor Code
```bash
POST /api/ai/refactor
Content-Type: application/json

{
  "code": "function example() { ... }",
  "language": "typescript",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Code Analysis
```bash
POST /api/ai/analyze
Content-Type: application/json

{
  "code": "function example() { ... }",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Generate Tests
```bash
POST /api/ai/tests
Content-Type: application/json

{
  "code": "function example() { ... }",
  "framework": "jest",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Generate Documentation
```bash
POST /api/ai/docs
Content-Type: application/json

{
  "code": "function example() { ... }",
  "docFormat": "JSDoc",
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

### Chat
```bash
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Help me with TypeScript" }
  ],
  "aiProvider": "claude",
  "apiKey": "your-api-key"
}
```

## Supported File Extensions

The system supports:
- TypeScript: `.ts`, `.tsx`
- JavaScript: `.js`, `.jsx`
- HTML: `.html`
- CSS: `.css`, `.scss`, `.sass`
- JSON: `.json`
- Markdown: `.md`, `.mdx`
- Python: `.py`
- Java: `.java`
- C/C++: `.c`, `.cpp`, `.h`
- Go: `.go`
- Rust: `.rs`
- PHP: `.php`
- Ruby: `.rb`
- Shell: `.sh`, `.bash`
- YAML: `.yaml`, `.yml`
- XML: `.xml`
- SQL: `.sql`
- Docker: `Dockerfile`
- Git: `.gitignore`, `.gitattributes`

## Usage Examples

### Using the AI Assistant UI

1. Navigate to `/ai` route
2. Select your preferred AI provider
3. Enter your API key
4. Use Chat, File Generation, or Tools tabs

### Programmatic Usage

```typescript
import { FileGenerator } from './src/server/file-generator';

const generator = new FileGenerator();

const file = await generator.generateFile({
  fileName: 'api.ts',
  description: 'REST API handler',
  fileType: 'typescript',
  aiProvider: 'claude',
  apiKey: process.env.CLAUDE_API_KEY,
});

console.log(file.content); // Generated code
```

## Environment Variables

Add to your `.env` or `wrangler.toml`:

```env
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
HUGGINGFACE_API_KEY=hf_...
```

## Performance Tips

1. **Use Groq for fast responses** - Best for quick code snippets
2. **Use Claude for complex tasks** - Best for in-depth analysis
3. **Cache API keys** securely in your application
4. **Implement rate limiting** to avoid excessive API calls
5. **Use appropriate models** based on task complexity

## Error Handling

All API endpoints return errors in format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** on API endpoints
4. **Validate user input** before sending to AI APIs
5. **Use HTTPS** in production
6. **Implement authentication** for your AI endpoints

## Troubleshooting

### API Key not working
- Verify key is valid on provider's website
- Check for spaces or special characters
- Ensure correct provider is selected

### Timeout errors
- Use Groq for faster responses
- Reduce code input size
- Check your internet connection

### Rate limit errors
- Implement exponential backoff
- Add request queueing
- Use a free tier account for testing

## Next Steps

1. Get API keys from your preferred providers
2. Add them to your environment
3. Start using the AI features!
4. Integrate AI into your development workflow

## Support

For issues or questions:
- Check AI provider documentation
- Review API response errors
- Test with simpler prompts first
