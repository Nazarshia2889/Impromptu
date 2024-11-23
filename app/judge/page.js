'use client';

import { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google';
import dotenv from 'dotenv';
import { getJudgeFeedbackContextPrompt } from '@/utils/prompt';
import { initializeAPIs } from '@/utils/apiUtils';
import {
	handleTranscribeAudio,
	playAudioBrowser,
	getAndPlayAudio,
	getResponse,
} from '@/utils/audioHandlers';
import { startMicrophoneStream, stopRecording } from '@/utils/recordingHandlers';
import RecordingControls from '@/components/recording/RecordingControls';
import JudgesFeedback from '@/components/recording/JudgesFeedback';
import RecordingSidebar from '@/components/recording/RecordingSidebar';

dotenv.config();
const inter = Inter({ subsets: ['latin'] });

const RecordingPage = () => {
	// State
	const [notes, setNotes] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const [topic, setTopic] = useState('');
	const [currentSpeaker, setCurrentSpeaker] = useState('');
	const [transcript, setTranscript] = useState('');

	// Refs
	const mediaRecorder = useRef(null);
	const stream = useRef(null);
	const history = [
		{
			role: 'system',
			content: getJudgeFeedbackContextPrompt(topic),
		},
	];

	// Initialize APIs
	const APIs = initializeAPIs();
	const { transcribeGroq, groq, openai } = APIs;

	// Load initial data
	useEffect(() => {
		const storedNotes = localStorage.getItem('notes');
		const storedSpeakingLength = localStorage.getItem('speakingLength');
		const storedSuggestions = localStorage.getItem('geminiSuggestions');
		const storedTopic = localStorage.getItem('topic');

		if (storedNotes) setNotes(storedNotes);
		if (storedSpeakingLength) setSpeakingLength(parseInt(storedSpeakingLength, 10));
		if (storedSuggestions) setSuggestions(JSON.parse(storedSuggestions));
		if (storedTopic) setTopic(storedTopic);
	}, []);

	// Create bound versions of handlers that include necessary state/props
	const boundGetAndPlayAudio = async (responseText) =>
		await getAndPlayAudio(responseText, openai, setCurrentSpeaker);

	const boundGetResponse = async (userText) =>
		await getResponse(userText, groq, history, setTranscript, boundGetAndPlayAudio);

	const boundHandleTranscribeAudio = async (file) =>
		await handleTranscribeAudio(file, transcribeGroq, boundGetResponse);

	// Event Handlers
	const handleTimerEnd = () => {
		if (isRecording) {
			handleStopRecording();
		}
	};

	const handleStartRecording = () => {
		setIsRecording(true);
		setHasStarted(true);
		startMicrophoneStream(mediaRecorder, stream, boundHandleTranscribeAudio);
		setCurrentSpeaker('User');
	};

	const handleStopRecording = () =>
		stopRecording(isRecording, mediaRecorder, stream, setIsRecording);

	return (
		<div className={`min-h-screen bg-gray-100 p-8 ${inter.className} flex relative`}>
			{/* Left Section (Recording + Judges) */}
			<div className='w-2/3 p-4 flex flex-col'>
				<RecordingControls
					isRecording={isRecording}
					speakingLength={speakingLength}
					onStartRecording={handleStartRecording}
					onStopRecording={handleStopRecording}
					onTimerEnd={handleTimerEnd}
					hasStarted={hasStarted}
				/>

				<JudgesFeedback currentSpeaker={currentSpeaker} />
			</div>

			<div className='relative'>
				<button
					className='absolute bottom-4 right-4 bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded w-44'
					onClick={() => {
						localStorage.setItem('transcript', transcript);
						window.location.href = '/score';
					}}
				>
					End Session
				</button>
			</div>

			<RecordingSidebar topic={topic} notes={notes} suggestions={suggestions} />

			{/* Current Speaker Box */}
			<div className='absolute bottom-4 left-4 bg-white shadow-md p-2 rounded-lg'>
				<p className='text-sm font-semibold'>Speaking: {currentSpeaker}</p>
			</div>
		</div>
	);
};

export default RecordingPage;
