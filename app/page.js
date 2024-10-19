'use client';

import { useState } from 'react';

const Home = () => {
	const [topic, setTopic] = useState('Click the button to generate a topic!');
	const [prepTime, setPrepTime] = useState('');
	const [speakingLength, setSpeakingLength] = useState('');

	// Array of topics to randomly select from
	const topics = [
		'Should social media platforms be regulated?',
		'The impact of artificial intelligence on job markets',
		'Does technology improve human connection?',
		'Is climate change the most urgent issue of our time?',
	];

	// Generate a random topic
	const generateTopic = () => {
		const randomTopic = topics[Math.floor(Math.random() * topics.length)];
		setTopic(randomTopic);
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
					onClick={() => {
						window.location.href = '/submit';
					}}
				>
					Submit
				</button>
			</div>
			<p className='text-lg mt-4'>{topic}</p>

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
