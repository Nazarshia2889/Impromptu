'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useTimer from '@/hooks/useTimer';
import Timer from '@/components/ui/Timer';
import Suggestions from '@/components/notes/Suggestions';
import NotesEditor from '@/components/notes/NotesEditor';
import TopicDisplay from '@/components/notes/TopicDisplay';

const NotesPage = () => {
	const [topic, setTopic] = useState('');
	const [prepTime, setPrepTime] = useState(null); // Set to null initially to indicate it's not ready yet
	const [notes, setNotes] = useState('');
	const router = useRouter();

	// Timer state
	const [timeLeft, setTimeLeft] = useState(null);

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
			setTimeLeft(prepTimeValue); // Set the initial value for the timer
		}
	}, []);

	// Use the timer hook only when prepTime is set and valid
	const timerEnabled = prepTime !== null && timeLeft !== null;
	const [currentTimer, setCurrentTimer] = useTimer(timerEnabled ? timeLeft : null, handleTimerEnd);

	useEffect(() => {
		if (timerEnabled) {
			setCurrentTimer(timeLeft);
		}
	}, [timerEnabled, timeLeft, setCurrentTimer]);

	return (
		<div className='min-h-screen bg-gray-100 p-8 flex flex-col items-center'>
			{timerEnabled && (
				<>
					<Timer timeLeft={currentTimer} />
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
