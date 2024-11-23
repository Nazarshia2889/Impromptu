import { useEffect, useRef, useState } from 'react';

const Timer = ({ initialTime, onTimerEnd, isActive = true }) => {
	const [, setUpdateCounter] = useState(0);
	const timeLeftRef = useRef(initialTime);
	const timerRef = useRef(null);

	// Format time as mm:ss
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

	// Force re-render
	const forceUpdate = () => {
		setUpdateCounter((prev) => prev + 1);
	};

	// Timer countdown and display update logic
	useEffect(() => {
		// Update ref when initialTime changes and we're not active
		if (!isActive) {
			timeLeftRef.current = initialTime;
			forceUpdate();
		}

		// Clear any existing interval
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		// Start new timer if active
		if (isActive && timeLeftRef.current > 0) {
			timerRef.current = setInterval(() => {
				timeLeftRef.current -= 1;
				forceUpdate();

				if (timeLeftRef.current <= 0) {
					clearInterval(timerRef.current);
					if (onTimerEnd) {
						onTimerEnd();
					}
				}
			}, 1000);
		}

		// Cleanup
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [initialTime, onTimerEnd, isActive]);

	return (
		<div className='text-lg font-semibold text-white bg-red-400 px-4 py-2 rounded-full'>
			Timer: {formatTime(timeLeftRef.current)} ⏱️
		</div>
	);
};

export default Timer;
