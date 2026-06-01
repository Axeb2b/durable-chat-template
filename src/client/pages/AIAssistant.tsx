import React, { useState } from 'react';
import '../../styles/ai-assistant.css';

interface AIMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

interface FileGenerationRequest {
	fileName: string;
	description: string;
	fileType: string;
	aiProvider: 'claude' | 'openai' | 'groq' | 'huggingface';
	apiKey: string;
}

export const AIAssistant: React.FC = () => {
	const [messages, setMessages] = useState<AIMessage[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [apiKey, setApiKey] = useState('');
	const [selectedProvider, setSelectedProvider] = useState<'claude' | 'openai' | 'groq' | 'huggingface'>('claude');
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('chat');
	const [generationForm, setGenerationForm] = useState({
		fileName: '',
		description: '',
	});

	const handleSendMessage = async () => {
		if (!inputValue.trim() || !apiKey.trim()) return;

		const userMessage: AIMessage = {
			id: Date.now().toString(),
			role: 'user',
			content: inputValue,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue('');
		setIsLoading(true);

		try {
			const response = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [...messages, userMessage].map((m) => ({
						role: m.role,
						content: m.content,
					})),
					aiProvider: selectedProvider,
					apiKey,
				}),
			});

			const data = await response.json();

			if (data.error) {
				const errorMessage: AIMessage = {
					id: Date.now().toString(),
					role: 'assistant',
					content: `Error: ${data.error}`,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			} else {
				const assistantMessage: AIMessage = {
					id: Date.now().toString(),
					role: 'assistant',
					content: data.content || data,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, assistantMessage]);
			}
		} catch (error: any) {
			const errorMessage: AIMessage = {
				id: Date.now().toString(),
				role: 'assistant',
				content: `Failed to get response: ${error.message}`,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenerateFile = async () => {
		if (!generationForm.fileName || !generationForm.description || !apiKey) {
			alert('Please fill all fields and provide API key');
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch('/api/ai/generate-file', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					fileName: generationForm.fileName,
					description: generationForm.description,
					fileType: 'typescript',
					aiProvider: selectedProvider,
					apiKey,
				}),
			});

			const data = await response.json();

			if (data.error) {
				alert(`Error: ${data.error}`);
			} else {
				alert('File generated successfully!');
				console.log('Generated file:', data);
				// Copy content to clipboard
				navigator.clipboard.writeText(data.content);
			}
		} catch (error: any) {
			alert(`Failed to generate file: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="ai-assistant">
			<div className="ai-header">
				<h1>🤖 AI Assistant</h1>
				<p>Code generation, review, and automation</p>
			</div>

			<div className="ai-tabs">
				<button
					className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
					onClick={() => setActiveTab('chat')}
				>
					💬 Chat
				</button>
				<button
					className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
					onClick={() => setActiveTab('generate')}
				>
					✨ Generate Files
				</button>
				<button
					className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
					onClick={() => setActiveTab('tools')}
				>
					🔧 Tools
				</button>
			</div>

			<div className="ai-config">
				<div className="config-group">
					<label>AI Provider</label>
					<select
						value={selectedProvider}
						onChange={(e) =>
							setSelectedProvider(
								e.target
									.value as any,
							)
						}
					>
						<option value="claude">Claude (Recommended)</option>
						<option value="openai">OpenAI GPT-4</option>
						<option value="groq">Groq (Fast & Free)</option>
						<option value="huggingface">
							Hugging Face
						</option>
					</select>
				</div>
				<div className="config-group">
					<label>API Key</label>
					<input
						type="password"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="Enter your API key"
					/>
				</div>
			</div>

			{activeTab === 'chat' && (
				<div className="ai-chat">
					<div className="messages">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`message ${msg.role}`}
							>
								<div className="message-content">
									{msg.content}
								</div>
							</div>
						))}
						{isLoading && (
							<div className="message assistant">
								<div className="loading">Thinking...</div>
							</div>
						)}
					</div>
					<div className="input-area">
						<textarea
							value={inputValue}
							onChange={(e) =>
								setInputValue(e.target.value)
							}
							onKeyDown={(e) => {
								if (
									e.key === 'Enter' &&
									!e.shiftKey
								) {
									e.preventDefault();
									handleSendMessage();
								}
							}}
							placeholder="Ask me anything... (Shift+Enter for new line)"
						/>
						<button
							onClick={handleSendMessage}
							disabled={isLoading || !inputValue.trim()}
						>
							Send
						</button>
					</div>
				</div>
			)}

			{activeTab === 'generate' && (
				<div className="ai-generate">
					<div className="form-group">
						<label>File Name</label>
						<input
							type="text"
							value={generationForm.fileName}
							onChange={(e) =>
								setGenerationForm({
									...generationForm,
									fileName: e.target.value,
								})
							}
							placeholder="e.g., utils.ts, Button.tsx"
						/>
					</div>
					<div className="form-group">
						<label>Description</label>
						<textarea
							value={generationForm.description}
							onChange={(e) =>
								setGenerationForm({
									...generationForm,
									description: e.target.value,
								})
							}
							placeholder="Describe what you want to generate..."
						></textarea>
					</div>
					<button
						className="generate-btn"
						onClick={handleGenerateFile}
						disabled={isLoading}
					>
						✨ Generate File
					</button>
				</div>
			)}

			{activeTab === 'tools' && (
				<div className="ai-tools">
					<div className="tools-grid">
						<div className="tool-card">
							<h3>🔍 Code Review</h3>
							<p>Get AI feedback on your code quality</p>
							<button>/api/ai/code-review</button>
						</div>
						<div className="tool-card">
							<h3>🐛 Bug Fix</h3>
							<p>Get AI help fixing code errors</p>
							<button>/api/ai/bug-fix</button>
						</div>
						<div className="tool-card">
							<h3>♻️ Refactor</h3>
							<p>Improve code structure and readability</p>
							<button>/api/ai/refactor</button>
						</div>
						<div className="tool-card">
							<h3>📊 Analyze</h3>
							<p>Deep code analysis and insights</p>
							<button>/api/ai/analyze</button>
						</div>
						<div className="tool-card">
							<h3>✅ Generate Tests</h3>
							<p>Auto-generate test cases</p>
							<button>/api/ai/tests</button>
						</div>
						<div className="tool-card">
							<h3>📖 Generate Docs</h3>
							<p>Create documentation automatically</p>
							<button>/api/ai/docs</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
