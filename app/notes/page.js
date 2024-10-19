'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';

const clock = 1;

const NotesPage = () => {
	const [topic, setTopic] = useState('');
	const [viewpoint1, setViewpoint1] = useState('');
	const [viewpoint2, setViewpoint2] = useState('');
	const [prepTime, setPrepTime] = useState(0);
	const [notes, setNotes] = useState('');
	const [timeLeft, setTimeLeft] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const router = useRouter();

	// Initialize Gemini API client
	const genAI = new GoogleGenerativeAI('AIzaSyBHMuOVy-yoiRGCExfmigCpTxYySWxRBpk');

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-pro-latest',
		generationConfig: {
			responseSchema: {
				type: 'object',
				properties: { text: { type: 'string', maxLength: 64 } },
			},
			temperature: 2,
		},
	});

	useEffect(() => {
		setTopic(localStorage.getItem('topic'));
		setViewpoint1(localStorage.getItem('viewpoint1'));
		setViewpoint2(localStorage.getItem('viewpoint2'));
		const prepTimeValue = localStorage.getItem('prepTime');
		setPrepTime(prepTimeValue);
		setTimeLeft(prepTimeValue ? prepTimeValue * 60 : 0); // Initialize timer with prep time in seconds
	}, []);

	// Timer logic
	useEffect(() => {
		let timer;
		if (timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000 / clock);
		} else if (timeLeft === 0 && prepTime > 0) {
			clearInterval(timer);
			router.push('/judge'); // Redirect to /judge route when timer reaches 0
		}
		return () => clearInterval(timer);
	}, [timeLeft, router]);

	// Function to get suggestions from Gemini
	const getSuggestions = async () => {
		try {
			console.log('Generating suggestion...');

			// Generate prompt for Gemini
			const prompt = `Here is a debate topic: "${topic}".
Viewpoint 1: ${viewpoint1}
Viewpoint 2: ${viewpoint2}
User Notes: ${notes}

In a single sentence, provide a concise, thought-provoking question or refutation to challenge the user's current arguments. Do not label your response with a header. If the user notes are empty, return an empty string.`;

			// Call Gemini API to generate suggestion
			const result = await model.generateContent(prompt);
			const suggestion = result.response.text().trim();

			// Add generated suggestion to list
			if (suggestion) {
				setSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
			}
		} catch (error) {
			console.error('Error generating suggestion:', error);
		}
	};

	// Format time in mm:ss
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

	return (
		<div className='min-h-screen bg-gray-100 p-8 flex flex-col items-center'>
			{/* Timer in the upper right corner */}
			<div className='w-full flex justify-end mb-4'>
				<div className='text-lg font-semibold text-gray-700'>Timer: {formatTime(timeLeft)}</div>
			</div>

			{/* Topic and Viewpoints Section */}
			<div className='bg-gray-200 p-6 mb-6 rounded-lg w-full max-w-6xl'>
				<p className='text-3xl font-bold text-left mb-4'>{topic}</p>
				{viewpoint1 && (
					<p className='text-lg mt-2 text-left'>
						<strong>• Viewpoint 1:</strong> {viewpoint1}
					</p>
				)}
				{viewpoint2 && (
					<p className='text-lg mt-2 text-left'>
						<strong>• Viewpoint 2:</strong> {viewpoint2}
					</p>
				)}
			</div>

			{/* Main Content Section */}
			<div className='w-full flex gap-4 max-w-6xl'>
				{/* Suggestions Section */}
				<div className='w-2/5 p-4 bg-white border border-gray-300 rounded-lg flex flex-col'>
					<h2 className='text-2xl font-bold mb-4'>Gemini Suggestions:</h2>
					<ul className='list-disc list-inside'>
						{suggestions.map((suggestion, index) => (
							<li key={index} className='text-lg mb-2'>
								{suggestion}
							</li>
						))}
					</ul>
					<button
						onClick={getSuggestions}
						className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'
					>
						Prompt My Thinking
					</button>
				</div>

				{/* Notes Section */}
				<div className='w-3/5 p-4 bg-white border border-gray-300 rounded-lg flex flex-col'>
					<h2 className='text-2xl font-bold mb-4'>Your Notes:</h2>
					<textarea
						className='w-full p-4 h-96 border border-gray-300 rounded-md bg-gray-50 resize-none'
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder='Type your notes here...'
				/>
				</div>
			</div>
		</div>
	);
};

export default NotesPage;
