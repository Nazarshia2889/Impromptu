'use client';

import { useState, useEffect } from 'react';
// import { createClient } from'@deepgram/sdk';
import OpenAI from 'openai';
import Vapi from '@vapi-ai/web';


export default function RecordingPage() {
	const [notes, setNotes] = useState('');
	const [transcript, setTranscript] = useState('');
	const [time, setTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const [audioChunks, setAudioChunks] = useState([]); // To hold audio data in memory
	let mediaRecorder = null;
	let stream = null;

	const OpenAI_API_KEY = ""

	const openai = new OpenAI({ apiKey: OpenAI_API_KEY , dangerouslyAllowBrowser: true});
	const vapi = new Vapi("");

	const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

	// Fetch notes, speakingLength, and suggestions from localStorage on page load
	useEffect(() => {
		const storedNotes = localStorage.getItem('notes');
		const storedSpeakingLength = localStorage.getItem('speakingLength');
		const storedSuggestions = localStorage.getItem('geminiSuggestions');

		if (storedNotes) {
			setNotes(storedNotes);
		}
		if (storedSpeakingLength) {
			setSpeakingLength(parseInt(storedSpeakingLength, 10) * 60); // Multiply by 60
		}
		if (storedSuggestions) {
			setSuggestions(JSON.parse(storedSuggestions));
		}
	}, []);

	// Timer logic
	useEffect(() => {
		let timer;
		if (isRecording && time < speakingLength) {
			timer = setInterval(() => {
				setTime((prevTime) => prevTime + 1);
			}, 1000);
		} else if (time > speakingLength) {
			setIsRecording(false); // Stop recording after speakingLength is reached
			stopRecording();
		}

		return () => clearInterval(timer);
	}, [isRecording, time, speakingLength]);

	// Start recording handler
	const startRecording = () => {
		setIsRecording(true);
		setHasStarted(true);
		setTime(0); // Reset timer
		const length = localStorage.getItem('speakingLength');
		startMicrophoneStream(length);
	};

	// Stop recording handler
	const stopRecording = async () => {
		setIsRecording(false);
		if (mediaRecorder && stream) {
			mediaRecorder.stop();

			stream.getTracks().forEach((track) => track.stop()); // Stop microphone stream
		}
		const transcript = await transcribeAudio();
		localStorage.setItem('transcription', transcript); // Save transcription in localStorage
		setTranscript(transcript);

		vapi.start("181a8564-58b5-4168-ad01-b53fa5f8f06e", {
			transcriber: {
			  provider: "deepgram",
			  model: "nova-2",
			  language: "en-US",
			},
			model: {
			  provider: "openai",
			  model: "gpt-3.5-turbo",
			  messages: [
				{
				  role: "system",
				  content: "You are a critical impromptu speech judge. Challenge the ideas in the user's speech after they give it.",
				},
			  ],
			},
			voice: {
			  provider: "playht",
			  voiceId: "jennifer",
			},
			name: "Critical Judge",
		  });

		  vapi.send({
			type: "add-message",
			message: {
			  role: "system",
			  content: "The user has finished their speech. Please start the discussion. Here is the speech: " + transcript,
			},
		  });
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
				setAudioChunks(audioBlob); // Store audio data in memory
			};
			mediaRecorder.start();

			setTimeout(() => {
				stopRecording();
			}, duration * 1000); // Stop recording after the specified duration
		});
	};
	

	const transcribeAudio = async () => {
		if(audioChunks.length > 0) {
			const file = new File([audioChunks], 'recording.mp3', { type: 'audio/mp3' });

			const formData = new FormData();
			formData.append('file', file);

			const transcription = await openai.audio.transcriptions.create({
				file: formData.get('file'),
				model: "whisper-1",
			});

			console.log("Transcription: ", transcription.text)
			return transcription.text;
		}
	};

	return (
		<div className='min-h-screen bg-gray-100 p-8 flex'>
			{/* Left Section (Recording + Judges) */}
			<div className='w-2/3 p-4 flex flex-col'>
				{/* Timer in the upper right corner */}
				<div className='w-full flex justify-end mb-4'>
					<div className='text-lg font-semibold text-gray-700'>Timer: {formatTime(time)}</div>
				</div>

				{/* Recording Section */}
				<div className='w-full flex flex-col items-start mb-8'>
					{/* Show recording status only after user clicks start */}
					{hasStarted && (
						<div
							className={`w-full p-4 rounded-lg border text-center mb-4 ${
								isRecording
									? 'bg-red-100 border-red-500 text-red-600'
									: 'bg-gray-200 border-gray-400 text-gray-600'
							}`}
						>
							{isRecording ? 'Recording in Progress...' : 'Recording Stopped'}
						</div>
					)}
					{/* Conditionally rendering Start/Stop buttons based on isRecording state */}
					{isRecording ? (
						<button
							onClick={stopRecording}
							className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded'
						>
							Stop Recording
						</button>
					) : (
						<button
							onClick={startRecording}
							className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded'
						>
							Start Recording
						</button>
					)}
				</div>

				{/* Judges Feedback Section */}
				<div className='w-full mb-6'>
					<h2 className='text-2xl font-bold mb-4'>Judges Feedback:</h2>
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 relative'>
						{/* Judge 2 */}
						<div className='group bg-white shadow-md p-4 rounded-lg sm:col-start-2 sm:row-start-1 z-10 relative transition-all duration-300 hover:-translate-y-2'>
							<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 group-hover:translate-y-1/3'>
								<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFKr4MIyosXeoVASWbJuBY_1ix3zEur2LDpw&s" alt="Judge 2" className="w-full h-full object-cover" />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Judge 2 (Understanding)</h3>
							<p className='text-gray-600 mb-4'>Provide understanding feedback on the speech.</p>
							<button className='bg-blue-500 text-white py-2 px-4 rounded-lg mb-8'>Give Feedback</button>
						</div>

						{/* Judge 1 */}
						<div className='group bg-white shadow-md p-4 rounded-lg sm:col-start-1 sm:row-start-2 sm:-mt-16 relative transition-all duration-300 hover:-translate-y-2'>
							<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 group-hover:translate-y-1/3'>
								<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFKr4MIyosXeoVASWbJuBY_1ix3zEur2LDpw&s" alt="Judge 1" className="w-full h-full object-cover" />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Judge 1 (Critical)</h3>
							<p className='text-gray-600 mb-4'>Provide critical feedback on the speech.</p>
							<button className='bg-blue-500 text-white py-2 px-4 rounded-lg mb-8'>Give Feedback</button>
						</div>

						{/* Judge 3 */}
						<div className='group bg-white shadow-md p-4 rounded-lg sm:col-start-3 sm:row-start-2 sm:-mt-16 relative transition-all duration-300 hover:-translate-y-2'>
							<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 group-hover:translate-y-1/3'>
								<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFKr4MIyosXeoVASWbJuBY_1ix3zEur2LDpw&s" alt="Judge 3" className="w-full h-full object-cover" />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Judge 3 (Curious)</h3>
							<p className='text-gray-600 mb-4'>Provide curious feedback on the speech.</p>
							<button className='bg-blue-500 text-white py-2 px-4 rounded-lg mb-8'>Give Feedback</button>
						</div>
					</div>
				</div>
			</div>

			{/* Right Section (Notes and Suggestions) */}
			<div className='w-1/3 p-4 bg-gray-50 border border-gray-300 rounded-lg h-auto flex flex-col'>
				<h2 className='text-2xl font-bold mb-4'>Previous Notes:</h2>
				<textarea
					className='w-full p-3 h-40 border border-gray-300 rounded-md bg-gray-50 resize-none mb-4'
					value={notes}
					readOnly
				/>

				{/* Suggestions Section */}
				<h2 className='text-2xl font-bold mb-4'>Gemini Suggestions:</h2>
				<ul className='list-disc list-inside'>
					{suggestions.map((suggestion, index) => (
						<li key={index} className='text-lg mb-2'>
							{suggestion}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
