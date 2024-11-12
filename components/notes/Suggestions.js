import { useState } from 'react';
import { getSuggestionsFromGemini } from '@/utils/noteSuggestion';

const Suggestions = ({ topic, notes }) => {
	const [suggestions, setSuggestions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const getSuggestions = async () => {
		setIsLoading(true);
		const suggestion = await getSuggestionsFromGemini(topic, notes);
		if (suggestion) {
			setSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
			localStorage.setItem('geminiSuggestions', JSON.stringify([...suggestions, suggestion]));
		}
		setIsLoading(false);
	};

	return (
		<div className='w-2/5 p-4 bg-white shadow-md rounded-lg flex flex-col'>
			<h2 className='text-2xl font-bold mb-4'>Gemini Suggestions 💡</h2>
			<ul className='list-disc list-inside flex-grow'>
				{suggestions.map((suggestion, index) => (
					<li key={index} className='text-lg mb-2'>
						{suggestion}
					</li>
				))}
			</ul>
			<div className='flex justify-center mt-4'>
				<button
					onClick={getSuggestions}
					disabled={isLoading}
					className={`bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${
						isLoading ? 'opacity-50 cursor-not-allowed' : ''
					}`}
				>
					{isLoading ? (
						<>
							<span className='inline-block animate-spin mr-2'>🧠</span>
							Thinking...
						</>
					) : (
						'Prompt My Thinking 🧠'
					)}
				</button>
			</div>
		</div>
	);
};

export default Suggestions;
