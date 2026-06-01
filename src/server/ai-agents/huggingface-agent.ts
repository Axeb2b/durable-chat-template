export interface AIResponse {
	content: string;
	model: string;
	usage?: {
		input_tokens?: number;
		output_tokens?: number;
	};
}

export interface HuggingFaceConfig {
	apiKey: string;
	model?: string;
	baseURL?: string;
}

export class HuggingFaceAgent {
	private apiKey: string;
	private model: string;
	private baseURL: string;

	constructor(config: HuggingFaceConfig) {
		if (!config.apiKey) {
			throw new Error('HuggingFace API key is required');
		}

		this.apiKey = config.apiKey;
		this.model =
			config.model || 'meta-llama/Llama-2-7b-chat-hf';
		this.baseURL =
			config.baseURL || 'https://api-inference.huggingface.co/models';
	}

	async generateCode(
		prompt: string,
		fileType: string = 'typescript',
	): Promise<AIResponse> {
		const systemPrompt = `Generate clean ${fileType} code. Only output code, no explanations.`;

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
		);
	}

	async chat(messages: any[]): Promise<AIResponse> {
		try {
			// Format messages for HuggingFace API
			const prompt = messages
				.map((m) => `${m.role}: ${m.content}`)
				.join('\n');

			const response = await fetch(
				`${this.baseURL}/${this.model}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.apiKey}`,
					},
					body: JSON.stringify({
						inputs: prompt,
						parameters: {
							max_new_tokens: 1024,
						},
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					`HuggingFace API error: ${error.error || 'Unknown error'}`,
				);
			}

			const data = await response.json();
			const content = Array.isArray(data)
				? data[0]?.generated_text || ''
				: data.generated_text || '';

			return {
				content,
				model: this.model,
			};
		} catch (error: any) {
			throw new Error(`HuggingFace request failed: ${error.message}`);
		}
	}

	async codeReview(code: string): Promise<AIResponse> {
		return this.chat([
			{
				role: 'system',
				content: 'Review this code and provide feedback.',
			},
			{
					role: 'user',
					content: `Code:\n${code}`,
			},
		]);
	}
}
