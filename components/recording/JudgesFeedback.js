const JudgesFeedback = ({ currentSpeaker }) => {
	return (
		<div className='w-full mb-6 mt-8'>
			<h2 className='text-2xl font-bold mb-4'>Judging Room:</h2>
			<div className='grid grid-cols-3 gap-4 mt-10'>
				<div
					className={`bg-white shadow-md p-4 rounded-lg relative ${
						currentSpeaker === 'Judge' ? 'bg-yellow-100 transform -translate-y-3.5' : ''
					} transition-all duration-300`}
				>
					<h3 className='text-xl font-semibold mb-2'>Wayne Shaw</h3>
					<p className='text-gray-600 mb-4'>
						Provide <span className='font-bold'>critical</span> feedback on the speech.
					</p>
					<div className='mb-16'></div>
					<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full bg-gray-300 overflow-hidden border-4 border-white'>
						<img src='nd.jpg' alt='Judge 1' className='w-full h-full object-cover' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default JudgesFeedback;
