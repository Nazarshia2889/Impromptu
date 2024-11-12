import { memo } from 'react';
import useStableTimer from '@/hooks/useStableTimer';

const Timer = memo(({ initialTime, onTimerEnd }) => {
	const timeLeft = useStableTimer(initialTime, onTimerEnd);

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
});

Timer.displayName = 'Timer';

export default Timer;
