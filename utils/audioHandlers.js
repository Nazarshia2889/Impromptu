import { transcribeAudio, getGroqResponse, generateSpeech } from '@/utils/apiUtils';

const playAudioBrowser = async (buffer) => {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const audioBuffer = await audioContext.decodeAudioData(buffer.buffer);
	const source = audioContext.createBufferSource();
	source.buffer = audioBuffer;
	source.connect(audioContext.destination);
	source.start(0);
};

const handleTranscribeAudio = async (file, transcribeGroq, getResponse) => {
	try {
		const transcriptionText = await transcribeAudio(file, transcribeGroq);
		await getResponse(transcriptionText);
		return transcriptionText;
	} catch (error) {
		console.error('Error in handleTranscribeAudio:', error);
	}
};

const getAndPlayAudio = async (responseText, openai, setCurrentSpeaker) => {
	try {
		const buffer = await generateSpeech(openai, responseText);
		setCurrentSpeaker('Judge');
		await playAudioBrowser(buffer);
	} catch (error) {
		console.error('Error in getAndPlayAudio:', error);
	}
};

const getResponse = async (userText, groq, history, setTranscript, getAndPlayAudioFn) => {
	try {
		history.push({ role: 'user', content: userText });
		const response = await getGroqResponse(groq, userText, history);
		history.push({ role: 'assistant', content: response });

		setTranscript((prev) => prev + 'USER: ' + userText + '\n' + 'JUDGE: ' + response + '\n');

		getAndPlayAudioFn(response);
		return response;
	} catch (error) {
		console.error('Error in getResponse:', error);
	}
};

export { handleTranscribeAudio, getAndPlayAudio, getResponse };
