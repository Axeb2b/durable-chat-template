export interface AIResponse {
	content: string;
	model: string;
	usage?: {
		input_tokens: number;
		output_tokens: number;
	};
}

export interface GroqConfig {
	apiKey: string;
	model?: string;
	temperature?: number;
	max_tokens?: number;
}

export class GroqAgent {
	private apiKey: string;
	private model: string;
	private temperature: number;
	private max_tokens: number;
	private baseURL = 'https://api.groq.com/openai/v1';

	constructor(config: GroqConfig) {
		if (!config.apiKey) {
			throw new Error('Groq API key is required');
		}

		this.apiKey = config.apiKey;
		this.model = config.model || 'mixtral-8x7b-32768';
		this.temperature = config.temperature || 0.7;
		this.max_tokens = config.max_tokens || 4096;
	}

	async generateCode(
		prompt: string,
		fileType: string = 'typescript',
	): Promise<AIResponse> {
		const systemPrompt = `You are an expert code generator. Generate clean, production-ready ${fileType} code with comments and best practices.`;

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
				`${this.baseURL}/chat/completions`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.apiKey}`,
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
					`Groq API error: ${error.error?.message || 'Unknown error'}`,
				);
			}

			const data = await response.json();

			return {
				content: data.choices[0].message.content,
				model: selectedModel,
				usage: {
					input_tokens: data.usage?.prompt_tokens || 0,
					output_tokens: data.usage?.completion_tokens || 0,
				},
			};
		} catch (error: any) {
			throw new Error(`Groq request failed: ${error.message}`);
		}
	}

	async codeReview(code: string): Promise<AIResponse> {
		return this.chat([
			{
				role: 'system',
				content:
					'You are a senior code reviewer. Review the code and provide constructive feedback.',
			},
			{
					role: 'user',
					content: `Please review this code:\n\n${code}`,
			},
		]);
	}
}
