import { useEffect, useState } from 'react';

const Timer = ({ initialTime, onTimerEnd }) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);

	useEffect(() => {
		if (initialTime === null || initialTime <= 0) return;

		const timer = setInterval(() => {
			setTimeLeft((prevTime) => {
				if (prevTime <= 1) {
					clearInterval(timer);
					if (onTimerEnd) {
						onTimerEnd();
					}
					return 0;
				}
				return prevTime - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [initialTime, onTimerEnd]);

	// Format time as mm:ss
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

	return (
		<div className='text-lg font-semibold text-white bg-red-400 px-4 py-2 rounded-full'>
			Timer: {formatTime(timeLeft)} ⏱️
		</div>
	);
};

export default Timer;
