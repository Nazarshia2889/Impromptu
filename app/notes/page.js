'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/ui/Timer';
import Suggestions from '@/components/notes/Suggestions';
import NotesEditor from '@/components/notes/NotesEditor';
import TopicDisplay from '@/components/notes/TopicDisplay';

const NotesPage = () => {
	const [topic, setTopic] = useState('');
	const [prepTime, setPrepTime] = useState(null); // Set to null initially to indicate it's not ready yet
	const [notes, setNotes] = useState('');
	const router = useRouter();

	const handleTimerEnd = () => {
		localStorage.setItem('notes', notes);
		localStorage.setItem('geminiSuggestions', JSON.stringify([]));
		router.push('/judge'); // Redirect to /judge route when timer reaches 0
	};

	// Load initial data for topic and prep time
	useEffect(() => {
		const savedTopic = localStorage.getItem('topic');
		const prepTimeValue = parseInt(localStorage.getItem('prepTime'), 10); // Parse to ensure it's a number

		if (savedTopic && !isNaN(prepTimeValue)) {
			setTopic(savedTopic);
			setPrepTime(prepTimeValue);
		}
	}, []);

	return (
		<div className='min-h-screen bg-gray-100 p-8 flex flex-col items-center'>
			{prepTime !== null && ( // Render only after prepTime is loaded
				<>
					{/* Timer Wrapper to align Timer to the right */}
					<div className='w-full flex justify-end mb-4'>
						<Timer initialTime={prepTime} onTimerEnd={handleTimerEnd} />
					</div>
					<TopicDisplay topic={topic} />
					<div className='w-full flex gap-4 max-w-6xl'>
						<Suggestions topic={topic} notes={notes} />
						<NotesEditor notes={notes} setNotes={setNotes} />
					</div>
				</>
			)}
		</div>
	);
};

export default NotesPage;
