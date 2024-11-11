import { GoogleGenerativeAI } from '@google/generative-ai';

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
		const prompt = `Here is a debate topic: "${topic}".
User Notes: ${notes}

In a single sentence, provide a concise, thought-provoking question or refutation to challenge the user's current arguments. Do not label your response with a header. If the user notes are empty, return an empty string.`;

		const result = await model.generateContent(prompt);
		return result.response.text().trim();
	} catch (error) {
		console.error('Error generating suggestion:', error);
		return '';
	}
};
