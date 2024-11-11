const SelectField = ({ label, value, onChange, options }) => {
	return (
		<div className='mb-4'>
			<label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
			<select
				value={value}
				onChange={onChange}
				className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
			>
				<option value=''>Select an option</option>
				{options.map((option, index) => (
					<option key={index} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
};

export default SelectField;
