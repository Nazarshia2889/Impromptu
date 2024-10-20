// Improved Version of Feedback Summary Component with Enhanced Styling
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const Summary = () => {
	const [history, setHistory] = useState([]);
	const [summary, setSummary] = useState('');
	const [topic, setTopic] = useState('');
	const router = useRouter();

	// Initialize Google Generative AI model
	const genAI = new GoogleGenerativeAI('AIzaSyDi7hrFxDENoBAdod7VPpUZbLwhkJz9GPk');

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

	return (
		<>
			<div className="bg-emoji-pattern2"></div>
			<div className={`flex flex-col items-center p-8 min-h-screen content-wrapper ${inter.className}`}>
				<div className='w-full max-w-xl bg-white rounded-xl shadow-md p-6 mt-12'>
					<h1 className='text-2xl font-bold text-center mb-4'>Topic Question</h1>
					<div className='bg-gray-50 p-3 rounded-md mb-4'>
						<h2 className='text-lg font-semibold'>{topic || 'Loading topic...'}</h2>
					</div>
					<h2 className='text-xl font-semibold mb-3'>Summary of Session</h2>
					<div className='bg-gray-50 p-4 rounded-md'>
						<p className='text-base text-gray-700'>{summary || 'Loading summary...'}</p>
					</div>
				</div>
				<div className='w-full max-w-xl mt-6 flex justify-end'>
					<button
						className='font-semibold bg-sky-500 text-white text-sm py-2 px-4 rounded hover:bg-sky-400 transition-all'
						onClick={() => router.push('/')}
					>
						Run it Back 😈
					</button>
				</div>
			</div>
		</>
	);
};

export default Summary;
