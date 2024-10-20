import { useState } from 'react';

const NotesSection = ({ notes, suggestions }) => {
	return (
		<div>
			<h2 className='text-2xl font-bold mb-4'>Your Notes:</h2>
			<textarea
				className='w-full p-3 h-40 border border-gray-300 rounded-md bg-gray-50 resize-none mb-4'
				value={notes}
			/>
			<h2 className='text-2xl font-bold mb-4'>Suggestions:</h2>
			<ul className='list-disc pl-5'>
				{suggestions.map((suggestion, index) => (
					<li key={index} className='mb-2'>
						{suggestion}
					</li>
				))}
			</ul>
		</div>
	);
};

export default NotesSection;
