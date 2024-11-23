import Timer from '@/components/ui/Timer';

const RecordingControls = ({
	isRecording,
	speakingLength,
	onStartRecording,
	onStopRecording,
	onTimerEnd,
}) => {
	return (
		<div className='w-full flex justify-between mb-4 items-center'>
			{isRecording ? (
				<button
					onClick={onStopRecording}
					className='bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded'
				>
					Stop Recording
				</button>
			) : (
				<button
					onClick={onStartRecording}
					className='bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded'
				>
					Start Recording
				</button>
			)}

			<Timer initialTime={speakingLength} onTimerEnd={onTimerEnd} isActive={isRecording} />
		</div>
	);
};

export default RecordingControls;
