const getNotesSuggestionsPrompt = (topic, notes) => {
	return `Here is a debate topic: "${topic}".
	User Notes: ${notes}

	In a single sentence, provide a concise, thought-provoking question about or refutation to challenge the user's current arguments. Do not label your response with a header. If the user notes are empty, return an empty string.`;
};

const getScorePrompt = (topic, history) => {
	console.log('topic:', topic);
	console.log('history:', history);

	return `Debate topic: "${topic}"
User's speech and feedback from judges: ${history}

Please evaluate the user's arguments based on the following criteria, providing both a score (1 to 10) and specific examples from the speech as justification for each category. A score of 1 is the worst, and a score of 10 is best.:

1. **Filler Words**: Rate and justify based on frequency and impact of filler words.
2. **Relevance**: Rate and justify based on how well arguments stay on topic and address the debate prompt.
3. **Use of Evidence/Examples**: Rate and justify based on the strength and relevance of supporting evidence or examples.
4. **Creativity and Insight**: Rate and justify based on originality and depth of thought.
5. **Overall Quality**: Provide an overall score, considering clarity, persuasiveness, and cohesiveness.

If no feedback is provided, return an empty string.`;
};

const groqStructureToolsParameters = [
	{
		type: 'function',
		function: {
			name: 'evaluate_user_arguments',
			description:
				"Evaluate user's arguments in a debate with scores and justifications for each criterion.",
			parameters: {
				type: 'object',
				properties: {
					filler_words: {
						type: 'object',
						properties: {
							score: { type: 'number', description: 'Score for filler word usage, 1 to 10' },
							justification: { type: 'string', description: 'Examples and reasons for score' },
						},
						required: ['score', 'justification'],
					},
					relevance: {
						type: 'object',
						properties: {
							score: { type: 'number', description: 'Score for relevance to topic, 1 to 10' },
							justification: { type: 'string', description: 'Examples and reasons for score' },
						},
						required: ['score', 'justification'],
					},
					use_of_evidence_examples: {
						type: 'object',
						properties: {
							score: { type: 'number', description: 'Score for use of evidence/examples, 1 to 10' },
							justification: { type: 'string', description: 'Examples and reasons for score' },
						},
						required: ['score', 'justification'],
					},
					creativity_and_insight: {
						type: 'object',
						properties: {
							score: { type: 'number', description: 'Score for creativity and insight, 1 to 10' },
							justification: { type: 'string', description: 'Examples and reasons for score' },
						},
						required: ['score', 'justification'],
					},
					overall: {
						type: 'object',
						properties: {
							score: { type: 'number', description: 'Overall score, 1 to 10' },
							justification: { type: 'string', description: 'Overall reasoning and impression' },
						},
						required: ['score', 'justification'],
					},
				},
				required: [
					'filler_words',
					'relevance',
					'use_of_evidence_examples',
					'creativity_and_insight',
					'overall',
				],
			},
		},
	},
];

export { getNotesSuggestionsPrompt, getScorePrompt, groqStructureToolsParameters };
