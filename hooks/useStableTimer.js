import { useEffect, useState, useRef } from 'react';

const useStableTimer = (initialTime, onTimerEnd) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const endTimeRef = useRef(null);
	const rafRef = useRef(null);

	useEffect(() => {
		// Set the end time when the timer starts
		if (endTimeRef.current === null) {
			endTimeRef.current = Date.now() + initialTime * 1000;
		}

		const updateTimer = () => {
			const now = Date.now();
			const remaining = Math.ceil((endTimeRef.current - now) / 1000);

			if (remaining <= 0) {
				setTimeLeft(0);
				if (onTimerEnd) {
					onTimerEnd();
				}
			} else {
				setTimeLeft(remaining);
				// Request next frame
				rafRef.current = requestAnimationFrame(updateTimer);
			}
		};

		// Start the animation frame loop
		rafRef.current = requestAnimationFrame(updateTimer);

		// Cleanup
		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [initialTime, onTimerEnd]);

	return timeLeft;
};

export default useStableTimer;
