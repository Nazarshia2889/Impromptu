'use client';

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Home = () => {
	const [topic, setTopic] = useState('Click the button to generate a topic!');
	const [viewpoint1, setViewpoint1] = useState('');
	const [viewpoint2, setViewpoint2] = useState('');
	const [prepTime, setPrepTime] = useState('1');
	const [speakingLength, setSpeakingLength] = useState('2');

	// Configure the Gemini API client
	const genAI = new GoogleGenerativeAI('AIzaSyBHMuOVy-yoiRGCExfmigCpTxYySWxRBpk');

	const schema = {
		description: 'A debatable topic with two sides to the argument.',
		type: 'object',
		properties: {
			question: {
				type: 'string',
				description: 'The debatable topic question.',
			},
			viewpoint1: {
				type: 'string',
				description: 'The first viewpoint on the topic.',
			},
			viewpoint2: {
				type: 'string',
				description: 'The second viewpoint on the topic.',
			},
		},
		required: ['question', 'viewpoint1', 'viewpoint2'],
	};

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-pro-latest',
		generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 2 },
	});

	// Generate a topic using the Gemini API
	const generateTopic = async () => {
		try {
			const prompt = `i am trying to practice impromptu speaking. generate one speaking topics that are topics that are well known and debatable and have two sides to the argument and no correct answer. here is an example of questions that you should generate. in your actual response, only output a single question:`;

			const result = await model.generateContent(prompt);
			console.log(result.response.text());
			const data = JSON.parse(result.response.text().trim());

			setTopic(data.question);
			setViewpoint1(data.viewpoint1);
			setViewpoint2(data.viewpoint2);
		} catch (error) {
			console.error('Error generating topic:', error);
		}
	};

	// Store data to localStorage and navigate to submit page
	const handleSubmit = () => {
		localStorage.setItem('topic', topic);
		localStorage.setItem('viewpoint1', viewpoint1);
		localStorage.setItem('viewpoint2', viewpoint2);
		localStorage.setItem('prepTime', prepTime);
		localStorage.setItem('speakingLength', speakingLength);
		window.location.href = '/submit';
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-8'>
			<div className='flex items-center gap-4'>
				<button
					onClick={generateTopic}
					className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded'
				>
					Generate Topic
				</button>
				<button
					className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded'
					onClick={handleSubmit}
				>
					Submit
				</button>
			</div>
			<div className='bg-gray-100 p-6 mt-6 rounded-2xl w-full max-w-2xl'>
				<p className='text-2xl text-left'>{topic}</p>
				{viewpoint1 && (
					<p className='text-md mt-2 text-left'>
						<strong>• Viewpoint 1:</strong> {viewpoint1}
					</p>
				)}
				{viewpoint2 && (
					<p className='text-md mt-2 text-left'>
						<strong>• Viewpoint 2:</strong> {viewpoint2}
					</p>
				)}
			</div>

			{/* Input fields for preparation time and speaking length */}
			<div className='flex flex-col items-center mt-8 gap-4'>
				<div className='flex flex-col items-start'>
					<label className='text-md font-semibold mb-2'>Preparation Time (minutes):</label>
					<input
						type='number'
						value={prepTime}
						onChange={(e) => setPrepTime(e.target.value)}
						className='p-2 border border-gray-300 rounded-md w-64'
						placeholder='Enter preparation time'
					/>
				</div>
				<div className='flex flex-col items-start'>
					<label className='text-md font-semibold mb-2'>Speaking Length (minutes):</label>
					<input
						type='number'
						value={speakingLength}
						onChange={(e) => setSpeakingLength(e.target.value)}
						className='p-2 border border-gray-300 rounded-md w-64'
						placeholder='Enter speaking length'
					/>
				</div>
			</div>
		</div>
	);
};

export default Home;
