import { useEffect, useState } from 'react';

const Timer = ({ initialTime, onTimerEnd }) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);

	useEffect(() => {
		if (initialTime === null || initialTime <= 0) return;

		let timer;
		if (timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			clearInterval(timer);
			if (onTimerEnd) {
				onTimerEnd();
			}
		}

		return () => clearInterval(timer);
	}, [timeLeft, onTimerEnd]);

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
