const JudgesFeedback = () => {
	return (
		<div className='w-full mb-6'>
			<h2 className='text-2xl font-bold mb-4'>Judges Feedback:</h2>
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				<div className='bg-white shadow-md p-4 rounded-lg'>
					<h3 className='text-xl font-semibold mb-2'>Judge 1 (Critical)</h3>
					<p className='text-gray-600 mb-4'>Provide critical feedback on the speech.</p>
					<button className='bg-blue-500 text-white py-2 px-4 rounded-lg'>Give Feedback</button>
				</div>
				<div className='bg-white shadow-md p-4 rounded-lg'>
					<h3 className='text-xl font-semibold mb-2'>Judge 2 (Understanding)</h3>
					<p className='text-gray-600 mb-4'>Provide understanding feedback on the speech.</p>
					<button className='bg-blue-500 text-white py-2 px-4 rounded-lg'>Give Feedback</button>
				</div>
				<div className='bg-white shadow-md p-4 rounded-lg'>
					<h3 className='text-xl font-semibold mb-2'>Judge 3 (Curious)</h3>
					<p className='text-gray-600 mb-4'>Provide curious feedback on the speech.</p>
					<button className='bg-blue-500 text-white py-2 px-4 rounded-lg'>Give Feedback</button>
				</div>
			</div>
		</div>
	);
};

export default JudgesFeedback;
