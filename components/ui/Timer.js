import { useEffect, useState } from 'react';

const Timer = ({ initialTime, onTimerEnd, isActive = true }) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);

	// Single useEffect to handle both initialization and updates
	useEffect(() => {
		// Initialize or reset timer when isActive changes to true
		if (isActive) {
			setTimeLeft(initialTime);
		}

		// Only start interval if we're active and have valid time
		if (isActive && initialTime > 0) {
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
		}
	}, [initialTime, onTimerEnd, isActive]);

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
