const getNotesSuggestionsPrompt = (topic, notes) => {
	return `Here is a debate topic: "${topic}".
	User Notes: ${notes}

	In a single sentence, provide a concise, thought-provoking question or refutation to challenge the user's current arguments. Do not label your response with a header. If the user notes are empty, return an empty string.`;
};

export { getNotesSuggestionsPrompt };
