'use client';

import { useState, useEffect } from 'react';
// import { createClient } from'@deepgram/sdk';
import OpenAI from 'openai';
import Vapi from '@vapi-ai/web';


export default function RecordingPage() {
	const [notes, setNotes] = useState('');
	const [time, setTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [speakingLength, setSpeakingLength] = useState(0);
	const [suggestions, setSuggestions] = useState([]);
	const [audioChunks, setAudioChunks] = useState([]); // To hold audio data in memory
	let mediaRecorder = null;
	let stream = null;

	const OpenAI_API_KEY = "sk-svcacct-MsWzbVh34xzDn4h13C2S_G0Cw9MhJaLCUxx3Ohz8Ww1bgjA3tyWNcK6H40oF6ruzBT3BlbkFJEEX1pjM--9F2VvJMnfgl9xDxmmTfYmD-jcyQwWy4S_ui_BHl6OKyN1CeYa93VDs9AA"
	const openai = new OpenAI({ apiKey: OpenAI_API_KEY , dangerouslyAllowBrowser: true});

	const vapi = new Vapi("bc70d4a2-9563-4172-bdb2-712b4084ba27");
	const vapi2 = new Vapi("bc70d4a2-9563-4172-bdb2-712b4084ba27");
	const vapi3 = new Vapi("bc70d4a2-9563-4172-bdb2-712b4084ba27");

	// List of vapis
	const vapis = [vapi, vapi2, vapi3];
	const vapis_name = ["vapi", "vapi2", "vapi3"];
	// map of vapis and assistant id
	const vapiMap = {
		"vapi": {
			"assistant_id": "181a8564-58b5-4168-ad01-b53fa5f8f06e",
			"voice_id": "jennifer",
			"assistant_name": "Critic #1",
			"content": "You are a critical impromptu speech judge. Challenge the ideas in the user's speech. The user has just finished their speech.",
		},
		"vapi2": {
			"assistant_id": "205d0a42-d818-495c-9496-7fee04e2d98c",
			"voice_id": "s3://voice-cloning-zero-shot/7b97b543-7877-41b6-86ee-aa1e0b6c110e/dicksaad/manifest.json",
			"assistant_name": "Critic #2",
			"content": "You are a supportive impromptu speech judge. The user has just finished their speech.",
		},
		"vapi3": {
			"assistant_id": "d7f80236-caa5-47a7-94fe-ae8705f77bf1",
			"voice_id": "chris",
			"assistant_name": "Critic #3",
			"content": "You are a curious impromptu speech judge. Question the ideas in the user's speech. The user has just finished their speech.",
		}
	};

	// Fetch notes, speakingLength, and suggestions from localStorage on page load
	useEffect(() => {
		const storedNotes = localStorage.getItem('notes');
		const storedSpeakingLength = localStorage.getItem('speakingLength');
		const storedSuggestions = localStorage.getItem('geminiSuggestions');

		if (storedNotes) {
			setNotes(storedNotes);
		}
		if (storedSpeakingLength) {
			setSpeakingLength(parseInt(storedSpeakingLength, 10)); // Multiply by 60
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
		localStorage.setItem('history', `User Speech: ` + transcript + "\n");

		// Execute VAPI interaction
		executeVapiInteraction();
		
	};

	const executeVapiInteraction = async () => {
		// Get a random vapi
		let rand = Math.floor(Math.random() * vapis.length);
		const curr = vapis[rand];
		const curr_name = vapis_name[rand];

		// Translate code
		if (curr_name == "vapi") {
			j1.style.className = 'translateY(-0.5rem)';
		}
		else {
			j1.style.className = 'translateY(0)';
		}

		if (curr_name == "vapi2") {
			j2.style.className = 'translateY(-0.5rem)';
		}
		else {
			j2.style.className = 'translateY(0)';
		}

		if (curr_name == "vapi3") {
			j3.style.className = 'translateY(-0.5rem)';
		}
		else {
			j3.style.className = 'translateY(0)';
		}

		// End Translate Code


		let totalResponse = "";

		console.log("VAPI: ", vapiMap[curr_name]["assistant_name"]);

		curr.start(vapiMap[curr_name]["assistant_id"], {
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
				content: vapiMap[curr_name]["content"],
				},
			],
			},
			voice: {
			provider: "playht",
			voiceId: vapiMap[curr_name]["voice_id"],
			},
			name: vapiMap[curr_name]["assistant_name"],
		});

		console.log("VAPI STARTED");

		curr.send({
			type: "add-message",
			message: {
			role: "user",
			content: "Consider the previous chat history when responding to the user: " + localStorage.getItem('history'),
			},
		});

		curr.on("message", (message) => {
			// if transcript type exist and equals "final"
			if (message.transcriptType === "final") {
				totalResponse += message.transcript;
			}
		});

		curr.on("speech-start", () => {
			console.log("START");
		});

		curr.on("speech-end", () => {
			localStorage.setItem('history', vapiMap[curr_name]["assistant_name"] + ": " + totalResponse + "\n");
			console.log("END.");
			curr.stop();
			executeVapiInteraction();
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
						<div id = "j2" className='group bg-white shadow-md p-4 rounded-lg sm:col-start-2 sm:row-start-1 z-10 relative transition-all duration-300 transition: transform '>
							<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 group-hover:translate-y-1/3'>
								<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFKr4MIyosXeoVASWbJuBY_1ix3zEur2LDpw&s" alt="Judge 2" className="w-full h-full object-cover" />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Judge 2 (Understanding)</h3>
							<p className='text-gray-600 mb-4'>Provide understanding feedback on the speech.</p>
							<button className='bg-blue-500 text-white py-2 px-4 rounded-lg mb-8'>Give Feedback</button>
						</div>

						{/* Judge 1 */}
						<div id = "j1" className='group bg-white shadow-md p-4 rounded-lg sm:col-start-1 sm:row-start-2 sm:-mt-16 relative transition-all duration-300 transition: transform'>
							<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 group-hover:translate-y-1/3'>
								<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFKr4MIyosXeoVASWbJuBY_1ix3zEur2LDpw&s" alt="Judge 1" className="w-full h-full object-cover" />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Judge 1 (Critical)</h3>
							<p className='text-gray-600 mb-4'>Provide critical feedback on the speech.</p>
							<button className='bg-blue-500 text-white py-2 px-4 rounded-lg mb-8'>Give Feedback</button>
						</div>

						{/* Judge 3 */}
						<div id="j3" className='group bg-white shadow-md p-4 rounded-lg sm:col-start-3 sm:row-start-2 sm:-mt-16 relative transition-all duration-300 transition: transform'>
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
