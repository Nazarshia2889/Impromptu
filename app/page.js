'use client';

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const Home = () => {
	const [topic, setTopic] = useState('Click the button to generate a topic!');
	const [viewpoint1, setViewpoint1] = useState('');
	const [viewpoint2, setViewpoint2] = useState('');
	const [prepTime, setPrepTime] = useState('1');
	const [speakingLength, setSpeakingLength] = useState('2');
	const [isTopicGenerated, setIsTopicGenerated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Configure the Gemini API client
	const genAI = new GoogleGenerativeAI('AIzaSyB8LEMaPEYLV7XQzVdFh3t2IJB7fuIojvQ');

	const topics = [
		'Social Media',
		'Globalization',
		'Climate Change',
		'Education System',
		'Artificial Intelligence',
		'Healthcare',
		'Freedom of Speech',
		'Economic Inequality',
		'Technology and Society',
		'Privacy vs. Security',
		'Immigration',
		'Work-Life Balance',
		'Environmental Sustainability',
		'Censorship',
		'Gender Equality',
		'Space Exploration',
		'Capitalism vs. Socialism',
		'Animal Rights',
		'Genetic Engineering',
		'Cultural Appropriation',
		'Gun Control',
		'Political Polarization',
		'Cryptocurrency',
		'Vaccination',
		'Public Surveillance',
		'Universal Basic Income',
		'Internet Censorship',
		'Renewable Energy',
		'Consumerism',
		'Ethics of Autonomous Vehicles',
	];

	const getRandomChoice = (array) => {
		return array[Math.floor(Math.random() * array.length)];
	}

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
		setIsLoading(true);
		try {
			const topic = getRandomChoice(topics);
			console.log(topic);

			const prompt = `i am trying to practice impromptu speaking. generate one speaking question about ${topic} that is well known and debatable and have two sides to the argument and no correct answer. here is an example of questions that you should generate. in your actual response, only output a single question:`;

			const result = await model.generateContent(prompt);
			console.log(result.response.text());
			const data = JSON.parse(result.response.text().trim());

			setTopic(data.question);
			setViewpoint1(data.viewpoint1);
			setViewpoint2(data.viewpoint2);
			setIsTopicGenerated(true);
		} catch (error) {
			console.error('Error generating topic:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Store data to localStorage and navigate to submit page
	const handleSubmit = () => {
		localStorage.setItem('topic', topic);
		localStorage.setItem('viewpoint1', viewpoint1);
		localStorage.setItem('viewpoint2', viewpoint2);
		localStorage.setItem('prepTime', prepTime);
		localStorage.setItem('speakingLength', speakingLength);
		window.location.href = '/notes';
	};

	return (
		<div className={`flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100 ${inter.className}`}>
			<div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-xl relative'>
				<div className='bg-gray-50 p-4 mt-4 rounded-lg shadow-sm'>
					<h2 className='text-xl font-bold text-left mb-3'>{topic}</h2>
					{viewpoint1 && viewpoint2 && (
						<div className='space-y-3'>
							<div className='bg-white p-3 rounded-md shadow-sm'>
								<h3 className='text-md font-semibold mb-1'>Viewpoint 1:</h3>
								<p className='text-sm'>{viewpoint1}</p>
							</div>
							<div className='bg-white p-3 rounded-md shadow-sm'>
								<h3 className='text-md font-semibold mb-1'>Viewpoint 2:</h3>
								<p className='text-sm'>{viewpoint2}</p>
							</div>
						</div>
					)}
				</div>

				<div className='mt-8 space-y-4'>
					<div className='flex flex-col'>
						<label className='text-md font-semibold mb-2'>Preparation Time (minutes):</label>
						<input
							type='number'
							value={prepTime}
							onChange={(e) => setPrepTime(e.target.value)}
							className='p-2 border border-gray-300 rounded-md w-full'
							placeholder='Enter preparation time'
						/>
					</div>
					<div className='flex flex-col'>
						<label className='text-md font-semibold mb-2'>Speaking Length (minutes):</label>
						<input
							type='number'
							value={speakingLength}
							onChange={(e) => setSpeakingLength(e.target.value)}
							className='p-2 border border-gray-300 rounded-md w-full'
							placeholder='Enter speaking length'
						/>
					</div>
				</div>

				<div className='mt-12 flex justify-between items-center'>
					<button
						onClick={generateTopic}
						className='bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center'
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Generating...
							</>
						) : (
							<>
								Generate Topic
								<span role="img" aria-label="Brain" className="ml-2">🤯</span>
							</>
						)}
					</button>

					<button
						className={`${
							isTopicGenerated
								? 'bg-green-500 hover:bg-green-400'
								: 'bg-gray-400 cursor-not-allowed'
						} text-white font-bold py-2 px-8 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center`}
						onClick={handleSubmit}
						disabled={!isTopicGenerated}
					>
						Next
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Home;
