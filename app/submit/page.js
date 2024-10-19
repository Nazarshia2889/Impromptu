'use client';

import { useState, useEffect } from 'react';

const NotesPage = () => {
	const [topic, setTopic] = useState('');
	const [viewpoint1, setViewpoint1] = useState('');
	const [viewpoint2, setViewpoint2] = useState('');
	const [prepTime, setPrepTime] = useState(0);
	const [notes, setNotes] = useState('');
	const [timeLeft, setTimeLeft] = useState(0);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		setTopic(localStorage.getItem('topic'));
		setViewpoint1(localStorage.getItem('viewpoint1'));
		setViewpoint2(localStorage.getItem('viewpoint2'));
		const prepTimeValue = localStorage.getItem('prepTime');
		setPrepTime(prepTimeValue);
		setTimeLeft(prepTimeValue * 60); // Initialize timer with prep time in seconds
	}, []);

	// Timer logic
	useEffect(() => {
		let timer;
		if (timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			clearInterval(timer);
		}
		return () => clearInterval(timer);
	}, [timeLeft]);

	// Simulate fetching suggestions from Gemini every set amount of time
	useEffect(() => {
		const fetchSuggestionsInterval = setInterval(() => {
			if (notes) {
				// This is where you'd call the Gemini API to get suggestions based on the notes.
				// For now, let's simulate this with some mock suggestions.
				const newSuggestions = [
					'Consider the ethical implications of your argument.',
					'How would your viewpoint change if you considered an opposing perspective?',
					'Can you provide a real-world example to strengthen your argument?',
				];
				setSuggestions(newSuggestions);
			}
		}, 60000); // Fetch suggestions every 60 seconds

		return () => clearInterval(fetchSuggestionsInterval);
	}, [notes]);

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
				<div className='w-1/3 p-4 bg-white border border-gray-300 rounded-lg flex flex-col'>
					<h2 className='text-2xl font-bold mb-4'>Suggestions:</h2>
					<ul className='list-disc list-inside'>
						{suggestions.map((suggestion, index) => (
							<li key={index} className='text-lg mb-2'>
								{suggestion}
							</li>
						))}
					</ul>
				</div>

				{/* Notes Section */}
				<div className='w-2/3 p-4 bg-white border border-gray-300 rounded-lg flex flex-col'>
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
