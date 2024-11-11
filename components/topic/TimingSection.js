import InputField from '../ui/InputField';
import Button from '../ui/Button';

const TimingSection = ({ prepTime, setPrepTime, speakingTime, setSpeakingTime, onConfirm }) => {
	return (
		<div>
			<h2 className='text-2xl font-semibold mb-6 text-center'>Select Timing</h2>
			<InputField
				label='Preparation Time (seconds):'
				value={prepTime}
				onChange={(e) => setPrepTime(e.target.value)}
			/>
			<InputField
				label='Speaking Time (seconds):'
				value={speakingTime}
				onChange={(e) => setSpeakingTime(e.target.value)}
			/>
			<Button
				onClick={onConfirm}
				styles='bg-green-500 text-white hover:bg-green-600 focus:bg-green-700'
			>
				Confirm
			</Button>
		</div>
	);
};

export default TimingSection;
