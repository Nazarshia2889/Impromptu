'use client'

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  // State management for topic, notes, and timer
  const [topic, setTopic] = useState("Click the button to generate a topic!");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Array of topics to randomly select from
  const topics = [
    "Should social media platforms be regulated?",
    "The impact of artificial intelligence on job markets",
    "Does technology improve human connection?",
    "Is climate change the most urgent issue of our time?"
  ];

  // Generate a random topic
  const generateTopic = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    setTopic(randomTopic);
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (isTimerRunning) {
      timer = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
    } else if (!isTimerRunning && time !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setTime(0);
    setIsTimerRunning(false);
  };

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
  

        {/* Topic Section */}
        <div className="text-center">
          <button
            onClick={generateTopic}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generate Topic
          </button>
          <p className="mt-4 text-lg">{topic}</p>
        </div>

        {/* Notes Section */}
        <div className="w-full">
          <label className="block text-xl font-semibold mb-2">Your Notes:</label>
          <textarea
            className="w-full h-40 p-3 border border-gray-300 rounded-md"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
          ></textarea>
        </div>

        {/* Judges Panel */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Judges Panel</h2>
          <div className="flex justify-between">
            <div className="bg-white shadow-md p-4 rounded-md w-1/3">
              <h3 className="text-xl font-bold">Judge 1 (Critical)</h3>
              <p className="text-gray-600">I'll ask critical questions.</p>
            </div>
            <div className="bg-white shadow-md p-4 rounded-md w-1/3 mx-4">
              <h3 className="text-xl font-bold">Judge 2 (Understanding)</h3>
              <p className="text-gray-600">I'm here to understand your viewpoint.</p>
            </div>
            <div className="bg-white shadow-md p-4 rounded-md w-1/3">
              <h3 className="text-xl font-bold">Judge 3 (Curious)</h3>
              <p className="text-gray-600">I'm curious about your ideas.</p>
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div className="text-center">
          <button
            onClick={startTimer}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Start Timer
          </button>
          <button
            onClick={stopTimer}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Stop Timer
          </button>
          <button
            onClick={resetTimer}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Reset Timer
          </button>
          <p className="mt-4 text-lg">{formatTime(time)}</p>
        </div>
      </main>
    </div>
  );
}
