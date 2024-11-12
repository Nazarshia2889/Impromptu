import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNotesSuggestionsPrompt } from './prompt';

const genAI = new GoogleGenerativeAI('AIzaSyB42v6cizIL79D3Pchj117Zgi65nyLgjTg');
const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: {
		responseSchema: {
			type: 'object',
			properties: { text: { type: 'string', maxLength: 64 } },
		},
		temperature: 2,
	},
});

export const getSuggestionsFromGemini = async (topic, notes) => {
	try {
		const prompt = getNotesSuggestionsPrompt(topic, notes);
		const result = await model.generateContent(prompt);
		return result.response.text().trim();
	} catch (error) {
		console.error('Error generating suggestion:', error);
		return '';
	}
};
