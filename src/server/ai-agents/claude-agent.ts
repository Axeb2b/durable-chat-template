export interface AIResponse {
	content: string;
	model: string;
	usage?: {
		input_tokens: number;
		output_tokens: number;
	};
}

export interface ClaudeConfig {
	apiKey: string;
	model?: string;
	max_tokens?: number;
}

export class ClaudeAgent {
	private apiKey: string;
	private model: string;
	private max_tokens: number;

	constructor(config: ClaudeConfig) {
		if (!config.apiKey) {
			throw new Error('Claude API key is required');
		}

		this.apiKey = config.apiKey;
		this.model = config.model || 'claude-3-5-sonnet-20241022';
		this.max_tokens = config.max_tokens || 4096;
	}

	async generateCode(
		prompt: string,
		fileType: string = 'typescript',
	): Promise<AIResponse> {
		const systemPrompt = `You are an expert code generator specializing in ${fileType}. Generate clean, production-ready code with proper error handling, type safety, and comments. Follow industry best practices.`;

		return this.chat(
			[
				{
					role: 'user',
					content: prompt,
				},
			],
			systemPrompt,
		);
	}

	async chat(
		messages: any[],
		system?: string,
		model?: string,
	): Promise<AIResponse> {
		const selectedModel = model || this.model;

		try {
			const response = await fetch(
				'https://api.anthropic.com/v1/messages',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-api-key': this.apiKey,
						'anthropic-version': '2023-06-01',
					},
					body: JSON.stringify({
						model: selectedModel,
						max_tokens: this.max_tokens,
						system: system || 'You are a helpful AI assistant.',
						messages: messages,
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					`Claude API error: ${error.error?.message || 'Unknown error'}`,
				);
			}

			const data = await response.json();

			const content =
				data.content[0]?.type === 'text' ? data.content[0].text : '';

			return {
				content,
				model: selectedModel,
				usage: {
					input_tokens: data.usage?.input_tokens || 0,
					output_tokens: data.usage?.output_tokens || 0,
				},
			};
		} catch (error: any) {
			throw new Error(`Claude API error: ${error.message}`);
		}
	}

	async codeReview(code: string): Promise<AIResponse> {
		const systemPrompt =
			'You are a senior code reviewer. Review the code and provide constructive feedback on quality, performance, security, and best practices.';

		return this.chat(
			[
				{
					role: 'user',
					content: `Please review this code:\n\n${code}`,
				},
			],
			systemPrompt,
		);
	}

	async bugFix(code: string, error: string): Promise<AIResponse> {
		const systemPrompt =
			'You are an expert debugger. Analyze the code and error, then provide a fixed version with clear explanation of what was wrong.';

		return this.chat(
			[
				{
					role: 'user',
					content: `Code:\n${code}\n\nError:\n${error}\n\nPlease fix this and explain the issue.`,
				},
			],
			systemPrompt,
		);
	}

	async refactor(code: string, language: string): Promise<AIResponse> {
		const systemPrompt = `You are an expert ${language} developer. Refactor the code to improve readability, performance, and maintainability.`;

		return this.chat(
			[
				{
					role: 'user',
					content: `Please refactor this ${language} code:\n\n${code}`,
				},
			],
			systemPrompt,
		);
	}
}
