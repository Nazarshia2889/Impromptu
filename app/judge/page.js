'use client';

import { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Timer from '@/components/ui/Timer';
import { getJudgeFeedbackContextPrompt } from '@/utils/prompt';
import { decrypt } from '@/utils/cryptography';
import { initializeAPIs, transcribeAudio, getGroqResponse, generateSpeech } from '@/utils/apiUtils';

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

	let mediaRecorder = useRef(null);
	let stream = useRef(null);
	let history = [
		{
			role: 'system',
			content: getJudgeFeedbackContextPrompt(topic),
		},
	];

	const { transcribeGroq, groq, openai } = initializeAPIs();

	useEffect(() => {
		const storedNotes = localStorage.getItem('notes');
		const storedSpeakingLength = localStorage.getItem('speakingLength');
		const storedSuggestions = localStorage.getItem('geminiSuggestions');
		const storedTopic = localStorage.getItem('topic');

		if (storedNotes) {
			setNotes(storedNotes);
		}
		if (storedSpeakingLength) {
			setSpeakingLength(parseInt(storedSpeakingLength, 10));
		}
		if (storedSuggestions) {
			setSuggestions(JSON.parse(storedSuggestions));
		}
		if (storedTopic) {
			setTopic(storedTopic);
		}
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
				transcribeAudio(file);
			};
			mediaRecorder.current.start();
		});
	};

	const transcribeAudio = async (file) => {
		try {
			const formData = new FormData();
			formData.append('file', file);
			const transcription = await transcribeGroq.audio.transcriptions.create({
				file: formData.get('file'),
				model: 'distil-whisper-large-v3-en',
				response_format: 'verbose_json',
			});

			await getResponse(transcription.text);
			return transcription.text;
		} catch (error) {
			console.error('Error transcribing audio:', error);
		}
	};

	const getResponse = async (userText) => {
		history.push({ role: 'user', content: userText });
		let response = await groq.chat.completions.create({
			messages: history,
			model: 'llama3-8b-8192',
			temperature: 0.5,
			max_tokens: 256,
			top_p: 1,
			stop: null,
			stream: false,
		});
		response = response.choices[0]?.message?.content;
		history.push({ role: 'assistant', content: response });

		setTranscript(transcript + 'USER: ' + userText + '\n' + 'JUDGE: ' + response + '\n');

		getAndPlayAudio(response);
		return response;
	};

	const getAndPlayAudio = async (responseText) => {
		try {
			const mp3 = await openai.audio.speech.create({
				model: 'tts-1',
				voice: 'alloy',
				input: responseText,
				speed: 1.15,
			});
			const buffer = Buffer.from(await mp3.arrayBuffer());
			setCurrentSpeaker('Judge');
			playAudioBrowser(buffer);
		} catch (error) {
			console.error('Error:', error);
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

	return (
		<div className={`min-h-screen bg-gray-100 p-8 ${inter.className} flex relative`}>
			{/* Left Section (Recording + Judges) */}
			<div className='w-2/3 p-4 flex flex-col'>
				{/* Timer and Recording Button on the same line */}
				<div className='w-full flex justify-between mb-4 items-center'>
					{isRecording ? (
						<button
							onClick={stopRecording}
							className='bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded'
						>
							Stop Recording
						</button>
					) : (
						<button
							onClick={startRecording}
							className='bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded'
						>
							Start Recording
						</button>
					)}

					<Timer initialTime={speakingLength} onTimerEnd={handleTimerEnd} isActive={isRecording} />
				</div>

				{/* Recording Status */}
				{hasStarted && (
					<div
						className={`w-full p-4 rounded-lg border text-center mb-4 ${
							isRecording
								? 'bg-gray-200 border-gray-400 text-gray-600'
								: 'bg-red-100 border-red-500 text-red-600'
						}`}
					>
						{isRecording ? 'Recording in Progress...' : 'Recording Stopped'}
					</div>
				)}

				{/* Judges Feedback Section */}
				<div className='w-full mb-6 mt-8'>
					<h2 className='text-2xl font-bold mb-4'>Judges Feedback:</h2>
					<div className='grid grid-cols-3 gap-4 mt-10'>
						{/* Judge 1 */}
						<div
							className={`bg-white shadow-md p-4 rounded-lg relative ${
								currentSpeaker === 'Judge' ? 'bg-yellow-100 transform -translate-y-3.5' : ''
							} transition-all duration-300`}
						>
							<h3 className='text-xl font-semibold mb-2'>Wayne Shaw</h3>
							<p className='text-gray-600 mb-4'>
								Provide <span className='font-bold'>critical</span> feedback on the speech.
							</p>
							<div className='mb-16'></div>
							<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full bg-gray-300 overflow-hidden border-4 border-white'>
								<img src='nd.jpg' alt='Judge 1' className='w-full h-full object-cover' />
							</div>
						</div>
					</div>
				</div>
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

			{/* Right Section (Topic, Notes and Suggestions) */}
			<div className='w-1/3 p-4 bg-gray-50 border border-gray-300 rounded-lg h-auto flex flex-col'>
				{/* Topic Section */}
				<h2 className='text-2xl font-bold mb-2'>Topic:</h2>
				<div className='w-full p-3 mb-4 bg-white border border-gray-300 rounded-md'>
					<p className='text-lg'>{topic}</p>
				</div>

				<h2 className='text-2xl font-bold mb-2'>Previous Notes:</h2>
				<textarea
					className='w-full p-3 h-40 border border-gray-300 rounded-md bg-gray-50 resize-none mb-4'
					value={notes}
					readOnly
				/>

				{/* Suggestions Section */}
				<h2 className='text-2xl font-bold mb-2'>Gemini Suggestions:</h2>
				<ul className='list-disc list-inside'>
					{suggestions.map((suggestion, index) => (
						<li key={index} className='text-lg mb-2'>
							{suggestion}
						</li>
					))}
				</ul>
			</div>

			{/* Current Speaker Box */}
			<div className='absolute bottom-4 left-4 bg-white shadow-md p-2 rounded-lg'>
				<p className='text-sm font-semibold'>Speaking: {currentSpeaker}</p>
			</div>
		</div>
	);
};

export default RecordingPage;
