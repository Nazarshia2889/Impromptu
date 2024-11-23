'use client';

import { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';

dotenv.config();

const inter = Inter({ subsets: ['latin'] });

const RecordingPage = () => {
	const [notes, setNotes] = useState('');
	const [time, setTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const [timeLeft, setTimeLeft] = useState(0);
	const [topic, setTopic] = useState(''); // New state for topic
	const [currentSpeaker, setCurrentSpeaker] = useState(''); // Changed initial value to empty string
	const [transcript, setTranscript] = useState(''); // New state for transcript

	let mediaRecorder = null;
	let stream = null;
	let history = [
		{
			role: 'system',
			content: `You are a speech judge. The user will start by giving an impromptu speech about this topic: ${topic}. Challenge or question their ideas. Please limit to a maximum of two sentences. Be direct and speak at the level of an intelligent high school student.`,
		},
	];
	// let transcript = "";

	const Groq_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
	const transcribeGroq = new Groq({ apiKey: Groq_API_KEY, dangerouslyAllowBrowser: true });
	const groq = new Groq({ apiKey: Groq_API_KEY, dangerouslyAllowBrowser: true });

	const decrypt = (encryptedText, secretKey, fixedIV) => {
		const key = CryptoJS.enc.Utf8.parse(secretKey.padEnd(16, ' ')); // Pad to 16 bytes
		const iv = CryptoJS.enc.Utf8.parse(fixedIV.padEnd(16, ' ')); // Pad to 16 bytes

		const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		});
		return decrypted.toString(CryptoJS.enc.Utf8); // Convert to UTF-8 string
	};

	const openai = new OpenAI({
		apiKey:
			decrypt('Gv3D1aeJ2wpA7qaCIal9qt55ayPMq6L9cEWqJxS/Pg2UCU73YqoRnVmodqq/ova/6zn1J7EhmuTyRu+dCkAPK54U0YAy1+7oyRDnOhpvVaNf+/1Fd/2IaBoESxXctti9j/J2HO3S/HpHaXuep1cRO9/Q5fsw/0/6qGfKIpfDKAKqtRSCOgGkx/t7L4+CW1Zt6MROOHGNLTmAW9uf3EOV3vAV5oU16b9eQwXL06Ynxc4=', process.env.NEXT_PUBLIC_SECRET_KEY, process.env.NEXT_PUBLIC_FIXED_IV),
		dangerouslyAllowBrowser: true,
	});

	useEffect(() => {
		const storedNotes = localStorage.getItem('notes');
		const storedSpeakingLength = localStorage.getItem('speakingLength');
		const storedSuggestions = localStorage.getItem('geminiSuggestions');
		const storedTopic = localStorage.getItem('topic'); // Fetch topic from localStorage

		if (storedNotes) {
			setNotes(storedNotes);
		}
		if (storedSpeakingLength) {
			setSpeakingLength(parseInt(storedSpeakingLength, 10));
			setTimeLeft(parseInt(storedSpeakingLength, 10)); // Initialize timeLeft
		}
		if (storedSuggestions) {
			setSuggestions(JSON.parse(storedSuggestions));
		}
		if (storedTopic) {
			setTopic(storedTopic); // Set the topic state
		}
	}, []);

	// Timer logic
	useEffect(() => {
		let timer;
		if (isRecording && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
		} else if (timeLeft === 0 && isRecording) {
			setIsRecording(false);
			stopRecording();
		}

		return () => clearInterval(timer);
	}, [isRecording, timeLeft]);

	// Start recording handler
	const startRecording = () => {
		setIsRecording(true);
		setHasStarted(true);
		setTimeLeft(speakingLength); // Reset timer to speaking length
		startMicrophoneStream(speakingLength);
		setCurrentSpeaker('User'); // Set current speaker to User when recording starts
	};

	// Stop recording handler
	const stopRecording = async () => {
		setIsRecording(false);
		if (mediaRecorder && stream) {
			mediaRecorder.stop();
			stream.getTracks().forEach((track) => track.stop()); // Stop microphone stream
		}
		// localStorage.setItem('history', `MY SPEECH: ` + localStorage.getItem('transcript') + '\n');
	};

	// Format time in mm:ss
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

	const startMicrophoneStream = (duration) => {
		// Get the microphone stream and store audio data in memory
		navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
			stream = micStream;
			mediaRecorder = new MediaRecorder(stream);
			let chunks = [];
			mediaRecorder.ondataavailable = (event) => {
				chunks.push(event.data);
			};
			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
				console.log('Audio Blob: ', audioBlob);
				const file = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });
				transcribeAudio(file);
			};
			mediaRecorder.start();

			setTimeout(() => {
				stopRecording();
			}, duration * 1000); // Stop recording after the specified duration
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

			console.log('Transcription: ', transcription.text);
			// localStorage.setItem('transcript', transcription.text);
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
		console.log('Response: ', response);

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

		// Convert buffer to AudioBuffer
		const audioBuffer = await audioContext.decodeAudioData(buffer.buffer);

		// Create audio source
		const source = audioContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(audioContext.destination);

		// Play the audio
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

					<div className='text-lg font-semibold text-white bg-red-400 px-4 py-2 rounded-full'>
						Timer: {formatTime(timeLeft)} ⏱️
					</div>
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
					<div className='grid grid-cols-3 gap-4  mt-10 '>
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
				{/* New Topic Section */}
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
