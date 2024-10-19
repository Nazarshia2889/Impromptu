"use client"

import { useState, useEffect } from "react";

export default function RecordingPage() {
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false); // Initially not recording
  const [hasStarted, setHasStarted] = useState(false); // Indicates if the user has started recording
  const [speakingLength, setSpeakingLength] = useState(0); // Speaking time in seconds

  // Fetch notes and speakingLength from localStorage on page load
  useEffect(() => {
    const storedNotes = localStorage.getItem("notes");
    const storedSpeakingLength = localStorage.getItem("speakingLength");

    if (storedNotes) {
      setNotes(storedNotes);
    }
    if (storedSpeakingLength) {
      setSpeakingLength(parseInt(storedSpeakingLength, 10));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRecording && time < speakingLength) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (time >= speakingLength) {
      setIsRecording(false); // Stop recording after speakingLength is reached
    }

    return () => clearInterval(timer);
  }, [isRecording, time, speakingLength]);

  // Start recording handler
  const startRecording = () => {
    setIsRecording(true);
    setHasStarted(true); // Set hasStarted to true when the recording starts
    setTime(0); // Reset timer when recording starts
  };

  // Stop recording handler
  const stopRecording = () => {
    setIsRecording(false);
  };

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex">
      {/* Left Section (Recording + Judges) */}
      <div className="w-full sm:w-2/3 lg:w-3/4 p-4 flex flex-col">
        {/* Timer in the upper right corner */}
        <div className="w-full flex justify-end mb-4">
          <div className="text-lg font-semibold text-gray-700">
            Timer: {formatTime(time)}
          </div>
        </div>

        {/* Recording Section */}
        <div className="w-full flex flex-col items-start mb-8">
          {/* Show recording status only after user clicks start */}
          {hasStarted && (
            <div className={`w-full p-4 rounded-lg border text-center mb-4 ${isRecording ? 'bg-red-100 border-red-500 text-red-600' : 'bg-gray-200 border-gray-400 text-gray-600'}`}>
              {isRecording ? "Recording in Progress..." : "Recording Stopped"}
            </div>
          )}
          {/* Conditionally rendering Start/Stop buttons based on isRecording state */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
            >
              Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              Start Recording
            </button>
          )}
        </div>

        {/* Judges Feedback Section */}
        <div className="w-full mb-6">
          <h2 className="text-2xl font-bold mb-4">Judges Feedback:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Judge 1 */}
            <div className="bg-white shadow-md p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Judge 1 (Critical)</h3>
              <p className="text-gray-600 mb-4">
                Provide critical feedback on the speech.
              </p>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Give Feedback
              </button>
            </div>

            {/* Judge 2 */}
            <div className="bg-white shadow-md p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Judge 2 (Understanding)</h3>
              <p className="text-gray-600 mb-4">
                Provide understanding feedback on the speech.
              </p>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Give Feedback
              </button>
            </div>

            {/* Judge 3 */}
            <div className="bg-white shadow-md p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Judge 3 (Curious)</h3>
              <p className="text-gray-600 mb-4">
                Provide curious feedback on the speech.
              </p>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section (Notes) */}
      <div className="w-full sm:w-1/3 lg:w-1/4 p-4 bg-gray-50 border border-gray-300 rounded-lg h-80 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Previous Notes:</h2>
        <textarea
          className="w-full p-3 h-full border border-gray-300 rounded-md bg-gray-50 resize-none"
          value={notes}
          readOnly
        />
      </div>
    </div>
  );
}
