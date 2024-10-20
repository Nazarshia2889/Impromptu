'use client';

import { useState, useEffect } from 'react';
import RecordingSection from '@/components/RecordingSection';
import JudgesFeedback from '@/components/JudgesFeedback';
import NotesSection from '@/components/NotesSection';

export default function RecordingPage() {
	const [notes, setNotes] = useState('');
	const [time, setTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		const storedNotes = localStorage.getItem('notes');
		const storedSpeakingLength = localStorage.getItem('speakingLength');
		const storedSuggestions = localStorage.getItem('geminiSuggestions');

		if (storedNotes) setNotes(storedNotes);
		if (storedSpeakingLength) setSpeakingLength(parseInt(storedSpeakingLength, 10) * 60);
		if (storedSuggestions) setSuggestions(JSON.parse(storedSuggestions));
	}, []);

	return (
		<div className='min-h-screen bg-gray-100 p-8 flex'>
			<div className='w-2/3 p-4 flex flex-col'>
				<RecordingSection
					isRecording={isRecording}
					hasStarted={hasStarted}
					setIsRecording={setIsRecording}
					setHasStarted={setHasStarted}
					time={time}
					setTime={setTime}
					speakingLength={speakingLength}
				/>
				<JudgesFeedback />
			</div>
			<div className='w-1/3 p-4 bg-gray-50 border border-gray-300 rounded-lg h-auto flex flex-col'>
				<NotesSection notes={notes} suggestions={suggestions} />
			</div>
		</div>
	);
}
