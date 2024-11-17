import { useState } from 'react';
import Button from '../ui/Button';
import SelectField from '../ui/SelectField';
import questions from '@/data/questions';

const TopicSection = ({ onNext }) => {
	const [specificity, setSpecificity] = useState('');
	const [category, setCategory] = useState('');
	const [topic, setTopic] = useState('');

	const handleGenerateTopic = () => {
		console.log('Generating topic...');

		if (category && specificity) {
			const topicsForCategory = questions[category]?.[specificity] || [];
			if (topicsForCategory.length > 0) {
				const randomTopic = topicsForCategory[Math.floor(Math.random() * topicsForCategory.length)];
				localStorage.setItem('topic', randomTopic);
				setTopic(randomTopic);
			} else {
				setTopic('No topics available for the selected options.');
			}
		} else {
			setTopic('Please select both specificity and category.');
		}
	};

	return (
		<div>
			<h2 className='text-2xl font-semibold mb-6 text-center'>Generate a Topic</h2>
			<SelectField
				label='Select Specificity:'
				value={specificity}
				onChange={(e) => setSpecificity(e.target.value)}
				options={['Personal', 'Broad']}
			/>
			<SelectField
				label='Select Topic Category:'
				value={category}
				onChange={(e) => setCategory(e.target.value)}
				options={[
					'Science and Technology',
					'History',
					'Politics',
					'Sports',
					'Pop Culture',
					'Economy',
					'Philosophy',
					'Ethics & Morality',
					'Environment',
					'Future Trends',
				]}
			/>
			<Button
				onClick={handleGenerateTopic}
				styles='bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-700'
			>
				Generate Topic
			</Button>
			{topic && (
				<div className='mt-4 p-4 border border-gray-300 rounded'>
					<p className='text-gray-700'>{topic}</p>
				</div>
			)}
			<Button
				onClick={onNext}
				disabled={!topic}
				styles={
					topic
						? 'bg-gray-800 text-white hover:bg-gray-900 focus:bg-gray-700 mt-4'
						: 'bg-gray-400 text-gray-600 cursor-not-allowed mt-4'
				}
			>
				Next
			</Button>
		</div>
	);
};

export default TopicSection;
