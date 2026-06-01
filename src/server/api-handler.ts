import { AIRouter } from './ai-router';
import { ClaudeAgent } from './ai-agents/claude-agent';

export async function handleAIRequest(
	request: Request,
	env: any,
): Promise<Response> {
	try {
		const url = new URL(request.url);
		const path = url.pathname;

		// Handle CORS
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods':
						'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers':
						'Content-Type, Authorization',
				},
			});
		}

		if (path === '/api/ai/generate-file' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'generate-file',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (
			path === '/api/ai/generate-files' &&
			request.method === 'POST'
		) {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'generate-files',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/code-review' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'code-review',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/bug-fix' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'bug-fix',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/refactor' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'refactor',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/analyze' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'analyze-code',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/tests' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'generate-tests',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/docs' && request.method === 'POST') {
			const body = await request.json();
			const router = new AIRouter();
			const result = await router.handleRequest({
				action: 'generate-docs',
				payload: body,
			});
			return jsonResponse(result);
		}

		if (path === '/api/ai/chat' && request.method === 'POST') {
			const body = await request.json();
			const { messages, aiProvider, apiKey } = body;

			if (!apiKey) {
				return jsonResponse(
					{ error: 'API key is required' },
					400,
				);
			}

			const agent = new ClaudeAgent({ apiKey });
			const result = await agent.chat(messages);
			return jsonResponse(result);
		}

		return jsonResponse(
			{
				error: 'Endpoint not found',
				availableEndpoints: [
					'/api/ai/generate-file',
					'/api/ai/generate-files',
					'/api/ai/code-review',
					'/api/ai/bug-fix',
					'/api/ai/refactor',
					'/api/ai/analyze',
					'/api/ai/tests',
					'/api/ai/docs',
					'/api/ai/chat',
				],
			},
			404,
		);
	} catch (error: any) {
		return jsonResponse(
			{
				error: error.message || 'Internal server error',
			},
			500,
		);
	}
}

function jsonResponse(data: any, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}
