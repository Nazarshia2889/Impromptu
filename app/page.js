'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import questions from '@/data/questions';

const TopicGenerator = () => {
	const [specificity, setSpecificity] = useState('');
	const [category, setCategory] = useState('');
	const [topic, setTopic] = useState('');
	const [step, setStep] = useState(1);
	const [prepTime, setPrepTime] = useState('');
	const [speakingTime, setSpeakingTime] = useState('');
	const router = useRouter();

	const handleGenerateTopic = () => {
		if (category && specificity) {
			const topicsForCategory = questions[category]?.[specificity] || [];
			if (topicsForCategory.length > 0) {
				const randomTopic = topicsForCategory[Math.floor(Math.random() * topicsForCategory.length)];
				setTopic(randomTopic);
			} else {
				setTopic('No topics available for the selected options.');
			}
		} else {
			setTopic('Please select both specificity and category.');
		}
	};

	const handleNext = () => {
		if (step === 1) {
			setStep(2);
		}
	};

	const handleConfirm = () => {
		localStorage.setItem('topic', topic);
		localStorage.setItem('prepTime', prepTime);
		localStorage.setItem('speakingLength', speakingTime);
		router.push('/notes');
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='bg-white p-10 rounded-lg shadow-md w-full max-w-md'>
				{step === 1 && (
					<div>
						<h2 className='text-2xl font-semibold mb-6 text-center'>Generate a Topic</h2>
						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Select Specificity:
							</label>
							<select
								value={specificity}
								onChange={(e) => setSpecificity(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							>
								<option value=''>Select an option</option>
								<option value='Personal'>Personal</option>
								<option value='Broad'>Broad</option>
							</select>
						</div>
						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Select Topic Category:
							</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							>
								<option value=''>Select a category</option>
								<option value='Science and Technology'>Science and Technology</option>
								<option value='History'>History</option>
								<option value='Politics'>Politics</option>
								<option value='Sports'>Sports</option>
								<option value='Pop Culture'>Pop Culture</option>
								<option value='Economy'>Economy</option>
								<option value='Philosophy'>Philosophy</option>
								<option value='Ethics & Morality'>Ethics & Morality</option>
								<option value='Environment'>Environment</option>
								<option value='Future Trends'>Future Trends</option>
							</select>
						</div>
						<button
							onClick={handleGenerateTopic}
							className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700'
						>
							Generate Topic
						</button>
						{topic && (
							<div className='mt-4 p-4 border border-gray-300 rounded'>
								<p className='text-gray-700'>{topic}</p>
							</div>
						)}
						<button
							onClick={handleNext}
							className={`w-full mt-4 py-2 rounded focus:outline-none ${
								topic
									? 'bg-gray-800 text-white hover:bg-gray-900 focus:bg-gray-700'
									: 'bg-gray-400 text-gray-600 cursor-not-allowed'
							}`}
							disabled={!topic}
						>
							Next
						</button>
					</div>
				)}
				{step === 2 && (
					<div>
						<h2 className='text-2xl font-semibold mb-6 text-center'>Select Timing</h2>
						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Preparation Time (seconds):
							</label>
							<input
								type='number'
								value={prepTime}
								onChange={(e) => setPrepTime(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Speaking Time (seconds):
							</label>
							<input
								type='number'
								value={speakingTime}
								onChange={(e) => setSpeakingTime(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<button
							onClick={handleConfirm}
							className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 focus:outline-none focus:bg-green-700'
						>
							Confirm
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default TopicGenerator;
