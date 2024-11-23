const RecordingSidebar = ({ topic, notes, suggestions }) => {
	return (
		<div className='w-1/3 p-4 bg-gray-50 border border-gray-300 rounded-lg h-auto flex flex-col'>
			{/* Topic Section */}
			<h2 className='text-2xl font-bold mb-2'>Topic:</h2>
			<div className='w-full p-3 mb-4 bg-white border border-gray-300 rounded-md'>
				<p className='text-lg'>{topic}</p>
			</div>

			<h2 className='text-2xl font-bold mb-2'>Previous Notes:</h2>
			<textarea
				className='w-full p-3 h-40 border border-gray-300 rounded-md bg-gray-50 resize-none mb-4'
				value={notes}
				readOnly
			/>

			{/* Suggestions Section */}
			<h2 className='text-2xl font-bold mb-2'>Gemini Suggestions:</h2>
			<ul className='list-disc list-inside'>
				{suggestions.map((suggestion, index) => (
					<li key={index} className='text-lg mb-2'>
						{suggestion}
					</li>
				))}
			</ul>
		</div>
	);
};

export default RecordingSidebar;
