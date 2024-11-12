'use client';

import { useEffect, useState } from 'react';
import { getScorePrompt, groqStructureToolsParameters } from '@/utils/prompt';
import Groq from 'groq-sdk';

const Score = () => {
	const [history, setHistory] = useState('');
	const [topic, setTopic] = useState('');
	const [score, setScore] = useState({});

	const groq = new Groq({
		apiKey: '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',
		dangerouslyAllowBrowser: true,
	});

	// Fetch and set topic and history from localStorage
	useEffect(() => {
		const storedHistory = localStorage.getItem('history');
		const storedTopic = localStorage.getItem('topic');

		if (storedTopic) {
			setTopic(storedTopic);
		}

		if (storedHistory) {
			setHistory(storedHistory);
		}
	}, []);

	// Run getScore only when topic and history are set
	useEffect(() => {
		if (topic && history) {
			getScore();
		}
	}, [topic, history]);

	// Define async function for Groq API call with structured output
	const getGroqChatCompletion = async (prompt) => {
		return await groq.chat.completions.create({
			model: 'llama3-groq-70b-8192-tool-use-preview',
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
			tools: groqStructureToolsParameters,
			tool_choice: 'auto',
		});
	};

	// Fetch score based on topic and history
	const getScore = async () => {
		try {
			console.log('topic:', topic);
			console.log('history:', history);

			const prompt = getScorePrompt(topic, history);
			const result = await getGroqChatCompletion(prompt);
			setScore(JSON.parse(result.choices[0]?.message?.content) || {});
		} catch (error) {
			console.error('Error getting score:', error);
		}
	};

	console.log(score);


	const categories = Object.keys(score);

	return (
    <div className="p-6 max-w-lg mx-auto font-sans">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">Speech Evaluation Summary</h2>
      <div className="grid gap-6">
        {categories.map((category) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-blue-600 mb-2 capitalize">
              {category.replace(/_/g, ' ')}
            </h3>
            <p className="text-sm font-semibold text-gray-700">
              Score: <span className="font-normal">{score[category].score} / 10</span>
            </p>
            <p className="text-gray-600 mt-2">{score[category].justification}</p>
          </div>
        ))}
      </div>
    </div>
  );

};

export default Score;
