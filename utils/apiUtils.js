// utils/apiUtils.js
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { decrypt } from '@/utils/cryptography';

const initializeAPIs = () => {
	const Groq_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
	const transcribeGroq = new Groq({ apiKey: Groq_API_KEY, dangerouslyAllowBrowser: true });
	const groq = new Groq({ apiKey: Groq_API_KEY, dangerouslyAllowBrowser: true });

	const openai = new OpenAI({
		apiKey: decrypt(
			'Gv3D1aeJ2wpA7qaCIal9qt55ayPMq6L9cEWqJxS/Pg2UCU73YqoRnVmodqq/ova/6zn1J7EhmuTyRu+dCkAPK54U0YAy1+7oyRDnOhpvVaNf+/1Fd/2IaBoESxXctti9j/J2HO3S/HpHaXuep1cRO9/Q5fsw/0/6qGfKIpfDKAKqtRSCOgGkx/t7L4+CW1Zt6MROOHGNLTmAW9uf3EOV3vAV5oU16b9eQwXL06Ynxc4=',
			process.env.NEXT_PUBLIC_SECRET_KEY,
			process.env.NEXT_PUBLIC_FIXED_IV
		),
		dangerouslyAllowBrowser: true,
	});

	return { transcribeGroq, groq, openai };
};

const transcribeAudio = async (file, transcribeGroq) => {
	try {
		const formData = new FormData();
		formData.append('file', file);
		const transcription = await transcribeGroq.audio.transcriptions.create({
			file: formData.get('file'),
			model: 'distil-whisper-large-v3-en',
			response_format: 'verbose_json',
		});
		return transcription.text;
	} catch (error) {
		console.error('Error transcribing audio:', error);
		throw error;
	}
};

const getGroqResponse = async (groq, userText, history) => {
	try {
		const response = await groq.chat.completions.create({
			messages: [...history, { role: 'user', content: userText }],
			model: 'llama3-8b-8192',
			temperature: 0.5,
			max_tokens: 256,
			top_p: 1,
			stop: null,
			stream: false,
		});
		return response.choices[0]?.message?.content;
	} catch (error) {
		console.error('Error getting Groq response:', error);
		throw error;
	}
};

const generateSpeech = async (openai, text) => {
	try {
		const mp3 = await openai.audio.speech.create({
			model: 'tts-1',
			voice: 'alloy',
			input: text,
			speed: 1.15,
		});
		return Buffer.from(await mp3.arrayBuffer());
	} catch (error) {
		console.error('Error generating speech:', error);
		throw error;
	}
};

export { initializeAPIs, transcribeAudio, getGroqResponse, generateSpeech };
