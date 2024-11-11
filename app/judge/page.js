'use client';

import { useState, useEffect, useCallback } from 'react';
import { Inter } from 'next/font/google';
import { RealtimeClient } from '@openai/realtime-api-beta';

const inter = Inter({ subsets: ['latin'] });
const DURATION = 10;

export default function RecordingPage() {
	const [notes, setNotes] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const [timeLeft, setTimeLeft] = useState(DURATION);
	const [topic, setTopic] = useState('');
	const [currentSpeaker, setCurrentSpeaker] = useState('');
	const [isAISpeaking, setIsAISpeeking] = useState(false);
	const [mediaRecorderRef, setMediaRecorderRef] = useState(null);
	const [audioStreamRef, setAudioStreamRef] = useState(null);
	const [audioContext, setAudioContext] = useState(null);
	const [client, setClient] = useState(null);

	useEffect(() => {
		localStorage.setItem('history', '');
	}, []);

	// Initialize client and set up event handlers
	useEffect(() => {
		const newClient = new RealtimeClient({
			apiKey:
				'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',
			dangerouslyAllowAPIKeyInBrowser: true,
		});
		// Set initial instructions and configuration
		const initializeClient = async () => {
			await newClient.updateSession({
				instructions:
					"Listen to the user's argument and provide a question for their position. Be direct and concise. Your response should be no longer than 2-3 sentences.",
				voice: 'alloy',
				turn_detection: { type: 'none' },
				input_audio_transcription: { model: 'whisper-1' },
			});
			await newClient.connect();
		};
		initializeClient();
		setClient(newClient);
		return () => {
			if (newClient) {
				newClient.disconnect();
			}
		};
	}, []);

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
	// Set up client event handlers
	useEffect(() => {
		if (!client) return;
		const handleConversationUpdate = async (event) => {
			const { item, delta } = event;
			if (item.type === 'message' && item.role === 'user' && item.status === 'completed') {
				localStorage.setItem(
					'history',
					'User: ' + localStorage.getItem('history') + item.formatted.transcript + '\n'
				);
			}
			if (item.type === 'message' && item.role === 'assistant') {
				if (item.status === 'completed') {
					setIsAISpeeking(true);
					setCurrentSpeaker('Judge');
					localStorage.setItem(
						'history',
						'Assistant: ' + localStorage.getItem('history') + item.formatted.transcript + '\n'
					);
					try {
						await playAudioResponse(item.formatted.audio);
						setIsAISpeeking(false);
						setTimeLeft(DURATION);
						startRecording(); // Start recording after AI finishes speaking
					} catch (error) {
						console.error('Error playing AI response:', error);
						setIsAISpeeking(false);
					}
				}
			}
		};
		client.on('conversation.updated', handleConversationUpdate);
		return () => {
			client.off('conversation.updated', handleConversationUpdate);
		};
	}, [client]);
	// Audio context initialization
	useEffect(() => {
		const ctx = new (window.AudioContext || window.webkitAudioContext)({
			sampleRate: 16000,
		});
		setAudioContext(ctx);
		return () => {
			ctx.close();
		};
	}, []);
	// Cleanup effect
	useEffect(() => {
		return () => {
			if (audioStreamRef) {
				audioStreamRef.getTracks().forEach((track) => track.stop());
			}
			if (mediaRecorderRef && mediaRecorderRef.state !== 'inactive') {
				mediaRecorderRef.stop();
			}
		};
	}, [audioStreamRef, mediaRecorderRef]);
	// Timer effect
	useEffect(() => {
		let timer;
		if (isRecording && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
		} else if (timeLeft === 0 && isRecording) {
			stopRecording();
		}
		return () => clearInterval(timer);
	}, [isRecording, timeLeft]);
	const playAudioResponse = async (int16Data) => {
		if (!audioContext) return;
		return new Promise((resolve, reject) => {
			try {
				// Convert Int16Array to Float32Array
				const floatData = new Float32Array(int16Data.length);
				for (let i = 0; i < int16Data.length; i++) {
					floatData[i] = int16Data[i] / 0x8000;
				}
				const audioBuffer = audioContext.createBuffer(1, floatData.length, 25000);
				audioBuffer.getChannelData(0).set(floatData);
				const source = audioContext.createBufferSource();
				source.buffer = audioBuffer;
				const gainNode = audioContext.createGain();
				gainNode.gain.value = 1.0;
				const filter = audioContext.createBiquadFilter();
				filter.type = 'lowpass';
				filter.frequency.value = 8000;
				filter.Q.value = 1;
				source.connect(filter);
				filter.connect(gainNode);
				gainNode.connect(audioContext.destination);
				source.onended = () => {
					console.log('Audio playback finished');
					resolve();
				};
				source.start(0);
			} catch (error) {
				reject(error);
			}
		});
	};
	const startRecording = async () => {
		if (isAISpeaking) return; // Don't start recording if AI is speaking
		try {
			if (audioContext.state === 'suspended') {
				await audioContext.resume();
			}
			const micStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					sampleRate: 16000,
				},
			});
			setAudioStreamRef(micStream);
			setCurrentSpeaker('User');
			const source = audioContext.createMediaStreamSource(micStream);
			const processor = audioContext.createScriptProcessor(4096, 1, 1);
			let audioChunks = [];
			processor.onaudioprocess = (e) => {
				const inputData = e.inputBuffer.getChannelData(0);
				const int16Data = new Int16Array(inputData.length);
				for (let i = 0; i < inputData.length; i++) {
					const s = Math.max(-1, Math.min(1, inputData[i]));
					int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
				}
				audioChunks.push(int16Data);
				if (audioChunks.length >= 4) {
					const combinedChunks = new Int16Array(
						audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
					);
					let offset = 0;
					audioChunks.forEach((chunk) => {
						combinedChunks.set(chunk, offset);
						offset += chunk.length;
					});
					client?.appendInputAudio(combinedChunks);
					audioChunks = [];
				}
			};
			source.connect(processor);
			processor.connect(audioContext.destination);
			setMediaRecorderRef({
				stop: () => {
					source.disconnect();
					processor.disconnect();
				},
			});
			setIsRecording(true);
			setHasStarted(true);
		} catch (error) {
			console.error('Error starting recording:', error);
		}
	};
	const stopRecording = async () => {
		setIsRecording(false);
		if (mediaRecorderRef) {
			mediaRecorderRef.stop();
		}
		if (audioStreamRef) {
			audioStreamRef.getTracks().forEach((track) => track.stop());
		}
		client?.createResponse();
		setCurrentSpeaker('Judge');
	};
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
					<h2 className='text-2xl font-bold mb-4'>Judges:</h2>
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
						client.disconnect();
						window.location.href = '/summary';
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
}
