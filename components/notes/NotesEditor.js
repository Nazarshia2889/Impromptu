const NotesEditor = ({ notes, setNotes }) => {
	return (
		<div className='w-3/5 p-4 bg-white shadow-md rounded-lg flex flex-col'>
			<h2 className='text-2xl font-bold mb-4'>Your Notes 📝</h2>
			<textarea
				className='w-full p-4 h-96 border border-gray-300 rounded-md bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder='Type your notes here...'
			/>
		</div>
	);
};

export default NotesEditor;
