import { useEffect } from 'react';
import { formatTime } from '../utils/utils';

const RecordingSection = ({
	isRecording,
	hasStarted,
	setIsRecording,
	setHasStarted,
	time,
	setTime,
	speakingLength,
	startMicrophoneStream,
	handleAudioFile,
}) => {
	// Timer logic
	useEffect(() => {
		let timer;
		if (isRecording && time < speakingLength) {
			timer = setInterval(() => {
				setTime((prevTime) => prevTime + 1);
			}, 1000);
		} else if (time >= speakingLength) {
			setIsRecording(false);
		}
		return () => clearInterval(timer);
	}, [isRecording, time, speakingLength, setTime]);

	const startRecording = async () => {
		await startMicrophoneStream(speakingLength);
		setIsRecording(true);
		setHasStarted(true);
		setTime(0);
	};

	const stopRecording = async () => {
		setIsRecording(false);
		await handleAudioFile();
	};

	return (
		<div className='w-full flex flex-col items-start mb-8'>
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
			<div className='w-full flex justify-end mt-4'>
				<div className='text-lg font-semibold text-gray-700'>Timer: {formatTime(time)}</div>
			</div>
		</div>
	);
};

export default RecordingSection;
