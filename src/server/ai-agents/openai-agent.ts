import { Anthropic } from '@anthropic-ai/sdk';

export interface AIResponse {
	content: string;
	model: string;
	usage?: {
		input_tokens: number;
		output_tokens: number;
	};
}

export interface OpenAIConfig {
	apiKey: string;
	model?: string;
	temperature?: number;
	max_tokens?: number;
}

export class OpenAIAgent {
	private client: any;
	private model: string;
	private temperature: number;
	private max_tokens: number;

	constructor(config: OpenAIConfig) {
		if (!config.apiKey) {
			throw new Error('OpenAI API key is required');
		}

		try {
			// Using fetch API for Cloudflare Workers compatibility
			this.client = {
				apiKey: config.apiKey,
				baseURL: 'https://api.openai.com/v1',
			};
		} catch (e) {
			console.warn('OpenAI client initialization note:', e);
		}

		this.model = config.model || 'gpt-4';
		this.temperature = config.temperature || 0.7;
		this.max_tokens = config.max_tokens || 4096;
	}

	async generateCode(
		prompt: string,
		fileType: string = 'typescript',
	): Promise<AIResponse> {
		const systemPrompt = `You are an expert code generator. Generate clean, production-ready code in ${fileType}. Include comments and follow best practices.`;

		return this.chat(
			[
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			this.model,
		);
	}

	async chat(
		messages: any[],
		model?: string,
	): Promise<AIResponse> {
		const selectedModel = model || this.model;

		try {
			const response = await fetch(
				'https://api.openai.com/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.client.apiKey}`,
					},
					body: JSON.stringify({
						model: selectedModel,
						messages,
						temperature: this.temperature,
						max_tokens: this.max_tokens,
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					`OpenAI API error: ${error.error?.message || 'Unknown error'}`,
				);
			}

			const data = await response.json();

			return {
				content: data.choices[0].message.content,
				model: selectedModel,
				usage: {
					input_tokens: data.usage.prompt_tokens,
					output_tokens: data.usage.completion_tokens,
				},
			};
		} catch (error: any) {
			throw new Error(`OpenAI request failed: ${error.message}`);
		}
	}

	async codeReview(code: string): Promise<AIResponse> {
		return this.chat([
			{
				role: 'system',
				content:
					'You are a senior code reviewer. Review the code and provide constructive feedback on quality, performance, security, and best practices.',
			},
			{
					role: 'user',
					content: `Please review this code:\n\n${code}`,
			},
		]);
	}

	async bugFix(code: string, error: string): Promise<AIResponse> {
		return this.chat([
			{
				role: 'system',
				content:
					'You are an expert debugger. Analyze the code and error, then provide a fixed version with explanation.',
			},
			{
					role: 'user',
					content: `Code:\n${code}\n\nError:\n${error}\n\nPlease fix this.`,
			},
		]);
	}
}
