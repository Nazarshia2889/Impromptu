import { useEffect, useState } from 'react';

const clock = 1; // This constant controls the speed of the timer, in case you need to speed up/slow down.

const useTimer = (initialTime, onTimerEnd) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);

	useEffect(() => {
		let timer;
		if (timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000 / clock);
		} else if (timeLeft === 0) {
			clearInterval(timer);
			if (onTimerEnd) {
				onTimerEnd();
			}
		}
		return () => clearInterval(timer);
	}, [timeLeft, onTimerEnd]);

	return [timeLeft, setTimeLeft];
};

export default useTimer;
