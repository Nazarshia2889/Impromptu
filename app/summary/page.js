// Improved Version of Feedback Summary Component with Enhanced Styling
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Summary = () => {
	const [history, setHistory] = useState([]);
	const [summary, setSummary] = useState('');
	const [topic, setTopic] = useState('');
	const router = useRouter();

	// Initialize Google Generative AI model
	const genAI = new GoogleGenerativeAI('AIzaSyDRwIal7m0dpzSsMchvzKuPxXZnYe8ZD54');

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-pro-latest',
		generationConfig: {
			responseSchema: {
				type: 'object',
				properties: { text: { type: 'string' } },
			},
			temperature: 2,
		},
	});

	useEffect(() => {
		// Retrieve history and topic from localStorage
		const storedHistory = localStorage.getItem('history');
		const storedTopic = localStorage.getItem('topic');
		if (storedHistory) {
			setHistory(storedHistory);
			// Improved prompt to specify summary details
			const prompt = `Please create a concise summary of the feedback provided by the judges based on the transcript below. Consider the following points for a good summary:

      - Focus on the key positive and negative feedback.
      - Highlight suggestions for improvement.
      - Provide an overall impression given by the judges.

      Transcript:
      ${storedHistory}`;
			generateSummary(prompt);
		}
		if (storedTopic) {
			setTopic(storedTopic);
		}
	}, []);

	// Function to generate summary from the generative model
	const generateSummary = async (prompt) => {
		try {
			const result = await model.generateContent(prompt);
			setSummary(result.response.text().trim());
		} catch (error) {
			console.error('Error generating summary:', error);
		}
	};

	const style = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: '#e0eef2',
		backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' transform='rotate(30)'%3E%3Ctext x='25' y='75' font-size='40'%3E%3C/text%3E%3C/svg%3E"),
											url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' transform='rotate(30)'%3E%3Ctext x='25' y='75' font-size='40'%3E%3C/text%3E%3C/svg%3E")`,
		backgroundRepeat: 'repeat',
		backgroundSize: '300px 300px',
		backgroundPosition: '0 0, 150px 150px', // Staggered position for second layer
		animation: 'float 360s linear infinite',
		filter: 'brightness(1.3) contrast(0.7) sepia(0.1) opacity(0.7)', // "Lifted" whites effect
		zIndex: -1,
	};

	return (
		<>
			<div style={style}></div>
			<div className='flex flex-col items-center p-8 min-h-screen bg-gray-100'>
				<div className='w-full max-w-3xl bg-white rounded-lg shadow-md p-8 mt-12'>
					<h1 className='text-3xl font-bold text-center mb-6'>Topic Question</h1>
					<div className='bg-blue-50 p-4 rounded-md mb-6'>
						<h2 className='text-xl font-semibold'>{topic || 'Loading topic...'}</h2>
					</div>
					<h2 className='text-2xl font-semibold mb-4'>Summary of Feedback</h2>
					<div className='bg-gray-50 p-6 rounded-md'>
						<p className='text-lg text-gray-700'>{summary || 'Loading summary...'}</p>
					</div>
				</div>
				<div className='w-full max-w-3xl mt-8 flex justify-end'>
					<button
						className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all'
						onClick={() => router.push('/')}
					>
						Run it Back!
					</button>
				</div>
			</div>
		</>
	);
};

export default Summary;
