import { ClaudeAgent } from './ai-agents/claude-agent';
import { OpenAIAgent } from './ai-agents/openai-agent';
import { GroqAgent } from './ai-agents/groq-agent';
import { HuggingFaceAgent } from './ai-agents/huggingface-agent';

export type AIProvider = 'claude' | 'openai' | 'groq' | 'huggingface';

export interface FileGenerationRequest {
	fileName: string;
	description: string;
	fileType: string;
	aiProvider: AIProvider;
	apiKey: string;
	codeContext?: string;
}

export interface GeneratedFile {
	path: string;
	content: string;
	fileType: string;
	generated_at: string;
}

export class FileGenerator {
	private supportedExtensions: Record<string, string[]> = {
		typescript: ['.ts', '.tsx'],
		javascript: ['.js', '.jsx'],
		html: ['.html'],
		css: ['.css', '.scss', '.sass'],
		json: ['.json'],
		markdown: ['.md', '.mdx'],
		python: ['.py'],
		java: ['.java'],
		c: ['.c', '.h'],
		cpp: ['.cpp', '.cc', '.h'],
		go: ['.go'],
		rust: ['.rs'],
		php: ['.php'],
		ruby: ['.rb'],
		shell: ['.sh', '.bash'],
		yaml: ['.yaml', '.yml'],
		xml: ['.xml'],
		sql: ['.sql'],
		dockerfile: ['Dockerfile'],
		git: ['.gitignore', '.gitattributes'],
	};

	async generateFile(
		request: FileGenerationRequest,
	): Promise<GeneratedFile> {
		const agent = this.getAgent(request.aiProvider, request.apiKey);

		const fileTypeKey = this.inferFileType(request.fileName);
	
		const prompt = this.buildPrompt(
			request.fileName,
			request.description,
			fileTypeKey,
			request.codeContext,
		);

		try {
			const response = await agent.generateCode(prompt, fileTypeKey);

			return {
				path: request.fileName,
				content: response.content,
				fileType: fileTypeKey,
				generated_at: new Date().toISOString(),
			};
		} catch (error: any) {
			throw new Error(
				`Failed to generate file with ${request.aiProvider}: ${error.message}`,
			);
		}
	}

	async generateMultipleFiles(
		requests: FileGenerationRequest[],
	): Promise<GeneratedFile[]> {
		return Promise.all(requests.map((req) => this.generateFile(req)));
	}

	private inferFileType(fileName: string): string {
		const ext = fileName.split('.').pop()?.toLowerCase();

		for (const [type, exts] of Object.entries(this.supportedExtensions)) {
			if (exts.includes(`.${ext}`) || exts.includes(fileName)) {
				return type;
			}
		}

		return 'typescript';
	}

	private buildPrompt(
		fileName: string,
		description: string,
		fileType: string,
		codeContext?: string,
	): string {
		return `
Generate a production-ready ${fileType} file named "${fileName}".

Requirements:
${description}

${codeContext ? `Code Context:\n${codeContext}\n` : ''}

Generate only the code, no explanations or markdown.
Include proper comments and follow ${fileType} best practices.
Ensure the code is complete and can run immediately.
`;
	}

	private getAgent(
		provider: AIProvider,
		apiKey: string,
	): any {
		switch (provider) {
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

	getSupportedExtensions(): Record<string, string[]> {
		return this.supportedExtensions;
	}

	isSupportedExtension(fileName: string): boolean {
		const ext = fileName.split('.').pop()?.toLowerCase();
		for (const exts of Object.values(this.supportedExtensions)) {
			if (exts.includes(`.${ext}`) || exts.includes(fileName)) {
				return true;
			}
		}
		return false;
	}
}
