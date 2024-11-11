'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopicSection from '@/components/topic/TopicSection';
import TimingSection from '@/components/topic/TimingSection';

const TopicGenerator = () => {
	const [step, setStep] = useState(1);
	const [prepTime, setPrepTime] = useState('');
	const [speakingTime, setSpeakingTime] = useState('');
	const router = useRouter();

	const handleNext = () => {
		setStep(2);
	};

	const handleConfirm = () => {
		localStorage.setItem('prepTime', prepTime);
		localStorage.setItem('speakingLength', speakingTime);
		router.push('/notes');
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='bg-white p-10 rounded-lg shadow-md w-full max-w-md'>
				{step === 1 && <TopicSection onNext={handleNext} />}
				{step === 2 && (
					<TimingSection
						prepTime={prepTime}
						setPrepTime={setPrepTime}
						speakingTime={speakingTime}
						setSpeakingTime={setSpeakingTime}
						onConfirm={handleConfirm}
					/>
				)}
			</div>
		</div>
	);
};

export default TopicGenerator;
