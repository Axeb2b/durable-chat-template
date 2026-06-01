import { FileGenerator, type FileGenerationRequest } from './file-generator';
import { ClaudeAgent } from './ai-agents/claude-agent';
import { OpenAIAgent } from './ai-agents/openai-agent';
import { GroqAgent } from './ai-agents/groq-agent';
import { HuggingFaceAgent } from './ai-agents/huggingface-agent';

export interface AIRouterRequest {
	action: string;
	payload: any;
}

export class AIRouter {
	private fileGenerator: FileGenerator;

	constructor() {
		this.fileGenerator = new FileGenerator();
	}

	async handleRequest(request: AIRouterRequest): Promise<any> {
		try {
			switch (request.action) {
				case 'generate-file':
					return await this.generateFile(request.payload);
				case 'generate-files':
					return await this.generateMultipleFiles(request.payload);
				case 'code-review':
					return await this.codeReview(request.payload);
				case 'bug-fix':
					return await this.bugFix(request.payload);
				case 'refactor':
					return await this.refactor(request.payload);
				case 'analyze-code':
					return await this.analyzeCode(request.payload);
				case 'generate-tests':
					return await this.generateTests(request.payload);
				case 'generate-docs':
					return await this.generateDocs(request.payload);
				default:
					return { error: `Unknown action: ${request.action}` };
			}
		} catch (error: any) {
			return { error: error.message };
		}
	}

	private async generateFile(
		payload: FileGenerationRequest,
	): Promise<any> {
		return this.fileGenerator.generateFile(payload);
	}

	private async generateMultipleFiles(
		payload: { files: FileGenerationRequest[] },
	): Promise<any> {
		return this.fileGenerator.generateMultipleFiles(payload.files);
	}

	private async codeReview(payload: {
		code: string;
		aiProvider: string;
		apiKey: string;
	}): Promise<any> {
		const agent = this.getAgent(payload.aiProvider, payload.apiKey);
		return agent.codeReview(payload.code);
	}

	private async bugFix(payload: {
		code: string;
		error: string;
		aiProvider: string;
		apiKey: string;
	}): Promise<any> {
		const agent = this.getAgent(payload.aiProvider, payload.apiKey);
		return agent.bugFix(payload.code, payload.error);
	}

	private async refactor(payload: {
		code: string;
		language: string;
		aiProvider: string;
		apiKey: string;
	}): Promise<any> {
		if (payload.aiProvider !== 'claude') {
			return { error: 'Refactoring is best with Claude' };
		}
		const agent = new ClaudeAgent({ apiKey: payload.apiKey });
		return agent.refactor(payload.code, payload.language);
	}

	private async analyzeCode(payload: {
		code: string;
		aiProvider: string;
		apiKey: string;
	}): Promise<any> {
		const agent = this.getAgent(payload.aiProvider, payload.apiKey);
		return agent.chat([
			{
				role: 'system',
				content:
					'Analyze the code and provide insights on quality, complexity, performance issues, and suggestions.',
			},
			{
					role: 'user',
					content: `Analyze this code:\n${payload.code}`,
			},
		]);
	}

	private async generateTests(payload: {
		code: string;
		framework?: string;
		aiProvider: string;
		apiKey: string;
	}): Promise<any> {
		const framework = payload.framework || 'jest';
		const agent = this.getAgent(payload.aiProvider, payload.apiKey);
		return agent.chat([
			{
				role: 'system',
				content: `Generate comprehensive unit tests using ${framework}. Include edge cases and error scenarios.`,
			},
			{
					role: 'user',
					content: `Generate tests for this code:\n${payload.code}`,
			},
		]);
	}

	private async generateDocs(payload: {
		code: string;
		docFormat?: string;
		aiProvider: string;
		apiKey: string;
	}): Promise<any> {
		const format = payload.docFormat || 'JSDoc';
		const agent = this.getAgent(payload.aiProvider, payload.apiKey);
		return agent.chat([
			{
				role: 'system',
				content: `Generate comprehensive ${format} documentation for the code.`,
			},
			{
					role: 'user',
					content: `Generate documentation for:\n${payload.code}`,
			},
		]);
	}

	private getAgent(provider: string, apiKey: string): any {
		switch (provider.toLowerCase()) {
			case 'claude':
				return new ClaudeAgent({ apiKey });
			case 'openai':
				return new OpenAIAgent({ apiKey });
			case 'groq':
				return new GroqAgent({ apiKey });
			case 'huggingface':
				return new HuggingFaceAgent({ apiKey });
			default:
				throw new Error(`Unsupported AI provider: ${provider}`);
		}
	}
}
