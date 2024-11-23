export const startMicrophoneStream = (mediaRecorder, stream, handleTranscribeAudioFn) => {
	navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
		stream.current = micStream;
		mediaRecorder.current = new MediaRecorder(stream.current);
		let chunks = [];
		mediaRecorder.current.ondataavailable = (event) => {
			chunks.push(event.data);
		};
		mediaRecorder.current.onstop = () => {
			const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
			const file = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });
			handleTranscribeAudioFn(file);
		};
		mediaRecorder.current.start();
	});
};

export const stopRecording = async (isRecording, mediaRecorder, stream, setIsRecording) => {
	setIsRecording(false);
	if (mediaRecorder.current && stream.current) {
		mediaRecorder.current.stop();
		stream.current.getTracks().forEach((track) => track.stop());
	}
};
