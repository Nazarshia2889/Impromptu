'use client';

import { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google';
import dotenv from 'dotenv';
import { getJudgeFeedbackContextPrompt } from '@/utils/prompt';
import { initializeAPIs, transcribeAudio, getGroqResponse, generateSpeech } from '@/utils/apiUtils';
import RecordingControls from '@/components/recording/RecordingControls';
import JudgesFeedback from '@/components/recording/JudgesFeedback';
import RecordingSidebar from '@/components/recording/RecordingSidebar';

dotenv.config();
const inter = Inter({ subsets: ['latin'] });

const RecordingPage = () => {
	const [notes, setNotes] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const [topic, setTopic] = useState('');
	const [currentSpeaker, setCurrentSpeaker] = useState('');
	const [transcript, setTranscript] = useState('');

	const mediaRecorder = useRef(null);
	const stream = useRef(null);
	const history = [
		{
			role: 'system',
			content: getJudgeFeedbackContextPrompt(topic),
		},
	];

	// Initialize APIs outside of component to avoid recreation
	const APIs = initializeAPIs();
	const { transcribeGroq, groq, openai } = APIs;

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

	const handleTimerEnd = () => {
		if (isRecording) {
			stopRecording();
		}
	};

	const startRecording = () => {
		const storedSpeakingLength = parseInt(localStorage.getItem('speakingLength'), 10);
		setSpeakingLength(storedSpeakingLength);
		setIsRecording(true);
		setHasStarted(true);
		startMicrophoneStream();
		setCurrentSpeaker('User');
	};

	const stopRecording = async () => {
		setIsRecording(false);
		if (mediaRecorder.current && stream.current) {
			mediaRecorder.current.stop();
			stream.current.getTracks().forEach((track) => track.stop());
		}
	};

	const startMicrophoneStream = () => {
		navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
			stream.current = micStream;
			mediaRecorder.current = new MediaRecorder(stream.current);
			let chunks = [];
			mediaRecorder.current.ondataavailable = (event) => {
				chunks.push(event.data);
			};
			mediaRecorder.current.onstop = () => {
				const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
				const file = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });
				handleTranscribeAudio(file);
			};
			mediaRecorder.current.start();
		});
	};

	const handleTranscribeAudio = async (file) => {
		try {
			const transcriptionText = await transcribeAudio(file, transcribeGroq);
			await getResponse(transcriptionText);
			return transcriptionText;
		} catch (error) {
			console.error('Error in handleTranscribeAudio:', error);
		}
	};

	const playAudioBrowser = async (buffer) => {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const audioBuffer = await audioContext.decodeAudioData(buffer.buffer);
		const source = audioContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(audioContext.destination);
		source.start(0);
	};

	const getAndPlayAudio = async (responseText) => {
		try {
			const buffer = await generateSpeech(openai, responseText);
			setCurrentSpeaker('Judge');
			playAudioBrowser(buffer);
		} catch (error) {
			console.error('Error in getAndPlayAudio:', error);
		}
	};

	const getResponse = async (userText) => {
		try {
			history.push({ role: 'user', content: userText });
			const response = await getGroqResponse(groq, userText, history);
			history.push({ role: 'assistant', content: response });

			setTranscript((prev) => prev + 'USER: ' + userText + '\n' + 'JUDGE: ' + response + '\n');

			getAndPlayAudio(response);
			return response;
		} catch (error) {
			console.error('Error in getResponse:', error);
		}
	};

	return (
		<div className={`min-h-screen bg-gray-100 p-8 ${inter.className} flex relative`}>
			{/* Left Section (Recording + Judges) */}
			<div className='w-2/3 p-4 flex flex-col'>
				<RecordingControls
					isRecording={isRecording}
					speakingLength={speakingLength}
					onStartRecording={startRecording}
					onStopRecording={stopRecording}
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
