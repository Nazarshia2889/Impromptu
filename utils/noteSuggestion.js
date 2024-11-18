import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNotesSuggestionsPrompt } from './prompt';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: {
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
