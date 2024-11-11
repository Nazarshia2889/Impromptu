const Timer = ({ timeLeft }) => {
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

	return (
		<div className='w-full flex justify-end mb-4'>
			<div className='text-lg font-semibold text-white bg-red-400 px-4 py-2 rounded-full'>
				Timer: {formatTime(timeLeft)} ⏱️
			</div>
		</div>
	);
};

export default Timer;
