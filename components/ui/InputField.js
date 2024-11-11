const InputField = ({ label, value, onChange }) => {
	return (
		<div className='mb-4'>
			<label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
			<input
				type='number'
				value={value}
				onChange={onChange}
				className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
			/>
		</div>
	);
};

export default InputField;
